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

    it("should remove anchor ID from heading", () => {
      const input = "*はじめに [#abc123]";
      const expected = "# はじめに";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should remove anchor ID from level 2 heading", () => {
      const input = "**セクション [#xyz789ab]";
      const expected = "## セクション";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should remove anchor ID from level 3 heading", () => {
      const input = "***サブセクション [#def456]";
      const expected = "### サブセクション";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should remove anchor ID with spaces around it", () => {
      const input = "* はじめに  [#abc123]  ";
      const expected = "# はじめに";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle heading without anchor ID", () => {
      const input = "*通常の見出し";
      const expected = "# 通常の見出し";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should remove anchor ID from heading with special characters", () => {
      const input = "*PukiWiki について [#qb249ac2]";
      const expected = "# PukiWiki について";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should not remove [#xxx] if it's in the middle of heading", () => {
      const input = "*見出し [#abc] の続き";
      const expected = "# 見出し [#abc] の続き";
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

    it("should handle horizontal rule with trailing spaces", () => {
      const input = "----   ";
      const expected = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert #hr plugin to horizontal rule", () => {
      const input = "#hr";
      const expected = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert #hr with trailing spaces", () => {
      const input = "#hr  ";
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

  describe("line break conversion", () => {
    it("should convert #br to <br>", () => {
      const input = "#br";
      const expected = "<br>";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #br with trailing spaces to <br>", () => {
      const input = "#br  ";
      const expected = "<br>";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should treat #br with leading spaces as preformatted", () => {
      const input = "  #br";
      const expected = "```\n #br\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle multiple #br on separate lines", () => {
      const input = "テキスト1\n#br\n#br\nテキスト2";
      const expected = "テキスト1\n<br>\n<br>\nテキスト2";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });
  });

  describe("comment conversion", () => {
    it("should convert // comment to HTML comment", () => {
      const input = "//これはコメントです";
      const expected = "<!-- これはコメントです -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert // with leading space", () => {
      const input = "// コメント";
      const expected = "<!-- コメント -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should preserve comment with other content", () => {
      const input = "//コメント\n*見出し\nテキスト";
      const expected = "<!-- コメント -->\n# 見出し\nテキスト";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle empty comment", () => {
      const input = "//";
      const expected = "<!--  -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should treat // with leading spaces as preformatted", () => {
      const input = "  //not a comment";
      const expected = "```\n //not a comment\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle multiple comments in sequence", () => {
      const input = "//コメント1\n//コメント2\n//コメント3";
      const expected =
        "<!-- コメント1 -->\n<!-- コメント2 -->\n<!-- コメント3 -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });
  });

  describe("#vote plugin conversion", () => {
    it("should convert #vote to HTML comment + table", () => {
      const input = "#vote(選択肢1[0],選択肢2[1],選択肢3[3])";
      const expected =
        "<!-- #vote(選択肢1[0],選択肢2[1],選択肢3[3]) -->\n| 選択肢 | 投票数 |\n| --- | ---: |\n| 選択肢1 | 0 |\n| 選択肢2 | 1 |\n| 選択肢3 | 3 |";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #vote with single option", () => {
      const input = "#vote(賛成[10])";
      const expected =
        "<!-- #vote(賛成[10]) -->\n| 選択肢 | 投票数 |\n| --- | ---: |\n| 賛成 | 10 |";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #vote with zero votes", () => {
      const input = "#vote(オプションA[0],オプションB[0])";
      const expected =
        "<!-- #vote(オプションA[0],オプションB[0]) -->\n| 選択肢 | 投票数 |\n| --- | ---: |\n| オプションA | 0 |\n| オプションB | 0 |";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle #vote with spaces in option labels", () => {
      const input = "#vote(選択肢 A[5],選択肢 B[3])";
      const expected =
        "<!-- #vote(選択肢 A[5],選択肢 B[3]) -->\n| 選択肢 | 投票数 |\n| --- | ---: |\n| 選択肢 A | 5 |\n| 選択肢 B | 3 |";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #vote with many options", () => {
      const input = "#vote(A[1],B[2],C[3],D[4],E[5])";
      const expected =
        "<!-- #vote(A[1],B[2],C[3],D[4],E[5]) -->\n| 選択肢 | 投票数 |\n| --- | ---: |\n| A | 1 |\n| B | 2 |\n| C | 3 |\n| D | 4 |\n| E | 5 |";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle #vote with option without count (default to 0)", () => {
      const input = "#vote(新しい選択肢)";
      const expected =
        "<!-- #vote(新しい選択肢) -->\n| 選択肢 | 投票数 |\n| --- | ---: |\n| 新しい選択肢 | 0 |";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should preserve #vote with content before and after", () => {
      const input = "*見出し\n#vote(はい[5],いいえ[2])\n通常テキスト";
      const expected =
        "# 見出し\n<!-- #vote(はい[5],いいえ[2]) -->\n| 選択肢 | 投票数 |\n| --- | ---: |\n| はい | 5 |\n| いいえ | 2 |\n通常テキスト";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert #vote-like text that is not a plugin", () => {
      const input = "これは #vote ではありません";
      const expected = "これは #vote ではありません";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });
  });

  describe("dynamic plugin conversion", () => {
    it("should convert #contents to HTML comment", () => {
      const input = "#contents";
      const expected = "<!-- #contents -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #contents with parameters to HTML comment", () => {
      const input = "#contents(depth=2)";
      const expected = "<!-- #contents(depth=2) -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #comment to HTML comment", () => {
      const input = "#comment";
      const expected = "<!-- #comment -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #pcomment to HTML comment", () => {
      const input = "#pcomment";
      const expected = "<!-- #pcomment -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #article to HTML comment", () => {
      const input = "#article";
      const expected = "<!-- #article -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #clear to HTML comment", () => {
      const input = "#clear";
      const expected = "<!-- #clear -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should preserve dynamic plugins with content before and after", () => {
      const input = "*見出し\n#contents\n通常テキスト";
      const expected = "# 見出し\n<!-- #contents -->\n通常テキスト";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert #vote (has special handling)", () => {
      const input = "#vote(選択肢1[0])";
      const expected =
        "<!-- #vote(選択肢1[0]) -->\n| 選択肢 | 投票数 |\n| --- | ---: |\n| 選択肢1 | 0 |";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert other # plugins", () => {
      const input = "#unknown_plugin";
      const expected = "#unknown_plugin";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #counter to HTML comment", () => {
      const input = "#counter";
      const expected = "<!-- #counter -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #navi to HTML comment", () => {
      const input = "#navi";
      const expected = "<!-- #navi -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #tracker to HTML comment", () => {
      const input = "#tracker";
      const expected = "<!-- #tracker -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #calendar to HTML comment", () => {
      const input = "#calendar";
      const expected = "<!-- #calendar -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #search to HTML comment", () => {
      const input = "#search";
      const expected = "<!-- #search -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert similar plugin names (#commentxxx)", () => {
      const input = "#commentxxx";
      const expected = "#commentxxx";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert plugin with suffix (#counter2)", () => {
      const input = "#counter2";
      const expected = "#counter2";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert plugin with prefix (#mycounter)", () => {
      const input = "#mycounter";
      const expected = "#mycounter";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });
  });

  describe("newly added block plugin exclusion", () => {
    it("should convert #include to HTML comment", () => {
      const input = "#include(OtherPage)";
      const expected = "<!-- #include(OtherPage) -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #ls to HTML comment", () => {
      const input = "#ls";
      const expected = "<!-- #ls -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #newpage to HTML comment", () => {
      const input = "#newpage";
      const expected = "<!-- #newpage -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #menu to HTML comment", () => {
      const input = "#menu";
      const expected = "<!-- #menu -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #popular to HTML comment", () => {
      const input = "#popular";
      const expected = "<!-- #popular -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #showrss to HTML comment", () => {
      const input = "#showrss(https://example.com/feed)";
      const expected = "<!-- #showrss(https://example.com/feed) -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #amazon to HTML comment", () => {
      const input = "#amazon(4123456789)";
      const expected = "<!-- #amazon(4123456789) -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #stationary to HTML comment", () => {
      const input = "#stationary";
      const expected = "<!-- #stationary -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #version to HTML comment", () => {
      const input = "#version";
      const expected = "<!-- #version -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });
  });

  describe("plugins without block-type support should not be excluded", () => {
    it("should not convert #edit (not a block plugin)", () => {
      const input = "#edit";
      const expected = "#edit";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert #rename (not a block plugin)", () => {
      const input = "#rename";
      const expected = "#rename";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert #poll (does not exist)", () => {
      const input = "#poll";
      const expected = "#poll";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert #norightbar (does not exist)", () => {
      const input = "#norightbar";
      const expected = "#norightbar";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });
  });

  describe("custom block plugin exclusion", () => {
    it("should convert custom plugin when specified", () => {
      const input = "#myplugin";
      const expected = "<!-- #myplugin -->";
      expect(convertToMarkdown(input, "テスト", ["myplugin"])).toBe(expected);
    });

    it("should convert multiple custom plugins", () => {
      const input = "#customplugin1\nテキスト\n#customplugin2";
      const expected =
        "<!-- #customplugin1 -->\nテキスト\n<!-- #customplugin2 -->";
      expect(
        convertToMarkdown(input, "テスト", ["customplugin1", "customplugin2"]),
      ).toBe(expected);
    });

    it("should convert custom plugin with parameters", () => {
      const input = "#myplugin(param1,param2)";
      const expected = "<!-- #myplugin(param1,param2) -->";
      expect(convertToMarkdown(input, "テスト", ["myplugin"])).toBe(expected);
    });

    it("should not convert non-specified custom plugin", () => {
      const input = "#otherplugin";
      const expected = "#otherplugin";
      expect(convertToMarkdown(input, "テスト", ["myplugin"])).toBe(expected);
    });

    it("should handle custom plugins with special regex characters", () => {
      const input = "#my.plugin";
      const expected = "<!-- #my.plugin -->";
      expect(convertToMarkdown(input, "テスト", ["my.plugin"])).toBe(expected);
    });
  });

  describe("line-head escape", () => {
    it("should escape Markdown special character *", () => {
      const input = "~*見出し";
      const expected = "\\*見出し";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should escape Markdown special character -", () => {
      const input = "~-リスト";
      const expected = "\\-リスト";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should escape Markdown special character >", () => {
      const input = "~>引用";
      const expected = "\\>引用";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should escape Markdown special character #", () => {
      const input = "~#見出し";
      const expected = "\\#見出し";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should remove ~ for PukiWiki-specific syntax", () => {
      const input = "~&ref(image.png);";
      // After removing ~, &ref will be converted to image syntax
      const expected = "![](テスト_attachment_image.png)";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should remove ~ for PukiWiki comment", () => {
      const input = "~//コメント";
      const expected = "//コメント";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should keep ~ alone on a line", () => {
      const input = "~";
      const expected = "~";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should treat ~ with leading spaces as preformatted", () => {
      const input = "  ~*not escaped";
      const expected = "```\n ~*not escaped\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should escape with other content", () => {
      const input = "~*見出し\nテキスト";
      const expected = "\\*見出し\nテキスト";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });
  });

  describe("line-end tilde", () => {
    it("should convert line-end ~ to <br>", () => {
      const input = "テキスト1~";
      const expected = "テキスト1<br>";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert multiple line-end ~ on separate lines", () => {
      const input = "テキスト1~\nテキスト2~";
      const expected = "テキスト1<br>\nテキスト2<br>";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should combine with other inline formats", () => {
      const input = "''太字''のテキスト~";
      const expected = "**太字**のテキスト<br>";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert ~ with trailing spaces", () => {
      const input = "テキスト~  ";
      const expected = "テキスト~  ";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert ~ in the middle of line", () => {
      const input = "テ~キスト";
      const expected = "テ~キスト";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle empty line with ~", () => {
      const input = "~";
      const expected = "~";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle both line-head and line-end escape", () => {
      const input = "~*見出し~";
      const expected = "\\*見出し<br>";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });
  });

  describe("system directive conversion", () => {
    it("should convert #author directive to HTML comment", () => {
      const input =
        '#author("2025-03-14T11:18:07+09:00","default:user","User Name")';
      const expected =
        '<!-- #author("2025-03-14T11:18:07+09:00","default:user","User Name") -->';
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #freeze directive to HTML comment", () => {
      const input = "#freeze";
      const expected = "<!-- #freeze -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #norelated directive to HTML comment", () => {
      const input = "#norelated";
      const expected = "<!-- #norelated -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #nofollow directive to HTML comment", () => {
      const input = "#nofollow";
      const expected = "<!-- #nofollow -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert system directives with trailing spaces", () => {
      const input = "#freeze  ";
      const expected = "<!-- #freeze -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should treat system directives with leading spaces as preformatted", () => {
      const input = "  #freeze";
      const expected = "```\n #freeze\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert multiple system directives in content", () => {
      const input = "#freeze\nテキスト\n#norelated";
      const expected = "<!-- #freeze -->\nテキスト\n<!-- #norelated -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #author and keep other content", () => {
      const input =
        '#author("2025-03-14T11:18:07+09:00","default:user","User")\n*見出し\nテキスト';
      const expected =
        '<!-- #author("2025-03-14T11:18:07+09:00","default:user","User") -->\n# 見出し\nテキスト';
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
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

  describe("text alignment conversion", () => {
    it("should remove CENTER prefix", () => {
      const input = "CENTER:中央揃え";
      const expected = "中央揃え";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should remove RIGHT prefix", () => {
      const input = "RIGHT:右寄せ";
      const expected = "右寄せ";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should remove LEFT prefix", () => {
      const input = "LEFT:左寄せ";
      const expected = "左寄せ";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle alignment with inline formatting", () => {
      const input = "CENTER:''太字''テキスト";
      const expected = "**太字**テキスト";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle alignment with links", () => {
      const input = "CENTER:[[リンク]]";
      const expected = "[リンク](リンク.md)";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should not convert alignment in the middle of line", () => {
      const input = "これはCENTER:中央ではない";
      const expected = "これはCENTER:中央ではない";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle empty content after alignment", () => {
      const input = "CENTER:";
      const expected = "";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle alignment with trailing spaces", () => {
      const input = "CENTER:テキスト  ";
      const expected = "テキスト";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle multiple aligned lines", () => {
      const input = "CENTER:1行目\nRIGHT:2行目\nLEFT:3行目";
      const expected = "1行目\n2行目\n3行目";
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

    it("should convert underline text", () => {
      const input = "これは%%%下線%%%です";
      const expected = "これは<u>下線</u>です";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert line break", () => {
      const input = "1行目&br;2行目";
      const expected = "1行目<br>2行目";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple formatting in one line", () => {
      const input = "''太字''と'''イタリック'''と%%取り消し%%と%%%下線%%%";
      const expected = "**太字**と*イタリック*と~~取り消し~~と<u>下線</u>";
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

    it("should handle underline in headings", () => {
      const input = "*%%%下線の見出し%%%";
      const expected = "# <u>下線の見出し</u>";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle inline formatting in lists", () => {
      const input = "-''太字''の項目";
      const expected = "- **太字**の項目";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle underline in lists", () => {
      const input = "-%%%下線%%%の項目";
      const expected = "- <u>下線</u>の項目";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle inline formatting in quotes", () => {
      const input = ">''太字''の引用";
      const expected = "> **太字**の引用";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle underline in quotes", () => {
      const input = ">%%%下線%%%の引用";
      const expected = "> <u>下線</u>の引用";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &size to HTML span with font-size", () => {
      const input = "&size(20){大きい文字};";
      const expected = '<span style="font-size: 20px">大きい文字</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple &size in one line", () => {
      const input = "&size(30){大};と&size(10){小};";
      const expected =
        '<span style="font-size: 30px">大</span>と<span style="font-size: 10px">小</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &size with other inline formats", () => {
      const input = "''太字''と&size(20){大きい};";
      const expected = '**太字**と<span style="font-size: 20px">大きい</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &color with color name", () => {
      const input = "&color(red){赤い文字};";
      const expected = '<span style="color: red">赤い文字</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &color with hex color", () => {
      const input = "&color(#FF0000){赤い文字};";
      const expected = '<span style="color: #FF0000">赤い文字</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &color with short hex color", () => {
      const input = "&color(#F00){赤い文字};";
      const expected = '<span style="color: #F00">赤い文字</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &color with foreground and background colors", () => {
      const input = "&color(blue,yellow){青い文字に黄色い背景};";
      const expected =
        '<span style="color: blue; background-color: yellow">青い文字に黄色い背景</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &color with hex colors for both fg and bg", () => {
      const input = "&color(#00F,#FF0){青い文字に黄色い背景};";
      const expected =
        '<span style="color: #00F; background-color: #FF0">青い文字に黄色い背景</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple &color in one line", () => {
      const input = "&color(red){赤};と&color(blue){青};";
      const expected =
        '<span style="color: red">赤</span>と<span style="color: blue">青</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &color with other inline formats", () => {
      const input = "''太字''と&color(red){赤};";
      const expected = '**太字**と<span style="color: red">赤</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &size and &color together", () => {
      const input = "&size(20){大きい};と&color(red){赤};";
      const expected =
        '<span style="font-size: 20px">大きい</span>と<span style="color: red">赤</span>';
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
        const expected =
          "|   |   |\n| --- | --- |\n| セル1 | セル2 |\n| セル3 | セル4 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle empty cells", () => {
        const input = "|セル1||\n||セル4|";
        const expected = "|   |   |\n| --- | --- |\n| セル1 |  |\n|  | セル4 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle cells with spaces", () => {
        const input = "| セル 1 | セル 2 |";
        const expected = "|   |   |\n| --- | --- |\n| セル 1 | セル 2 |";
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
        const expected = "|   |   |\n| --- | --- |\n| **見出し** | 通常 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle multiple ~ header cells", () => {
        const input = "|~列1|~列2|~列3|";
        const expected =
          "|   |   |   |\n| --- | --- | --- |\n| **列1** | **列2** | **列3** |";
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
      it("should include footer row (|f) as normal row", () => {
        const input = "|ヘッダ|h\n|データ|\n|フッター|f";
        const expected = "| ヘッダ |\n| --- |\n| データ |\n| フッター |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should skip column width row (|c)", () => {
        const input = "|100|200|c\n|ヘッダ1|ヘッダ2|h\n|データ1|データ2|";
        const expected =
          "| ヘッダ1 | ヘッダ2 |\n| --- | --- |\n| データ1 | データ2 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should include footer row in HTML table", () => {
        const input = "|データ|\n|フッター|f";
        const expected = "|   |\n| --- |\n| データ |\n| フッター |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should skip column width row in HTML table", () => {
        const input = "|100|200|c\n|データ1|データ2|";
        const expected = "|   |   |\n| --- | --- |\n| データ1 | データ2 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("multiple tables", () => {
      it("should handle multiple tables separated by text", () => {
        const input = "|表1A|表1B|\n\nテキスト\n\n|表2A|表2B|";
        const expected =
          "|   |   |\n| --- | --- |\n| 表1A | 表1B |\n\nテキスト\n\n|   |   |\n| --- | --- |\n| 表2A | 表2B |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle tables with headings between them", () => {
        const input = "|データ1|\n\n*見出し\n\n|データ2|";
        const expected =
          "|   |\n| --- |\n| データ1 |\n\n# 見出し\n\n|   |\n| --- |\n| データ2 |";
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
        const expected = "|   |\n| --- |\n| データ |\n> 引用文";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle table with list after", () => {
        const input = "|データ|\n-リスト項目";
        const expected = "|   |\n| --- |\n| データ |\n- リスト項目";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("table cell formatting", () => {
      it("should convert BOLD: in HTML table", () => {
        const input = "|BOLD:太字|通常|";
        const expected = "|   |   |\n| --- | --- |\n| **太字** | 通常 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert BOLD: in Markdown table", () => {
        const input = "|BOLD:太字|通常|h";
        const expected = "| **太字** | 通常 |\n| --- | --- |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert SIZE in HTML table", () => {
        const input = "|SIZE(20):大きい|通常|";
        const expected =
          '|   |   |\n| --- | --- |\n| <span style="font-size: 20px">大きい</span> | 通常 |';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert SIZE in Markdown table", () => {
        const input = "|SIZE(20):大きい|通常|h";
        const expected =
          '| <span style="font-size: 20px">大きい</span> | 通常 |\n| --- | --- |';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert COLOR in HTML table", () => {
        const input = "|COLOR(red):赤|通常|";
        const expected =
          '|   |   |\n| --- | --- |\n| <span style="color: red">赤</span> | 通常 |';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert COLOR with hex code in Markdown table", () => {
        const input = "|COLOR(#FF0000):赤|通常|h";
        const expected =
          '| <span style="color: #FF0000">赤</span> | 通常 |\n| --- | --- |';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should preserve BGCOLOR as HTML comment", () => {
        const input = "|BGCOLOR(yellow):黄背景|通常|";
        const expected =
          "|   |   |\n| --- | --- |\n| 黄背景 <!-- BGCOLOR(yellow) --> | 通常 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should combine multiple styles", () => {
        const input = "|SIZE(20):COLOR(red):大きくて赤|通常|";
        const expected =
          '|   |   |\n| --- | --- |\n| <span style="font-size: 20px; color: red">大きくて赤</span> | 通常 |';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should combine styles and preserve BGCOLOR as comment", () => {
        const input = "|BOLD:SIZE(20):COLOR(red):BGCOLOR(yellow):全部|通常|";
        const expected =
          '|   |   |\n| --- | --- |\n| <span style="font-size: 20px; color: red">**全部**</span> <!-- BGCOLOR(yellow) --> | 通常 |';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should combine with alignment in Markdown table", () => {
        const input = "|LEFT:BOLD:名前|RIGHT:SIZE(20):大きい|h";
        const expected =
          '| **名前** | <span style="font-size: 20px">大きい</span> |\n| --- | ---: |';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle BOLD: with ~ header cell", () => {
        const input = "|BOLD:~太字|通常|h";
        const expected = "| **太字** | 通常 |\n| --- | --- |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should preserve BGCOLOR only as comment without other styles", () => {
        const input = "|BGCOLOR(red):赤背景|";
        const expected = "|   |\n| --- |\n| 赤背景 <!-- BGCOLOR(red) --> |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should preserve BGCOLOR in header row", () => {
        const input = "|BGCOLOR(yellow):ヘッダ|h";
        const expected = "| ヘッダ <!-- BGCOLOR(yellow) --> |\n| --- |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle multiple formatted cells in one row", () => {
        const input = "|BOLD:太字|COLOR(red):赤|SIZE(20):大きい|h";
        const expected =
          '| **太字** | <span style="color: red">赤</span> | <span style="font-size: 20px">大きい</span> |\n| --- | --- | --- |';
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

  describe("preformatted text conversion", () => {
    it("should convert single preformatted line to fenced code block", () => {
      const input = " 整形済みテキスト";
      const expected = "```\n整形済みテキスト\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert multiple preformatted lines to single code block", () => {
      const input = " 行1\n 行2\n 行3";
      const expected = "```\n行1\n行2\n行3\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle preformatted text with normal text before and after", () => {
      const input = "通常テキスト\n\n 整形1\n 整形2\n\n通常テキスト2";
      const expected =
        "通常テキスト\n\n```\n整形1\n整形2\n```\n\n通常テキスト2";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle preformatted text starting with tab", () => {
      const input = "\t整形済みテキスト";
      const expected = "```\n整形済みテキスト\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not treat whitespace-only lines as preformatted", () => {
      const input = "   ";
      const expected = "   ";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should remove only first leading space preserving relative indent", () => {
      const input = "  コード行1\n   コード行2";
      const expected = "```\n コード行1\n  コード行2\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle multiple preformatted blocks", () => {
      const input = " ブロック1\n\n通常\n\n ブロック2";
      const expected = "```\nブロック1\n```\n\n通常\n\n```\nブロック2\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not process PukiWiki syntax in preformatted text", () => {
      const input = " *見出し\n ''強調''";
      const expected = "```\n*見出し\n''強調''\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle preformatted text followed by table", () => {
      const input = " コード\n|セル|h";
      const expected = "```\nコード\n```\n| セル |\n| --- |";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle table followed by preformatted text", () => {
      const input = "|セル|h\n コード";
      const expected = "| セル |\n| --- |\n```\nコード\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should treat horizontal rule with leading spaces as preformatted", () => {
      const input = "   ----";
      const expected = "```\n  ----\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should treat #hr with leading spaces as preformatted", () => {
      const input = "  #hr";
      const expected = "```\n #hr\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should preserve internal and trailing whitespace", () => {
      const input = "  hello   world  ";
      const expected = "```\n hello   world  \n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should preserve relative indentation by removing only first space", () => {
      const input = "  function test() {\n    return 42;\n  }";
      const expected = "```\n function test() {\n   return 42;\n }\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
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
