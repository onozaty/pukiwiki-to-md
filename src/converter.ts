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
 * @returns Converted Markdown content
 */
export const convertToMarkdown = (
  content: string,
  pageName: string,
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
        const markdownTable = generateMarkdownTable(tableBuffer);
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
        const markdownTable = generateMarkdownTable(tableBuffer);
        convertedLines.push(...markdownTable);
        tableBuffer = [];
        inTable = false;
      }

      // Convert and output non-table line
      const converted = convertLine(line, pageName);
      // Skip lines that were removed by converters (e.g., system directives)
      // But keep original empty lines (where line === converted === "")
      if (converted !== "" || line === "") {
        convertedLines.push(converted);
      }
    }
  }

  // Handle remaining blocks at end of content
  if (inPreformatted && preformattedBuffer.length > 0) {
    const codeBlock = generatePreformattedBlock(preformattedBuffer);
    convertedLines.push(...codeBlock);
  }

  if (inTable && tableBuffer.length > 0) {
    const markdownTable = generateMarkdownTable(tableBuffer);
    convertedLines.push(...markdownTable);
  }

  return convertedLines.join("\n");
};

/**
 * Convert a single line from PukiWiki to Markdown
 *
 * @param line - PukiWiki line
 * @param pageName - Page name (used for relative path calculation and attachments)
 * @returns Converted Markdown line
 */
const convertLine = (line: string, pageName: string): string => {
  // Apply block-level conversions (mutually exclusive)
  // Try each conversion in order, stop at first match
  const blockConverters = [
    convertSystemDirective,
    convertComment,
    convertLineHeadEscape,
    convertHorizontalRule,
    convertLineBreak,
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
 * Remove system directive plugins from PukiWiki
 *
 * These plugins control PukiWiki system behavior and have no meaning in static Markdown:
 * - #author: Page metadata (author and timestamp) - automatically generated by PukiWiki
 * - #freeze: Page freeze setting - prevents editing in PukiWiki
 * - #norelated: Suppress related pages display - PukiWiki UI feature
 * - #nofollow: Search engine hint - PukiWiki SEO setting
 * - #norightbar: Hide right sidebar - PukiWiki layout setting
 *
 * @param line - Line to convert
 * @returns Empty string if system directive, otherwise original line
 */
const convertSystemDirective = (line: string): string => {
  const trimmed = line.trimEnd();

  // Match #author("timestamp","user_id","display_name")
  if (/^#author\(/.test(trimmed)) {
    return "";
  }

  // Match system directive plugins
  if (
    trimmed === "#freeze" ||
    trimmed === "#norelated" ||
    trimmed === "#nofollow" ||
    trimmed === "#norightbar"
  ) {
    return "";
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
 * PukiWiki: ---- (4 or more hyphens) or #hr
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

  // Match #hr plugin
  if (trimmed === "#hr") {
    return "---";
  }

  return line;
};

/**
 * Convert line break plugin from PukiWiki to Markdown
 *
 * PukiWiki: #br
 * Markdown: <br>
 *
 * Note: Line-ending whitespace is trimmed before matching
 *
 * @param line - Line to convert
 * @returns Converted line
 */
const convertLineBreak = (line: string): string => {
  const trimmed = line.trimEnd();

  // Match #br plugin
  if (trimmed === "#br") {
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
 * PukiWiki: ''bold'', '''italic''', %%strikethrough%%, &br;, text~
 * Markdown: **bold**, *italic*, ~~strikethrough~~, <br>, text<br>
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

  // Convert line-end tilde: text~ → text<br>
  // Only match ~ that is not preceded by ~ (to avoid ~~)
  converted = converted.replace(/([^~])~$/g, "$1<br>");

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
  converted = converted.replace(/\[\[([^\]:>]+?)\]\]/g, (_, targetPage) => {
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

  // Detect alignment specification
  const alignMatch = content.match(/^(LEFT|CENTER|RIGHT):(.*)$/);
  let align: "left" | "center" | "right" | undefined = undefined;
  if (alignMatch && alignMatch[1] && alignMatch[2] !== undefined) {
    align = alignMatch[1].toLowerCase() as "left" | "center" | "right";
    content = alignMatch[2];
  }

  // Detect ~ header cell
  if (content.startsWith("~")) {
    isHeader = true;
    content = content.substring(1);
  }

  const result: TableCell = { content, isHeader };
  if (align !== undefined) {
    result.align = align;
  }
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
 * Generate HTML table from table rows
 *
 * @param rows - Table rows
 * @returns Array of HTML lines
 */
const generateHtmlTable = (rows: TableRow[]): string[] => {
  if (rows.length === 0) return [];

  const result: string[] = [];
  result.push("<table>");

  for (const row of rows) {
    // Skip c (column width) rows
    if (row.type === "c") continue;

    result.push("<tr>");
    for (const cell of row.cells) {
      let content = cell.content;
      // Convert ~ header cells to bold with <strong> tag
      if (cell.isHeader) {
        content = `<strong>${content}</strong>`;
      }
      result.push(`<td>${content}</td>`);
    }
    result.push("</tr>");
  }

  result.push("</table>");
  return result;
};

/**
 * Generate Markdown table from table rows
 *
 * @param rows - Table rows
 * @returns Array of Markdown lines
 */
const generateMarkdownTable = (rows: TableRow[]): string[] => {
  if (rows.length === 0) return [];

  // Check if table has |h header row
  const hasHeaderRow = rows.some((row) => row.type === "h");

  // If no |h header, use HTML table format
  if (!hasHeaderRow) {
    return generateHtmlTable(rows);
  }

  const result: string[] = [];
  const firstRow = rows[0];
  if (!firstRow) return [];

  const columnCount = firstRow.cells.length;

  // Determine column alignments
  const columnAligns = determineColumnAligns(rows, columnCount);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Skip c (column width) rows
    if (row.type === "c") continue;

    // Generate cell contents
    const cells = row.cells.map((cell) => {
      let content = cell.content;
      // Convert ~ header cells to bold
      if (cell.isHeader) {
        content = `**${content}**`;
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
