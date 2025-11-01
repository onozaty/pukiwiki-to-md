/**
 * PukiWiki to Markdown Converter
 *
 * Converts PukiWiki syntax to Markdown format
 */

import path from "path";

/**
 * Table cell representation
 */
interface TableCell {
  content: string;
  align?: "left" | "center" | "right";
  isHeader: boolean;
  isBold?: boolean;
  fontSize?: string;
  color?: string;
  bgColor?: string;
}

/**
 * Table row representation
 */
interface TableRow {
  cells: TableCell[];
  type: "h" | "f" | "c" | "";
}

/**
 * Result of block-level conversion
 */
type ConversionResult = {
  lines: string[]; // Empty array means no match
};

/**
 * Convert PukiWiki content to Markdown
 *
 * @param content - PukiWiki content
 * @param pageName - Page name (used for attachment references)
 * @param excludeBlockPlugins - Custom block plugins to exclude (optional)
 * @returns Converted Markdown content
 */
export const convertToMarkdown = (
  content: string,
  pageName: string,
  excludeBlockPlugins: string[] = [],
): string => {
  const lines = content.split("\n");
  const convertedLines: string[] = [];
  let tableBuffer: TableRow[] = [];
  let inTable = false;
  let preformattedBuffer: string[] = [];
  let inPreformatted = false;

  for (const line of lines) {
    const isPreformatted = isPreformattedLine(line);
    const tableRow = !isPreformatted ? parseTableRow(line) : null;

    if (isPreformatted) {
      // Preformatted text line detected
      if (inTable) {
        // End of table - convert and output buffered table
        const markdownTable = generateMarkdownTable(tableBuffer, pageName);
        convertedLines.push(...markdownTable);
        tableBuffer = [];
        inTable = false;
      }

      // Remove only the first leading space/tab and add to preformatted buffer
      // This preserves relative indentation within the preformatted block
      preformattedBuffer.push(line.replace(/^[ \t]/, ""));
      inPreformatted = true;
    } else if (tableRow) {
      // Table row detected
      if (inPreformatted) {
        // End of preformatted block - convert and output
        const codeBlock = generatePreformattedBlock(preformattedBuffer);
        convertedLines.push(...codeBlock);
        preformattedBuffer = [];
        inPreformatted = false;
      }

      // Add to table buffer
      tableBuffer.push(tableRow);
      inTable = true;
    } else {
      // Non-table, non-preformatted row detected
      if (inPreformatted) {
        // End of preformatted block - convert and output
        const codeBlock = generatePreformattedBlock(preformattedBuffer);
        convertedLines.push(...codeBlock);
        preformattedBuffer = [];
        inPreformatted = false;
      }

      if (inTable) {
        // End of table - convert and output buffered table
        const markdownTable = generateMarkdownTable(tableBuffer, pageName);
        convertedLines.push(...markdownTable);
        tableBuffer = [];
        inTable = false;
      }

      // Convert line (may return multiple lines for some converters)
      const converted = convertLine(line, pageName, excludeBlockPlugins);
      convertedLines.push(...converted);
    }
  }

  // Handle remaining blocks at end of content
  if (inPreformatted && preformattedBuffer.length > 0) {
    const codeBlock = generatePreformattedBlock(preformattedBuffer);
    convertedLines.push(...codeBlock);
  }

  if (inTable && tableBuffer.length > 0) {
    const markdownTable = generateMarkdownTable(tableBuffer, pageName);
    convertedLines.push(...markdownTable);
  }

  return convertedLines.join("\n");
};

/**
 * Convert a single line from PukiWiki to Markdown
 *
 * Each block converter applies inline processing internally if needed.
 * Block converters are mutually exclusive - first match wins.
 *
 * @param line - PukiWiki line
 * @param pageName - Page name (used for relative path calculation and attachments)
 * @param excludeBlockPlugins - Custom block plugins to exclude
 * @returns Converted Markdown lines (may be multiple lines for some converters)
 */
const convertLine = (
  line: string,
  pageName: string,
  excludeBlockPlugins: string[],
): string[] => {
  // Apply block-level conversions (mutually exclusive)
  // Try each conversion in order, stop at first match
  const blockConverters = [
    (l: string) => convertComment(l, pageName),
    (l: string) =>
      convertUnsupportedBlockPlugin(l, excludeBlockPlugins, pageName),
    (l: string) => convertRefBlock(l, pageName),
    (l: string) => convertVote(l, pageName),
    (l: string) => convertInclude(l, pageName),
    (l: string) => convertLineHeadEscape(l, pageName),
    (l: string) => convertHorizontalRule(l, pageName),
    (l: string) => convertLineBreak(l, pageName),
    (l: string) => convertAlignment(l, pageName),
    (l: string) => convertHeading(l, pageName),
    (l: string) => convertList(l, pageName),
    (l: string) => convertQuote(l, pageName),
  ];

  for (const converter of blockConverters) {
    const result = converter(line);
    if (result.lines.length > 0) {
      // Matched - converter already applied inline processing if needed
      return result.lines;
    }
  }

  // No block converter matched - apply inline processing
  return [applyInlineConversions(line, pageName)];
};

/**
 * Convert text alignment from PukiWiki by removing alignment prefix
 *
 * PukiWiki: LEFT:text, CENTER:text, RIGHT:text
 * Output: text (prefix removed)
 *
 * Note: Alignment is not preserved because:
 * - Markdown has no standard syntax for text alignment
 * - HTML div tags prevent Markdown parsing inside
 * - Users can manually add alignment if needed
 *
 * Inline processing is applied to the content after removing the prefix.
 *
 * @param line - Line to convert
 * @param pageName - Current page name for link resolution
 * @returns Conversion result
 */
