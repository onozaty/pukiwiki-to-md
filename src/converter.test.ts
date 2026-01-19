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
      const expected = "***";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert 5 or more hyphens", () => {
      const input = "-----";
      const expected = "***";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle horizontal rule with trailing spaces", () => {
      const input = "----   ";
      const expected = "***";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert #hr plugin to horizontal rule", () => {
      const input = "#hr";
      const expected = "***";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert #hr() plugin to horizontal rule", () => {
      const input = "#hr()";
      const expected = "***";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert #hr with trailing spaces", () => {
      const input = "#hr  ";
      const expected = "***";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert #hr() with trailing spaces", () => {
      const input = "#hr()  ";
      const expected = "***";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert #hr() with trailing text", () => {
      const input = "#hr() 追加テキスト";
      const expected = "***";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should not convert #hr with text (no parentheses)", () => {
      const input = "#hr 追加テキスト";
      expect(convertToMarkdown(input, "テストページ")).toBe(input);
    });

    it("should not convert similar plugin names like #hrxxx", () => {
      const input = "#hrxxx";
      expect(convertToMarkdown(input, "テストページ")).toBe(input);
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

    it("should discard trailing text after ---- without inline formatting", () => {
      const input = "---- ''太字''";
      // ---- matches and discards trailing text (PukiWiki behavior)
      const expected = "***";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should discard trailing text after #hr() without inline formatting", () => {
      const input = "#hr() [[リンク]]";
      // #hr() matches and discards trailing text (not converted to separate line)
      const expected = "***";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });
  });

  describe("line break conversion", () => {
    it("should convert #br to <br> with blank line", () => {
      const input = "#br";
      const expected = "<br>\n";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #br() to <br> with blank line", () => {
      const input = "#br()";
      const expected = "<br>\n";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #br with trailing spaces to <br> with blank line", () => {
      const input = "#br  ";
      const expected = "<br>\n";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #br() with trailing spaces to <br> with blank line", () => {
      const input = "#br()  ";
      const expected = "<br>\n";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #br() with trailing text", () => {
      const input = "#br() 追加テキスト";
      const expected = "<br>\n";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert #br with text (no parentheses)", () => {
      const input = "#br 追加テキスト";
      expect(convertToMarkdown(input, "テスト")).toBe(input);
    });

    it("should not convert similar plugin names like #brxxx", () => {
      const input = "#brxxx";
      expect(convertToMarkdown(input, "テスト")).toBe(input);
    });

    it("should treat #br with leading spaces as preformatted", () => {
      const input = "  #br";
      const expected = "```\n #br\n```";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle multiple #br on separate lines", () => {
      const input = "テキスト1\n#br\n#br\nテキスト2";
      const expected = "テキスト1\n<br>\n\n<br>\n\nテキスト2";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should handle multiple #br() on separate lines", () => {
      const input = "テキスト1\n#br()\n#br()\nテキスト2";
      const expected = "テキスト1\n<br>\n\n<br>\n\nテキスト2";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not match #br with trailing text (no parentheses, becomes normal text)", () => {
      const input = "#br ''太字''";
      // #br with text (no parentheses) doesn't match, becomes normal text with inline formatting
      const expected = "#br **太字**";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should discard trailing text after #br() without inline formatting", () => {
      const input = "#br() %%%下線%%%";
      // #br() matches and discards trailing text (not converted to separate line)
      const expected = "<br>\n";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should ensure following Markdown link is properly parsed", () => {
      const input = "#br\n[[Link:https://example.com/]]";
      const expected = "<br>\n\n[Link](https://example.com/)";
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

    it("should not apply inline formatting in comments (bold)", () => {
      const input = "//''太字''のコメント";
      const expected = "<!-- ''太字''のコメント -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not apply inline formatting in comments (underline)", () => {
      const input = "//%%%下線%%%を含むコメント";
      const expected = "<!-- %%%下線%%%を含むコメント -->";
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

    it("should convert #vote with trailing text", () => {
      const input = "#vote(はい[5],いいえ[2])追加テキスト";
      const expected =
        "<!-- #vote(はい[5],いいえ[2])追加テキスト -->\n| 選択肢 | 投票数 |\n| --- | ---: |\n| はい | 5 |\n| いいえ | 2 |";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert #vote-like text that is not a plugin", () => {
      const input = "これは #vote ではありません";
      const expected = "これは #vote ではありません";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should apply inline formatting in vote options (bold)", () => {
      const input = "#vote(''太字''[5],通常[3])";
      const expected =
        "<!-- #vote(''太字''[5],通常[3]) -->\n| 選択肢 | 投票数 |\n| --- | ---: |\n| **太字** | 5 |\n| 通常 | 3 |";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should apply inline formatting in vote options (link)", () => {
      const input = "#vote([[リンク]][10])";
      const expected =
        "<!-- #vote([[リンク]][10]) -->\n| 選択肢 | 投票数 |\n| --- | ---: |\n| [リンク](リンク.md) | 10 |";
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

    it("should not apply inline formatting in plugin parameters (bold)", () => {
      const input = "#contents(''太字'')";
      const expected = "<!-- #contents(''太字'') -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not apply inline formatting in plugin parameters (link)", () => {
      const input = "#comment([[リンク]])";
      const expected = "<!-- #comment([[リンク]]) -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });
  });

  describe("newly added block plugin exclusion", () => {
    it("should convert #include to HTML comment and link", () => {
      const input = "#include(OtherPage)";
      const expected =
        "<!-- #include(OtherPage) -->\n[OtherPage](OtherPage.md)";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #include with parameters to HTML comment and link", () => {
      const input = "#include(共通ヘッダー,notitle)";
      const expected =
        "<!-- #include(共通ヘッダー,notitle) -->\n[共通ヘッダー](共通ヘッダー.md)";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert #include with relative path in hierarchical pages", () => {
      const input = "#include(プロジェクト/共通部分)";
      const expected =
        "<!-- #include(プロジェクト/共通部分) -->\n[プロジェクト/共通部分](共通部分.md)";
      expect(convertToMarkdown(input, "プロジェクト/タスク")).toBe(expected);
    });

    it("should convert #include to parent page from child page", () => {
      const input = "#include(共通ページ)";
      const expected =
        "<!-- #include(共通ページ) -->\n[共通ページ](../共通ページ.md)";
      expect(convertToMarkdown(input, "プロジェクト/タスク")).toBe(expected);
    });

    it("should convert #include with trailing text", () => {
      const input = "#include(Header,notitle)追加テキスト";
      const expected =
        "<!-- #include(Header,notitle)追加テキスト -->\n[Header](Header.md)";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not apply inline formatting in #include page name", () => {
      const input = "#include(''太字''ページ)";
      const expected =
        "<!-- #include(''太字''ページ) -->\n[''太字''ページ](''太字''ページ.md)";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not apply inline formatting in trailing text after #include", () => {
      const input = "#include(Header) [[リンク]]";
      const expected =
        "<!-- #include(Header) [[リンク]] -->\n[Header](Header.md)";
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
      expect(
        convertToMarkdown(input, "テスト", {
          excludeBlockPlugins: ["myplugin"],
        }),
      ).toBe(expected);
    });

    it("should convert multiple custom plugins", () => {
      const input = "#customplugin1\nテキスト\n#customplugin2";
      const expected =
        "<!-- #customplugin1 -->\nテキスト\n<!-- #customplugin2 -->";
      expect(
        convertToMarkdown(input, "テスト", {
          excludeBlockPlugins: ["customplugin1", "customplugin2"],
        }),
      ).toBe(expected);
    });

    it("should convert custom plugin with parameters", () => {
      const input = "#myplugin(param1,param2)";
      const expected = "<!-- #myplugin(param1,param2) -->";
      expect(
        convertToMarkdown(input, "テスト", {
          excludeBlockPlugins: ["myplugin"],
        }),
      ).toBe(expected);
    });

    it("should not convert non-specified custom plugin", () => {
      const input = "#otherplugin";
      const expected = "#otherplugin";
      expect(
        convertToMarkdown(input, "テスト", {
          excludeBlockPlugins: ["myplugin"],
        }),
      ).toBe(expected);
    });

    it("should handle custom plugins with special regex characters", () => {
      const input = "#my.plugin";
      const expected = "<!-- #my.plugin -->";
      expect(
        convertToMarkdown(input, "テスト", {
          excludeBlockPlugins: ["my.plugin"],
        }),
      ).toBe(expected);
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
      const expected = "![image.png](テスト_attachment_image.png)";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should remove ~ for PukiWiki comment", () => {
      const input = "~//コメント";
      const expected = "//コメント";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should keep ~ alone on a line", () => {
      const input = "~";
      const expected = "<br>";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should remove ~ before whitespace", () => {
      const input = "~   ";
      const expected = "   ";
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
      const expected = "**太字** のテキスト<br>";
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
      const expected = "<br>";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert ~~ to <br>", () => {
      const input = "~~";
      const expected = "<br>";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert ~~~ to ~<br>", () => {
      const input = "~~~";
      const expected = "~<br>";
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

    it("should convert plugin with empty parentheses", () => {
      const input = "#freeze()";
      const expected = "<!-- #freeze() -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert plugin with parentheses and text after", () => {
      const input = "#freeze() 追加テキスト";
      const expected = "<!-- #freeze() 追加テキスト -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should convert plugin with parameters and text after closing paren", () => {
      const input = "#contents(depth=2)これは無視される";
      const expected = "<!-- #contents(depth=2)これは無視される -->";
      expect(convertToMarkdown(input, "テスト")).toBe(expected);
    });

    it("should not convert plugin without parentheses but with text after", () => {
      const input = "#freeze 追加テキスト";
      const expected = "#freeze 追加テキスト";
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
      const expected = "**太字** テキスト";
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
      const expected = "# 見出し\n\n普通のテキスト\n\n> 引用\n\n***";
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
      const expected = "これは **太字** です";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert italic text", () => {
      const input = "これは'''イタリック'''です";
      const expected = "これは *イタリック* です";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert strikethrough text", () => {
      const input = "これは%%取り消し%%です";
      const expected = "これは ~~取り消し~~ です";
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

    it("should convert line break with parentheses", () => {
      const input = "1行目&br();2行目";
      const expected = "1行目<br>2行目";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple line breaks", () => {
      const input = "1行目&br;2行目&br;3行目";
      const expected = "1行目<br>2行目<br>3行目";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple line breaks with parentheses", () => {
      const input = "1行目&br();2行目&br();3行目";
      const expected = "1行目<br>2行目<br>3行目";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple formatting in one line", () => {
      const input = "''太字''と'''イタリック'''と%%取り消し%%と%%%下線%%%";
      const expected = "**太字** と *イタリック* と ~~取り消し~~ と<u>下線</u>";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle inline formatting in headings", () => {
      const input = "*''太字の見出し''";
      const expected = "# **太字の見出し**";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should add spaces around bold markers with punctuation", () => {
      const input = "''「太字です」''";
      const expected = "**「太字です」**";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should add spaces around bold markers with alphanumeric", () => {
      const input = "text''bold''text";
      const expected = "text **bold** text";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should not add spaces when already present", () => {
      const input = "これは ''太字'' です";
      const expected = "これは **太字** です";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should not add space at line start", () => {
      const input = "''太字''です";
      const expected = "**太字** です";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should not add space at line end", () => {
      const input = "これは''太字''";
      const expected = "これは **太字**";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should add spaces around italic markers with punctuation", () => {
      const input = "'''(italic)'''";
      const expected = "*(italic)*";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should add spaces around strikethrough markers with punctuation", () => {
      const input = "%%[削除]%%";
      const expected = "~~[削除]~~";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle underline in headings", () => {
      const input = "*%%%下線の見出し%%%";
      const expected = "# <u>下線の見出し</u>";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle inline formatting in lists", () => {
      const input = "-''太字''の項目";
      const expected = "- **太字** の項目";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle underline in lists", () => {
      const input = "-%%%下線%%%の項目";
      const expected = "- <u>下線</u>の項目";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle inline formatting in quotes", () => {
      const input = ">''太字''の引用";
      const expected = "> **太字** の引用";
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
      const expected = '**太字** と<span style="font-size: 20px">大きい</span>';
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
      const expected = '**太字** と<span style="color: red">赤</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &size and &color together", () => {
      const input = "&size(20){大きい};と&color(red){赤};";
      const expected =
        '<span style="font-size: 20px">大きい</span>と<span style="color: red">赤</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &color old style (color,text)", () => {
      const input = "&color(red,赤い文字);";
      const expected = '<span style="color: red">赤い文字</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &color old style with hex color", () => {
      const input = "&color(#FF0000,赤い文字);";
      const expected = '<span style="color: #FF0000">赤い文字</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert &color old style case-insensitive", () => {
      const input = "&COLOR(blue,青い文字);";
      const expected = '<span style="color: blue">青い文字</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple &color old style in one line", () => {
      const input = "&color(red,赤);と&color(blue,青);";
      const expected =
        '<span style="color: red">赤</span>と<span style="color: blue">青</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert both old and new &color styles together", () => {
      const input = "&color(red,旧式);と&color(blue){新式};";
      const expected =
        '<span style="color: red">旧式</span>と<span style="color: blue">新式</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert COLOR(color):text format in regular text", () => {
      const input = "COLOR(red):赤い文字";
      const expected = '<span style="color: red">赤い文字</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple COLOR directives", () => {
      const input = "xxxCOLOR(red):redCOLOR(green):green";
      const expected =
        'xxx<span style="color: red">red</span><span style="color: green">green</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert COLOR with text continuation", () => {
      const input = "前の文字COLOR(blue):青い部分後の文字";
      const expected =
        '前の文字<span style="color: blue">青い部分後の文字</span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });
  });

  describe("nested plugin conversion", () => {
    it("should convert nested &color and &size (color inside size)", () => {
      const input = "&size(20){&color(red){テキスト};};";
      const expected =
        '<span style="font-size: 20px"><span style="color: red">テキスト</span></span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert nested &color and &size (size inside color)", () => {
      const input = "&color(red){&size(20){テキスト};};";
      const expected =
        '<span style="color: red"><span style="font-size: 20px">テキスト</span></span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert nested plugins with &br inside", () => {
      const input = "&color(red){&size(20){text1&br;text2};};";
      const expected =
        '<span style="color: red"><span style="font-size: 20px">text1<br>text2</span></span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert 3-level nested plugins", () => {
      const input = "&color(blue){&size(20){''太字''};};";
      const expected =
        '<span style="color: blue"><span style="font-size: 20px"> **太字** </span></span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple nested plugins in one line", () => {
      const input =
        "&color(red){&size(20){赤};};と&color(blue){&size(30){青};};";
      const expected =
        '<span style="color: red"><span style="font-size: 20px">赤</span></span>と<span style="color: blue"><span style="font-size: 30px">青</span></span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert nested color with background color", () => {
      const input = "&color(red,yellow){&size(20){テキスト};};";
      const expected =
        '<span style="color: red; background-color: yellow"><span style="font-size: 20px">テキスト</span></span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert complex nested structure with old style color", () => {
      const input = "&size(20){&color(red,テキスト);};";
      const expected =
        '<span style="font-size: 20px"><span style="color: red">テキスト</span></span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert nested plugin with mixed content", () => {
      const input =
        "&color(red){&size(10){テキスト1};テキスト2&size(20){テキスト3};};";
      const expected =
        '<span style="color: red"><span style="font-size: 10px">テキスト1</span>テキスト2<span style="font-size: 20px">テキスト3</span></span>';
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert size with multiple nested colors", () => {
      const input =
        "&size(20){&color(red){テキスト1};テキスト2&color(green){テキスト3};};";
      const expected =
        '<span style="font-size: 20px"><span style="color: red">テキスト1</span>テキスト2<span style="color: green">テキスト3</span></span>';
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

      it("should convert internal link with leading colon", () => {
        const input = "[[:blog/2018-10-09]]";
        const expected = "[:blog/2018-10-09](%3Ablog/2018-10-09.md)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert internal link with leading colon and custom text", () => {
        const input = "[[ブログ記事>:blog/2018-10-09]]";
        const expected = "[ブログ記事](%3Ablog/2018-10-09.md)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should escape brackets in page name", () => {
        const input = "[[ページ[括弧]名]]";
        // Link text: brackets are escaped for Markdown
        // URL: brackets are percent-encoded by encodePathForMarkdown
        const expected = "[ページ\\[括弧\\]名](ページ%5B括弧%5D名.md)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should escape brackets in link text", () => {
        const input = "[[テキスト[xxx]>ページ名]]";
        const expected = "[テキスト\\[xxx\\]](ページ名.md)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should escape backslash in link text", () => {
        const input = "[[テキスト\\バックスラッシュ>ページ名]]";
        const expected = "[テキスト\\\\バックスラッシュ](ページ名.md)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
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

      it("should escape brackets in external link text", () => {
        const input = "[[外部[サイト]:https://example.com]]";
        const expected = "[外部\\[サイト\\]](https://example.com)";
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
        const expected = "**太字** の[リンク](リンク.md)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });
    });
  });

  describe("attachment conversion", () => {
    describe("image references (#ref)", () => {
      it("should convert image reference without alt text", () => {
        const input = "#ref(screenshot.png)";
        const expected =
          "![screenshot.png](テストページ_attachment_screenshot.png)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should convert image reference with alt text", () => {
        const input = "#ref(diagram.png,システム図)";
        const expected = "![システム図](テストページ_attachment_diagram.png)";
        expect(convertToMarkdown(input, "テストページ")).toBe(expected);
      });

      it("should handle hierarchical page name", () => {
        const input = "#ref(screenshot.png)";
        const expected = "![screenshot.png](タスク_attachment_screenshot.png)";
        expect(convertToMarkdown(input, "プロジェクト/タスク")).toBe(expected);
      });

      it("should handle hierarchical page name with alt text", () => {
        const input = "#ref(diagram.png,図表)";
        const expected = "![図表](概要_attachment_diagram.png)";
        expect(convertToMarkdown(input, "プロジェクト/概要")).toBe(expected);
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

      it("should handle filename with spaces (URL encode)", () => {
        const input = "#ref(my image.png)";
        const expected = "![my image.png](テスト_attachment_my%20image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle filename with spaces and alt text", () => {
        const input = "#ref(my document.pdf,マイドキュメント)";
        const expected =
          "[マイドキュメント](テスト_attachment_my%20document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle filename with special characters", () => {
        const input = "#ref(file (1).png)";
        const expected =
          "![file (1).png](テスト_attachment_file%20%281%29.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle quoted filename with parentheses", () => {
        const input = '#ref("file (1).png")';
        const expected =
          "![file (1).png](テスト_attachment_file%20%281%29.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle quoted filename with comma", () => {
        const input = '#ref("file, name.png",300x200)';
        const expected =
          '<img src="テスト_attachment_file%2C%20name.png" alt="file, name.png" width="300" height="200">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle quoted filename with escaped quotes", () => {
        const input = '#ref("file ""quoted"".png")';
        const expected =
          '![file "quoted".png](テスト_attachment_file%20%22quoted%22.png)';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle reference to other page attachment", () => {
        const input = "#ref(OtherPage/image.png)";
        const expected = "![image.png](OtherPage_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle reference to hierarchical page attachment", () => {
        const input = "#ref(Parent/Child/file.png)";
        const expected = "![file.png](Parent/Child_attachment_file.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle relative path reference (same page)", () => {
        const input = "#ref(./image.png)";
        const expected = "![image.png](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle relative path reference (parent page)", () => {
        const input = "#ref(../image.png)";
        const expected = "![image.png](../プロジェクト_attachment_image.png)";
        expect(convertToMarkdown(input, "プロジェクト/タスク")).toBe(expected);
      });

      it("should handle other page reference with parameters", () => {
        const input = "#ref(OtherPage/image.png,300x200,説明)";
        const expected =
          '<img src="OtherPage_attachment_image.png" alt="説明" width="300" height="200">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle other page non-image file", () => {
        const input = "#ref(OtherPage/document.pdf,資料)";
        const expected = "[資料](OtherPage_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert #ref with trailing text", () => {
        const input = "#ref(image.png)追加テキスト";
        const expected = "![image.png](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert #ref with parentheses in filename and trailing text", () => {
        const input = "#ref(file (1).png)追加テキスト";
        const expected =
          "![file (1).png](テスト_attachment_file%20%281%29.png)";
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
        const expected = "![icon.png](テスト_attachment_icon.png)";
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

      it("should escape brackets in alt text for images", () => {
        const input = "&ref(image.png,[xxx]タイトル);";
        const expected = "![\\[xxx\\]タイトル](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should escape brackets in alt text for files", () => {
        const input = "&ref(document.pdf,[重要]資料);";
        const expected = "[\\[重要\\]資料](テスト_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should escape backslash in alt text", () => {
        const input = "&ref(document.pdf,資料\\バックスラッシュ);";
        const expected =
          "[資料\\\\バックスラッシュ](テスト_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should filter empty parameters (single empty)", () => {
        const input = "&ref(document.pdf,,[xxx]yyy);";
        const expected = "[\\[xxx\\]yyy](テスト_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should filter empty parameters (multiple empty)", () => {
        const input = "&ref(image.png,,,alt text);";
        const expected = "![alt text](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should filter empty parameters with size specification", () => {
        const input = "&ref(image.png,,300x200,図表);";
        const expected =
          '<img src="テスト_attachment_image.png" alt="図表" width="300" height="200">';
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
          '<img src="テスト_attachment_image.png" alt="image.png" width="300" height="200">';
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
          '<img src="テスト_attachment_image.png" alt="image.png" width="300" height="200">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should not apply inline formatting in alt text (bold)", () => {
        const input = "#ref(image.png,''太字''の画像)";
        const expected = "![''太字''の画像](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should not apply inline formatting in alt text (link)", () => {
        const input = "#ref(document.pdf,[[リンク]]付きテキスト)";
        // Alt text does not undergo inline processing, so brackets from [[...]] remain
        // and then get escaped for Markdown safety
        const expected =
          "[\\[\\[リンク\\]\\]付きテキスト](テスト_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should escape brackets in #ref alt text for images", () => {
        const input = "#ref(image.png,[xxx]タイトル)";
        const expected = "![\\[xxx\\]タイトル](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should escape brackets in #ref alt text for files", () => {
        const input = "#ref(document.pdf,[重要]資料)";
        const expected = "[\\[重要\\]資料](テスト_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should filter empty parameters in #ref (single empty)", () => {
        const input = "#ref(document.pdf,,[xxx]yyy)";
        const expected = "[\\[xxx\\]yyy](テスト_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should filter empty parameters in #ref (with size)", () => {
        const input = "#ref(image.png,,300x200,図表)";
        const expected =
          '<img src="テスト_attachment_image.png" alt="図表" width="300" height="200">';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("mixed attachments", () => {
      it("should handle images and file links together", () => {
        const input = "&ref(image.png);と&ref(document.pdf);";
        const expected =
          "![image.png](テスト_attachment_image.png)と[document.pdf](テスト_attachment_document.pdf)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle attachments with other inline formatting", () => {
        const input = "''太字''の&ref(image.png);";
        const expected = "**太字** の![image.png](テスト_attachment_image.png)";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });
  });

  describe("table conversion", () => {
    describe("basic tables", () => {
      it("should convert simple 2x2 table", () => {
        const input = "|セル1|セル2|\n|セル3|セル4|";
        const expected =
          "|  |  |\n| --- | --- |\n| セル1 | セル2 |\n| セル3 | セル4 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle empty cells", () => {
        const input = "|セル1||\n||セル4|";
        const expected = "|  |  |\n| --- | --- |\n| セル1 |  |\n|  | セル4 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle cells with spaces", () => {
        const input = "| セル 1 | セル 2 |";
        const expected = "|  |  |\n| --- | --- |\n| セル 1 | セル 2 |";
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
        const expected = "|  |  |\n| --- | --- |\n| **見出し** | 通常 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle multiple ~ header cells", () => {
        const input = "|~列1|~列2|~列3|";
        const expected =
          "|  |  |  |\n| --- | --- | --- |\n| **列1** | **列2** | **列3** |";
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
        const expected = "|  |\n| --- |\n| データ |\n| フッター |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should skip column width row in HTML table", () => {
        const input = "|100|200|c\n|データ1|データ2|";
        const expected = "|  |  |\n| --- | --- |\n| データ1 | データ2 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("multiple tables", () => {
      it("should handle multiple tables separated by text", () => {
        const input = "|表1A|表1B|\n\nテキスト\n\n|表2A|表2B|";
        const expected =
          "|  |  |\n| --- | --- |\n| 表1A | 表1B |\n\nテキスト\n\n|  |  |\n| --- | --- |\n| 表2A | 表2B |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle tables with headings between them", () => {
        const input = "|データ1|\n\n*見出し\n\n|データ2|";
        const expected =
          "|  |\n| --- |\n| データ1 |\n\n# 見出し\n\n|  |\n| --- |\n| データ2 |";
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
        const expected = "|  |\n| --- |\n| データ |\n> 引用文";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle table with list after", () => {
        const input = "|データ|\n-リスト項目";
        const expected = "|  |\n| --- |\n| データ |\n- リスト項目";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("table cell formatting", () => {
      it("should convert BOLD: in HTML table", () => {
        const input = "|BOLD:太字|通常|";
        const expected = "|  |  |\n| --- | --- |\n| **太字** | 通常 |";
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
          '|  |  |\n| --- | --- |\n| <span style="font-size: 20px">大きい</span> | 通常 |';
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
          '|  |  |\n| --- | --- |\n| <span style="color: red">赤</span> | 通常 |';
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
          "|  |  |\n| --- | --- |\n| 黄背景 <!-- BGCOLOR(yellow) --> | 通常 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should combine multiple styles", () => {
        const input = "|SIZE(20):COLOR(red):大きくて赤|通常|";
        const expected =
          '|  |  |\n| --- | --- |\n| <span style="font-size: 20px; color: red">大きくて赤</span> | 通常 |';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should combine styles and preserve BGCOLOR as comment", () => {
        const input = "|BOLD:SIZE(20):COLOR(red):BGCOLOR(yellow):全部|通常|";
        const expected =
          '|  |  |\n| --- | --- |\n| <span style="font-size: 20px; color: red">**全部**</span> <!-- BGCOLOR(yellow) --> | 通常 |';
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
        const expected = "|  |\n| --- |\n| 赤背景 <!-- BGCOLOR(red) --> |";
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

      it("should handle empty cell with BOLD", () => {
        const input = "|BOLD:|通常|h";
        const expected = "|  | 通常 |\n| --- | --- |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle empty cell with multiple styles", () => {
        const input = "|BOLD:SIZE(20):COLOR(red):|通常|";
        const expected = "|  |  |\n| --- | --- |\n|  | 通常 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should combine alignment with BGCOLOR", () => {
        const input = "|RIGHT:BGCOLOR(red):テキスト|CENTER:SIZE(20):テキスト|";
        const expected =
          '|  |  |\n| ---: | :---: |\n| テキスト <!-- BGCOLOR(red) --> | <span style="font-size: 20px">テキスト</span> |';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle alignment after other formatting", () => {
        const input = "|BGCOLOR(red):RIGHT:テキスト|SIZE(20):CENTER:テキスト|";
        const expected =
          '|  |  |\n| ---: | :---: |\n| テキスト <!-- BGCOLOR(red) --> | <span style="font-size: 20px">テキスト</span> |';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });
    });

    describe("table cells with #ref plugin", () => {
      it("should convert #ref with image in table cell", () => {
        const input = "|#ref(image.png)|説明|h";
        const expected =
          "| ![image.png](テスト_attachment_image.png) | 説明 |\n| --- | --- |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert #ref with non-image file in table cell", () => {
        const input = "|#ref(document.pdf)|説明|";
        const expected =
          "|  |  |\n| --- | --- |\n| [document.pdf](テスト_attachment_document.pdf) | 説明 |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert #ref with alt text in table cell", () => {
        const input = "|#ref(image.png,図1)|データ|h";
        const expected =
          "| ![図1](テスト_attachment_image.png) | データ |\n| --- | --- |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert #ref with size specification in table cell", () => {
        const input = "|#ref(image.png,300x200)|データ|";
        const expected =
          '|  |  |\n| --- | --- |\n| <img src="テスト_attachment_image.png" alt="image.png" width="300" height="200"> | データ |';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert #ref with size and alt text in table cell", () => {
        const input = "|#ref(image.png,300x200,スクリーンショット)|説明|h";
        const expected =
          '| <img src="テスト_attachment_image.png" alt="スクリーンショット" width="300" height="200"> | 説明 |\n| --- | --- |';
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert multiple #ref in same table", () => {
        const input = "|#ref(image1.png)|#ref(image2.png)|h";
        const expected =
          "| ![image1.png](テスト_attachment_image1.png) | ![image2.png](テスト_attachment_image2.png) |\n| --- | --- |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert #ref with quoted filename containing comma", () => {
        const input = '|#ref("file, name.png")|データ|';
        const expected =
          "|  |  |\n| --- | --- |\n| ![file, name.png](テスト_attachment_file%2C%20name.png) | データ |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle #ref with other page attachment", () => {
        const input = "|#ref(OtherPage/diagram.png)|説明|h";
        const expected =
          "| ![diagram.png](OtherPage_attachment_diagram.png) | 説明 |\n| --- | --- |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert #ref combined with BOLD formatting", () => {
        const input = "|BOLD:#ref(image.png)|通常|h";
        const expected =
          "| **![image.png](テスト_attachment_image.png)** | 通常 |\n| --- | --- |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should handle inline &ref alongside block #ref", () => {
        const input = "|#ref(block.png)|&ref(inline.png);|h";
        const expected =
          "| ![block.png](テスト_attachment_block.png) | ![inline.png](テスト_attachment_inline.png) |\n| --- | --- |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should not convert #ref in cell with text before (not a block plugin)", () => {
        const input = "|説明: #ref(image.png)|データ|";
        const expected =
          "|  |  |\n| --- | --- |\n| 説明: #ref(image.png) | データ |";
        expect(convertToMarkdown(input, "テスト")).toBe(expected);
      });

      it("should convert #ref and ignore text after closing parenthesis", () => {
        const input = "|#ref(image.png) 図1|データ|";
        const expected =
          "|  |  |\n| --- | --- |\n| ![image.png](テスト_attachment_image.png) | データ |";
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

    it("should preserve trailing newline", () => {
      const input = "*見出し\n";
      const expected = "# 見出し\n";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should preserve trailing newline with multiple lines", () => {
      const input = "*見出し\nテキスト\n";
      const expected = "# 見出し\nテキスト\n";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle input without trailing newline", () => {
      const input = "*見出し";
      const expected = "# 見出し";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle multiple lines without trailing newline", () => {
      const input = "*見出し\nテキスト";
      const expected = "# 見出し\nテキスト";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should preserve multiple trailing newlines", () => {
      const input = "*見出し\nテキスト\n\n";
      const expected = "# 見出し\nテキスト\n\n";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should preserve many trailing newlines", () => {
      const input = "*見出し\n\n\n\n";
      const expected = "# 見出し\n\n\n\n";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });
  });

  describe("stripComments option", () => {
    it("should remove PukiWiki comment lines when stripComments is true", () => {
      const input = "//コメント\nテキスト\n// TODO: fix";
      const expected = "テキスト";
      expect(convertToMarkdown(input, "テスト", { stripComments: true })).toBe(
        expected,
      );
    });

    it("should preserve PukiWiki comment lines when stripComments is false", () => {
      const input = "//コメント\nテキスト";
      const expected = "<!-- コメント -->\nテキスト";
      expect(convertToMarkdown(input, "テスト", { stripComments: false })).toBe(
        expected,
      );
    });

    it("should remove block plugin comments when stripComments is true", () => {
      const input = "#contents\nテキスト\n#comment";
      const expected = "テキスト";
      expect(convertToMarkdown(input, "テスト", { stripComments: true })).toBe(
        expected,
      );
    });

    it("should preserve block plugin comments when stripComments is false", () => {
      const input = "#contents\nテキスト";
      const expected = "<!-- #contents -->\nテキスト";
      expect(convertToMarkdown(input, "テスト", { stripComments: false })).toBe(
        expected,
      );
    });

    it("should remove #vote comment but keep table when stripComments is true", () => {
      const input = "#vote(選択肢1[5],選択肢2[10])";
      const result = convertToMarkdown(input, "テスト", {
        stripComments: true,
      });
      expect(result).not.toContain("<!-- #vote");
      expect(result).toContain("| 選択肢 | 投票数 |");
      expect(result).toContain("| 選択肢1 | 5 |");
      expect(result).toContain("| 選択肢2 | 10 |");
    });

    it("should preserve #vote comment and table when stripComments is false", () => {
      const input = "#vote(選択肢1[5],選択肢2[10])";
      const result = convertToMarkdown(input, "テスト", {
        stripComments: false,
      });
      expect(result).toContain("<!-- #vote(選択肢1[5],選択肢2[10]) -->");
      expect(result).toContain("| 選択肢 | 投票数 |");
    });

    it("should remove #include comment but keep link when stripComments is true", () => {
      const input = "#include(CommonHeader)";
      const result = convertToMarkdown(input, "テスト", {
        stripComments: true,
      });
      expect(result).not.toContain("<!-- #include");
      expect(result).toBe("[CommonHeader](CommonHeader.md)");
    });

    it("should preserve #include comment and link when stripComments is false", () => {
      const input = "#include(CommonHeader)";
      const result = convertToMarkdown(input, "テスト", {
        stripComments: false,
      });
      expect(result).toContain("<!-- #include(CommonHeader) -->");
      expect(result).toContain("[CommonHeader](CommonHeader.md)");
    });

    it("should remove BGCOLOR comments in tables when stripComments is true", () => {
      const input = "|BGCOLOR(yellow):テキスト|h";
      const result = convertToMarkdown(input, "テスト", {
        stripComments: true,
      });
      expect(result).not.toContain("BGCOLOR");
      expect(result).toContain("テキスト");
    });

    it("should preserve BGCOLOR comments in tables when stripComments is false", () => {
      const input = "|BGCOLOR(yellow):テキスト|h";
      const result = convertToMarkdown(input, "テスト", {
        stripComments: false,
      });
      expect(result).toContain("<!-- BGCOLOR(yellow) -->");
      expect(result).toContain("テキスト");
    });

    it("should handle mixed comments when stripComments is true", () => {
      const input =
        "//コメント\n#contents\nテキスト\n#vote(A[1],B[2])\n#include(Page)";
      const result = convertToMarkdown(input, "テスト", {
        stripComments: true,
      });
      expect(result).not.toContain("<!--");
      expect(result).toContain("テキスト");
      expect(result).toContain("| A | 1 |");
      expect(result).toContain("[Page](Page.md)");
    });

    it("should work with excludeBlockPlugins and stripComments together", () => {
      const input = "#myplugin\nテキスト";
      const result = convertToMarkdown(input, "テスト", {
        excludeBlockPlugins: ["myplugin"],
        stripComments: true,
      });
      // Custom plugin should be removed when stripComments is true
      expect(result).not.toContain("<!-- #myplugin");
      expect(result).not.toContain("#myplugin");
      expect(result).toContain("テキスト");
    });
  });

  describe("ls to lsx conversion", () => {
    describe("when convertLsToLsx is false (default)", () => {
      it("should convert #ls to HTML comment", () => {
        const input = "#ls";
        const result = convertToMarkdown(input, "テスト");
        expect(result).toBe("<!-- #ls -->");
      });

      it("should convert #ls() to HTML comment", () => {
        const input = "#ls()";
        const result = convertToMarkdown(input, "テスト");
        expect(result).toBe("<!-- #ls() -->");
      });

      it("should convert #ls(title) to HTML comment", () => {
        const input = "#ls(title)";
        const result = convertToMarkdown(input, "テスト");
        expect(result).toBe("<!-- #ls(title) -->");
      });
    });

    describe("when convertLsToLsx is true", () => {
      it("should convert #ls to $lsx(./)", () => {
        const input = "#ls";
        const result = convertToMarkdown(input, "テスト", {
          convertLsToLsx: true,
        });
        expect(result).toBe("$lsx(./)");
      });

      it("should convert #ls() to $lsx(./)", () => {
        const input = "#ls()";
        const result = convertToMarkdown(input, "テスト", {
          convertLsToLsx: true,
        });
        expect(result).toBe("$lsx(./)");
      });

      it("should convert #ls(title) with HTML comment", () => {
        const input = "#ls(title)";
        const result = convertToMarkdown(input, "テスト", {
          convertLsToLsx: true,
        });
        expect(result).toBe("<!-- #ls(title) -->\n$lsx(./)");
      });

      it("should not add HTML comment when stripComments is true", () => {
        const input = "#ls(title)";
        const result = convertToMarkdown(input, "テスト", {
          convertLsToLsx: true,
          stripComments: true,
        });
        expect(result).not.toContain("<!--");
        expect(result).toBe("$lsx(./)");
      });

      it("should handle case-insensitive #LS", () => {
        const input = "#LS()";
        const result = convertToMarkdown(input, "テスト", {
          convertLsToLsx: true,
        });
        expect(result).toBe("$lsx(./)");
      });

      it("should handle case-insensitive TITLE option", () => {
        const input = "#ls(TITLE)";
        const result = convertToMarkdown(input, "テスト", {
          convertLsToLsx: true,
        });
        expect(result).toBe("<!-- #ls(TITLE) -->\n$lsx(./)");
      });

      it("should convert #ls from nested page", () => {
        const input = "#ls";
        const result = convertToMarkdown(input, "Project/Task", {
          convertLsToLsx: true,
        });
        // #ls always lists children of current page
        expect(result).toBe("$lsx(./)");
      });

      it("should not match #ls2 when processing #ls", () => {
        const input = "#ls2(Project)";
        const result = convertToMarkdown(input, "テスト", {
          convertLsToLsx: true,
        });
        // Should be processed by ls2 converter, not ls converter
        expect(result).toContain("Project");
      });
    });
  });

  describe("ls2 to lsx conversion", () => {
    describe("when convertLsToLsx is false (default)", () => {
      it("should convert #ls2 to HTML comment", () => {
        const input = "#ls2";
        const result = convertToMarkdown(input, "テスト");
        expect(result).toBe("<!-- #ls2 -->");
      });

      it("should convert #ls2() to HTML comment", () => {
        const input = "#ls2()";
        const result = convertToMarkdown(input, "テスト");
        expect(result).toBe("<!-- #ls2() -->");
      });

      it("should convert #ls2(pattern) to HTML comment", () => {
        const input = "#ls2(PageName)";
        const result = convertToMarkdown(input, "テスト");
        expect(result).toBe("<!-- #ls2(PageName) -->");
      });
    });

    describe("when convertLsToLsx is true", () => {
      it("should convert #ls2 to $lsx(./)", () => {
        const input = "#ls2";
        const result = convertToMarkdown(input, "テスト", {
          convertLsToLsx: true,
        });
        expect(result).toBe("$lsx(./)");
      });

      it("should convert #ls2() to $lsx(./)", () => {
        const input = "#ls2()";
        const result = convertToMarkdown(input, "テスト", {
          convertLsToLsx: true,
        });
        expect(result).toBe("$lsx(./)");
      });

      it("should convert #ls2(pattern) with child page to relative path", () => {
        const input = "#ls2(Project/Task/SubPage)";
        const result = convertToMarkdown(input, "Project/Task", {
          convertLsToLsx: true,
        });
        // Project/Task page is treated as directory "Project/Task/"
        // From "Project/Task/" to "Project/Task/SubPage/" is "./SubPage"
        expect(result).toBe("$lsx(./SubPage)");
      });

      it("should convert #ls2(pattern) with sibling page to relative path", () => {
        const input = "#ls2(Project/Other)";
        const result = convertToMarkdown(input, "Project/Task", {
          convertLsToLsx: true,
        });
        // Project/Task page is treated as directory "Project/Task/"
        // From "Project/Task/" to "Project/Other/" is "../Other"
        expect(result).toBe("$lsx(../Other)");
      });

      it("should convert #ls2(pattern) with parent directory to relative path", () => {
        const input = "#ls2(Project)";
        const result = convertToMarkdown(input, "Project/Task/SubTask", {
          convertLsToLsx: true,
        });
        // Project/Task/SubTask page is treated as directory "Project/Task/SubTask/"
        // From "Project/Task/SubTask/" to "Project/" is "../.."
        expect(result).toBe("$lsx(../..)");
      });

      it("should convert #ls2(pattern) from root page to relative path", () => {
        const input = "#ls2(Project/Task)";
        const result = convertToMarkdown(input, "TopPage", {
          convertLsToLsx: true,
        });
        // TopPage page is treated as directory "TopPage/"
        // From "TopPage/" to "Project/Task/" is "../Project/Task"
        expect(result).toBe("$lsx(../Project/Task)");
      });

      it("should convert #ls2 with reverse option", () => {
        const input = "#ls2(Project, reverse)";
        const result = convertToMarkdown(input, "TopPage", {
          convertLsToLsx: true,
        });
        // TopPage page is treated as directory "TopPage/"
        // From "TopPage/" to "Project/" is "../Project"
        expect(result).toBe("$lsx(../Project, reverse=true)");
      });

      it("should convert #ls2 with reverse option and no pattern", () => {
        const input = "#ls2(reverse)";
        const result = convertToMarkdown(input, "TopPage", {
          convertLsToLsx: true,
        });
        expect(result).toBe("$lsx(./, reverse=true)");
      });

      it("should preserve unsupported options as HTML comment", () => {
        const input = "#ls2(Project, title)";
        const result = convertToMarkdown(input, "TopPage", {
          convertLsToLsx: true,
        });
        expect(result).toBe("<!-- #ls2(Project, title) -->\n$lsx(../Project)");
      });

      it("should preserve multiple unsupported options as HTML comment", () => {
        const input = "#ls2(Project, title, include, compact)";
        const result = convertToMarkdown(input, "TopPage", {
          convertLsToLsx: true,
        });
        expect(result).toBe(
          "<!-- #ls2(Project, title, include, compact) -->\n$lsx(../Project)",
        );
      });

      it("should convert mixed supported and unsupported options", () => {
        const input = "#ls2(Project, reverse, title)";
        const result = convertToMarkdown(input, "TopPage", {
          convertLsToLsx: true,
        });
        expect(result).toBe(
          "<!-- #ls2(Project, reverse, title) -->\n$lsx(../Project, reverse=true)",
        );
      });

      it("should not add HTML comment when stripComments is true", () => {
        const input = "#ls2(Project, title)";
        const result = convertToMarkdown(input, "TopPage", {
          convertLsToLsx: true,
          stripComments: true,
        });
        expect(result).not.toContain("<!--");
        expect(result).toBe("$lsx(../Project)");
      });

      it("should handle link option as unsupported", () => {
        const input = "#ls2(Project, link)";
        const result = convertToMarkdown(input, "TopPage", {
          convertLsToLsx: true,
        });
        expect(result).toBe("<!-- #ls2(Project, link) -->\n$lsx(../Project)");
      });

      it("should handle case-insensitive option matching", () => {
        const input = "#ls2(Project, REVERSE)";
        const result = convertToMarkdown(input, "TopPage", {
          convertLsToLsx: true,
        });
        expect(result).toBe("$lsx(../Project, reverse=true)");
      });

      it("should handle case-insensitive #LS2", () => {
        const input = "#LS2(Project)";
        const result = convertToMarkdown(input, "TopPage", {
          convertLsToLsx: true,
        });
        expect(result).toBe("$lsx(../Project)");
      });

      it("should normalize backslashes to forward slashes in path", () => {
        const input = "#ls2(Project\\Task)";
        const result = convertToMarkdown(input, "TopPage", {
          convertLsToLsx: true,
        });
        // On Windows, path might contain backslashes, but we normalize them
        expect(result).toMatch(/\$lsx\(\.\.\/Project\/Task\)/);
      });

      it("should convert A/B page with pattern C to ../../C", () => {
        const input = "#ls2(C)";
        const result = convertToMarkdown(input, "A/B", {
          convertLsToLsx: true,
        });
        // A/B page is treated as directory "A/B/"
        // From "A/B/" to "C/" is "../../C"
        expect(result).toBe("$lsx(../../C)");
      });
    });
  });
});
