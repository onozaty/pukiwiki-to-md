import { describe, expect, it } from "vitest";
import { convertToMarkdown } from "./converter";

describe("convertToMarkdown", () => {
  describe("heading conversion", () => {
    it("should convert level 1 heading", () => {
      const input = "*はじめに";
      const expected = "# はじめに";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert level 2 heading", () => {
      const input = "**セクション";
      const expected = "## セクション";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert level 3 heading", () => {
      const input = "***サブセクション";
      const expected = "### サブセクション";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert heading with space after asterisk", () => {
      const input = "* はじめに";
      const expected = "# はじめに";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should not convert asterisks in the middle of line", () => {
      const input = "This is * not a heading";
      expect(convertToMarkdown(input, "テストページ")).toBe(input);
    });

    it("should handle asterisks without content", () => {
      const input = "*";
      const expected = "# ";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple headings", () => {
      const input = "*タイトル\n\nコンテンツ\n\n**サブタイトル";
      const expected = "# タイトル\n\nコンテンツ\n\n## サブタイトル";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });
  });

  describe("horizontal rule conversion", () => {
    it("should convert 4 hyphens horizontal rule", () => {
      const input = "----";
      const expected = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert 5 or more hyphens", () => {
      const input = "-----";
      const expected = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle horizontal rule with spaces", () => {
      const input = "   ----   ";
      const expected = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert #hr plugin to horizontal rule", () => {
      const input = "#hr";
      const expected = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert #hr with spaces", () => {
      const input = "  #hr  ";
      const expected = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should not convert dashes in text", () => {
      const input = "This is a --- test";
      expect(convertToMarkdown(input, "テストページ")).toBe(input);
    });

    it("should not convert three dashes (it becomes level 3 list)", () => {
      const input = "---";
      const expected = "        - ";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });
  });

  describe("list conversion", () => {
    describe("unordered list", () => {
      it("should convert level 1 unordered list", () => {
        const input = "-項目1";
        const expected = "- 項目1";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert level 2 unordered list", () => {
        const input = "--項目1-1";
        const expected = "    - 項目1-1";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert level 3 unordered list", () => {
        const input = "---項目1-1-1";
        const expected = "        - 項目1-1-1";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert multiple unordered list items", () => {
        const input = "-項目1\n--項目1-1\n---項目1-1-1\n-項目2";
        const expected = "- 項目1\n    - 項目1-1\n        - 項目1-1-1\n- 項目2";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert when dash has space after it", () => {
        const input = "- スペースがある場合も変換する";
        const expected = "- スペースがある場合も変換する";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should handle dash without content", () => {
        const input = "-";
        const expected = "- ";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });
    });

    describe("ordered list", () => {
      it("should convert level 1 ordered list", () => {
        const input = "+番号1";
        const expected = "1. 番号1";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert level 2 ordered list", () => {
        const input = "++番号1-1";
        const expected = "    1. 番号1-1";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert level 3 ordered list", () => {
        const input = "+++番号1-1-1";
        const expected = "        1. 番号1-1-1";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert multiple ordered list items", () => {
        const input = "+項目1\n++項目1-1\n+++項目1-1-1\n+項目2";
        const expected =
          "1. 項目1\n    1. 項目1-1\n        1. 項目1-1-1\n1. 項目2";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert when plus has space after it", () => {
        const input = "+ スペースがある場合も変換する";
        const expected = "1. スペースがある場合も変換する";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should handle plus without content", () => {
        const input = "+";
        const expected = "1. ";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });
    });

    describe("mixed lists", () => {
      it("should handle unordered and ordered lists together", () => {
        const input = "-箇条書き\n+番号付き\n--ネスト";
        const expected = "- 箇条書き\n1. 番号付き\n    - ネスト";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });
    });
  });

  describe("quote conversion", () => {
    it("should convert level 1 quote", () => {
      const input = ">引用文";
      const expected = "> 引用文";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert level 2 quote", () => {
      const input = ">>ネスト引用";
      const expected = "> > ネスト引用";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert level 3 quote", () => {
      const input = ">>>深いネスト";
      const expected = "> > > 深いネスト";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple quotes", () => {
      const input = ">引用1\n>>引用2\n>引用3";
      const expected = "> 引用1\n> > 引用2\n> 引用3";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });
  });

  describe("mixed conversions", () => {
    it("should handle multiple syntax types in one content", () => {
      const input = "*見出し\n\n普通のテキスト\n\n>引用\n\n----";
      const expected = "# 見出し\n\n普通のテキスト\n\n> 引用\n\n---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should correctly handle valid syntax mix", () => {
      const input = "* Space heading\n*NoSpace heading\n>Quote\nNormal text";
      const expected =
        "# Space heading\n# NoSpace heading\n> Quote\nNormal text";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should preserve empty lines", () => {
      const input = "*Heading\n\n\n>Quote";
      const expected = "# Heading\n\n\n> Quote";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });
  });

  describe("inline text formatting", () => {
    it("should convert bold text", () => {
      const input = "これは''太字''です";
      const expected = "これは**太字**です";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert italic text", () => {
      const input = "これは'''イタリック'''です";
      const expected = "これは*イタリック*です";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert strikethrough text", () => {
      const input = "これは%%取り消し%%です";
      const expected = "これは~~取り消し~~です";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert line break", () => {
      const input = "1行目&br;2行目";
      const expected = "1行目<br>2行目";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple formatting in one line", () => {
      const input = "''太字''と'''イタリック'''と%%取り消し%%";
      const expected = "**太字**と*イタリック*と~~取り消し~~";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple line breaks", () => {
      const input = "1行目&br;2行目&br;3行目";
      const expected = "1行目<br>2行目<br>3行目";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle inline formatting in headings", () => {
      const input = "*''太字の見出し''";
      const expected = "# **太字の見出し**";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle inline formatting in lists", () => {
      const input = "-''太字''の項目";
      const expected = "- **太字**の項目";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle inline formatting in quotes", () => {
      const input = ">''太字''の引用";
      const expected = "> **太字**の引用";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });
  });

  describe("link conversion", () => {
    describe("internal links", () => {
      it("should convert simple internal link (same directory)", () => {
        const input = "[[ページB]]";
        const expected = "[ページB](ページB.md)";
        expect(convertToMarkdown(input, "ページA")).toBe(expected);
      });

      it("should convert internal link from root to hierarchy", () => {
        const input = "[[プロジェクト/タスク]]";
        const expected = "[プロジェクト/タスク](プロジェクト/タスク.md)";
        expect(convertToMarkdown(input, "トップページ")).toBe(expected);
      });

      it("should convert internal link from hierarchy to root", () => {
        const input = "[[トップページ]]";
        const expected = "[トップページ](../トップページ.md)";
        expect(convertToMarkdown(input, "プロジェクト/タスク")).toBe(expected);
      });

      it("should convert internal link in same directory (sibling pages)", () => {
        const input = "[[プロジェクト/概要]]";
        const expected = "[プロジェクト/概要](概要.md)";
        expect(convertToMarkdown(input, "プロジェクト/タスク")).toBe(expected);
      });

      it("should convert internal link between different hierarchies (sibling directories)", () => {
        const input = "[[プロジェクトB/概要]]";
        const expected = "[プロジェクトB/概要](../プロジェクトB/概要.md)";
        expect(convertToMarkdown(input, "プロジェクトA/タスク")).toBe(expected);
      });

      it("should convert internal link with custom text", () => {
        const input = "[[リンクテキスト>ページB]]";
        const expected = "[リンクテキスト](ページB.md)";
        expect(convertToMarkdown(input, "ページA")).toBe(expected);
      });

      it("should convert internal link with custom text across hierarchy", () => {
        const input = "[[概要へ>プロジェクト/概要]]";
        const expected = "[概要へ](概要.md)";
        expect(convertToMarkdown(input, "プロジェクト/タスク")).toBe(expected);
      });

      it("should convert multiple internal links", () => {
        const input = "[[ページA]]と[[ページB]]を参照";
        const expected = "[ページA](ページA.md)と[ページB](ページB.md)を参照";
        expect(convertToMarkdown(input, "トップページ")).toBe(expected);
      });
    });

    describe("external links", () => {
      it("should convert external link with HTTP", () => {
        const input = "[[Example:http://example.com]]";
        const expected = "[Example](http://example.com)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert external link with HTTPS", () => {
        const input = "[[公式サイト:https://example.com]]";
        const expected = "[公式サイト](https://example.com)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert external link with path", () => {
        const input = "[[ドキュメント:https://example.com/docs/index.html]]";
        const expected = "[ドキュメント](https://example.com/docs/index.html)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });
    });

    describe("mixed links", () => {
      it("should handle internal and external links together", () => {
        const input = "[[内部ページ]]と[[外部:https://example.com]]";
        const expected =
          "[内部ページ](内部ページ.md)と[外部](https://example.com)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should handle links with other inline formatting", () => {
        const input = "''太字''の[[リンク]]";
        const expected = "**太字**の[リンク](リンク.md)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });
    });
  });

  describe("attachment conversion", () => {
    describe("image references (#ref)", () => {
      it("should convert image reference without alt text", () => {
        const input = "#ref(screenshot.png)";
        const expected = "![](テストページ_attachment_screenshot.png)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert image reference with alt text", () => {
        const input = "#ref(diagram.png,システム図)";
        const expected = "![システム図](テストページ_attachment_diagram.png)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should handle hierarchical page name", () => {
        const input = "#ref(screenshot.png)";
        const expected = "![](タスク_attachment_screenshot.png)";
        expect(convertToMarkdown(input, "プロジェクト/タスク")).toBe(expected);
      });

      it("should handle hierarchical page name with alt text", () => {
        const input = "#ref(diagram.png,図表)";
        const expected = "![図表](概要_attachment_diagram.png)";
        expect(convertToMarkdown(input, "プロジェクト/概要")).toBe(expected);
      });

      it("should convert multiple image references", () => {
        const input = "#ref(image1.png)と#ref(image2.png,画像2)";
        const expected =
          "![](テスト_attachment_image1.png)と![画像2](テスト_attachment_image2.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert non-image file with #ref as link", () => {
        const input = "#ref(document.pdf)";
        const expected = "[document.pdf](テスト_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert non-image file with #ref and alt text as link", () => {
        const input = "#ref(spec.xlsx,仕様書)";
        const expected = "[仕様書](テスト_attachment_spec.xlsx)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("file link references (&ref)", () => {
      it("should convert file link reference", () => {
        const input = "&ref(document.pdf);";
        const expected = "[document.pdf](テストページ_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should handle hierarchical page name", () => {
        const input = "&ref(spec.pdf);";
        const expected = "[spec.pdf](タスク_attachment_spec.pdf)";
        expect(convertToMarkdown(input, "プロジェクト/タスク")).toBe(expected);
      });

      it("should convert multiple file references", () => {
        const input = "&ref(doc1.pdf);と&ref(doc2.xlsx);";
        const expected =
          "[doc1.pdf](テスト_attachment_doc1.pdf)と[doc2.xlsx](テスト_attachment_doc2.xlsx)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert image file with &ref as image", () => {
        const input = "&ref(icon.png);";
        const expected = "![](テスト_attachment_icon.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should support parameters with &ref for images", () => {
        const input = "&ref(icon.png,アイコン);";
        const expected = "![アイコン](テスト_attachment_icon.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should support parameters with &ref for files", () => {
        const input = "&ref(document.pdf,資料);";
        const expected = "[資料](テスト_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert to HTML img tag with size for &ref", () => {
        const input = "&ref(image.png,300x200,説明);";
        const expected =
          '<img src="テスト_attachment_image.png" alt="説明" width="300" height="200">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle complex parameters with &ref", () => {
        const input = "&ref(image.png,left,50%,図表);";
        const expected =
          '<img src="テスト_attachment_image.png" alt="図表" style="width: 50%">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should filter keywords with &ref", () => {
        const input = "&ref(image.png,center,nolink,テスト画像);";
        const expected = "![テスト画像](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("#ref with complex parameters", () => {
      it("should convert to HTML img tag with width and height (300x200)", () => {
        const input = "#ref(image.png,300x200,説明文)";
        const expected =
          '<img src="テスト_attachment_image.png" alt="説明文" width="300" height="200">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert to HTML img tag with percentage size (50%)", () => {
        const input = "#ref(image.png,50%,図表)";
        const expected =
          '<img src="テスト_attachment_image.png" alt="図表" style="width: 50%">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert to HTML img tag with width only (300x)", () => {
        const input = "#ref(image.png,300x,サンプル)";
        const expected =
          '<img src="テスト_attachment_image.png" alt="サンプル" width="300">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert to HTML img tag with height only (x200)", () => {
        const input = "#ref(image.png,x200,画像)";
        const expected =
          '<img src="テスト_attachment_image.png" alt="画像" height="200">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert to HTML img tag with width in pixels (300w)", () => {
        const input = "#ref(image.png,300w,テスト画像)";
        const expected =
          '<img src="テスト_attachment_image.png" alt="テスト画像" width="300">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert to HTML img tag with height in pixels (200h)", () => {
        const input = "#ref(image.png,200h,スクリーンショット)";
        const expected =
          '<img src="テスト_attachment_image.png" alt="スクリーンショット" height="200">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should filter out keyword 'left'", () => {
        const input = "#ref(image.png,left,左寄せ画像)";
        const expected = "![左寄せ画像](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should filter out keyword 'center'", () => {
        const input = "#ref(image.png,center,中央画像)";
        const expected = "![中央画像](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should filter out keyword 'right'", () => {
        const input = "#ref(image.png,right,右寄せ)";
        const expected = "![右寄せ](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should filter out multiple keywords (wrap, nolink)", () => {
        const input = "#ref(image.png,wrap,nolink,回り込み画像)";
        const expected = "![回り込み画像](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should filter out keyword 'noicon'", () => {
        const input = "#ref(document.pdf,noicon,資料)";
        const expected = "[資料](テスト_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should filter out keyword 'zoom'", () => {
        const input = "#ref(image.png,zoom,拡大可能)";
        const expected = "![拡大可能](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle multiple text parameters with size", () => {
        const input = "#ref(image.png,300x200,システム,構成図)";
        const expected =
          '<img src="テスト_attachment_image.png" alt="システム,構成図" width="300" height="200">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle mixed keywords, sizes, and text", () => {
        const input = "#ref(image.png,left,50%,図1,概要)";
        const expected =
          '<img src="テスト_attachment_image.png" alt="図1,概要" style="width: 50%">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle all parameters being filtered out (no alt text, with size)", () => {
        const input = "#ref(image.png,300x200,left,center)";
        const expected =
          '<img src="テスト_attachment_image.png" width="300" height="200">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle decimal percentage (50.5%)", () => {
        const input = "#ref(image.png,50.5%,テスト)";
        const expected =
          '<img src="テスト_attachment_image.png" alt="テスト" style="width: 50.5%">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle non-image files with complex parameters", () => {
        const input = "#ref(document.pdf,noicon,left,仕様書,最新版)";
        const expected = "[仕様書,最新版](テスト_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should preserve text parameters with spaces", () => {
        const input = "#ref(image.png,300x,図 1)";
        const expected =
          '<img src="テスト_attachment_image.png" alt="図 1" width="300">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should use Markdown format when no size specification", () => {
        const input = "#ref(image.png,left,図表)";
        const expected = "![図表](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle size without alt text", () => {
        const input = "#ref(image.png,300x200)";
        const expected =
          '<img src="テスト_attachment_image.png" width="300" height="200">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("mixed attachments", () => {
      it("should handle images and file links together", () => {
        const input = "#ref(image.png)と&ref(document.pdf);";
        const expected =
          "![](テスト_attachment_image.png)と[document.pdf](テスト_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle attachments with other inline formatting", () => {
        const input = "''太字''の#ref(image.png)";
        const expected = "**太字**の![](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });
  });

  describe("table conversion", () => {
    describe("basic tables", () => {
      it("should convert simple 2x2 table", () => {
        const input = "|セル1|セル2|\n|セル3|セル4|";
        const expected = "| セル1 | セル2 |\n| セル3 | セル4 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle empty cells", () => {
        const input = "|セル1||\n||セル4|";
        const expected = "| セル1 |  |\n|  | セル4 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle cells with spaces", () => {
        const input = "| セル 1 | セル 2 |";
        const expected = "| セル 1 | セル 2 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("header rows", () => {
      it("should convert table with header row (|h)", () => {
        const input = "|ヘッダ1|ヘッダ2|h\n|データ1|データ2|";
        const expected =
          "| ヘッダ1 | ヘッダ2 |\n| --- | --- |\n| データ1 | データ2 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle multiple rows after header", () => {
        const input = "|名前|年齢|h\n|太郎|25|\n|花子|30|";
        const expected =
          "| 名前 | 年齢 |\n| --- | --- |\n| 太郎 | 25 |\n| 花子 | 30 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("column alignment", () => {
      it("should handle LEFT alignment", () => {
        const input = "|LEFT:左|データ|h\n|値1|値2|";
        const expected = "| 左 | データ |\n| --- | --- |\n| 値1 | 値2 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle CENTER alignment", () => {
        const input = "|CENTER:中央|データ|h\n|値1|値2|";
        const expected = "| 中央 | データ |\n| :---: | --- |\n| 値1 | 値2 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle RIGHT alignment", () => {
        const input = "|RIGHT:右|データ|h\n|値1|値2|";
        const expected = "| 右 | データ |\n| ---: | --- |\n| 値1 | 値2 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle mixed alignments", () => {
        const input = "|LEFT:左|CENTER:中央|RIGHT:右|h\n|A|B|C|";
        const expected =
          "| 左 | 中央 | 右 |\n| --- | :---: | ---: |\n| A | B | C |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should use first occurrence of alignment per column", () => {
        const input =
          "|LEFT:ヘッダ1|CENTER:ヘッダ2|h\n|RIGHT:データ1|LEFT:データ2|";
        const expected =
          "| ヘッダ1 | ヘッダ2 |\n| --- | :---: |\n| データ1 | データ2 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("header cells (~)", () => {
      it("should convert ~ header cell to bold", () => {
        const input = "|~見出し|通常|";
        const expected = "| **見出し** | 通常 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle multiple ~ header cells", () => {
        const input = "|~列1|~列2|~列3|";
        const expected = "| **列1** | **列2** | **列3** |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should combine ~ with |h row", () => {
        const input = "|~名前|~年齢|h\n|太郎|25|";
        const expected =
          "| **名前** | **年齢** |\n| --- | --- |\n| 太郎 | 25 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle ~ with alignment", () => {
        const input = "|CENTER:~見出し|データ|h";
        const expected = "| **見出し** | データ |\n| :---: | --- |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("footer and column width rows", () => {
      it("should skip footer row (|f)", () => {
        const input = "|ヘッダ|h\n|データ|\n|フッター|f";
        const expected = "| ヘッダ |\n| --- |\n| データ |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should skip column width row (|c)", () => {
        const input = "|100|200|c\n|ヘッダ1|ヘッダ2|h\n|データ1|データ2|";
        const expected =
          "| ヘッダ1 | ヘッダ2 |\n| --- | --- |\n| データ1 | データ2 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("multiple tables", () => {
      it("should handle multiple tables separated by text", () => {
        const input = "|表1A|表1B|\n\nテキスト\n\n|表2A|表2B|";
        const expected = "| 表1A | 表1B |\n\nテキスト\n\n| 表2A | 表2B |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle tables with headings between them", () => {
        const input = "|データ1|\n\n*見出し\n\n|データ2|";
        const expected = "| データ1 |\n\n# 見出し\n\n| データ2 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("tables with other syntax", () => {
      it("should handle table after heading", () => {
        const input = "*見出し\n|列1|列2|h\n|データ1|データ2|";
        const expected =
          "# 見出し\n| 列1 | 列2 |\n| --- | --- |\n| データ1 | データ2 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle table before quote", () => {
        const input = "|データ|\n>引用文";
        const expected = "| データ |\n> 引用文";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle table with list after", () => {
        const input = "|データ|\n-リスト項目";
        const expected = "| データ |\n- リスト項目";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("complex tables", () => {
      it("should handle table with all features", () => {
        const input =
          "|CENTER:~名前|RIGHT:年齢|LEFT:備考|h\n|太郎|25|学生|\n|花子|30|教師|";
        const expected =
          "| **名前** | 年齢 | 備考 |\n| :---: | ---: | --- |\n| 太郎 | 25 | 学生 |\n| 花子 | 30 | 教師 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle 3x4 table with header", () => {
        const input = "|列1|列2|列3|h\n|A|B|C|\n|D|E|F|\n|G|H|I|";
        const expected =
          "| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| A | B | C |\n| D | E | F |\n| G | H | I |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      expect(convertToMarkdown("", "テストページ")).toBe("");
    });

    it("should handle single line with no syntax", () => {
      const input = "Just plain text";
      expect(convertToMarkdown(input, "テストページ")).toBe(input);
    });

    it("should handle only newlines", () => {
      const input = "\n\n\n";
      expect(convertToMarkdown(input, "テストページ")).toBe(input);
    });
  });
});