const convertAlignment = (line: string, pageName: string): ConversionResult => {
  const trimmed = line.trimEnd();

  // Match LEFT:, CENTER:, or RIGHT: at line start and remove prefix
  const match = trimmed.match(/^(LEFT|CENTER|RIGHT):(.*)$/);
  if (!match || !match[1] || match[2] === undefined) {
    return { lines: [] }; // No match
  }

  let content = match[2];

  // Apply inline processing to the content
  content = applyInlineConversions(content, pageName);

  return { lines: [content] };
};

/**
 * Convert heading from PukiWiki to Markdown
 *
 * PukiWiki: *Heading1, **Heading2, ***Heading3
 * Markdown: # Heading1, ## Heading2, ### Heading3
 *
 * Note: Optional space after asterisks is allowed and ignored
 * Auto-generated anchor IDs [#xxxxx] are removed
 *
 * Inline processing is applied to the heading text.
 *
 * @param line - Line to convert
 * @param pageName - Current page name for link resolution
 * @returns Conversion result
 */
const convertHeading = (line: string, pageName: string): ConversionResult => {
  const match = line.match(/^(\*{1,3})\s*(.*)$/);
  if (!match || !match[1] || match[2] === undefined) {
    return { lines: [] }; // No match
  }

  const level = match[1].length;
  let text = match[2];

  // Remove auto-generated anchor ID [#xxxxxxxx] at the end
  text = text.replace(/\s*\[#[a-z0-9]+\]\s*$/, "").trim();

  // Apply inline processing to the heading text
  text = applyInlineConversions(text, pageName);

  return { lines: [`${"#".repeat(level)} ${text}`] };
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
 * Inline processing is applied to the list item text.
 *
 * @param line - Line to convert
 * @param pageName - Current page name for link resolution
 * @returns Conversion result
 */
const convertList = (line: string, pageName: string): ConversionResult => {
  // Unordered list: max 3 levels, 4th+ hyphen becomes part of content
  // -text, --text, ---text (or ----text becomes level 3 with "-text")
  const unorderedMatch = line.match(/^(-{1,3})(.*)$/);
  if (unorderedMatch && unorderedMatch[1] && unorderedMatch[2] !== undefined) {
    const level = unorderedMatch[1].length;
    const rest = unorderedMatch[2];

    // Skip leading space, but keep everything else including extra hyphens
    let text = rest.replace(/^\s*/, "");

    // Apply inline processing to list item text
    text = applyInlineConversions(text, pageName);

    const indent = " ".repeat((level - 1) * 4);
    return { lines: [`${indent}- ${text}`] };
  }

  // Ordered list: max 3 levels, 4th+ plus becomes part of content
  const orderedMatch = line.match(/^(\+{1,3})(.*)$/);
  if (orderedMatch && orderedMatch[1] && orderedMatch[2] !== undefined) {
    const level = orderedMatch[1].length;
    const rest = orderedMatch[2];

    // Skip leading space, but keep everything else including extra pluses
    let text = rest.replace(/^\s*/, "");

    // Apply inline processing to list item text
    text = applyInlineConversions(text, pageName);

    const indent = " ".repeat((level - 1) * 4);
    return { lines: [`${indent}1. ${text}`] };
  }

  return { lines: [] }; // No match
};

/**
 * Convert comment from PukiWiki to Markdown
 *
 * PukiWiki: //comment
 * Markdown: <!-- comment -->
 *
 * No inline processing is applied to HTML comments.
 *
 * @param line - Line to convert
 * @param pageName - Current page name (unused, for signature consistency)
 * @returns Conversion result
 */
const convertComment = (line: string, _pageName: string): ConversionResult => {
  const trimmed = line.trimEnd();

  // Match comment line starting with //
  if (trimmed.startsWith("//")) {
    const commentContent = trimmed.substring(2).trimStart();
    // No inline processing for HTML comments
    return { lines: [`<!-- ${commentContent} -->`] };
  }

  return { lines: [] }; // No match
};

/**
 * Convert #vote plugin from PukiWiki to HTML comment + table
 *
 * PukiWiki: #vote(選択肢1[0],選択肢2[1],選択肢3[3])
 * Markdown:
 *   <!-- #vote(選択肢1[0],選択肢2[1],選択肢3[3]) -->
 *   | 選択肢 | 投票数 |
 *   | --- | ---: |
 *   | 選択肢1 | 0 |
 *   | 選択肢2 | 1 |
 *   | 選択肢3 | 3 |
 *
 * Inline processing is applied to vote option labels.
 *
 * @param line - Line to convert
 * @param pageName - Current page name for link resolution
 * @returns Conversion result (multiple lines)
 */
const convertVote = (line: string, pageName: string): ConversionResult => {
  const trimmed = line.trimEnd();

  // Match #vote plugin - greedy matching, allow text after closing )
  const voteMatch = trimmed.match(/^#vote\((.+)\)/);
  if (!voteMatch || !voteMatch[1]) {
    return { lines: [] }; // No match
  }

  const result: string[] = [];

  // Add entire line as HTML comment (including any text after closing ))
  result.push(`<!-- ${trimmed} -->`);

  // Parse vote options: 選択肢1[0],選択肢2[1],選択肢3[3]
  const optionsText = voteMatch[1];
  const options: Array<{ label: string; count: number }> = [];

  // Split by comma, but handle nested brackets carefully
  let currentOption = "";
  let depth = 0;

  for (let i = 0; i < optionsText.length; i++) {
    const char = optionsText[i];

    if (char === "[") {
      depth++;
      currentOption += char;
    } else if (char === "]") {
      depth--;
      currentOption += char;
    } else if (char === "," && depth === 0) {
      // Found a separator at depth 0
      if (currentOption.trim()) {
        const parsed = parseVoteOption(currentOption.trim());
        if (parsed) options.push(parsed);
      }
      currentOption = "";
    } else {
      currentOption += char;
    }
  }

  // Don't forget the last option
  if (currentOption.trim()) {
    const parsed = parseVoteOption(currentOption.trim());
    if (parsed) options.push(parsed);
  }

  // Generate table with inline processing applied to labels
  if (options.length > 0) {
    result.push("| 選択肢 | 投票数 |");
    result.push("| --- | ---: |");
    for (const option of options) {
      // Apply inline processing to the option label
      const processedLabel = applyInlineConversions(option.label, pageName);
      result.push(`| ${processedLabel} | ${option.count} |`);
    }
  }

  return { lines: result };
};

/**
 * Parse a single vote option
 * @param option - Vote option string like "選択肢1[0]" or "選択肢1"
 * @returns Parsed option with label and count
 */
const parseVoteOption = (
  option: string,
): { label: string; count: number } | null => {
  // Match pattern: label[count]
  const match = option.match(/^(.+?)\[(\d+)\]$/);

  if (match && match[1] && match[2]) {
    return {
      label: match[1].trim(),
      count: parseInt(match[2], 10),
    };
  }

  // If no count specified, default to 0
  if (option && !option.includes("[")) {
    return {
      label: option.trim(),
      count: 0,
    };
  }

  return null;
};

/**
 * Convert #include plugin to HTML comment + link
 *
 * PukiWiki: #include(PageName) or #include(PageName,params)
 * Output: <!-- #include(...) -->
 *         [PageName](relativePath)
 *
 * No inline processing needed (HTML comment + simple link).
 *
 * @param line - Line to convert
 * @param currentPage - Current page name for relative path calculation
 * @returns Conversion result (multiple lines)
 */
const convertInclude = (
  line: string,
  currentPage: string,
): ConversionResult => {
  const trimmed = line.trimEnd();

  // Match #include(PageName) or #include(PageName,params) - allow text after closing )
  const match = trimmed.match(/^#include\(([^,)]+)(?:,([^)]*))?\)/);
  if (!match || !match[1]) {
    return { lines: [] }; // No match
  }

  const pageName = match[1];

  // Add entire line as HTML comment (including any text after closing ))
  const comment = `<!-- ${trimmed} -->`;

  // Generate link to the included page (no inline processing needed)
  const relativePath = calculateRelativePath(currentPage, `${pageName}.md`);
  const link = `[${pageName}](${relativePath})`;

  return { lines: [comment, link] };
};

/**
 * Convert unsupported block-level plugins from PukiWiki to HTML comments
 *
 * These plugins cannot be represented in static Markdown, so they are
 * preserved as HTML comments. This includes:
 * - System directives (author, freeze, norelated, nofollow, norightbar)
 * - Dynamic/interactive plugins (contents, comment, pcomment, article, etc.)
 * - Layout control plugins (clear)
 * - Tracking/counting plugins (counter, navi, tracker, calendar, etc.)
 * - Navigation plugins (related, recent, online, topicpath, search)
 *
 * Note: Only handles block plugins (#plugin), not inline plugins (&plugin;)
 * Note: #include is handled by convertInclude() function
 *
 * @param line - Line to convert
 * @param customExcludePlugins - Custom plugins to exclude (from CLI option)
 * @returns Converted line with HTML comment, or original line if not matched
 */
const convertUnsupportedBlockPlugin = (
  line: string,
  customExcludePlugins: string[],
  _pageName: string,
): ConversionResult => {
  const trimmed = line.trimEnd();

  // Default block plugins to exclude (all official PukiWiki block plugins except those with custom conversion)
  const DEFAULT_EXCLUDE_BLOCK_PLUGINS = [
    // System directives
    "author",
    "freeze",
    "nofollow",
    "norelated",

    // Content inclusion & display
    "amazon",
    "aname",
    // "include" - handled by convertInclude() function
    "includesubmenu",

    // Dynamic functionality & forms
    "article",
    "attach",
    "comment",
    "contents",
    "counter",
    "insert",
    "lookup",
    "navi",
    "newpage",
    "pcomment",

    // Lists & navigation
    "back",
    "ls",
    "ls2",
    "menu",
    "online",
    "popular",
    "recent",
    "related",
    "search",
    "topicpath",

    // Tracker & issue management
    "bugtrack",
    "bugtrack_list",
    "tracker",
    "tracker_list",

    // Calendar
    "calendar",
    "calendar2",
    "calendar_edit",
    "calendar_read",
    "calendar_viewer",

    // Utilities & misc
    "clear",
    "memo",
    "paint",
    "random",
    "server",
    "setlinebreak",
    "showrss",
    "stationary",
    "version",
    "versionlist",
  ];

  // Combine default and custom plugins
  const allPlugins = [
    ...DEFAULT_EXCLUDE_BLOCK_PLUGINS,
    ...customExcludePlugins,
  ];

  for (const plugin of allPlugins) {
    // Match #plugin or #plugin(...)
    // Plugin names contain only [a-zA-Z0-9_], so no escaping needed
    // Parentheses are optional; if present, anything after them is allowed
    const regex = new RegExp(`^#${plugin}(?:\\(.*\\).*)?$`);

    if (regex.test(trimmed)) {
      // No inline processing for HTML comments
      return { lines: [`<!-- ${trimmed} -->`] };
    }
  }

  return { lines: [] }; // No match
};

/**
 * Convert line-head escape from PukiWiki to Markdown
 *
 * PukiWiki: ~*text, ~-text, etc.
 * Markdown: \*text, \-text, etc.
 *
 * Escapes Markdown special characters at line start. For non-Markdown
 * special characters (like PukiWiki-specific syntax), just removes the ~.
 *
 * Inline processing is applied to the text after the escape character.
 *
 * @param line - Line to convert
 * @param pageName - Current page name for link resolution
 * @returns Conversion result
 */
const convertLineHeadEscape = (
  line: string,
  pageName: string,
): ConversionResult => {
  // Don't process empty ~ or ~ with only whitespace after it
  const trimmed = line.trimEnd();
  if (trimmed === "~") return { lines: [] }; // No match

  if (!line.startsWith("~")) return { lines: [] }; // No match

  const restOfLine = line.substring(1);
  if (restOfLine.length === 0) return { lines: [] }; // No match

  const firstChar = restOfLine.charAt(0);
  // Markdown characters that need escaping at line start
  const markdownSpecialChars = ["*", "-", "+", ">", "#", "|"];

  let converted: string;
  if (markdownSpecialChars.includes(firstChar)) {
    // Escape with backslash for Markdown special characters
    converted = `\\${restOfLine}`;
  } else {
    // Just remove ~ for non-Markdown characters (e.g., PukiWiki syntax)
    converted = restOfLine;
  }

  // Apply inline processing to the text
  converted = applyInlineConversions(converted, pageName);

  return { lines: [converted] };
};

/**
 * Convert horizontal rule from PukiWiki to Markdown
 *
 * PukiWiki: ---- (4 or more hyphens) or #hr or #hr()
 * Markdown: ---
 *
 * No inline processing needed (simple horizontal rule).
 *
 * @param line - Line to convert
 * @param pageName - Current page name (unused, for signature consistency)
 * @returns Conversion result
 */
const convertHorizontalRule = (
  line: string,
  _pageName: string,
): ConversionResult => {
  const trimmed = line.trimEnd();

  // Match ---- (4 or more hyphens), with or without trailing text
  // Trailing text is discarded (PukiWiki behavior)
  if (/^-{4,}/.test(trimmed)) {
    return { lines: ["---"] };
  }

  // Match #hr, #hr(), or #hr() with trailing text
  // Does NOT match #hrxxx or #hr text
  if (/^#hr(\(\).*)?$/.test(trimmed)) {
    return { lines: ["---"] };
  }

  return { lines: [] }; // No match
};

/**
 * Convert line break plugin from PukiWiki to Markdown
 *
 * PukiWiki: #br or #br()
 * Markdown: <br>
 *
 * No inline processing needed (simple line break tag).
 *
 * Note: Line-ending whitespace is trimmed before matching
 *
 * @param line - Line to convert
 * @param pageName - Current page name (unused, for signature consistency)
 * @returns Conversion result
 */
const convertLineBreak = (
  line: string,
  _pageName: string,
): ConversionResult => {
  const trimmed = line.trimEnd();

  // Match #br, #br(), or #br() with trailing text
  // Does NOT match #brxxx or #br text
  if (/^#br(\(\).*)?$/.test(trimmed)) {
    return { lines: ["<br>"] };
  }

  return { lines: [] }; // No match
};

/**
 * Convert quote from PukiWiki to Markdown
 *
 * PukiWiki: >quote, >>nested quote
 * Markdown: > quote, > > nested quote
 *
 * Inline processing is applied to the quoted text.
 *
 * @param line - Line to convert
 * @param pageName - Current page name for link resolution
 * @returns Conversion result
 */
const convertQuote = (line: string, pageName: string): ConversionResult => {
  const match = line.match(/^(>{1,})(.*)$/);
  if (!match || !match[1] || match[2] === undefined) {
    return { lines: [] }; // No match
  }

  const level = match[1].length;
  let text = match[2];

  // Apply inline processing to the quoted text
  text = applyInlineConversions(text, pageName);

  const quotes = "> ".repeat(level);
  return { lines: [`${quotes}${text}`] };
};

/**
 * Convert inline text formatting from PukiWiki to Markdown
 *
 * PukiWiki: ''bold'', '''italic''', %%strikethrough%%, %%%underline%%%, &br; or &br();, text~, &size, &color
 * Markdown: **bold**, *italic*, ~~strikethrough~~, <u>underline</u>, <br>, text<br>, HTML span tags
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

  // Convert underline (3 %): %%%text%%% → <u>text</u>
  // Must be processed before strikethrough to avoid matching %%% as %%
  converted = converted.replace(/%%%([^%]+)%%%/g, "<u>$1</u>");

  // Convert strikethrough (2 %): %%text%% → ~~text~~
  converted = converted.replace(/%%([^%]+)%%/g, "~~$1~~");

  // Convert line break: &br; or &br(); → <br>
  converted = converted.replace(/&br(\(\))?;/g, "<br>");

  // Convert line-end tilde: text~ → text<br>
  // Only match ~ that is not preceded by ~ (to avoid ~~)
  converted = converted.replace(/([^~])~$/g, "$1<br>");

  // Convert size: &size(20){text}; → <span style="font-size: 20px">text</span>
  converted = converted.replace(
    /&size\((\d+)\)\{([^}]+)\};/g,
    (_, size, text) => `<span style="font-size: ${size}px">${text}</span>`,
  );

  // Convert color: &color(color){text}; → <span style="color: color">text</span>
  // &color(color,bgcolor){text}; → <span style="color: color; background-color: bgcolor">text</span>
  converted = converted.replace(
    /&color\(([^,)]+)(?:,([^)]+))?\)\{([^}]+)\};/g,
    (_, fgColor, bgColor, text) => {
      if (bgColor) {
        return `<span style="color: ${fgColor}; background-color: ${bgColor}">${text}</span>`;
      } else {
        return `<span style="color: ${fgColor}">${text}</span>`;
      }
    },
  );

  return converted;
};

/**
 * Encode a file path for use in Markdown URLs
 *
 * Encodes only characters that cause issues in Markdown links, while preserving
 * Unicode characters (Japanese, etc.) for better readability.
 *
 * Encoded characters: %, space, (), [], :, ", ,
 * Preserved characters: Unicode (Japanese, etc.), alphanumerics, -_.~
 *
 * @param filePath - File path to encode (e.g., "../プロジェクト/タスク.md")
 * @returns Minimally encoded path (e.g., "../プロジェクト/タスク.md")
 */
const encodePathForMarkdown = (filePath: string): string => {
  // Split by path separator, encode each part (except . and ..), then rejoin
  const pathParts = filePath.split(path.sep);
  const encodedPath = pathParts
    .map((part) => {
      // Don't encode relative path markers
      if (part === "." || part === "..") {
        return part;
      }
      // Encode only characters that cause issues in Markdown links
      return part
        .replace(/%/g, "%25") // % first (avoid double-encoding)
        .replace(/ /g, "%20") // space
        .replace(/\(/g, "%28") // left parenthesis
        .replace(/\)/g, "%29") // right parenthesis
        .replace(/\[/g, "%5B") // left bracket
        .replace(/\]/g, "%5D") // right bracket
        .replace(/:/g, "%3A") // colon
        .replace(/"/g, "%22") // double quote
        .replace(/,/g, "%2C"); // comma
    })
    .join("/"); // Use forward slash for URL paths in Markdown

  return encodedPath;
};

/**
 * Calculate relative path from current page to target file
 *
 * This is a generic function that works for any file type (pages, attachments, etc.).
 * The caller is responsible for adding file extensions if needed.
 *
 * @param currentPage - Current page path (e.g., "プロジェクト/タスク")
 * @param targetFilePath - Target file path (e.g., "共通ページ.md" or "テスト_attachment_image.png")
 * @returns Relative path from current page directory to target file
 */
const calculateRelativePath = (
  currentPage: string,
  targetFilePath: string,
): string => {
  // Get directory of current page
  const currentDir = path.dirname(currentPage);

  // If current page is at root level, just use target path as-is
  if (currentDir === ".") {
    return targetFilePath;
  }

  // Calculate relative path from current directory to target file
  return path.relative(currentDir, targetFilePath);
};

/**
 * Convert links from PukiWiki to Markdown
 *
 * PukiWiki internal links: [[ページ名]], [[テキスト>ページ名]]
 * PukiWiki external links: [[テキスト:URL]]
 * Markdown: [text](url)
 *
 * @param text - Text to convert
 * @param currentPage - Current page name for relative path calculation
 * @returns Converted text
 */
const convertLinks = (text: string, currentPage: string): string => {
  let converted = text;

  // Convert external links first: [[text:URL]] → [text](URL)
  converted = converted.replace(
    /\[\[([^\]]+?):(https?:\/\/[^\]]+?)\]\]/g,
    (_, linkText, url) => {
      return `[${linkText}](${url})`;
    },
  );

  // Convert internal links with custom text: [[text>page]] → [text](relativePath)
  converted = converted.replace(
    /\[\[([^\]>]+?)>([^\]]+?)\]\]/g,
    (_, linkText, targetPage) => {
      const relativePath = calculateRelativePath(
        currentPage,
        `${targetPage}.md`,
      );
      const encodedPath = encodePathForMarkdown(relativePath);
      return `[${linkText}](${encodedPath})`;
    },
  );

  // Convert internal links: [[page]] → [page](relativePath)
  converted = converted.replace(/\[\[([^\]>]+?)\]\]/g, (_, targetPage) => {
    const relativePath = calculateRelativePath(currentPage, `${targetPage}.md`);
    const encodedPath = encodePathForMarkdown(relativePath);
    return `[${targetPage}](${encodedPath})`;
  });

  return converted;
};

/**
 * Get page name for attachment file naming
 * Extracts the last part of hierarchical page name
 *
 * @param pageName - Full page name (e.g., "プロジェクト/タスク")
 * @returns Page name for attachment (e.g., "タスク")
 */
const getAttachmentPageName = (pageName: string): string => {
  const lastSlashIndex = pageName.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return pageName;
  }
  return pageName.substring(lastSlashIndex + 1);
};

