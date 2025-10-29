import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as iconv from "iconv-lite";
import { cleanupTempDir, createTempDir, createTestFiles } from "../test/utils";
import { main } from "./index";

let testDir: string;
let wikiDir: string;
let attachDir: string;
let outputDir: string;
let consoleLogSpy: ReturnType<typeof vi.spyOn>;

describe("main", () => {
  beforeEach(async () => {
    // Create unique temp directory for each test
    testDir = await createTempDir();
    wikiDir = path.join(testDir, "wiki");
    attachDir = path.join(testDir, "attach");
    outputDir = path.join(testDir, "output");

    // Create test directories
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.mkdir(attachDir, { recursive: true });

    // Create a sample wiki file
    await createTestFiles(wikiDir, {
      "E38386E382B9E38388.txt": "*テスト\nテキスト",
    });

    // Setup console.log spy before each test
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(async () => {
    // Clean up temp directory
    await cleanupTempDir(testDir);

    // Restore console.log spy
    consoleLogSpy.mockRestore();
  });

  it("should successfully convert with valid arguments", async () => {
    await main(wikiDir, attachDir, outputDir);

    expect(consoleLogSpy).toHaveBeenCalledWith("Starting conversion...");
    expect(consoleLogSpy).toHaveBeenCalledWith(`Wiki folder: ${wikiDir}`);
    expect(consoleLogSpy).toHaveBeenCalledWith(`Attach folder: ${attachDir}`);
    expect(consoleLogSpy).toHaveBeenCalledWith(`Output folder: ${outputDir}`);
    expect(consoleLogSpy).toHaveBeenCalledWith("Conversion completed.");
    expect(consoleLogSpy).toHaveBeenCalledWith("Completed:");
    expect(consoleLogSpy).toHaveBeenCalledWith("- Pages converted: 1");
    expect(consoleLogSpy).toHaveBeenCalledWith("- Page errors: 0");
    expect(consoleLogSpy).toHaveBeenCalledWith("- Attachments copied: 0");
    expect(consoleLogSpy).toHaveBeenCalledWith("- Attachment errors: 0");

    // Check converted file exists and has correct content
    const outputFile = path.join(outputDir, "テスト.md");
    const outputContent = await fs.readFile(outputFile, "utf-8");
    expect(outputContent).toBe("# テスト\nテキスト");
  });

  it("should throw error when wiki folder does not exist", async () => {
    await expect(
      main(path.join(testDir, "nonexistent"), attachDir, outputDir),
    ).rejects.toThrow("Wiki folder not found");
  });

  it("should throw error when attach folder does not exist", async () => {
    await expect(
      main(wikiDir, path.join(testDir, "nonexistent"), outputDir),
    ).rejects.toThrow("Attach folder not found");
  });

  it("should accept encoding parameter", async () => {
    // Create EUC-JP encoded file
    const inputContent = "*テスト\nテキスト";
    const encodedContent = iconv.encode(inputContent, "euc-jp");

    // Write file as EUC-JP encoded
    const filePath = path.join(wikiDir, "A5C6A5B9A5C8.txt");
    await fs.writeFile(filePath, encodedContent);

    await main(wikiDir, attachDir, outputDir, "euc-jp");

    expect(consoleLogSpy).toHaveBeenCalledWith("Conversion completed.");

    // Check converted file exists and has correct content
    const outputFile = path.join(outputDir, "テスト.md");
    const outputContent = await fs.readFile(outputFile, "utf-8");
    expect(outputContent).toBe("# テスト\nテキスト");
  });

  it("should use utf-8 as default encoding", async () => {
    await main(wikiDir, attachDir, outputDir);

    expect(consoleLogSpy).toHaveBeenCalledWith("- Pages converted: 1");

    // Check converted file exists and has correct content
    const outputFile = path.join(outputDir, "テスト.md");
    const outputContent = await fs.readFile(outputFile, "utf-8");
    expect(outputContent).toBe("# テスト\nテキスト");
  });
});
