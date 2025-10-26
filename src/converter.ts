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
  // Apply block-level conversions (mutually exclusive)
  // Try each conversion in order, stop at first match
  const blockConverters = [
    convertHorizontalRule,
    convertHeading,
    convertList,
    convertQuote,
  ];

  let converted = line;
  for (const converter of blockConverters) {
    const result = converter(line);
    if (result !== line) {
      converted = result;
      break;
    }
  }

  // Apply inline conversions (can be combined with block-level)
  converted = convertInlineFormat(converted);

  // TODO: Apply link and attachment conversions (Phase 2.3)
  // converted = convertLinks(converted, _pageName);

  return converted;
};

/**
 * Convert heading from PukiWiki to Markdown
 *
 * PukiWiki: *Heading1, **Heading2, ***Heading3
 * Markdown: # Heading1, ## Heading2, ### Heading3
 *
 * Note: Optional space after asterisks is allowed and ignored
 *
 * @param line - Line to convert
 * @returns Converted line
 */
const convertHeading = (line: string): string => {
  const match = line.match(/^(\*{1,3})\s*(.*)$/);
  if (!match || !match[1] || match[2] === undefined) return line;

  const level = match[1].length;
  const text = match[2];
  return `${"#".repeat(level)} ${text}`;
};

/**
 * Convert list from PukiWiki to Markdown
 *
 * PukiWiki: -item, --item, ---item (unordered)
 *           +item, ++item, +++item (ordered)
 * Markdown: - item, "    - item", "        - item"
 *           1. item, "    1. item", "        1. item"
 *
 * Note: Optional space after - or + is allowed and ignored
 *
 * @param line - Line to convert
 * @returns Converted line
 */
const convertList = (line: string): string => {
  // Unordered list: max 3 levels, 4th+ hyphen becomes part of content
  // -text, --text, ---text (or ----text becomes level 3 with "-text")
  const unorderedMatch = line.match(/^(-{1,3})(.*)$/);
  if (unorderedMatch && unorderedMatch[1] && unorderedMatch[2] !== undefined) {
    const level = unorderedMatch[1].length;
    const rest = unorderedMatch[2];

    // Skip leading space, but keep everything else including extra hyphens
    const text = rest.replace(/^\s*/, "");
    const indent = " ".repeat((level - 1) * 4);
    return `${indent}- ${text}`;
  }

  // Ordered list: max 3 levels, 4th+ plus becomes part of content
  const orderedMatch = line.match(/^(\+{1,3})(.*)$/);
  if (orderedMatch && orderedMatch[1] && orderedMatch[2] !== undefined) {
    const level = orderedMatch[1].length;
    const rest = orderedMatch[2];

    // Skip leading space, but keep everything else including extra pluses
    const text = rest.replace(/^\s*/, "");
    const indent = " ".repeat((level - 1) * 4);
    return `${indent}1. ${text}`;
  }

  return line;
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

/**
 * Convert inline text formatting from PukiWiki to Markdown
 *
 * PukiWiki: ''bold'', '''italic''', %%strikethrough%%, &br;
 * Markdown: **bold**, *italic*, ~~strikethrough~~, <br>
 *
 * @param text - Text to convert
 * @returns Converted text
 */
const convertInlineFormat = (text: string): string => {
  let converted = text;

  // Convert italic first (longer pattern): '''text''' → *text*
  converted = converted.replace(/'''([^']+)'''/g, "*$1*");

  // Convert bold: ''text'' → **text**
  converted = converted.replace(/''([^']+)''/g, "**$1**");

  // Convert strikethrough: %%text%% → ~~text~~
  converted = converted.replace(/%%([^%]+)%%/g, "~~$1~~");

  // Convert line break: &br; → <br>
  converted = converted.replace(/&br;/g, "<br>");

  return converted;
};
