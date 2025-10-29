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
| `&br;` | `<br>` |
| `text~` | `text<br>` |
| `&size(20){text};` | `<span style="font-size: 20px">text</span>` |
| `&color(red){text};` | `<span style="color: red">text</span>` |
| `&color(red,yellow){text};` | `<span style="color: red; background-color: yellow">text</span>` |

### Comments

| PukiWiki | Markdown |
|----------|----------|
| `//comment` | `<!-- comment -->` |

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

PukiWiki tables are converted to Markdown or HTML format depending on whether they have a header marker.

**Markdown Tables** (with `|h` header marker):

**Input:**
```
|Header1|Header2|h
|Data1|Data2|
```

**Output:**
```
| Header1 | Header2 |
| --- | --- |
| Data1 | Data2 |
```

**HTML Tables** (without `|h` header marker):

**Input:**
```
|~Date|2025-01-01|
|~Location|Online|
```

**Output:**
```html
<table>
<tr><td><strong>Date</strong></td><td>2025-01-01</td></tr>
<tr><td><strong>Location</strong></td><td>Online</td></tr>
</table>
```

**Table Cell Formatting:**

Cells can be formatted with the following prefixes:

| PukiWiki | Description | Output |
|----------|-------------|--------|
| `BOLD:text` | Bold text | `**text**` or `<strong>text</strong>` |
| `SIZE(20):text` | Font size (px) | `<span style="font-size: 20px">text</span>` |
| `COLOR(red):text` | Text color | `<span style="color: red">text</span>` |
| `BGCOLOR(yellow):text` | Background color | `<span style="background-color: yellow">text</span>` |

**Example:**
```
Input:  |BOLD:Name|SIZE(20):Large|COLOR(red):Red|h
Output: | **Name** | <span style="font-size: 20px">Large</span> | <span style="color: red">Red</span> |
        | --- | --- | --- |
```

Multiple formatting options can be combined:
```
Input:  |BOLD:SIZE(20):COLOR(red):All|Normal|h
Output: | <span style="font-size: 20px; color: red">**All**</span> | Normal |
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

### Removed System Directives

The following PukiWiki system directives are automatically removed during conversion:

- `#author` - Page metadata (author and timestamp)
- `#freeze` - Page freeze setting
- `#norelated` - Suppress related pages
- `#nofollow` - Search engine hint
- `#norightbar` - Hide right sidebar

### Excluded Pages

Pages starting with `:` are automatically excluded:

- `:config/*` - Configuration pages
- `:RenameLog` - Rename history
- Other system pages

### Unsupported Syntax

The following PukiWiki features are not converted and remain as-is:

- Plugin syntax (e.g., `#contents`, `#ls`, `#include`)

## Requirements

- Node.js 18.x or later

## License

MIT

## Author

[onozaty](https://github.com/onozaty)
