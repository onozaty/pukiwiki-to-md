#!/usr/bin/env node

import { Command } from "commander";
import { exists } from "./file-io";
import { processConversion } from "./processor";

const program = new Command();

/**
 * Main execution
 * @param wikiPath - Wiki folder path
 * @param attachPath - Attach folder path
 * @param outputPath - Output folder path
 * @param encoding - Input file encoding (default: utf-8)
 * @param excludePlugins - Comma-separated custom plugins to exclude (default: empty string)
 * @param stripComments - Whether to remove HTML comments (default: false)
 */
export const main = async (
  wikiPath: string,
  attachPath: string,
  outputPath: string,
  encoding: string = "utf-8",
  excludePlugins: string = "",
  stripComments: boolean = false,
): Promise<void> => {
  // Validate input directories
  if (!(await exists(wikiPath))) {
    throw new Error(`Wiki folder not found: ${wikiPath}`);
  }

  if (!(await exists(attachPath))) {
    throw new Error(`Attach folder not found: ${attachPath}`);
  }

  // Parse exclude plugins
  const excludeBlockPlugins = excludePlugins
    ? excludePlugins
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : [];

  // Print starting message
  console.log("Starting conversion...");
  console.log(`Wiki folder: ${wikiPath}`);
  console.log(`Attach folder: ${attachPath}`);
  console.log(`Output folder: ${outputPath}`);
  if (excludeBlockPlugins.length > 0) {
    console.log(`Custom exclude plugins: ${excludeBlockPlugins.join(", ")}`);
  }
  if (stripComments) {
    console.log(`Strip comments: enabled`);
  }
  console.log();

  // Process conversion
  const stats = await processConversion(
    wikiPath,
    attachPath,
    outputPath,
    encoding,
    excludeBlockPlugins,
    stripComments,
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
  console.log(`Output folder: ${outputPath}`);
};

program
  .name("pukiwiki-to-md")
  .description("Convert PukiWiki to Markdown")
  .version("1.0.0")
  .requiredOption("-w, --wiki <path>", "Wiki folder path")
  .requiredOption("-a, --attach <path>", "Attach folder path")
  .requiredOption("-o, --output <path>", "Output folder path")
  .option("-e, --encoding <encoding>", "Input file encoding", "utf-8")
  .option(
    "-x, --exclude-plugins <plugins>",
    'Comma-separated list of custom block plugins to exclude (e.g., "myplugin,customplugin")',
    "",
  )
  .option(
    "-s, --strip-comments",
    "Remove all HTML comments from output (plugin comments, PukiWiki comments, etc.)",
    false,
  )
  .action(
    async (options: {
      wiki: string;
      attach: string;
      output: string;
      encoding: string;
      excludePlugins: string;
      stripComments: boolean;
    }) => {
      try {
        await main(
          options.wiki,
          options.attach,
          options.output,
          options.encoding,
          options.excludePlugins,
          options.stripComments,
        );
      } catch (error) {
        console.error(
          "Error:",
          error instanceof Error ? error.message : "Unknown error",
        );
        process.exit(1);
      }
    },
  );

// Only parse if not in test mode
if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  program.parse();
}