/**
 * Check if file is an image based on extension
 *
 * @param filename - File name to check
 * @returns True if image file
 */
const isImageFile = (filename: string): boolean => {
  const imageExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".bmp",
    ".svg",
    ".webp",
  ];
  const lowerFilename = filename.toLowerCase();
  return imageExtensions.some((ext) => lowerFilename.endsWith(ext));
};

/**
 * Size specification extracted from #ref parameters
 */
interface RefSizeSpec {
  width?: string;
  height?: string;
  percentage?: string;
}

/**
 * Parse #ref plugin parameters to extract alt text and size specifications
 * Filters out keywords and size specifications, keeps only text parameters
 *
 * Based on PukiWiki ref.inc.php implementation
 *
 * @param paramsString - Comma-separated parameter string after filename
 * @returns Object containing alt text and size specifications
 */
const parseRefParameters = (
  paramsString: string,
): { altText: string; size: RefSizeSpec | null } => {
  if (!paramsString) return { altText: "", size: null };

  const params = paramsString.split(",").map((p) => p.trim());

  // Keywords that should be filtered out
  const keywords = [
    "left",
    "center",
    "right",
    "wrap",
    "nowrap",
    "around",
    "nolink",
    "noicon",
    "noimg",
    "zoom",
  ];

  let size: RefSizeSpec | null = null;
  const textParams: string[] = [];

  for (const param of params) {
    // Check for percentage: 50% or 50.5%
    const percentMatch = param.match(/^(\d+(?:\.\d+)?)%$/);
    if (percentMatch && percentMatch[1]) {
      size = { percentage: percentMatch[1] };
      continue;
    }

    // Check for width x height: 300x200
    const whMatch = param.match(/^(\d+)x(\d+)$/);
    if (whMatch && whMatch[1] && whMatch[2]) {
      size = { width: whMatch[1], height: whMatch[2] };
      continue;
    }

    // Check for width only: 300x
    const wMatch = param.match(/^(\d+)x$/);
    if (wMatch && wMatch[1]) {
      size = { width: wMatch[1] };
      continue;
    }

    // Check for height only: x200
    const hMatch = param.match(/^x(\d+)$/);
    if (hMatch && hMatch[1]) {
      size = { height: hMatch[1] };
      continue;
    }

    // Check for width in pixels: 300w
    const wPixelMatch = param.match(/^(\d+)w$/);
    if (wPixelMatch && wPixelMatch[1]) {
      size = { width: wPixelMatch[1] };
      continue;
    }

    // Check for height in pixels: 200h
    const hPixelMatch = param.match(/^(\d+)h$/);
    if (hPixelMatch && hPixelMatch[1]) {
      size = { height: hPixelMatch[1] };
      continue;
    }

    // Check for keywords
    if (keywords.includes(param.toLowerCase())) {
      continue;
    }

    // If none of the above, it's a text parameter
    textParams.push(param);
  }

  return { altText: textParams.join(","), size };
};

