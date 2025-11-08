# pukiwiki-to-md

[![test](https://github.com/onozaty/pukiwiki-to-md/actions/workflows/test.yaml/badge.svg)](https://github.com/onozaty/pukiwiki-to-md/actions/workflows/test.yaml)
[![codecov](https://codecov.io/gh/onozaty/pukiwiki-to-md/graph/badge.svg?token=19VZNQCMUN)](https://codecov.io/gh/onozaty/pukiwiki-to-md)
[![npm version](https://badge.fury.io/js/@onozaty%2Fpukiwiki-to-md.svg)](https://www.npmjs.com/package/@onozaty/pukiwiki-to-md)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English README](README.md)

PukiWiki のページと添付ファイルを Markdown 形式に変換するコマンドラインツールです。

## 特長

- 📝 **PukiWiki 記法の変換** - PukiWiki のマークアップを Markdown に変換します
- 📁 **ディレクトリ構造の保持** - 階層化されたページ構造を維持します
- 📎 **添付ファイルの処理** - 添付ファイルを自動的に処理します
- 🌍 **エンコーディング対応** - UTF-8 と EUC-JP に対応しています
- 🗑️ **システムページの自動除外** - `:config` や `:RenameLog` などを除外します
- 🧹 **未対応ブロックプラグインのコメント化** - システムディレクティブを含む未対応ブロックプラグインを HTML コメントに変換します（`--strip-comments` で完全削除も可能）

## インストール

### npx を使用（推奨）

インストール不要で、npx から直接実行できます。

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output
```

### グローバルインストール

繰り返し使用する場合はグローバルインストールが便利です。

```bash
npm install -g @onozaty/pukiwiki-to-md
pukiwiki-to-md -w ./wiki -a ./attach -o ./output
```

## 使い方

### 基本的なコマンド

```bash
npx @onozaty/pukiwiki-to-md -w <wiki-folder> -a <attach-folder> -o <output-folder>
```

### オプション

| オプション | エイリアス | デフォルト | 説明 |
|------------|------------|------------|------|
| `--wiki <path>` | `-w` | (必須) | PukiWiki の wiki フォルダへのパス |
| `--attach <path>` | `-a` | (必須) | PukiWiki の attach フォルダへのパス |
| `--output <path>` | `-o` | (必須) | 出力ディレクトリのパス |
| `--encoding <encoding>` | `-e` | `utf-8` | 入力ファイルの文字コード（utf-8 または euc-jp） |
| `--exclude-plugins <list>` | `-x` | (空) | 除外するカスタムブロックプラグインをカンマ区切りで指定 |
| `--strip-comments` | `-s` | `false` | 出力からすべての HTML コメントを削除 |
| `--help` | `-h` | | ヘルプを表示 |
| `--version` | `-v` | | バージョン番号を表示 |

### 例

**UTF-8 でエンコードされた PukiWiki を変換:**

```bash
npx @onozaty/pukiwiki-to-md -w ./pukiwiki/wiki -a ./pukiwiki/attach -o ./output
```

**EUC-JP でエンコードされた PukiWiki を変換:**

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output -e euc-jp
```

**カスタムプラグインを除外:**

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output -x "myplugin,customplugin"
```

**出力から HTML コメントを削除:**

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output -s
```

## 変換機能

**注意:** プラグイン名（`#` や `&` で始まるもの）は PukiWiki と同様に大文字小文字を区別しません。たとえば `#ref`、`#REF`、`#Ref` は同じプラグインとして認識されます。パラメーター（ファイル名やテキストなど）は元の大文字小文字が保持されます。

### 見出し

PukiWiki の見出しを Markdown に変換し、自動生成されるアンカー ID を削除します。

| PukiWiki | Markdown |
|----------|----------|
| `*Heading` | `# Heading` |
| `**Heading [#abc123]` | `## Heading` |
| `***Heading` | `### Heading` |

### リスト

**箇条書きリスト:**

| PukiWiki | Markdown |
|----------|----------|
| `-Item` | `- Item` |
| `--Item` | `    - Item` |
| `---Item` | `        - Item` |

**番号付きリスト:**

| PukiWiki | Markdown |
|----------|----------|
| `+Item` | `1. Item` |
| `++Item` | `    1. Item` |
| `+++Item` | `        1. Item` |

### テキスト装飾

| PukiWiki | Markdown |
|----------|----------|
| `''bold''` | `**bold**` |
| `'''italic'''` | `*italic*` |
| `%%strikethrough%%` | `~~strikethrough~~` |
| `%%%underline%%%` | `<u>underline</u>` |
| `&br;` または `&br();` | `<br>` |
| `text~` | `text<br>` |
| `&size(20){text};` | `<span style="font-size: 20px">text</span>` |
| `&color(red){text};` | `<span style="color: red">text</span>` |
| `&color(red,yellow){text};` | `<span style="color: red; background-color: yellow">text</span>` |
| `&color(red,text);` | `<span style="color: red">text</span>`（旧形式） |
| `COLOR(red):text` | `<span style="color: red">text</span>` |

**備考:**
- `&color` プラグインは新しい形式（波括弧付き）と古い形式（カンマ区切り）の両方をサポートします。旧形式では背景色を指定できません。
- `COLOR(color):` 形式は、次の `COLOR(color):` 指定または行末まで色を適用します。`COLOR(red):textCOLOR(blue):text` のように連続して使用できます。
- **ネストされたプラグイン構文:** `&size` と `&color` は順序に関係なく入れ子にできます。`&br;` や太字・斜体などのインライン要素も入れ子にできます。

**ネストされたプラグインの例:**

| PukiWiki | Markdown |
|----------|----------|
| `&color(red){&size(20){text};};` | `<span style="color: red"><span style="font-size: 20px">text</span></span>` |
| `&size(20){&color(red){text};};` | `<span style="font-size: 20px"><span style="color: red">text</span></span>` |
| `&color(red){&size(20){text1&br;text2};};` | `<span style="color: red"><span style="font-size: 20px">text1<br>text2</span></span>` |
| `&size(20){&color(blue){''bold''};};` | `<span style="font-size: 20px"><span style="color: blue">**bold**</span></span>` |

### コメント

| PukiWiki | Markdown |
|----------|----------|
| `//comment` | `<!-- comment -->` |

### テキストの配置

| PukiWiki | Markdown |
|----------|----------|
| `LEFT:text` | `text`（プレフィックスを削除） |
| `CENTER:text` | `text`（プレフィックスを削除） |
| `RIGHT:text` | `text`（プレフィックスを削除） |

Markdown にはテキストの配置を標準的に表現する方法がないため、配置情報は保持されません。HTML の div タグを使用すると、内部の Markdown が解釈されなくなるため使用しません。

### エスケープ

| PukiWiki | Markdown |
|----------|----------|
| `~*text` | `\*text` |
| `~-text` | `\-text` |

Markdown の特殊文字（`*`、`-`、`+`、`>`、`#`、`|`）を行頭でエスケープします。Markdown の特殊文字でない場合は単に `~` を削除します。

### リンク

内部リンクは相対パスに変換され、最小限の URL エンコードが行われます。Unicode 文字（日本語など）は可読性のため保持し、問題となる文字（スペース、括弧など）のみエンコードします。

| PukiWiki | Markdown |
|----------|----------|
| `[[Page]]` | `[Page](Page.md)` |
| `[[Label>Page]]` | `[Label](Page.md)` |
| `[[テストページ]]` | `[テストページ](テストページ.md)` |
| `[[File (1)]]` | `[File (1)](File%20%281%29.md)` |
| `[[https://example.com]]` | `[https://example.com](https://example.com)` |
| `[[Label:https://example.com]]` | `[Label](https://example.com)` |

**相対パスの解決:**

リンクは現在のページの場所に基づいて相対パスに変換されます。

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

### テーブル

すべての PukiWiki テーブルは Markdown テーブル形式に変換されます。`|h` ヘッダーマーカーがない場合は自動的に空のヘッダー行が追加されます。

**ヘッダーマーカーあり（`|h`）:**

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

**ヘッダーマーカーなし（空のヘッダー行が自動追加）:**

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

**テーブルセル内の PukiWiki 記法:**

PukiWiki のリンクや装飾などはテーブルセル内でも正しく変換されます。

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

**テーブルセルの装飾:**

以下のプレフィックスをサポートします。

| PukiWiki | 説明 | Output |
|----------|------|--------|
| `LEFT:text` | 左寄せセル | `text`（列の左揃えを適用） |
| `CENTER:text` | 中央寄せセル | `text`（列の中央揃えを適用） |
| `RIGHT:text` | 右寄せセル | `text`（列の右揃えを適用） |
| `BOLD:text` | 太字 | `**text**` |
| `SIZE(20):text` | フォントサイズ（px） | `<span style="font-size: 20px">text</span>` |
| `COLOR(red):text` | 文字色 | `<span style="color: red">text</span>` |
| `BGCOLOR(yellow):text` | 背景色（コメントとして保持） | `text <!-- BGCOLOR(yellow) -->` |
| `~text` | 太字（ヘッダーセル） | `**text**` |

**備考:** `BGCOLOR` は Markdown テーブルで背景色を表現できないため HTML コメントとして保持します。HTML テーブルに変換するとセル内の Markdown 構文（リンクや太字）が使用できなくなるため、Markdown テーブルを使用しています。

**例:**
```
Input:  |BOLD:Name|SIZE(20):Large|COLOR(red):Red|h
Output: | **Name** | <span style="font-size: 20px">Large</span> | <span style="color: red">Red</span> |
	| --- | --- | --- |
```

複数の装飾を組み合わせることも可能です。
```
Input:  |BOLD:SIZE(20):COLOR(red):BGCOLOR(yellow):All|Normal|h
Output: | <span style="font-size: 20px; color: red">**All**</span> <!-- BGCOLOR(yellow) --> | Normal |
	| --- | --- |
```

**テーブルセル内のブロックプラグイン:**

テーブルセル内で `#ref` ブロックプラグインを使用して画像やファイルを埋め込めます。

```
Input:  |#ref(image.png)|#ref(document.pdf,説明)|
Output: |   |   |
	| --- | --- |
	| ![image.png](PageName_attachment_image.png) | [説明](PageName_attachment_document.pdf) |
```

セル先頭で `#ref` を使用するとブロックプラグインとして処理され、閉じ括弧以降のテキストは無視されます。`#ref` のすべてのパラメーターに対応します。

### 引用

| PukiWiki | Markdown |
|----------|----------|
| `>quote` | `> quote` |
| `>>nested quote` | `> > nested quote` |

### 水平線

| PukiWiki | Markdown |
|----------|----------|
| `----` | `---` |
| `#hr` または `#hr()` | `---` |

### 改行

| PukiWiki | Markdown |
|----------|----------|
| `#br` または `#br()` | `<br>` |

### 整形済みテキスト

行頭がスペースまたはタブで始まる行はフェンス付きコードブロックに変換されます。

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

### #vote プラグイン

`#vote` プラグインは HTML コメントと集計表に変換されます。選択肢ラベルにはインライン装飾を適用できます。

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

**インライン装飾あり:**
```
Input:  #vote(''Bold''[5],[[Link]][10])
Output: <!-- #vote(''Bold''[5],[[Link]][10]) -->
	| 選択肢 | 投票数 |
	| --- | ---: |
	| **Bold** | 5 |
	| [Link](Link.md) | 10 |
```

投票機能自体は失われますが、投票結果は静的な表として保持されます。

### #include プラグイン

`#include` プラグインは HTML コメントと対象ページへのリンクに変換され、元の構文を保持したままナビゲーションを提供します。

**Input:**
```
#include(CommonHeader)
```

**Output:**
```markdown
<!-- #include(CommonHeader) -->
[CommonHeader](CommonHeader.md)
```

**パラメーターあり:**
```
Input:  #include(PageName,notitle)
Output: <!-- #include(PageName,notitle) -->
	[PageName](PageName.md)
```

**階層ページ:**
```
Current page: Project/Task
Input:  #include(Project/Common)
Output: <!-- #include(Project/Common) -->
	[Project/Common](Common.md)
```

include 機能自体は失われますが、リンクを通じて対象ページに移動できます。

### 未サポートのプラグイン

Markdown で表現できない以下のブロックプラグインは HTML コメントに変換されます（全 46 プラグイン）。`#vote` と `#include` は専用セクションのとおり特別な変換を行います。

**システムディレクティブ:**
- `#author(...)` - ページメタデータ（作者とタイムスタンプ）
- `#freeze` - ページ凍結設定
- `#nofollow` - 検索エンジン向けヒント
- `#norelated` - 関連ページの非表示

**コンテンツの取り込み/表示:**
- `#amazon` - Amazon 商品情報
- `#aname` - アンカー定義
- `#includesubmenu` - サブメニューの取り込み

**動的機能・フォーム:**
- `#article` - 記事/BBS フォーム
- `#attach` - ファイルアップロードフォーム
- `#comment` - コメントフォーム
- `#contents` - 目次
- `#counter` - アクセスカウンター
- `#insert` - 挿入フォーム
- `#lookup` - 辞書検索
- `#navi` - ナビゲーション
- `#newpage` - 新規ページ作成フォーム
- `#pcomment` - ページコメントフォーム

**リスト・ナビゲーション:**
- `#back` - 戻るリンク
- `#ls` - 子ページ一覧
- `#ls2` - 子ページ一覧（拡張）
- `#menu` - メニュー表示
- `#online` - オンラインユーザー表示
- `#popular` - 人気ページランキング
- `#recent` - 最近の更新
- `#related` - 関連ページ
- `#search` - 検索フォーム
- `#topicpath` - パンくずリスト

**トラッカー・課題管理:**
- `#bugtrack` - バグトラッカー入力フォーム
- `#bugtrack_list` - バグトラッカー一覧表示
- `#tracker` - トラッカー入力フォーム
- `#tracker_list` - トラッカー一覧表示

**カレンダー:**
- `#calendar` - カレンダー表示
- `#calendar2` - 代替カレンダー
- `#calendar_edit` - カレンダー編集フォーム
- `#calendar_read` - カレンダー閲覧
- `#calendar_viewer` - カレンダービューア

**ユーティリティなど:**
- `#clear` - フロート解除（レイアウト）
- `#memo` - メモ
- `#paint` - お絵かきツール
- `#random` - ランダム表示
- `#server` - サーバー情報
- `#setlinebreak` - 改行設定
- `#showrss` - RSS フィード表示
- `#stationary` - テンプレート
- `#version` - バージョン表示
- `#versionlist` - バージョン一覧

これらは `<!-- #plugin -->` のような HTML コメントに変換され、パラメーターも保持されます。

```
Input:  #contents(depth=2)
Output: <!-- #contents(depth=2) -->
```

**括弧閉じ後のテキスト:**

PukiWiki の挙動と同じく、括弧がある場合は閉じ括弧以降のテキストは無視され、行全体が HTML コメントになります。括弧がない場合、プラグイン名は単独で行に存在する必要があります。

```
Input:  #freeze() additional text
Output: <!-- #freeze() additional text -->

Input:  #contents(depth=2)this is ignored
Output: <!-- #contents(depth=2)this is ignored -->

Input:  #freeze additional text
Output: #freeze additional text
	(not converted, remains as-is)
```

**カスタムプラグインの除外:**

`--exclude-plugins` オプションで追加のカスタムプラグインを除外できます。

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output -x "myplugin,customplugin"
```

指定した `#myplugin` や `#customplugin` もデフォルトのプラグインと同様に HTML コメントに変換されます。

**備考:** 動的機能やレイアウト制御は失われますが、元の構文は HTML コメントとして保持されます。

### HTML コメントの削除

デフォルトでは、未サポートのプラグインや PukiWiki コメントは参照用に HTML コメントへ変換されます。`--strip-comments` オプションで出力からすべての HTML コメントを削除できます。

```bash
npx @onozaty/pukiwiki-to-md -w ./wiki -a ./attach -o ./output --strip-comments
```

このオプションで削除されるもの:
- PukiWiki のコメント行（`//comment`）
- 未サポートのブロックプラグイン（`#contents`、`#comment` など）のコメント
- プラグイン固有のコメント（`#vote` や `#include` のコメント行など）
- テーブルセル内の BGCOLOR コメント

変換された実際のコンテンツ（`#vote` の表、`#include` のリンクなど）は保持されます。

## 添付ファイル

### ファイル処理

添付ファイルは自動的に検出され、ファイル名を調整したうえで出力ディレクトリにコピーされます。参照リンクは最小限の URL エンコードを行い、Unicode 文字は可読性のため保持します。

- PukiWiki 形式: `E38386E382B9E38388_696D6167652E706E67`
- 変換後の形式: `テスト_attachment_image.png`
- Markdown での表示: `![image.png](テスト_attachment_image.png)`

**添付ファイル参照:**

`#ref` と `&ref` プラグインは以下をサポートします。

- **デフォルトの alt テキスト**: 指定がない場合はファイル名を alt テキストとして使用
- **CSV 形式のパラメーター**: カンマを含むファイル名は `"file, name.png"` のように引用符で囲めます
- **他ページの添付ファイル**: `PageName/file.png` や `../file.png` などで参照可能
- **最小限の URL エンコード**: Markdown リンクで問題となる文字（`%`, space, `()`, `[]`, `:`, `"`, `,`）のみエンコード

例:

```
Input:  #ref(image.png)
Output: ![image.png](PageName_attachment_image.png)

Input:  #ref("file, name.png",300x200)
Output: <img src="PageName_attachment_file%2C%20name.png" alt="file, name.png" width="300" height="200">

Input:  #ref(OtherPage/diagram.png)
Output: ![diagram.png](../OtherPage/OtherPage_attachment_diagram.png)
```

### ディレクトリ構造

階層化されたページ構造はそのまま維持されます。

```
Input:
wiki/E38397E383ADE382B8E382A7E382AFE383882FE382BFE382B9E382AF.txt

Output:
output/プロジェクト/タスク.md
```

添付ファイルも同じ構造で配置されます。

```
Input:
attach/E38397E383ADE382B8E382A7E382AFE383882FE382BFE382B9E382AF_696D6167652E706E67

Output:
output/プロジェクト/タスク_attachment_image.png
```

## 制限事項

### HTML コメントへの変換

多くの PukiWiki プラグインは静的 Markdown で表現できないため HTML コメントに変換されます。詳細は [未サポートのプラグイン](#未サポートのプラグイン) を参照してください。

### 除外されるページ

以下のシステムページは自動的に除外されます。

- `:config` および `:config/*` - 設定ページ
- `:RenameLog` - 名前変更履歴

`:` で始まるユーザー作成ページ（例: `:userpage`）は除外されず通常どおり変換されます。

### 未対応の構文

以下の PukiWiki 機能は変換されず、そのまま残ります。

- カスタムプラグイン（`--exclude-plugins` で指定したものを除く）

## 必要条件

- Node.js 18.x 以上

## ライセンス

MIT

## 作者

[onozaty](https://github.com/onozaty)
