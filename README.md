# pukiwiki-to-md

English | [日本語](README.ja.md)

[![test](https://github.com/onozaty/pukiwiki-to-md/actions/workflows/test.yaml/badge.svg)](https://github.com/onozaty/pukiwiki-to-md/actions/workflows/test.yaml)
[![codecov](https://codecov.io/gh/onozaty/pukiwiki-to-md/graph/badge.svg?token=19VZNQCMUN)](https://codecov.io/gh/onozaty/pukiwiki-to-md)
[![npm version](https://badge.fury.io/js/@onozaty%2Fpukiwiki-to-md.svg)](https://www.npmjs.com/package/@onozaty/pukiwiki-to-md)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A command-line tool to convert PukiWiki pages and attachments to Markdown format.

## Features

- 📝 **Convert PukiWiki Syntax** - Transform PukiWiki markup to Markdown
- 📁 **Preserve Directory Structure** - Maintain hierarchical page organization
- 📎 **Process Attachments** - Automatically handle attached files
- 🌍 **Encoding Support** - Works with UTF-8 and EUC-JP encoded files
- 🗑️ **Auto-Exclude System Pages** - Filters out `:config`, `:RenameLog`, etc.
- 🧹 **Comment Unsupported Block Plugins** - Converts system directives and other unsupported block plugins to HTML comments (use `--strip-comments` to drop them entirely)

## Installation

### Using npx (Recommended)

No installation required. Run directly with npx:

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output
```

### Global Installation

Install globally for repeated use:

```bash
npm install -g @onozaty/pukiwiki-to-md
pukiwiki-to-md -w ./wiki -a ./attach -o ./output
```

## Usage

### Basic Command

```bash
npx @onozaty/pukiwiki-to-md -w <wiki-folder> -a <attach-folder> -o <output-folder>
```

### Options

| Option | Alias | Default | Description |
|--------|-------|---------|-------------|
| `--wiki <path>` | `-w` | (required) | Path to PukiWiki wiki folder |
| `--attach <path>` | `-a` | (required) | Path to PukiWiki attach folder |
| `--output <path>` | `-o` | (required) | Output directory path |
| `--encoding <encoding>` | `-e` | `utf-8` | Input file encoding (utf-8 or euc-jp) |
| `--exclude-plugins <list>` | `-x` | (empty) | Comma-separated custom block plugins to exclude |
| `--strip-comments` | `-s` | `false` | Remove all HTML comments from output |
| `--convert-ls-to-lsx` | | `false` | Convert PukiWiki `#ls`/`#ls2` plugins to GROWI `$lsx` format |
| `--help` | `-h` | | Display help information |
| `--version` | `-v` | | Display version number |

### Examples

**Convert UTF-8 encoded PukiWiki:**

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output
```

**Convert EUC-JP encoded PukiWiki:**

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output -e euc-jp
```

**Exclude custom plugins:**

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output -x "myplugin,customplugin"
```

**Remove HTML comments from output:**

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output -s
```

**Convert #ls/#ls2 plugins to GROWI $lsx format:**

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output --convert-ls-to-lsx
```

## Conversion Features

**Note:** Plugin names (starting with `#` or `&`) are case-insensitive, matching PukiWiki's behavior. For example, `#ref`, `#REF`, and `#Ref` are all recognized as the same plugin. Parameters (filenames, text, etc.) preserve their original case.

### Headings

Converts PukiWiki headings to Markdown, automatically removing anchor IDs:

| PukiWiki | Markdown |
|----------|----------|
| `*Heading` | `# Heading` |
| `**Heading [#abc123]` | `## Heading` |
| `***Heading` | `### Heading` |

### Lists

**Unordered Lists:**

| PukiWiki | Markdown |
|----------|----------|
| `-Item` | `- Item` |
| `--Item` | `    - Item` |
| `---Item` | `        - Item` |

**Ordered Lists:**

| PukiWiki | Markdown |
|----------|----------|
| `+Item` | `1. Item` |
| `++Item` | `    1. Item` |
| `+++Item` | `        1. Item` |

### Text Formatting

| PukiWiki | Markdown |
|----------|----------|
| `''bold''` | `**bold**` |
| `'''italic'''` | `*italic*` |
| `%%strikethrough%%` | `~~strikethrough~~` |
| `%%%underline%%%` | `<u>underline</u>` |
| `&br;` or `&br();` | `<br>` |
| `text~` | `text<br>` |
| `&size(20){text};` | `<span style="font-size: 20px">text</span>` |
| `&color(red){text};` | `<span style="color: red">text</span>` |
| `&color(red,yellow){text};` | `<span style="color: red; background-color: yellow">text</span>` |
| `&color(red,text);` | `<span style="color: red">text</span>` (old style) |
| `COLOR(red):text` | `<span style="color: red">text</span>` |

**Notes:**
- **Spacing around emphasis markers**: Spaces are automatically added before and after bold (`**`), italic (`*`), and strikethrough (`~~`) markers to ensure proper Markdown rendering, unless spaces already exist or the markers are at the start/end of a line. For example, `これは''太字''です` becomes `これは **太字** です`.
- The `&color` plugin supports both new style (with braces) and old style (comma-separated): `&color(color){text};` and `&color(color,text);` are both supported. The old style does not support background color.
- The `COLOR(color):` format applies color until the next `COLOR(color):` directive or end of line. Multiple consecutive color directives are supported (e.g., `COLOR(red):textCOLOR(blue):text`).
- **Nested plugin syntax**: `&size` and `&color` can be nested within each other in any order. Other inline elements (like `&br;`, bold, italic, etc.) can also be included inside nested plugins.

**Nested Plugin Examples:**

| PukiWiki | Markdown |
|----------|----------|
| `&color(red){&size(20){text};};` | `<span style="color: red"><span style="font-size: 20px">text</span></span>` |
| `&size(20){&color(red){text};};` | `<span style="font-size: 20px"><span style="color: red">text</span></span>` |
| `&color(red){&size(20){text1&br;text2};};` | `<span style="color: red"><span style="font-size: 20px">text1<br>text2</span></span>` |
| `&size(20){&color(blue){''bold''};};` | `<span style="font-size: 20px"><span style="color: blue">**bold**</span></span>` |

### Comments

| PukiWiki | Markdown |
|----------|----------|
| `//comment` | `<!-- comment -->` |

### Text Alignment

| PukiWiki | Markdown |
|----------|----------|
| `LEFT:text` | `text` (prefix removed) |
| `CENTER:text` | `text` (prefix removed) |
| `RIGHT:text` | `text` (prefix removed) |

Note: Alignment information is not preserved because Markdown has no standard syntax for text alignment, and HTML tags would prevent Markdown parsing of inline elements.

### Escape

| PukiWiki | Markdown |
|----------|----------|
| `~*text` | `\*text` |
| `~-text` | `\-text` |

Escapes Markdown special characters (`*`, `-`, `+`, `>`, `#`, `|`) at line start. For non-Markdown characters, the `~` is simply removed.

### Links

Internal links are converted to relative paths with minimal URL encoding. Unicode characters (Japanese, etc.) are preserved for readability, while only problematic characters (spaces, parentheses, etc.) are encoded:

| PukiWiki | Markdown |
|----------|----------|
| `[[Page]]` | `[Page](Page.md)` |
| `[[Label>Page]]` | `[Label](Page.md)` |
| `[[テストページ]]` | `[テストページ](テストページ.md)` |
| `[[File (1)]]` | `[File (1)](File%20%281%29.md)` |
| `[[https://example.com]]` | `[https://example.com](https://example.com)` |
| `[[Label:https://example.com]]` | `[Label](https://example.com)` |

**Relative Path Resolution:**

Links are converted to relative paths based on the current page location:

```
Current page: Project/Task
Link: [[Project/Overview]]
Output: [Project/Overview](Overview.md)

Current page: TopPage
Link: [[Project/Task]]
Output: [Project/Task](Project/Task.md)

Current page: Project/Task
Link: [[TopPage]]
Output: [TopPage](../TopPage.md)
```

### Tables

All PukiWiki tables are converted to Markdown table format. Tables without a header marker (`|h`) automatically get an empty header row.

**With Header Marker** (`|h`):

**Input:**
```
|Header1|Header2|h
|Data1|Data2|
```

**Output:**
```markdown
| Header1 | Header2 |
| --- | --- |
| Data1 | Data2 |
```

**Without Header Marker** (empty header row added automatically):

**Input:**
```
|Data1|Data2|
|Data3|Data4|
```

**Output:**
```markdown
|   |   |
| --- | --- |
| Data1 | Data2 |
| Data3 | Data4 |
```

**Tables with PukiWiki Syntax in Cells:**

PukiWiki syntax (links, formatting, etc.) within table cells is properly converted:

**Input:**
```
|[[TopPage]]|''Bold''|
|[[Help]]|Normal|
```

**Output:**
```markdown
|   |   |
| --- | --- |
| [TopPage](TopPage.md) | **Bold** |
| [Help](Help.md) | Normal |
```

**Table Cell Formatting:**

Cells can be formatted with the following prefixes:

| PukiWiki | Description | Output |
|----------|-------------|--------|
| `LEFT:text` | Left-aligned cell | `text` (left alignment applied to column) |
| `CENTER:text` | Center-aligned cell | `text` (center alignment applied to column) |
| `RIGHT:text` | Right-aligned cell | `text` (right alignment applied to column) |
| `BOLD:text` | Bold text | `**text**` |
| `SIZE(20):text` | Font size (px) | `<span style="font-size: 20px">text</span>` |
| `COLOR(red):text` | Text color | `<span style="color: red">text</span>` |
| `BGCOLOR(yellow):text` | Background color (preserved as comment) | `text <!-- BGCOLOR(yellow) -->` |
| `~text` | Bold (header cell) | `**text**` |

**Note:** `BGCOLOR` is not converted and is preserved as an HTML comment because Markdown tables do not support cell background colors. Converting to HTML tables would prevent Markdown syntax (links, bold, etc.) from working inside cells.

**Example:**
```
Input:  |BOLD:Name|SIZE(20):Large|COLOR(red):Red|h
Output: | **Name** | <span style="font-size: 20px">Large</span> | <span style="color: red">Red</span> |
        | --- | --- | --- |
```

Multiple formatting options can be combined:
```
Input:  |BOLD:SIZE(20):COLOR(red):BGCOLOR(yellow):All|Normal|h
Output: | <span style="font-size: 20px; color: red">**All**</span> <!-- BGCOLOR(yellow) --> | Normal |
        | --- | --- |
```

**Block Plugins in Table Cells:**

The `#ref` block plugin is supported in table cells for embedding images and file attachments:

```
Input:  |#ref(image.png)|#ref(document.pdf,説明)|
Output: |   |   |
        | --- | --- |
        | ![image.png](PageName_attachment_image.png) | [説明](PageName_attachment_document.pdf) |
```

When `#ref` is used at the start of a cell, it's processed as a block plugin. Text after the closing parenthesis is ignored (standard PukiWiki block plugin behavior). All `#ref` parameters (alt text, size specifications, etc.) are supported.

### Quotes

| PukiWiki | Markdown |
|----------|----------|
| `>quote` | `> quote` |
| `>>nested quote` | `> > nested quote` |

### Horizontal Rules

| PukiWiki | Markdown |
|----------|----------|
| `----` | `***` |
| `#hr` or `#hr()` | `***` |

### Line Breaks

| PukiWiki | Markdown | Notes |
|----------|----------|-------|
| `#br` or `#br()` | `<br>` + blank line | Blank line added to ensure proper Markdown parsing |

### Preformatted Text

Lines starting with spaces or tabs are converted to fenced code blocks.

**Input:**
```
 function() {
   return 42;
 }
```

**Output:**
````
```
function() {
  return 42;
}
```
````

### Vote Plugin

The `#vote` plugin is converted to an HTML comment plus a table showing vote results. Option labels support inline formatting (bold, links, etc.):

**Input:**
```
#vote(選択肢1[0],選択肢2[1],選択肢3[3])
```

**Output:**
```markdown
<!-- #vote(選択肢1[0],選択肢2[1],選択肢3[3]) -->
| 選択肢 | 投票数 |
| --- | ---: |
| 選択肢1 | 0 |
| 選択肢2 | 1 |
| 選択肢3 | 3 |
```

**With inline formatting:**
```
Input:  #vote(''Bold''[5],[[Link]][10])
Output: <!-- #vote(''Bold''[5],[[Link]][10]) -->
        | 選択肢 | 投票数 |
        | --- | ---: |
        | **Bold** | 5 |
        | [Link](Link.md) | 10 |
```

Note: The voting functionality is lost, and the vote data is preserved as a static snapshot.

### Include Plugin

The `#include` plugin is converted to an HTML comment plus a link to the included page, allowing navigation while preserving the original syntax:

**Input:**
```
#include(CommonHeader)
```

**Output:**
```markdown
<!-- #include(CommonHeader) -->
[CommonHeader](CommonHeader.md)
```

**With parameters:**
```
Input:  #include(PageName,notitle)
Output: <!-- #include(PageName,notitle) -->
        [PageName](PageName.md)
```

**Hierarchical pages:**
```
Current page: Project/Task
Input:  #include(Project/Common)
Output: <!-- #include(Project/Common) -->
        [Project/Common](Common.md)
```

Note: The include functionality is lost, but the link provides navigation to the included page.

### Unsupported Plugins

The following block plugins cannot be represented in Markdown and are converted to HTML comments (46 plugins total). Note that `#vote` and `#include` have special conversion handling (see their dedicated sections above):

**System directives:**
- `#author(...)` - Page metadata (author and timestamp)
- `#freeze` - Page freeze setting
- `#nofollow` - Search engine hint
- `#norelated` - Suppress related pages display

**Content inclusion & display:**
- `#amazon` - Amazon product information
- `#aname` - Anchor definition
- `#includesubmenu` - Include submenu

**Dynamic functionality & forms:**
- `#article` - Article/BBS form
- `#attach` - File upload form
- `#comment` - Comment form
- `#contents` - Table of contents
- `#counter` - Access counter
- `#insert` - Insert form
- `#lookup` - Dictionary lookup
- `#navi` - Navigation
- `#newpage` - New page creation form
- `#pcomment` - Page comment form

**Lists & navigation:**
- `#back` - Back link
- `#ls` - Child page list - Can be converted to GROWI `$lsx` format with `--convert-ls-to-lsx` option
- `#ls2` - Child page list (enhanced) - Can be converted to GROWI `$lsx` format with `--convert-ls-to-lsx` option
- `#menu` - Menu display
- `#online` - Online users display
- `#popular` - Popular pages ranking
- `#recent` - Recent changes display
- `#related` - Related pages display
- `#search` - Search form
- `#topicpath` - Breadcrumb navigation

**Tracker & issue management:**
- `#bugtrack` - Bug tracker input form
- `#bugtrack_list` - Bug tracker list display
- `#tracker` - Tracker input form
- `#tracker_list` - Tracker list display

**Calendar:**
- `#calendar` - Calendar display
- `#calendar2` - Calendar (alternative)
- `#calendar_edit` - Calendar edit form
- `#calendar_read` - Calendar read view
- `#calendar_viewer` - Calendar viewer

**Utilities & misc:**
- `#clear` - Clear float (layout)
- `#memo` - Memo
- `#paint` - Drawing tool
- `#random` - Random display
- `#server` - Server information
- `#setlinebreak` - Line break setting
- `#showrss` - RSS feed display
- `#stationary` - Template/stationery
- `#version` - Version display
- `#versionlist` - Version list

All of these are converted to HTML comments like `<!-- #plugin -->`. Parameters are preserved:

```
Input:  #contents(depth=2)
Output: <!-- #contents(depth=2) -->
```

**Text After Closing Parenthesis:**

Following PukiWiki behavior, when parentheses are present, any text after the closing `)` is ignored and the entire line is converted to an HTML comment. Without parentheses, the plugin name must be alone on the line.

```
Input:  #freeze() additional text
Output: <!-- #freeze() additional text -->

Input:  #contents(depth=2)this is ignored
Output: <!-- #contents(depth=2)this is ignored -->

Input:  #freeze additional text
Output: #freeze additional text
        (not converted, remains as-is)
```

#### GROWI lsx Conversion

When using the `--convert-ls-to-lsx` option, PukiWiki `#ls` and `#ls2` plugins are converted to GROWI `$lsx` format with relative paths:

**#ls plugin (simple child page list):**

| PukiWiki | GROWI lsx | Notes |
|----------|-----------|-------|
| `#ls` | `$lsx(./)` | Current page children |
| `#ls()` | `$lsx(./)` | Current page children |
| `#ls(title)` | `<!-- #ls(title) -->`<br>`$lsx(./)` | Unsupported option preserved as comment |

**#ls2 plugin (enhanced child page list with pattern):**

| PukiWiki | GROWI lsx | Notes |
|----------|-----------|-------|
| `#ls2` | `$lsx(./)` | Current page children |
| `#ls2()` | `$lsx(./)` | Current page children |
| `#ls2(Project/Task)` | `$lsx(./relative/path)` | Relative path calculated |
| `#ls2(Page, reverse)` | `$lsx(./relative/path, reverse=true)` | Supported option |
| `#ls2(Page, title)` | `<!-- #ls2(Page, title) -->`<br>`$lsx(./relative/path)` | Unsupported option preserved as comment |

**Supported options (ls2 only):**
- `reverse` → `reverse=true`

**Unsupported options (preserved as HTML comment):**
- `title` - Heading list display (both ls and ls2)
- `include` - Include page list (ls2 only)
- `compact` - Compact display (ls2 only)
- `link` - Link display (ls2 only)

**Custom Plugin Exclusion:**

You can specify additional custom plugins to exclude using the `--exclude-plugins` option:

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output -x "myplugin,customplugin"
```

This will convert `#myplugin` and `#customplugin` to HTML comments in addition to the default plugins listed above.

**Note:** Dynamic functionality and layout features are lost, but the original syntax is preserved for reference in HTML comments.

### Removing HTML Comments

By default, unsupported plugins and PukiWiki comments are converted to HTML comments for reference. You can use the `--strip-comments` option to remove all HTML comments from the output:

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output --strip-comments
```

This removes:
- PukiWiki comment lines (`//comment`)
- Unsupported block plugin comments (`#contents`, `#comment`, etc.)
- Plugin-specific comments (e.g., `#vote` comment line, `#include` comment line)
- BGCOLOR comments in table cells

The actual converted content (tables from `#vote`, links from `#include`, etc.) is preserved.

## Attachments

### File Processing

Attachments are automatically detected and copied to the output directory with sanitized filenames. File references use minimal URL encoding - Unicode characters are preserved for readability while only problematic characters are encoded:

- PukiWiki format: `E38386E382B9E38388_696D6167652E706E67`
- Converted format: `テスト_attachment_image.png`
- In Markdown: `![image.png](テスト_attachment_image.png)`

**Attachment References:**

The `#ref` and `&ref` plugins support:

- **Default alt text**: If no alt text is specified, the filename is used
- **CSV-style parameters**: Filenames with commas can be quoted (`"file, name.png"`)
- **Other page attachments**: Reference files from other pages (`PageName/file.png`, `../file.png`)
- **Minimal URL encoding**: Only characters that cause issues in Markdown links are encoded (`%, space, (), [], :, ", ,`)

Examples:

```
Input:  #ref(image.png)
Output: ![image.png](PageName_attachment_image.png)

Input:  #ref("file, name.png",300x200)
Output: <img src="PageName_attachment_file%2C%20name.png" alt="file, name.png" width="300" height="200">

Input:  #ref(OtherPage/diagram.png)
Output: ![diagram.png](../OtherPage/OtherPage_attachment_diagram.png)
```

### Directory Structure

Hierarchical page structures are preserved:

```
Input:
wiki/E38397E383ADE382B8E382A7E382AFE383882FE382BFE382B9E382AF.txt

Output:
output/プロジェクト/タスク.md
```

Attachments follow the same structure:

```
Input:
attach/E38397E383ADE382B8E382A7E382AFE383882FE382BFE382B9E382AF_696D6167652E706E67

Output:
output/プロジェクト/タスク_attachment_image.png
```

## Limitations

### Converted to HTML Comments

Many PukiWiki plugins are automatically converted to HTML comments because they cannot be represented in static Markdown. See the [Unsupported Plugins](#unsupported-plugins) section for the complete list of 46 plugins that are converted.

### Excluded Pages

The following system pages are automatically excluded:

- `:config` and `:config/*` - Configuration pages
- `:RenameLog` - Rename history

Note: User-created pages starting with `:` (e.g., `:userpage`) are not excluded and will be converted normally.

### Unsupported Syntax

The following PukiWiki features are not converted and remain as-is:

- Custom plugins (unless specified with `--exclude-plugins`)

## Requirements

- Node.js 18.x or later

## License

MIT

## Author

[onozaty](https://github.com/onozaty)
