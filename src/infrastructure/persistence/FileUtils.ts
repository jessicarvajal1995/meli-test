import { promises as fs } from "fs";
import path from "path";
import { FileOperationError } from "@/infrastructure/errors/FileOperationError";

export class FileUtils {
  private static readonly DATA_DIR = path.join(process.cwd(), "data");

  static async readJsonFile<T>(filename: string): Promise<T[]> {
    try {
      const filePath = path.join(this.DATA_DIR, filename);

      await fs.access(filePath);

      const content = await fs.readFile(filePath, "utf-8");

      if (!content.trim()) {
        return [];
      }

      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw new FileOperationError(
        `Error reading JSON file ${filename}: ${(error as Error).message}`,
        error as Error,
      );
    }
  }

  static async writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
    try {
      const filePath = path.join(this.DATA_DIR, filename);

      await fs.mkdir(path.dirname(filePath), { recursive: true });

      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, content, "utf-8");
    } catch (error) {
      throw new FileOperationError(
        `Error writing JSON file ${filename}: ${(error as Error).message}`,
        error as Error,
      );
    }
  }

  static async fileExists(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.DATA_DIR, filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async backupFile(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.DATA_DIR, filename);
      const backupPath = path.join(
        this.DATA_DIR,
        `${filename}.backup.${Date.now()}`,
      );

      if (await this.fileExists(filename)) {
        await fs.copyFile(filePath, backupPath);
      }
    } catch (error) {
      throw new FileOperationError(
        `Error creating backup for ${filename}: ${(error as Error).message}`,
        error as Error,
      );
    }
  }
}