/**
 * Generate HTML img tag with size attributes
 *
 * @param src - Image source path
 * @param alt - Alt text
 * @param size - Size specification
 * @returns HTML img tag
 */
const generateImageTag = (
  src: string,
  alt: string,
  size: RefSizeSpec,
): string => {
  const altAttr = alt ? ` alt="${alt}"` : "";

  if (size.percentage) {
    return `<img src="${src}"${altAttr} style="width: ${size.percentage}%">`;
  }

  const attrs: string[] = [];
  if (size.width) attrs.push(`width="${size.width}"`);
  if (size.height) attrs.push(`height="${size.height}"`);

  return `<img src="${src}"${altAttr}${attrs.length > 0 ? " " + attrs.join(" ") : ""}>`;
};

/**
 * Convert a single attachment reference to Markdown/HTML
 *
 * @param filename - File name (may include page path like "PageName/file.png")
 * @param params - Parameter string (optional)
 * @param fullPagePath - Full page path for relative path resolution
 * @returns Converted text
 */
const convertAttachmentReference = (
  filename: string,
  params: string | undefined,
  fullPagePath: string,
): string => {
  // Parse filename for page reference (e.g., "PageName/file.png")
  // Supports: OtherPage/file.png, ../ParentPage/file.png, ./SamePage/file.png
  let targetPagePath = fullPagePath; // Full path to the target page
  let actualFilename = filename;

  const slashMatch = filename.match(/^(.+)\/([^/]+)$/);
  if (slashMatch && slashMatch[1] && slashMatch[2]) {
    const pagePart = slashMatch[1];
    actualFilename = slashMatch[2];

    // Handle relative paths
    if (pagePart === ".") {
      // "./file.png" - same page (no change)
      targetPagePath = fullPagePath;
    } else if (pagePart === "..") {
      // "../file.png" - parent page
      const parentMatch = fullPagePath.match(/^(.+)\//);
      targetPagePath =
        parentMatch && parentMatch[1] ? parentMatch[1] : fullPagePath;
    } else {
      // "OtherPage/file.png" or "Parent/Child/file.png"
      // This is an absolute reference from the root
      targetPagePath = pagePart;
    }
  }

  // Get the attachment page name (last component) for the file naming
  const targetPageName = getAttachmentPageName(targetPagePath);

  // Build the attachment file name
  const attachmentFileName = `${targetPageName}_attachment_${actualFilename}`;

  // Calculate relative path from current page to attachment file
  const attachmentPath = path.join(
    path.dirname(targetPagePath),
    attachmentFileName,
  );
  const relativePath = calculateRelativePath(fullPagePath, attachmentPath);

  // Encode the relative path for Markdown URL
  const encodedPath = encodePathForMarkdown(relativePath);

  const { altText, size } = parseRefParameters(params || "");
  // Use actual filename (without page path) as default alt text if not specified
  const effectiveAltText = altText || actualFilename;

  // Check if it's an image file based on actual filename (not the path)
  if (isImageFile(actualFilename)) {
    // If size specification exists, use HTML img tag
    if (size) {
      return generateImageTag(encodedPath, effectiveAltText, size);
    }
    // Otherwise use Markdown format
    return `![${effectiveAltText}](${encodedPath})`;
  } else {
    // Non-image files always use link format (size is ignored)
    return `[${effectiveAltText}](${encodedPath})`;
  }
};

/**
 * Parse ref plugin content in CSV format (like PukiWiki's csv_explode)
 *
 * Supports:
 * - Simple: file.png,300x200,説明
 * - Quoted: "file (1).png",300x200
 * - With comma: "file, name.png",left
 * - Escaped quotes: "file ""quoted"".png"
 *
 * @param content - Content string from ref plugin (entire content inside parentheses)
 * @returns Object with filename and optional params string
 */
const parseRefContent = (
  content: string,
): { filename: string; params: string | undefined } => {
  const parts: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        // Escaped double quote: ""
        current += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }

    if (char === "," && !inQuotes) {
      // Split by comma (only outside quotes)
      parts.push(current);
      current = "";
      i++;
      continue;
    }

    current += char;
    i++;
  }

  // Add last part
  if (current) {
    parts.push(current);
  }

  const filename = parts[0] || "";
  const params = parts.length > 1 ? parts.slice(1).join(",") : undefined;

  return { filename, params };
};

