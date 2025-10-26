#!/usr/bin/env node

import { Command } from "commander";
import { processConversion } from "./processor.js";
import { exists } from "./file-io.js";

const program = new Command();

program
  .name("pukiwiki-to-md")
  .description("Convert PukiWiki to Markdown")
  .version("1.0.0")
  .requiredOption("-w, --wiki <path>", "Wiki folder path")
  .requiredOption("-a, --attach <path>", "Attach folder path")
  .requiredOption("-o, --output <path>", "Output folder path")
  .option("-e, --encoding <encoding>", "Input file encoding", "utf-8");

program.parse();

const options = program.opts<{
  wiki: string;
  attach: string;
  output: string;
  encoding: string;
}>();

/**
 * Main execution
 */
const main = async (): Promise<void> => {
  try {
    // Validate input directories
    if (!(await exists(options.wiki))) {
      console.error(`Error: Wiki folder not found: ${options.wiki}`);
      process.exit(1);
    }

    if (!(await exists(options.attach))) {
      console.error(`Error: Attach folder not found: ${options.attach}`);
      process.exit(1);
    }

    // Print starting message
    console.log("Starting conversion...");
    console.log(`Wiki folder: ${options.wiki}`);
    console.log(`Attach folder: ${options.attach}`);
    console.log(`Output folder: ${options.output}`);
    console.log();

    // Process conversion
    const stats = await processConversion(
      options.wiki,
      options.attach,
      options.output,
      options.encoding,
    );

    console.log();
    console.log("Conversion completed.");
    console.log();

    // Print summary
    console.log("Completed:");
    console.log(`- Pages converted: ${stats.pagesConverted}`);
    console.log(`- Page errors: ${stats.pageErrors}`);
    console.log(`- Attachments copied: ${stats.attachmentsCopied}`);
    console.log(`- Attachment errors: ${stats.attachmentErrors}`);
    console.log();
    console.log(`Output folder: ${options.output}`);

    // Exit with error code if there are errors
    if (stats.pageErrors > 0 || stats.attachmentErrors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(
      "Fatal error:",
      error instanceof Error ? error.message : "Unknown error",
    );
    process.exit(1);
  }
};

main();
