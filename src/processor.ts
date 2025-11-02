import * as path from "node:path";
import { convertToMarkdown } from "./converter";
import { decodeFileName, splitPagePath } from "./utils";
import {
  readWikiFile,
  copyAttachment,
  writeMarkdown,
  ensureDir,
  getFiles,
} from "./file-io";

export type ConversionStats = {
  pagesConverted: number;
  pageErrors: number;
  attachmentsCopied: number;
  attachmentErrors: number;
};

/**
 * Get wiki files to process
 *
 * @param wikiDir - Wiki directory path
 * @param encoding - File encoding (used for decoding filenames)
 * @returns Array of wiki file paths to process
 */
const getWikiFiles = async (
  wikiDir: string,
  encoding: string,
): Promise<string[]> => {
  const allFiles = await getFiles(wikiDir);
  return allFiles.filter((filePath) => {
    const fileName = path.basename(filePath);
    // Must be .txt file
    if (!fileName.endsWith(".txt")) {
      return false;
    }
    // Decode filename to check the actual page name
    const baseName = path.basename(fileName, ".txt");
    try {
      const pageName = decodeFileName(baseName, encoding);
      // Exclude system pages only (users can create pages starting with :)
      if (
        pageName === ":config" ||
        pageName.startsWith(":config/") ||
        pageName === ":RenameLog"
      ) {
        return false;
      }
    } catch {
      // If decoding fails, include the file (better to process than skip)
      return true;
    }
    return true;
  });
};

/**
 * Get attachment files to process
 *
 * @param attachDir - Attachment directory path
 * @returns Array of attachment file paths to process
 */
const getAttachmentFiles = async (attachDir: string): Promise<string[]> => {
  const allFiles = await getFiles(attachDir);
  return allFiles.filter((filePath) => {
    const fileName = path.basename(filePath);
    // Must contain underscore
    if (!fileName.includes("_")) {
      return false;
    }
    // Must not end with .log
    if (fileName.endsWith(".log")) {
      return false;
    }
    return true;
  });
};

/**
 * Process single wiki file
 *
 * @param filePath - Wiki file path
 * @param outputDir - Output directory path
 * @param encoding - File encoding
 * @param excludeBlockPlugins - Block plugins to exclude
 * @param stripComments - Whether to remove HTML comments
 * @returns Output path if successful, null if failed
 */
const processWikiFile = async (
  filePath: string,
  outputDir: string,
  encoding: string,
  excludeBlockPlugins: string[],
  stripComments: boolean,
): Promise<{ success: boolean; outputPath?: string; error?: string }> => {
  try {
    const fileName = path.basename(filePath, ".txt");

    // Decode filename to get page name
    const pageName = decodeFileName(fileName, encoding);

    // Split into directory and filename
    const { dir, name } = splitPagePath(pageName);

    // Create output path
    const outputSubDir = dir ? path.join(outputDir, dir) : outputDir;
    await ensureDir(outputSubDir);

    const outputPath = path.join(outputSubDir, `${name}.md`);

    // Read wiki file
    const content = await readWikiFile(filePath, encoding);

    // Convert PukiWiki syntax to Markdown
    const converted = convertToMarkdown(content, pageName, {
      excludeBlockPlugins,
      stripComments,
    });

    // Write as markdown
    await writeMarkdown(outputPath, converted);

    return { success: true, outputPath };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
};

/**
 * Process single attachment file
 *
 * @param filePath - Attachment file path
 * @param outputDir - Output directory path
 * @param encoding - File encoding
 * @returns Output path if successful, null if failed
 */
const processAttachmentFile = async (
  filePath: string,
  outputDir: string,
  encoding: string,
): Promise<{ success: boolean; outputPath?: string; error?: string }> => {
  try {
    const fileName = path.basename(filePath);

    // Split filename into page name and attachment name
    const underscoreIndex = fileName.indexOf("_");
    const encodedPageName = fileName.substring(0, underscoreIndex);
    const encodedFileName = fileName.substring(underscoreIndex + 1);

    // Decode both parts
    const pageName = decodeFileName(encodedPageName, encoding);
    const attachmentName = decodeFileName(encodedFileName, encoding);

    // Create output path
    const { dir, name } = splitPagePath(pageName);
    const outputSubDir = dir ? path.join(outputDir, dir) : outputDir;
    await ensureDir(outputSubDir);

    const newFileName = `${name}_attachment_${attachmentName}`;
    const destPath = path.join(outputSubDir, newFileName);

    // Copy attachment
    await copyAttachment(filePath, destPath);

    return { success: true, outputPath: destPath };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
};

/**
 * Process conversion from PukiWiki to Markdown
 *
 * @param wikiDir - Wiki directory path
 * @param attachDir - Attachment directory path
 * @param outputDir - Output directory path
 * @param encoding - File encoding
 * @param excludeBlockPlugins - Block plugins to exclude
 * @param stripComments - Whether to remove HTML comments
 * @returns Conversion statistics
 */
export const processConversion = async (
  wikiDir: string,
  attachDir: string,
  outputDir: string,
  encoding: string,
  excludeBlockPlugins: string[] = [],
  stripComments: boolean = false,
): Promise<ConversionStats> => {
  let pagesConverted = 0;
  let pageErrors = 0;
  let attachmentsCopied = 0;
  let attachmentErrors = 0;

  // Ensure output directory exists
  await ensureDir(outputDir);

  // Get files to process
  const wikiFiles = await getWikiFiles(wikiDir, encoding);
  const attachmentFiles = await getAttachmentFiles(attachDir);

  // Log file counts
  console.log(`Wiki files: ${wikiFiles.length}`);
  console.log(`Attachment files: ${attachmentFiles.length}`);
  console.log();

  // Process wiki files
  for (const filePath of wikiFiles) {
    const result = await processWikiFile(
      filePath,
      outputDir,
      encoding,
      excludeBlockPlugins,
      stripComments,
    );
    if (result.success) {
      console.log(`[SUCCESS] ${filePath} → ${result.outputPath} (converted)`);
      pagesConverted++;
    } else {
      console.log(`[ERROR] ${filePath} → (${result.error})`);
      pageErrors++;
    }
  }

  // Process attachments
  for (const filePath of attachmentFiles) {
    const result = await processAttachmentFile(filePath, outputDir, encoding);
    if (result.success) {
      console.log(
        `[SUCCESS] ${filePath} → ${result.outputPath} (attachment copied)`,
      );
      attachmentsCopied++;
    } else {
      console.log(`[ERROR] ${filePath} → (${result.error})`);
      attachmentErrors++;
    }
  }

  return {
    pagesConverted,
    pageErrors,
    attachmentsCopied,
    attachmentErrors,
  };
};
