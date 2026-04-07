import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import yaml from 'js-yaml';
import { config } from '../config';
import { yamlService } from './yamlService';
import { comfyService } from './comfyService';
import { promptService } from './promptService';
import {
  QueueFile,
  Job,
  Task,
  ResolvedTask,
  GenerationState,
  GenerationStatus,
  GenerationStatusResponse,
  Library,
  BaseModel,
  SimpleComponent,
  OutputMetadata,
} from '../types';

export class GenerationService {
  private state: GenerationState = {
    id: '',
    status: 'idle',
    started_at: null,
    completed_at: null,
    tasks: [],
    current_task_index: 0,
    completed_count: 0,
    errors: [],
    results: [],
  };

  // Current task progress (from WebSocket)
  private currentTaskProgress: {
    value: number;
    max: number;
    percent: number;
  } = {
    value: 0,
    max: 0,
    percent: 0,
  };

  /**
   * Start generation from queue
   */
  async startGeneration(queue: QueueFile): Promise<string> {
    if (this.state.status === 'running') {
      throw new Error('Generation is already running');
    }

    // Check ComfyUI availability
    const health = await comfyService.checkHealth();
    if (!health.available) {
      throw new Error('ComfyUI is not available');
    }

    // Load library and base model
    const library = await yamlService.loadLibrary();
    const baseModel = await yamlService.readBaseModel();

    // Flatten jobs into tasks
    const tasks = this.flattenJobs(queue.jobs, queue.settings.drafts_per_combination);

    // Initialize state
    this.state = {
      id: uuidv4(),
      status: 'running',
      started_at: new Date(),
      completed_at: null,
      tasks,
      current_task_index: 0,
      completed_count: 0,
      errors: [],
      results: [],
    };

    const generationId = this.state.id;

    // Start generation in background
    this.runGeneration(library, baseModel).catch(error => {
      console.error('Generation failed:', error);
      this.state.status = 'error';
      this.state.errors.push(error.message);
    });

    return generationId;
  }

  /**
   * Stop current generation
   */
  async stopGeneration(): Promise<void> {
    if (this.state.status !== 'running') {
      throw new Error('No generation is running');
    }

    this.state.status = 'stopping';
    await comfyService.clearQueue();
    await comfyService.interrupt();
  }

  /**
   * Get current generation status
   */
  getStatus(): GenerationStatusResponse {
    const elapsed_seconds =
      this.state.started_at ? Math.floor((Date.now() - this.state.started_at.getTime()) / 1000) : 0;

    const eta_seconds =
      this.state.completed_count > 0
        ? Math.floor((elapsed_seconds / this.state.completed_count) * (this.state.tasks.length - this.state.completed_count))
        : 0;

    const current_task =
      this.state.status === 'running' && this.state.current_task_index < this.state.tasks.length
        ? {
            character: this.state.tasks[this.state.current_task_index].character,
            pose: this.state.tasks[this.state.current_task_index].pose,
            camera: this.state.tasks[this.state.current_task_index].camera,
            outfit: this.state.tasks[this.state.current_task_index].outfit,
          }
        : null;

    return {
      id: this.state.id,
      status: this.state.status,
      progress: {
        completed: this.state.completed_count,
        total: this.state.tasks.length,
        percent: this.state.tasks.length > 0 ? Math.round((this.state.completed_count / this.state.tasks.length) * 100) : 0,
      },
      current_task,
      current_task_progress: this.currentTaskProgress.max > 0 ? this.currentTaskProgress : undefined,
      elapsed_seconds,
      eta_seconds,
      errors: this.state.errors,
    };
  }

  /**
   * Main generation loop
   */
  private async runGeneration(library: Library, baseModel: BaseModel): Promise<void> {
    console.log(`\n🚀 Starting generation: ${this.state.tasks.length} tasks`);

    for (let i = 0; i < this.state.tasks.length; i++) {
      // Check if stopping
      if (this.state.status === 'stopping') {
        console.log('⏹️  Generation stopped by user');
        this.state.status = 'idle';
        return;
      }

      this.state.current_task_index = i;
      const task = this.state.tasks[i];

      try {
        console.log(`\n[${i + 1}/${this.state.tasks.length}] Generating: ${task.character} / ${task.pose} / ${task.camera}`);

        // Resolve task
        const resolved = this.resolveTask(task, library, baseModel);

        // Build prompt
        const builtPrompt = promptService.buildPrompt(resolved);

        // Build ComfyUI workflow
        const workflow = promptService.buildComfyWorkflow(baseModel, builtPrompt);

        // Free memory
        await comfyService.freeMemory();

        // Submit to ComfyUI
        const promptId = await comfyService.submitPrompt(workflow);
        console.log(`   Submitted to ComfyUI: ${promptId}`);

        // Reset current task progress
        this.currentTaskProgress = { value: 0, max: 0, percent: 0 };

        // Wait for completion with WebSocket progress tracking
        const history = await comfyService.waitForCompletion(promptId, 300000, (event) => {
          // Handle progress events
          if (event.type === 'progress') {
            this.currentTaskProgress = {
              value: event.data.value,
              max: event.data.max,
              percent: event.data.max > 0 ? Math.round((event.data.value / event.data.max) * 100) : 0,
            };
          } else if (event.type === 'executing') {
            // Log which node is executing
            if (event.data.node) {
              console.log(`   Executing node: ${event.data.node}`);
            }
          }
        });

        // Extract output filename
        const output = comfyService.extractOutputFilename(history);
        if (!output) {
          throw new Error('No output image found in ComfyUI response');
        }

        // Copy result to output folder
        const savedPath = await this.saveResult(resolved, baseModel, builtPrompt, output, i);

        this.state.results.push({
          task_index: i,
          filename: path.basename(savedPath),
          path: savedPath,
        });

        this.state.completed_count++;
        console.log(`   ✅ Saved: ${path.basename(savedPath)}`);

        // Reset current task progress
        this.currentTaskProgress = { value: 0, max: 0, percent: 0 };

        // Cooldown
        await this.sleep(5000);
      } catch (error) {
        const errorMsg = `Task ${i + 1} failed: ${(error as Error).message}`;
        console.error(`   ❌ ${errorMsg}`);
        this.state.errors.push(errorMsg);

        // Continue to next task instead of stopping
        continue;
      }
    }

    this.state.status = 'completed';
    this.state.completed_at = new Date();
    console.log(`\n✨ Generation completed: ${this.state.completed_count}/${this.state.tasks.length} images`);
  }

