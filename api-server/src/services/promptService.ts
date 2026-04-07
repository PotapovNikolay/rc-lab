import { ResolvedTask, BuiltPrompt, LoraInStack, ComfyUIWorkflow, BaseModel } from '../types';

export class PromptService {
  /**
   * Build final prompt from resolved task
   * Order: Quality → Style (loras + body + style) → Camera → Character (trigger + appearance) → Outfit → Pose → Expression → Background
   */
  buildPrompt(task: ResolvedTask): BuiltPrompt {
    const parts_positive: string[] = [];
    const parts_negative: string[] = [];
    const lora_stack: LoraInStack[] = [];

    const { base_model, style, character, outfit, camera, pose, expression, background } = task.resolved;

    // 1. Quality (base_model)
    if (base_model.positive) {
      parts_positive.push(base_model.positive);
    }
    if (base_model.negative) {
      parts_negative.push(base_model.negative);
    }

    // 2. Style: loras → body → style
    // Style loras
    for (const lora of style.loras) {
      if (lora.positive) parts_positive.push(lora.positive);
      if (lora.negative) parts_negative.push(lora.negative);
      lora_stack.push({
        file: lora.file,
        strength: lora.strength,
        type: 'style',
      });
    }

    // Body lora (if exists)
    if (style.body.lora) {
      lora_stack.push({
        file: style.body.lora.file,
        strength: style.body.lora.strength,
        type: 'body',
      });
    }

    // Body prompts
    if (style.body.positive) parts_positive.push(style.body.positive);
    if (style.body.negative) parts_negative.push(style.body.negative);

    // Style prompts
    if (style.positive) parts_positive.push(style.positive);
    if (style.negative) parts_negative.push(style.negative);

    // 3. Camera
    if (camera.lora) {
      lora_stack.push({
        file: camera.lora.file,
        strength: camera.lora.strength,
        type: 'camera',
      });
    }
    if (camera.positive) parts_positive.push(camera.positive);
    if (camera.negative) parts_negative.push(camera.negative);

    // 4. Character: lora → trigger → appearance
    lora_stack.push({
      file: character.lora.file,
      strength: character.lora.strength,
      type: 'character',
    });

    if (character.positive) parts_positive.push(character.positive);
    if (character.appearance.positive) parts_positive.push(character.appearance.positive);
    if (character.negative) parts_negative.push(character.negative);
    if (character.appearance.negative) parts_negative.push(character.appearance.negative);

    // 5. Outfit
    if (outfit) {
      // If 'default', use character's default_outfit
      // If specific outfit from library, use that
      // 'none' means outfit is null, so we skip
      if (outfit.lora) {
        lora_stack.push({
          file: outfit.lora.file,
          strength: outfit.lora.strength,
          type: 'outfit',
        });
      }
      if (outfit.positive) parts_positive.push(outfit.positive);
      if (outfit.negative) parts_negative.push(outfit.negative);
    } else if (task.outfit === 'default') {
      // Use character default_outfit
      if (character.default_outfit.positive) parts_positive.push(character.default_outfit.positive);
      if (character.default_outfit.negative) parts_negative.push(character.default_outfit.negative);
    }
    // 'none' = no outfit prompts

    // 6. Pose
    if (pose.lora) {
      lora_stack.push({
        file: pose.lora.file,
        strength: pose.lora.strength,
        type: 'pose',
      });
    }
    if (pose.positive) parts_positive.push(pose.positive);
    if (pose.negative) parts_negative.push(pose.negative);

    // 7. Expression
    if (expression.lora) {
      lora_stack.push({
        file: expression.lora.file,
        strength: expression.lora.strength,
        type: 'expression',
      });
    }
    if (expression.positive) parts_positive.push(expression.positive);
    if (expression.negative) parts_negative.push(expression.negative);

    // 8. Background
    if (background.lora) {
      lora_stack.push({
        file: background.lora.file,
        strength: background.lora.strength,
        type: 'background',
      });
    }
    if (background.positive) parts_positive.push(background.positive);
    if (background.negative) parts_negative.push(background.negative);

    // Join with commas
    const final_positive = parts_positive.filter(p => p.trim()).join(', ');
    const final_negative = parts_negative.filter(p => p.trim()).join(', ');

    return {
      final_positive,
      final_negative,
      lora_stack,
    };
  }

