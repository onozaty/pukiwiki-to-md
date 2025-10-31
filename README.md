# pukiwiki-to-md

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
- 🧹 **Remove System Directives** - Strips `#author`, `#freeze`, and similar directives

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
| `--help` | `-h` | | Display help information |
| `--version` | `-v` | | Display version number |

### Examples

**Convert UTF-8 encoded PukiWiki:**

```bash
npx @onozaty/pukiwiki-to-md -w ./pukiwiki/wiki -a ./pukiwiki/attach -o ./output
```

**Convert EUC-JP encoded PukiWiki:**

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output -e euc-jp
```

**Exclude custom plugins:**

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output -x "myplugin,customplugin"
```

## Conversion Features

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
| `&br;` | `<br>` |
| `text~` | `text<br>` |
| `&size(20){text};` | `<span style="font-size: 20px">text</span>` |
| `&color(red){text};` | `<span style="color: red">text</span>` |
| `&color(red,yellow){text};` | `<span style="color: red; background-color: yellow">text</span>` |

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

| PukiWiki | Markdown |
|----------|----------|
| `[[Page]]` | `[Page](Page.md)` |
| `[[Label>Page]]` | `[Label](Page.md)` |
| `[[https://example.com]]` | `[https://example.com](https://example.com)` |
| `[[Label:https://example.com]]` | `[Label](https://example.com)` |

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

### Quotes

| PukiWiki | Markdown |
|----------|----------|
| `>quote` | `> quote` |
| `>>nested quote` | `> > nested quote` |

### Horizontal Rules

| PukiWiki | Markdown |
|----------|----------|
| `----` | `---` |
| `#hr` | `---` |

### Line Breaks

| PukiWiki | Markdown |
|----------|----------|
| `#br` | `<br>` |

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

The `#vote` plugin is converted to an HTML comment plus a table showing vote results:

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

Note: The voting functionality is lost, and the vote data is preserved as a static snapshot.

### Unsupported Plugins

The following block plugins cannot be represented in Markdown and are converted to HTML comments (46 plugins total):

**System directives:**
- `#author(...)` - Page metadata (author and timestamp)
- `#freeze` - Page freeze setting
- `#nofollow` - Search engine hint
- `#norelated` - Suppress related pages display

**Content inclusion & display:**
- `#amazon` - Amazon product information
- `#aname` - Anchor definition
- `#include` - Include another page
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
- `#ls` - Child page list
- `#ls2` - Child page list (enhanced)
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

**Custom Plugin Exclusion:**

You can specify additional custom plugins to exclude using the `--exclude-plugins` option:

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output -x "myplugin,customplugin"
```

This will convert `#myplugin` and `#customplugin` to HTML comments in addition to the default plugins listed above.

**Note:** Dynamic functionality and layout features are lost, but the original syntax is preserved for reference in HTML comments.

## Attachments

### File Processing

Attachments are automatically detected and copied to the output directory with sanitized filenames:

- PukiWiki format: `E38386E382B9E38388_696D6167652E706E67`
- Converted format: `テスト_attachment_image.png`

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
