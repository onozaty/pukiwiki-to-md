import { mkdtemp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export const createTempDir = async (): Promise<string> => {
  return await mkdtemp(join(tmpdir(), "pukiwiki-to-md-test-"));
};

export const createTestFiles = async (
  dir: string,
  files: Record<string, string>
): Promise<void> => {
  for (const [path, content] of Object.entries(files)) {
    const fullPath = join(dir, path);
    const dirPath = dirname(fullPath);
    await mkdir(dirPath, { recursive: true });
    await writeFile(fullPath, content, "utf-8");
  }
};

export const cleanupTempDir = async (dir: string): Promise<void> => {
  await rm(dir, { recursive: true, force: true });
};

export const getAllFiles = async (
  dir: string,
  baseDir?: string,
): Promise<string[]> => {
  try {
    const base = baseDir ?? dir;
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await getAllFiles(fullPath, base);
        files.push(...subFiles);
      } else {
        // Return relative path from base directory
        const relativePath = fullPath.substring(base.length + 1);
        files.push(relativePath);
      }
    }

    return files.sort();
  } catch {
    return [];
  }
};
