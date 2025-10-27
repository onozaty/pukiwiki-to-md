import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as iconv from "iconv-lite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  cleanupTempDir,
  createTempDir,
  createTestFiles,
  getAllFiles,
} from "../test/utils";
import { processConversion } from "./processor";

let testDir: string;
let wikiDir: string;
let attachDir: string;
let outputDir: string;

describe("processConversion", () => {
  beforeEach(async () => {
    // Create unique temp directory for each test
    testDir = await createTempDir();
    wikiDir = path.join(testDir, "wiki");
    attachDir = path.join(testDir, "attach");
    outputDir = path.join(testDir, "output");

    // Create test directories
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.mkdir(attachDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up temp directory
    await cleanupTempDir(testDir);
  });

  it("should process wiki files and exclude pages starting with colon", async () => {
    // Create test files
    // E38386E382B9E38388 = テスト (regular page)
    // 3A636F6E666967 = :config (should be excluded)
    // 3A52656E616D654C6F67 = :RenameLog (should be excluded)
    await createTestFiles(wikiDir, {
      "E38386E382B9E38388.txt": "Test content",
      "3A636F6E666967.txt": "Config content", // :config
      "3A52656E616D654C6F67.txt": "Rename log", // :RenameLog
    });

    const stats = await processConversion(
      wikiDir,
      attachDir,
      outputDir,
      "utf-8",
    );

    // Check output files - only regular page should be converted
    const outputFiles = await getAllFiles(outputDir);
    expect(outputFiles).toEqual(["テスト.md"]);

    // Check stats
    expect(stats.pagesConverted).toBe(1);
    expect(stats.pageErrors).toBe(0);
  });

  it("should process attachments and exclude log files", async () => {
    // Create test wiki file (テスト in UTF-8)
    await createTestFiles(wikiDir, {
      "E38386E382B9E38388.txt": "Test",
    });

    // Create test attachment files
    await createTestFiles(attachDir, {
      E38386E382B9E38388_696D6167652E706E67: "fake image",
      "E38386E382B9E38388_696D6167652E706E67.log": "log data",
    });

    const stats = await processConversion(
      wikiDir,
      attachDir,
      outputDir,
      "utf-8",
    );

    // Check output files
    const outputFiles = await getAllFiles(outputDir);
    expect(outputFiles).toEqual(["テスト.md", "テスト_attachment_image.png"]);

    // Check stats
    expect(stats.pagesConverted).toBe(1);
    expect(stats.attachmentsCopied).toBe(1);
    expect(stats.attachmentErrors).toBe(0);
  });

  it("should create hierarchical directory structure", async () => {
    // Create test file with hierarchy (プロジェクト/タスク in UTF-8)
    await createTestFiles(wikiDir, {
      "E38397E383ADE382B8E382A7E382AFE383882FE382BFE382B9E382AF.txt":
        "Task content",
    });

    const stats = await processConversion(
      wikiDir,
      attachDir,
      outputDir,
      "utf-8",
    );

    // Check output files
    const outputFiles = await getAllFiles(outputDir);
    expect(outputFiles).toEqual([path.join("プロジェクト", "タスク.md")]);

    // Check stats
    expect(stats.pagesConverted).toBe(1);
  });

  it("should rename attachments correctly", async () => {
    // Create test wiki file
    await createTestFiles(wikiDir, {
      "E38386E382B9E38388.txt": "Test",
    });

    // Create test attachment (テスト_image.png in UTF-8)
    await createTestFiles(attachDir, {
      E38386E382B9E38388_696D6167652E706E67: "fake image",
    });

    const stats = await processConversion(
      wikiDir,
      attachDir,
      outputDir,
      "utf-8",
    );

    // Check output files
    const outputFiles = await getAllFiles(outputDir);
    expect(outputFiles).toEqual(["テスト.md", "テスト_attachment_image.png"]);

    // Check stats
    expect(stats.pagesConverted).toBe(1);
    expect(stats.attachmentsCopied).toBe(1);
  });

  it("should process multiple files correctly", async () => {
    // Create multiple test files
    await createTestFiles(wikiDir, {
      "E38386E382B9E383881.txt": "Test 1",
      "E38386E382B9E383882.txt": "Test 2",
    });
    await createTestFiles(attachDir, {
      E38386E382B9E38388_696D6167652E706E67: "image",
    });

    const stats = await processConversion(
      wikiDir,
      attachDir,
      outputDir,
      "utf-8",
    );

    // Check stats (2 wiki files + 1 attachment)
    expect(stats.pagesConverted).toBe(2);
    expect(stats.attachmentsCopied).toBe(1);
  });

  it("should exclude index.html and .htaccess from wiki folder", async () => {
    // Create wiki files including index.html and .htaccess
    await createTestFiles(wikiDir, {
      "E38386E382B9E38388.txt": "Test content",
      "index.html": "index",
      ".htaccess": "htaccess",
    });

    const stats = await processConversion(
      wikiDir,
      attachDir,
      outputDir,
      "utf-8",
    );

    // Check output files
    const outputFiles = await getAllFiles(outputDir);
    expect(outputFiles).toEqual(["テスト.md"]);

    // Check stats (only .txt file should be processed)
    expect(stats.pagesConverted).toBe(1);
    expect(stats.pageErrors).toBe(0);
  });

  it("should exclude index.html and .htaccess from attach folder", async () => {
    // Create files without underscore (not attachment format)
    await createTestFiles(attachDir, {
      "index.html": "index",
      ".htaccess": "htaccess",
    });

    const stats = await processConversion(
      wikiDir,
      attachDir,
      outputDir,
      "utf-8",
    );

    // Check output files (should be empty)
    const outputFiles = await getAllFiles(outputDir);
    expect(outputFiles).toEqual([]);

    // Check stats (no files should be processed)
    expect(stats.pagesConverted).toBe(0);
    expect(stats.attachmentsCopied).toBe(0);
    expect(stats.attachmentErrors).toBe(0);
  });

  it("should handle attachments for hierarchical pages", async () => {
    // Create hierarchical wiki file (プロジェクト/タスク in UTF-8)
    await createTestFiles(wikiDir, {
      "E38397E383ADE382B8E382A7E382AFE383882FE382BFE382B9E382AF.txt":
        "Task content",
    });

    // Create attachment for hierarchical page (プロジェクト/タスク_image.png)
    await createTestFiles(attachDir, {
      E38397E383ADE382B8E382A7E382AFE383882FE382BFE382B9E382AF_696D6167652E706E67:
        "fake image",
    });

    const stats = await processConversion(
      wikiDir,
      attachDir,
      outputDir,
      "utf-8",
    );

    // Check output files
    const outputFiles = await getAllFiles(outputDir);
    expect(outputFiles).toEqual([
      path.join("プロジェクト", "タスク.md"),
      path.join("プロジェクト", "タスク_attachment_image.png"),
    ]);

    // Check stats
    expect(stats.pagesConverted).toBe(1);
    expect(stats.attachmentsCopied).toBe(1);
  });

  it("should convert wiki file content correctly (UTF-8)", async () => {
    // Create test wiki file with specific content
    const inputContent = "これはテスト内容です。\n複数行のテキスト。";
    await createTestFiles(wikiDir, {
      "E38386E382B9E38388.txt": inputContent,
    });

    await processConversion(wikiDir, attachDir, outputDir, "utf-8");

    // Read the converted file and check content
    const outputFile = path.join(outputDir, "テスト.md");
    const outputContent = await fs.readFile(outputFile, "utf-8");
    expect(outputContent).toBe(inputContent);
  });

  it("should convert wiki file content correctly (EUC-JP)", async () => {
    // Create test wiki file with EUC-JP encoded content
    const inputContent = "これはテスト内容です。\n複数行のテキスト。";
    const encodedContent = iconv.encode(inputContent, "euc-jp");

    // Write file as EUC-JP encoded
    const filePath = path.join(wikiDir, "A5C6A5B9A5C8.txt");
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(filePath, encodedContent);

    await processConversion(wikiDir, attachDir, outputDir, "euc-jp");

    // Read the converted file and check content
    const outputFile = path.join(outputDir, "テスト.md");
    const outputContent = await fs.readFile(outputFile, "utf-8");
    expect(outputContent).toBe(inputContent);
  });

  it("should copy attachment file content correctly", async () => {
    // Create test wiki file
    await createTestFiles(wikiDir, {
      "E38386E382B9E38388.txt": "Test",
    });

    // Create attachment with specific content
    const attachmentContent = "This is fake image data";
    await createTestFiles(attachDir, {
      E38386E382B9E38388_696D6167652E706E67: attachmentContent,
    });

    await processConversion(wikiDir, attachDir, outputDir, "utf-8");

    // Read the copied attachment and check content
    const outputFile = path.join(outputDir, "テスト_attachment_image.png");
    const outputContent = await fs.readFile(outputFile, "utf-8");
    expect(outputContent).toBe(attachmentContent);
  });
});
