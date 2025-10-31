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

      // Check for #vote plugin first (returns multiple lines)
      const voteLines = convertVote(line);
      if (voteLines.length > 1 || voteLines[0] !== line) {
        // #vote was converted - add all resulting lines
        convertedLines.push(...voteLines);
      } else {
        // Check for #include plugin (returns multiple lines)
        const includeLines = convertInclude(line, pageName);
        if (includeLines) {
          // #include was converted - add all resulting lines
          convertedLines.push(...includeLines);
        } else {
          // Convert and output non-table line
          const converted = convertLine(line, pageName, excludeBlockPlugins);
          // Skip lines that were removed by converters (e.g., block plugins converted to comments)
          // But keep original empty lines (where line === converted === "")
          if (converted !== "" || line === "") {
            convertedLines.push(converted);
          }
        }
      }
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
 * @param line - PukiWiki line
 * @param pageName - Page name (used for relative path calculation and attachments)
 * @param excludeBlockPlugins - Custom block plugins to exclude
 * @returns Converted Markdown line
 */
const convertLine = (
  line: string,
  pageName: string,
  excludeBlockPlugins: string[],
): string => {
  // Apply block-level conversions (mutually exclusive)
  // Try each conversion in order, stop at first match
  const blockConverters = [
    convertComment,
    (l: string) => convertUnsupportedBlockPlugin(l, excludeBlockPlugins),
    convertLineHeadEscape,
    convertHorizontalRule,
    convertLineBreak,
    convertAlignment,
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
  converted = convertLinks(converted, pageName);
  converted = convertAttachments(converted, pageName);

  return converted;
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
 * @param line - Line to convert
 * @returns Converted line with alignment prefix removed
 */
const convertAlignment = (line: string): string => {
  const trimmed = line.trimEnd();

  // Match LEFT:, CENTER:, or RIGHT: at line start and remove prefix
  const match = trimmed.match(/^(LEFT|CENTER|RIGHT):(.*)$/);
  if (!match || !match[1] || match[2] === undefined) return line;

  const content = match[2];
  return content;
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
 * @param line - Line to convert
 * @returns Converted line
 */
const convertHeading = (line: string): string => {
  const match = line.match(/^(\*{1,3})\s*(.*)$/);
  if (!match || !match[1] || match[2] === undefined) return line;

  const level = match[1].length;
  let text = match[2];

  // Remove auto-generated anchor ID [#xxxxxxxx] at the end
  text = text.replace(/\s*\[#[a-z0-9]+\]\s*$/, "").trim();

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
 * Convert comment from PukiWiki to Markdown
 *
 * PukiWiki: //comment
 * Markdown: <!-- comment -->
 *
 * @param line - Line to convert
 * @returns Converted line with HTML comment
 */
const convertComment = (line: string): string => {
  const trimmed = line.trimEnd();

  // Match comment line starting with //
  if (trimmed.startsWith("//")) {
    const commentContent = trimmed.substring(2).trimStart();
    return `<!-- ${commentContent} -->`;
  }

  return line;
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
 * @param line - Line to convert
 * @returns Converted lines as array (comment + table)
 */
const convertVote = (line: string): string[] => {
  const trimmed = line.trimEnd();

  // Match #vote plugin
  const voteMatch = trimmed.match(/^#vote\((.+)\)$/);
  if (!voteMatch || !voteMatch[1]) {
    return [line];
  }

  const result: string[] = [];

  // Add original as HTML comment
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

  // Generate table
  if (options.length > 0) {
    result.push("| 選択肢 | 投票数 |");
    result.push("| --- | ---: |");
    for (const option of options) {
      result.push(`| ${option.label} | ${option.count} |`);
    }
  }

  return result;
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
 * @param line - Line to convert
 * @param currentPage - Current page name for relative path calculation
 * @returns Array of converted lines (comment + link), or null if not matched
 */
const convertInclude = (line: string, currentPage: string): string[] | null => {
  const trimmed = line.trimEnd();

  // Match #include(PageName) or #include(PageName,params)
  const match = trimmed.match(/^#include\(([^,)]+)(?:,([^)]*))?\)$/);
  if (!match || !match[1]) return null;

  const pageName = match[1];
  const params = match[2];

  // Generate HTML comment with full syntax
  const comment = params
    ? `<!-- #include(${pageName},${params}) -->`
    : `<!-- #include(${pageName}) -->`;

  // Generate link to the included page
  const relativePath = calculateRelativePath(currentPage, pageName);
  const link = `[${pageName}](${relativePath})`;

  return [comment, link];
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
  customExcludePlugins: string[] = [],
): string => {
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
    // Escape special regex characters in plugin name
    const escapedPlugin = plugin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Match #plugin or #plugin(...)
    // The $ ensures we match exact plugin names (not #pluginxxx)
    const regex = new RegExp(`^#${escapedPlugin}(\\(.*\\))?$`);

    if (regex.test(trimmed)) {
      return `<!-- ${trimmed} -->`;
    }
  }

  return line;
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
 * @param line - Line to convert
 * @returns Converted line with escaped characters or ~ removed
 */
const convertLineHeadEscape = (line: string): string => {
  // Don't process empty ~ or ~ with only whitespace after it
  const trimmed = line.trimEnd();
  if (trimmed === "~") return line;

  if (!line.startsWith("~")) return line;

  const restOfLine = line.substring(1);
  if (restOfLine.length === 0) return line;

  const firstChar = restOfLine.charAt(0);
  // Markdown characters that need escaping at line start
  const markdownSpecialChars = ["*", "-", "+", ">", "#", "|"];

  if (markdownSpecialChars.includes(firstChar)) {
    // Escape with backslash for Markdown special characters
    return `\\${restOfLine}`;
  } else {
    // Just remove ~ for non-Markdown characters (e.g., PukiWiki syntax)
    return restOfLine;
  }
};

/**
 * Convert horizontal rule from PukiWiki to Markdown
 *
 * PukiWiki: ---- (4 or more hyphens) or #hr or #hr()
 * Markdown: ---
 *
 * @param line - Line to convert
 * @returns Converted line
 */
const convertHorizontalRule = (line: string): string => {
  const trimmed = line.trimEnd();

  // Match ---- (4 or more hyphens)
  if (/^-{4,}$/.test(trimmed)) {
    return "---";
  }

  // Match #hr or #hr() plugin
  if (trimmed === "#hr" || trimmed === "#hr()") {
    return "---";
  }

  return line;
};

/**
 * Convert line break plugin from PukiWiki to Markdown
 *
 * PukiWiki: #br or #br()
 * Markdown: <br>
 *
 * Note: Line-ending whitespace is trimmed before matching
 *
 * @param line - Line to convert
 * @returns Converted line
 */
const convertLineBreak = (line: string): string => {
  const trimmed = line.trimEnd();

  // Match #br or #br() plugin
  if (trimmed === "#br" || trimmed === "#br()") {
    return "<br>";
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
 * Calculate relative path from current page to target page
 *
 * @param currentPage - Current page name (e.g., "プロジェクト/タスク")
 * @param targetPage - Target page name (e.g., "プロジェクト/概要")
 * @returns Relative path to target page (e.g., "概要.md")
 */
const calculateRelativePath = (
  currentPage: string,
  targetPage: string,
): string => {
  // Get directory of current page
  const currentDir = path.dirname(currentPage);

  // Target file path with .md extension
  const targetPath = `${targetPage}.md`;

  // Calculate relative path
  // If currentPage has no directory (root level), just use targetPath
  if (currentDir === ".") {
    return targetPath;
  }

  const relativePath = path.relative(currentDir, targetPath);
  return relativePath;
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
      const relativePath = calculateRelativePath(currentPage, targetPage);
      return `[${linkText}](${relativePath})`;
    },
  );

  // Convert internal links: [[page]] → [page](relativePath)
  converted = converted.replace(/\[\[([^\]>]+?)\]\]/g, (_, targetPage) => {
    const relativePath = calculateRelativePath(currentPage, targetPage);
    return `[${targetPage}](${relativePath})`;
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
 * @param filename - File name
 * @param params - Parameter string (optional)
 * @param attachmentPageName - Page name for attachment file naming
 * @returns Converted text
 */
const convertAttachmentReference = (
  filename: string,
  params: string | undefined,
  attachmentPageName: string,
): string => {
  const attachmentFileName = `${attachmentPageName}_attachment_${filename}`;
  const { altText, size } = parseRefParameters(params || "");

  if (isImageFile(filename)) {
    // If size specification exists, use HTML img tag
    if (size) {
      return generateImageTag(attachmentFileName, altText, size);
    }
    // Otherwise use Markdown format
    return altText
      ? `![${altText}](${attachmentFileName})`
      : `![](${attachmentFileName})`;
  } else {
    // Non-image files always use link format (size is ignored)
    return altText
      ? `[${altText}](${attachmentFileName})`
      : `[${filename}](${attachmentFileName})`;
  }
};

/**
 * Convert attachment references from PukiWiki to Markdown
 *
 * PukiWiki: #ref(file), #ref(file,params...), &ref(file);, &ref(file,params...);
 * Markdown: ![alt](file) for images, [alt](file) for other files
 * HTML: <img> tags when size specifications are present
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
  const attachmentPageName = getAttachmentPageName(currentPage);

  // Convert both #ref and &ref with unified pattern
  // Matches: #ref(file,params...) or &ref(file,params...);
  // The optional semicolon at the end handles both syntaxes
  return text.replace(
    /[#&]ref\(([^,)]+?)(?:,([^)]+?))?\);?/g,
    (_, filename, params) =>
      convertAttachmentReference(filename, params, attachmentPageName),
  );
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
      // Note: Block plugins are not expected in table cells, so we don't pass excludeBlockPlugins
      content = convertInlineFormat(content);
      content = convertLinks(content, pageName);
      content = convertAttachments(content, pageName);

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