/**
 * Convert #ref block plugin from PukiWiki to Markdown
 *
 * PukiWiki: #ref(file), #ref(file,params...)
 * Markdown: ![alt](file) for images, [alt](file) for other files
 * HTML: <img> tags when size specifications are present
 *
 * Following PukiWiki behavior, text after closing ) is ignored.
 * No additional inline processing is needed as convertAttachmentReference
 * already produces the final output.
 *
 * @param line - Line to convert
 * @param currentPage - Current page name for attachment file naming
 * @returns Conversion result
 */
const convertRefBlock = (
  line: string,
  currentPage: string,
): ConversionResult => {
  const trimmed = line.trimEnd();

  // Match #ref(...) - greedy matching to handle filenames with parentheses
  // e.g., #ref(file (1).png)
  const match = trimmed.match(/^#ref\((.+)\)/);
  if (!match || !match[1]) {
    return { lines: [] }; // No match
  }

  const { filename, params } = parseRefContent(match[1]);

  const converted = convertAttachmentReference(filename, params, currentPage);

  // Already fully converted, no inline processing needed
  return { lines: [converted] };
};

/**
 * Convert attachment references from PukiWiki to Markdown
 *
 * PukiWiki: &ref(file);, &ref(file,params...);
 * Markdown: ![alt](file) for images, [alt](file) for other files
 * HTML: <img> tags when size specifications are present
 *
 * Note: #ref (block plugin) is handled by convertRefBlock() function
 *
 * Parameters can include keywords (left, center, etc.), size specs (300x200, 50%, etc.),
 * and text parameters. Only text parameters are used as alt text.
 * Size specifications result in HTML img tags to preserve dimensions.
 *
 * @param text - Text to convert
 * @param currentPage - Current page name for attachment file naming
 * @returns Converted text
 */
const convertAttachments = (text: string, currentPage: string): string => {
  let result = text;

  // Process inline &ref(...); (non-greedy matching)
  // Note: Block-level #ref(...) is handled by convertRefBlock
  result = result.replace(/&ref\((.+?)\);/g, (_match, content) => {
    const { filename, params } = parseRefContent(content);
    return convertAttachmentReference(filename, params, currentPage);
  });

  return result;
};

/**
 * Apply inline conversions (formatting, links, attachments) to text
 *
 * This helper function is used by block converters to apply inline processing
 * to their content when needed.
 *
 * @param text - Text to convert
 * @param pageName - Current page name for link resolution
 * @returns Text with inline conversions applied
 */
const applyInlineConversions = (text: string, pageName: string): string => {
  let result = text;
  result = convertInlineFormat(result);
  result = convertLinks(result, pageName);
  result = convertAttachments(result, pageName);
  return result;
};

/**
 * Parse a table cell from PukiWiki format
 *
 * @param cellText - Cell text
 * @returns Parsed table cell
 */
const parseTableCell = (cellText: string): TableCell => {
  let content = cellText.trim();
  let isHeader = false;
  let isBold = false;
  let fontSize: string | undefined = undefined;
  let color: string | undefined = undefined;
  let bgColor: string | undefined = undefined;

  // Detect alignment specification (must be first)
  const alignMatch = content.match(/^(LEFT|CENTER|RIGHT):(.*)$/);
  let align: "left" | "center" | "right" | undefined = undefined;
  if (alignMatch && alignMatch[1] && alignMatch[2] !== undefined) {
    align = alignMatch[1].toLowerCase() as "left" | "center" | "right";
    content = alignMatch[2];
  }

  // Detect BOLD:
  if (content.startsWith("BOLD:")) {
    isBold = true;
    content = content.substring(5);
  }

  // Detect SIZE(n):
  const sizeMatch = content.match(/^SIZE\((\d+)\):(.*)$/);
  if (sizeMatch && sizeMatch[1] && sizeMatch[2] !== undefined) {
    fontSize = sizeMatch[1];
    content = sizeMatch[2];
  }

  // Detect COLOR(color):
  const colorMatch = content.match(/^COLOR\(([^)]+)\):(.*)$/);
  if (colorMatch && colorMatch[1] && colorMatch[2] !== undefined) {
    color = colorMatch[1];
    content = colorMatch[2];
  }

  // Detect BGCOLOR(color):
  const bgColorMatch = content.match(/^BGCOLOR\(([^)]+)\):(.*)$/);
  if (bgColorMatch && bgColorMatch[1] && bgColorMatch[2] !== undefined) {
    bgColor = bgColorMatch[1];
    content = bgColorMatch[2];
  }

  // Detect ~ header cell
  if (content.startsWith("~")) {
    isHeader = true;
    content = content.substring(1);
  }

  const result: TableCell = { content, isHeader };
  if (align !== undefined) result.align = align;
  if (isBold) result.isBold = isBold;
  if (fontSize) result.fontSize = fontSize;
  if (color) result.color = color;
  if (bgColor) result.bgColor = bgColor;

  return result;
};

