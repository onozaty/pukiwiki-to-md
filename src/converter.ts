/**
 * PukiWiki to Markdown Converter
 *
 * Converts PukiWiki syntax to Markdown format
 */

/**
 * Convert PukiWiki content to Markdown
 *
 * @param content - PukiWiki content
 * @param pageName - Page name (used for attachment references)
 * @returns Converted Markdown content
 */
export const convertToMarkdown = (
  content: string,
  pageName: string,
): string => {
  const lines = content.split("\n");
  const convertedLines = lines.map((line) => convertLine(line, pageName));
  return convertedLines.join("\n");
};

/**
 * Convert a single line from PukiWiki to Markdown
 *
 * @param line - PukiWiki line
 * @param _pageName - Page name (used for attachment references in Phase 2.3)
 * @returns Converted Markdown line
 */
const convertLine = (line: string, _pageName: string): string => {
  let converted = line;

  // Apply block-level conversions
  converted = convertHeading(converted);
  converted = convertHorizontalRule(converted);
  converted = convertQuote(converted);

  // TODO: Apply inline conversions (Phase 2.3)
  // converted = convertInline(converted, _pageName);

  return converted;
};

/**
 * Convert heading from PukiWiki to Markdown
 *
 * PukiWiki: *Heading1, **Heading2, ***Heading3
 * Markdown: # Heading1, ## Heading2, ### Heading3
 *
 * Note: In PukiWiki, headings must not have a space after the asterisks
 *
 * @param line - Line to convert
 * @returns Converted line
 */
const convertHeading = (line: string): string => {
  const match = line.match(/^(\*{1,3})([^\s].*)$/);
  if (!match || !match[1] || !match[2]) return line;

  const level = match[1].length;
  const text = match[2];
  return `${"#".repeat(level)} ${text}`;
};

/**
 * Convert horizontal rule from PukiWiki to Markdown
 *
 * PukiWiki: ---- (4 or more hyphens) or #hr
 * Markdown: ---
 *
 * @param line - Line to convert
 * @returns Converted line
 */
const convertHorizontalRule = (line: string): string => {
  const trimmed = line.trim();

  // Match ---- (4 or more hyphens)
  if (/^-{4,}$/.test(trimmed)) {
    return "---";
  }

  // Match #hr plugin
  if (trimmed === "#hr") {
    return "---";
  }

  return line;
};

/**
 * Convert quote from PukiWiki to Markdown
 *
 * PukiWiki: >quote, >>nested quote
 * Markdown: > quote, > > nested quote
 *
 * @param line - Line to convert
 * @returns Converted line
 */
const convertQuote = (line: string): string => {
  const match = line.match(/^(>{1,})(.*)$/);
  if (!match || !match[1] || match[2] === undefined) return line;

  const level = match[1].length;
  const text = match[2];
  const quotes = "> ".repeat(level);
  return `${quotes}${text}`;
};