  /**
   * Flatten jobs into individual tasks
   */
  private flattenJobs(jobs: Job[], draftsPerCombination: number): Task[] {
    const tasks: Task[] = [];

    for (const job of jobs) {
      const outfits = Array.isArray(job.outfit) ? job.outfit : [job.outfit];
      const cameras = Array.isArray(job.camera) ? job.camera : [job.camera];
      const poses = Array.isArray(job.pose) ? job.pose : [job.pose];
      const expressions = Array.isArray(job.expression) ? job.expression : [job.expression];
      const backgrounds = Array.isArray(job.background) ? job.background : [job.background];

      // Cartesian product
      for (const outfit of outfits) {
        for (const camera of cameras) {
          for (const pose of poses) {
            for (const expression of expressions) {
              for (const background of backgrounds) {
                for (let draft = 1; draft <= draftsPerCombination; draft++) {
                  tasks.push({
                    style: job.style,
                    character: job.character,
                    outfit,
                    camera,
                    pose,
                    expression,
                    background,
                    draft_index: draft,
                  });
                }
              }
            }
          }
        }
      }
    }

    return tasks;
  }

  /**
   * Resolve task by looking up components in library
   */
  private resolveTask(task: Task, library: Library, baseModel: BaseModel): ResolvedTask {
    const style = library.styles[task.style];
    const character = library.characters[task.character];
    const camera = library.cameras[task.camera];
    const pose = library.poses[task.pose];
    const expression = library.expressions[task.expression];
    const background = library.backgrounds[task.background];

    if (!style) throw new Error(`Style not found: ${task.style}`);
    if (!character) throw new Error(`Character not found: ${task.character}`);
    if (!camera) throw new Error(`Camera not found: ${task.camera}`);
    if (!pose) throw new Error(`Pose not found: ${task.pose}`);
    if (!expression) throw new Error(`Expression not found: ${task.expression}`);
    if (!background) throw new Error(`Background not found: ${task.background}`);

    // Resolve outfit
    let outfit: SimpleComponent | null = null;
    if (task.outfit !== 'default' && task.outfit !== 'none') {
      outfit = library.outfits[task.outfit];
      if (!outfit) throw new Error(`Outfit not found: ${task.outfit}`);
    }

    return {
      ...task,
      resolved: {
        base_model: baseModel,
        style,
        character,
        outfit,
        camera,
        pose,
        expression,
        background,
      },
    };
  }

  /**
   * Save result to output folder
   */
  private async saveResult(
    resolved: ResolvedTask,
    baseModel: BaseModel,
    builtPrompt: any,
    output: { filename: string; subfolder: string },
    taskIndex: number
  ): Promise<string> {
    const { style, character, outfit, camera, pose, background, expression } = resolved.resolved;

    // Create output directory: output/{style}/{character}/
    const outputDir = path.join(config.outputPath, resolved.style, resolved.character);
    await fs.mkdir(outputDir, { recursive: true });

    // Generate filename: {index}_{pose}_{camera}_{outfit}_{seed}.png
    const seed = Math.floor(Math.random() * 4294967295);
    const outfitName = resolved.outfit === 'default' ? 'default' : resolved.outfit === 'none' ? 'none' : resolved.outfit;
    const filename = `${taskIndex + 1}_${resolved.pose}_${resolved.camera}_${outfitName}_${seed}.png`;

    const destImagePath = path.join(outputDir, filename);
    const destMetaPath = path.join(outputDir, filename.replace('.png', '.yaml'));

    // Copy image from ComfyUI output
    const sourcePath = path.join(config.comfyOutput, output.subfolder, output.filename);
    await fs.copyFile(sourcePath, destImagePath);

    // Create metadata
    const metadata: OutputMetadata = {
      generated: new Date().toISOString(),
      seed,
      task_index: taskIndex,
      total_tasks: this.state.tasks.length,
      checkpoint: baseModel.checkpoint,
      settings: baseModel.settings,
      components: {
        style: resolved.style,
        character: resolved.character,
        outfit: resolved.outfit,
        camera: resolved.camera,
        pose: resolved.pose,
        expression: resolved.expression,
        background: resolved.background,
      },
      loras: builtPrompt.lora_stack,
      prompt: {
        positive: builtPrompt.final_positive,
        negative: builtPrompt.final_negative,
      },
      source_data: {
        style,
        character,
        outfit,
        camera,
        pose,
        expression,
        background,
      },
    };

    // Save metadata as YAML
    const yamlContent = yaml.dump(metadata, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
    await fs.writeFile(destMetaPath, yamlContent, 'utf-8');

    return destImagePath;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const generationService = new GenerationService();
