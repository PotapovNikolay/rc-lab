import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { config } from '../config';
import {
  BaseModel,
  Style,
  Character,
  SimpleComponent,
  ComponentType,
  Library,
} from '../types';

export class YamlService {
  /**
   * Read all YAML files from a folder and merge them into a single object
   */
  async readAllFromFolder(type: ComponentType): Promise<Record<string, any>> {
    const folderPath = path.join(config.libraryPath, type);

    try {
      const files = await fs.readdir(folderPath);
      const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

      const merged: Record<string, any> = {};

      for (const file of yamlFiles) {
        const filePath = path.join(folderPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = yaml.load(content) as Record<string, any>;

        if (data && typeof data === 'object') {
          Object.assign(merged, data);
        }
      }

      return merged;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {};
      }
      throw error;
    }
  }

  /**
   * Read base_model.yaml
   */
  async readBaseModel(): Promise<BaseModel> {
    const filePath = path.join(config.libraryPath, 'base_model.yaml');

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = yaml.load(content) as BaseModel;
      return data;
    } catch (error) {
      throw new Error(`Failed to read base_model.yaml: ${(error as Error).message}`);
    }
  }

  /**
   * Write base_model.yaml
   */
  async writeBaseModel(data: BaseModel): Promise<void> {
    const filePath = path.join(config.libraryPath, 'base_model.yaml');

    try {
      const yamlContent = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });
      await fs.writeFile(filePath, yamlContent, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write base_model.yaml: ${(error as Error).message}`);
    }
  }

  /**
   * Get a specific item by ID from a component type
   */
  async getItem(type: ComponentType, id: string): Promise<any | null> {
    const all = await this.readAllFromFolder(type);
    return all[id] || null;
  }

  /**
   * Find which file contains a specific ID
   */
  async findFileContainingId(type: ComponentType, id: string): Promise<string | null> {
    const folderPath = path.join(config.libraryPath, type);

    try {
      const files = await fs.readdir(folderPath);
      const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

      for (const file of yamlFiles) {
        const filePath = path.join(folderPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = yaml.load(content) as Record<string, any>;

        if (data && typeof data === 'object' && id in data) {
          return file;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create a new item in a new file (filename = id.yaml)
   */
  async createItem(type: ComponentType, id: string, data: any): Promise<void> {
    // Validate ID format
    if (!/^[a-z0-9_]+$/.test(id)) {
      throw new Error('ID must contain only lowercase letters, numbers, and underscores');
    }

    // Validate required fields
    this.validateComponentData(type, id, data);

    // Check if ID already exists
    const existing = await this.getItem(type, id);
    if (existing) {
      throw new Error(`Item with ID "${id}" already exists in ${type}`);
    }

    const folderPath = path.join(config.libraryPath, type);
    const filePath = path.join(folderPath, `${id}.yaml`);

    // Ensure folder exists
    await fs.mkdir(folderPath, { recursive: true });

    // Create YAML with the ID as key
    const yamlData = { [id]: data };
    const yamlContent = yaml.dump(yamlData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });

    await fs.writeFile(filePath, yamlContent, 'utf-8');
  }

  /**
   * Update an existing item
   */
  async updateItem(type: ComponentType, id: string, data: any): Promise<void> {
    // Validate data
    this.validateComponentData(type, id, data);

    // Find which file contains this ID
    const fileName = await this.findFileContainingId(type, id);
    if (!fileName) {
      throw new Error(`Item with ID "${id}" not found in ${type}`);
    }

    const filePath = path.join(config.libraryPath, type, fileName);

    // Read the file
    const content = await fs.readFile(filePath, 'utf-8');
    const fileData = yaml.load(content) as Record<string, any>;

    // Update the specific item
    fileData[id] = data;

    // Write back
    const yamlContent = yaml.dump(fileData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });

    await fs.writeFile(filePath, yamlContent, 'utf-8');
  }

  /**
   * Delete an item (remove from file, or delete file if it's the only item)
   */
  async deleteItem(type: ComponentType, id: string): Promise<void> {
    const fileName = await this.findFileContainingId(type, id);
    if (!fileName) {
      throw new Error(`Item with ID "${id}" not found in ${type}`);
    }

    const filePath = path.join(config.libraryPath, type, fileName);

    // Read the file
    const content = await fs.readFile(filePath, 'utf-8');
    const fileData = yaml.load(content) as Record<string, any>;

    // Remove the item
    delete fileData[id];

    // If file is now empty, delete it
    if (Object.keys(fileData).length === 0) {
      await fs.unlink(filePath);
    } else {
      // Otherwise, write back without this item
      const yamlContent = yaml.dump(fileData, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });
      await fs.writeFile(filePath, yamlContent, 'utf-8');
    }
  }

  /**
   * Load entire library
   */
  async loadLibrary(): Promise<Library> {
    const [styles, characters, cameras, outfits, poses, expressions, backgrounds] = await Promise.all([
      this.readAllFromFolder('styles'),
      this.readAllFromFolder('characters'),
      this.readAllFromFolder('cameras'),
      this.readAllFromFolder('outfits'),
      this.readAllFromFolder('poses'),
      this.readAllFromFolder('expressions'),
      this.readAllFromFolder('backgrounds'),
    ]);

    return {
      styles: styles as Record<string, Style>,
      characters: characters as Record<string, Character>,
      cameras: cameras as Record<string, SimpleComponent>,
      outfits: outfits as Record<string, SimpleComponent>,
      poses: poses as Record<string, SimpleComponent>,
      expressions: expressions as Record<string, SimpleComponent>,
      backgrounds: backgrounds as Record<string, SimpleComponent>,
    };
  }

  /**
   * Validate component data based on type
   */
  private validateComponentData(type: ComponentType, id: string, data: any): void {
    // All components require name, positive, negative
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Component must have a "name" field');
    }
    if (typeof data.positive !== 'string') {
      throw new Error('Component must have a "positive" field');
    }
    if (typeof data.negative !== 'string') {
      throw new Error('Component must have a "negative" field');
    }

    // Type-specific validation
    if (type === 'characters') {
      if (!data.lora || !data.lora.file || typeof data.lora.strength !== 'number') {
        throw new Error('Character must have a valid "lora" field with file and strength');
      }
      if (!data.appearance || typeof data.appearance.positive !== 'string') {
        throw new Error('Character must have an "appearance" field');
      }
      if (!data.default_outfit || typeof data.default_outfit.positive !== 'string') {
        throw new Error('Character must have a "default_outfit" field');
      }
      if (typeof data.weight !== 'number') {
        throw new Error('Character must have a numeric "weight" field');
      }
    }

    if (type === 'styles') {
      if (!Array.isArray(data.loras)) {
        throw new Error('Style must have a "loras" array');
      }
      if (!data.body || typeof data.body.positive !== 'string') {
        throw new Error('Style must have a "body" field');
      }
    }
  }
}

export const yamlService = new YamlService();