  /**
   * Build ComfyUI workflow JSON
   * This creates a complete API workflow for ComfyUI
   */
  buildComfyWorkflow(
    base_model: BaseModel,
    prompt: BuiltPrompt,
    seed?: number
  ): ComfyUIWorkflow {
    const actualSeed = seed || Math.floor(Math.random() * 4294967295);

    // Build LoRA chain
    let lastLoraNodeId = '4'; // Start from checkpoint loader
    const loraNodes: Record<string, any> = {};

    prompt.lora_stack.forEach((lora, index) => {
      const nodeId = `10${index}`;
      loraNodes[nodeId] = {
        inputs: {
          lora_name: lora.file,
          strength_model: lora.strength,
          strength_clip: lora.strength,
          model: [lastLoraNodeId, 0],
          clip: [lastLoraNodeId, 1],
        },
        class_type: 'LoraLoader',
        _meta: {
          title: `LoRA ${index + 1}: ${lora.type}`,
        },
      };
      lastLoraNodeId = nodeId;
    });

    // Final model and CLIP outputs
    const finalModelOutput = [lastLoraNodeId, 0];
    const finalClipOutput = [lastLoraNodeId, 1];

    // Build the workflow
    const workflow: ComfyUIWorkflow = {
      // Checkpoint Loader
      '4': {
        inputs: {
          ckpt_name: base_model.checkpoint,
        },
        class_type: 'CheckpointLoaderSimple',
        _meta: {
          title: 'Load Checkpoint',
        },
      },

      // Add all LoRA nodes
      ...loraNodes,

      // CLIP Skip
      '200': {
        inputs: {
          stop_at_clip_layer: -base_model.settings.clip_skip,
          clip: finalClipOutput,
        },
        class_type: 'CLIPSetLastLayer',
        _meta: {
          title: 'CLIP Skip',
        },
      },

      // Positive Prompt
      '6': {
        inputs: {
          text: prompt.final_positive,
          clip: ['200', 0],
        },
        class_type: 'CLIPTextEncode',
        _meta: {
          title: 'Positive Prompt',
        },
      },

      // Negative Prompt
      '7': {
        inputs: {
          text: prompt.final_negative,
          clip: ['200', 0],
        },
        class_type: 'CLIPTextEncode',
        _meta: {
          title: 'Negative Prompt',
        },
      },

      // Empty Latent Image
      '5': {
        inputs: {
          width: base_model.settings.width,
          height: base_model.settings.height,
          batch_size: 1,
        },
        class_type: 'EmptyLatentImage',
        _meta: {
          title: 'Empty Latent',
        },
      },

      // KSampler
      '3': {
        inputs: {
          seed: actualSeed,
          steps: base_model.settings.steps,
          cfg: base_model.settings.cfg,
          sampler_name: base_model.settings.sampler,
          scheduler: base_model.settings.scheduler,
          denoise: 1.0,
          model: finalModelOutput,
          positive: ['6', 0],
          negative: ['7', 0],
          latent_image: ['5', 0],
        },
        class_type: 'KSampler',
        _meta: {
          title: 'KSampler',
        },
      },

      // VAE Decode
      '8': {
        inputs: {
          samples: ['3', 0],
          vae: ['4', 2],
        },
        class_type: 'VAEDecode',
        _meta: {
          title: 'VAE Decode',
        },
      },

      // Save Image
      '9': {
        inputs: {
          filename_prefix: 'ai_factory',
          images: ['8', 0],
        },
        class_type: 'SaveImage',
        _meta: {
          title: 'Save Image',
        },
      },
    };

    return workflow;
  }
}

export const promptService = new PromptService();
