import * as fs from "node:fs/promises";
import * as path from "node:path";
import { convertEncoding } from "./utils";

/**
 * Read wiki file and convert encoding to UTF-8
 *
 * @param filePath - Path to wiki file
 * @param encoding - Source encoding
 * @returns File content as UTF-8 string
 */
export const readWikiFile = async (
  filePath: string,
  encoding: string,
): Promise<string> => {
  const buffer = await fs.readFile(filePath);
  return convertEncoding(buffer, encoding);
};

/**
 * Copy attachment file to destination
 *
 * @param sourcePath - Source file path
 * @param destPath - Destination file path
 */
export const copyAttachment = async (
  sourcePath: string,
  destPath: string,
): Promise<void> => {
  await fs.copyFile(sourcePath, destPath);
};

/**
 * Write Markdown file (UTF-8)
 *
 * @param filePath - Output file path
 * @param content - Markdown content
 */
export const writeMarkdown = async (
  filePath: string,
  content: string,
): Promise<void> => {
  await fs.writeFile(filePath, content, "utf-8");
};

/**
 * Ensure directory exists (create recursively if needed)
 *
 * @param dirPath - Directory path
 */
export const ensureDir = async (dirPath: string): Promise<void> => {
  await fs.mkdir(dirPath, { recursive: true });
};

/**
 * Check if file or directory exists
 *
 * @param filePath - Path to check
 * @returns true if exists
 */
export const exists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get all files in directory recursively
 *
 * @param dirPath - Directory path
 * @returns Array of file paths (sorted)
 */
export const getFiles = async (dirPath: string): Promise<string[]> => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getFiles(fullPath);
      files.push(...subFiles);
    } else {
      files.push(fullPath);
    }
  }

  return files.sort();
};
