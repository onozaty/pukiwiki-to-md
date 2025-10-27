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
