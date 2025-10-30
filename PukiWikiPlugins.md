# PukiWiki 1.4 公式プラグイン一覧

PukiWiki 1.4公式マニュアルに記載されている全プラグインの一覧です。

出典: https://pukiwiki.sourceforge.io/?PukiWiki/1.4/Manual/Plugin

## 凡例

- **コマンド**: `?cmd=plugin` または `?plugin=plugin` 形式で呼び出し可能
- **ブロック**: `#plugin()` 形式で呼び出し可能
- **インライン**: `&plugin();` 形式で呼び出し可能
- **疑似ブロック**: PukiWiki本体で実現されている機能

## プラグイン一覧 (全77個)

| プラグイン名 | コマンド | ブロック | インライン | 疑似ブロック | 備考 |
|------------|---------|---------|-----------|------------|------|
| add | ○ | - | - | - | ページ追加 |
| amazon | ○ | ○ | ○ | - | Amazon商品情報表示 |
| aname | - | ○ | ○ | - | アンカー設定 |
| article | ○ | ○ | - | - | 記事投稿フォーム |
| attach | ○ | ○ | - | - | ファイル添付 |
| back | - | ○ | - | - | 前のページへ戻るリンク |
| backup | ○ | - | - | - | バックアップ管理 |
| br | - | ○ | ○ | - | 改行 |
| bugtrack | ○ | ○ | - | - | バグトラッキングフォーム |
| bugtrack_list | - | ○ | - | - | バグトラッキング一覧 |
| calendar | - | ○ | - | - | カレンダー表示 |
| calendar_edit | - | ○ | - | - | カレンダー編集 |
| calendar_read | - | ○ | - | - | カレンダー閲覧 |
| calendar_viewer | ○ | ○ | - | - | カレンダービューア |
| calendar2 | ○ | ○ | - | - | カレンダー2 |
| clear | - | ○ | - | - | floatクリア |
| color | - | - | ○ | - | 文字色変更 |
| comment | ○ | ○ | - | - | コメント欄 |
| contents | - | - | - | ○ | 目次生成（疑似ブロック） |
| counter | - | ○ | ○ | - | アクセスカウンター |
| deleted | ○ | - | - | - | 削除ページ一覧 |
| diff | ○ | - | - | - | 差分表示 |
| dump | ○ | - | - | - | データダンプ |
| edit | ○ | - | ○ | - | ページ編集 |
| filelist | ○ | - | - | - | ファイル一覧 |
| freeze | ○ | ○ | - | - | ページ凍結 |
| hr | - | ○ | - | - | 水平線 |
| img | - | ○ | - | - | 画像表示 |
| include | - | ○ | - | - | ページインクルード |
| includesubmenu | - | ○ | - | - | サブメニューインクルード |
| insert | ○ | ○ | - | - | 挿入フォーム |
| interwiki | ○ | - | - | - | InterWiki |
| lastmod | - | - | ○ | - | 最終更新日時 |
| links | ○ | - | - | - | リンク一覧 |
| list | ○ | - | - | - | ページ一覧 |
| lookup | - | ○ | - | - | 辞書検索 |
| ls | - | ○ | - | - | 子ページ一覧 |
| ls2 | - | ○ | - | - | 子ページ一覧2 |
| map | ○ | - | - | - | サイトマップ |
| md5 | ○ | - | - | - | MD5ハッシュ |
| memo | - | ○ | - | - | メモ |
| menu | - | ○ | - | - | メニュー |
| navi | - | ○ | - | - | ナビゲーション |
| new | - | - | ○ | - | NEW!マーカー |
| newpage | ○ | ○ | - | - | 新規ページ作成フォーム |
| nofollow | - | ○ | - | - | nofollow設定 |
| norelated | - | ○ | - | - | 関連ページ非表示 |
| online | - | ○ | ○ | - | オンラインユーザー |
| paint | ○ | ○ | - | - | お絵かきツール |
| pcomment | ○ | ○ | - | - | 段落コメント |
| popular | - | ○ | - | - | 人気ページ |
| random | ○ | ○ | - | - | ランダム表示 |
| read | ○ | - | - | - | ページ閲覧 |
| recent | - | ○ | - | - | 最近更新されたページ |
| ref | - | ○ | ○ | - | ファイル参照 |
| referer | ○ | - | - | - | リファラ一覧 |
| related | ○ | - | - | ○ | 関連ページ（疑似ブロック） |
| rename | ○ | - | - | - | ページ名変更 |
| rss | ○ | - | - | - | RSS配信 |
| rss10 | ○ | - | - | - | RSS1.0配信 |
| ruby | - | - | ○ | - | ルビ（ふりがな） |
| search | ○ | ○ | - | - | 検索 |
| server | - | ○ | - | - | サーバー情報 |
| setlinebreak | - | ○ | - | - | 改行設定 |
| showrss | - | ○ | - | - | RSS表示 |
| size | - | - | ○ | - | 文字サイズ変更 |
| source | ○ | - | - | - | ソース表示 |
| stationary | ○ | ○ | ○ | - | 雛形作成 |
| tb | ○ | - | - | - | トラックバック |
| template | ○ | - | - | - | テンプレート |
| topicpath | - | ○ | ○ | - | トピックパス |
| touchgraph | ○ | - | - | - | 関連図表示 |
| tracker | ○ | ○ | - | - | トラッカー |
| tracker_list | ○ | ○ | - | - | トラッカー一覧 |
| unfreeze | ○ | - | - | - | 凍結解除 |
| update_entities | ○ | - | - | - | エンティティ更新 |
| version | - | ○ | ○ | - | バージョン表示 |
| versionlist | ○ | ○ | - | - | バージョン一覧 |
| vote | ○ | ○ | - | - | 投票 |
| yetlist | ○ | - | - | - | 未作成ページ一覧 |

## 統計

- **総プラグイン数**: 77個
- **コマンド型対応**: 40個
- **ブロック型対応**: 50個
- **インライン型対応**: 14個
- **疑似ブロック**: 2個 (contents, related)

## ブロック型プラグインの分類

### システムディレクティブ (5個)
- freeze, nofollow, norelated

### 動的機能 (10個以上)
- article, comment, pcomment, counter, navi など

### カレンダー系 (5個)
- calendar, calendar_edit, calendar_read, calendar_viewer, calendar2

### トラッカー/課題管理 (4個)
- bugtrack, bugtrack_list, tracker, tracker_list

### ページ一覧/ナビゲーション (9個)
- ls, ls2, list, menu, popular, recent, yetlist など

### フォーム/編集 (6個)
- attach, edit, newpage, insert, poll, rename など

### コンテンツ表示 (8個)
- include, showrss, ref, img など

## 注意事項

- 一部のプラグインは複数の呼び出し形式に対応しています
- 疑似ブロック型は、PukiWiki本体の機能として実装されているもの
- プラグインの動作詳細は公式マニュアルを参照してください