/**
 * Check if a line is preformatted text (starts with space or tab)
 *
 * @param line - Line to check
 * @returns True if line is preformatted text
 */
const isPreformattedLine = (line: string): boolean => {
  // Preformatted line must start with space or tab followed by non-whitespace
  // Empty lines or lines with only whitespace are not preformatted
  return /^[ \t]+\S/.test(line);
};

/**
 * Generate fenced code block from preformatted text lines
 *
 * @param lines - Preformatted text lines (leading whitespace already removed)
 * @returns Array of Markdown lines forming a fenced code block
 */
const generatePreformattedBlock = (lines: string[]): string[] => {
  if (lines.length === 0) return [];

  return ["```", ...lines, "```"];
};

/**
 * Parse a table row from PukiWiki format
 *
 * @param line - Line to parse
 * @returns Parsed table row or null if not a table row
 */
const parseTableRow = (line: string): TableRow | null => {
  const match = line.match(/^\|(.+)\|([hfc])?$/);
  if (!match || !match[1]) return null;

  const cellsText = match[1];
  const type = (match[2] || "") as "h" | "f" | "c" | "";
  const cells = cellsText.split("|").map(parseTableCell);

  return { cells, type };
};

/**
 * Determine column alignments from table rows
 *
 * @param rows - Table rows
 * @param columnCount - Number of columns
 * @returns Array of column alignments
 */
const determineColumnAligns = (
  rows: TableRow[],
  columnCount: number,
): ("left" | "center" | "right")[] => {
  const aligns: ("left" | "center" | "right")[] = [];

  for (let col = 0; col < columnCount; col++) {
    let align: "left" | "center" | "right" = "left";

    // Find first row with alignment specification for this column
    for (const row of rows) {
      const cell = row.cells[col];
      if (cell && cell.align) {
        align = cell.align;
        break;
      }
    }

    aligns.push(align);
  }

  return aligns;
};

/**
 * Generate Markdown table from table rows
 *
 * @param rows - Table rows
 * @param pageName - Page name (used for link conversion)
 * @returns Array of Markdown lines
 */
const generateMarkdownTable = (
  rows: TableRow[],
  pageName: string,
): string[] => {
  if (rows.length === 0) return [];

  // Check if table has |h header row
  const hasHeaderRow = rows.some((row) => row.type === "h");

  const result: string[] = [];
  const firstRow = rows[0];
  if (!firstRow) return [];

  const columnCount = firstRow.cells.length;

  // Determine column alignments
  const columnAligns = determineColumnAligns(rows, columnCount);

  // If no |h header, add empty header row
  if (!hasHeaderRow) {
    const emptyHeaders = Array(columnCount).fill("");
    result.push(`| ${emptyHeaders.join(" | ")} |`);

    // Add separator row
    const separator = columnAligns.map((align) => {
      if (align === "center") return ":---:";
      if (align === "right") return "---:";
      return "---";
    });
    result.push(`| ${separator.join(" | ")} |`);
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Skip c (column width) rows
    if (row.type === "c") continue;

    // Generate cell contents
    const cells = row.cells.map((cell) => {
      let content = cell.content;

      // Apply inline conversions (links, attachments, formatting)
      content = applyInlineConversions(content, pageName);

      // Apply bold formatting (both ~ and BOLD:) only if content is not empty
      if ((cell.isHeader || cell.isBold) && content.trim() !== "") {
        content = `**${content}**`;
      }

      // Apply SIZE, COLOR with span tags (BGCOLOR is not applied) only if content is not empty
      const styles: string[] = [];
      if (cell.fontSize) styles.push(`font-size: ${cell.fontSize}px`);
      if (cell.color) styles.push(`color: ${cell.color}`);
      // Note: BGCOLOR is not applied here - it will be added as HTML comment

      if (styles.length > 0 && content.trim() !== "") {
        content = `<span style="${styles.join("; ")}">${content}</span>`;
      }

      // Add BGCOLOR as HTML comment (not converted due to Markdown table limitations)
      if (cell.bgColor) {
        content = `${content} <!-- BGCOLOR(${cell.bgColor}) -->`;
      }

      return content;
    });

    // Generate Markdown row
    result.push(`| ${cells.join(" | ")} |`);

    // Insert separator row after h (header) row
    if (row.type === "h") {
      const separator = columnAligns.map((align) => {
        if (align === "center") return ":---:";
        if (align === "right") return "---:";
        return "---";
      });
      result.push(`| ${separator.join(" | ")} |`);
    }
  }

  return result;
};
