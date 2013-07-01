**Miyako for Web (M4W)**

version 0.0.1

2013.05.20 Cyross Makoto

# はじめに

本ソフトは、HTML5ベースのゲーム開発を支援するjQueryプラグインです。

# 必要環境

 1. Webサーバ
  * ApacheでもRuby on RailsでもSinatraでもnode.js...etc
  * もしくは、Phonegapなどの、HTML5/Javascriptを使用するハイブリッドアプリ開発ツール
  * 推奨:Ruby on Rails 3.1以降が動く環境
    できれば3.2以降
 2. jQuery
  * 1.9.0/2.0.0以降
  * jQuery UIなどはお好みで(名前が被らないように!)
 3. HTML、画像、CSSなどのファイル(おこのみで)

# ファイル構成

ダウンロードしたアーカイブファイルを展開すると、以下のファイル・ディレクトリが作成されます。

 * doc ドキュメントディレクトリ
 * sample サンプルディレクトリ
 * README.md 本ファイル
 * NEWS.txt 更新履歴
 * jquery.m4w.js M4W本体
 * jquery.m4w.sound.js M4Wを使用し、音声を扱うための拡張プラグイン
 * jquery.m4w.video.js M4Wを使用し、ビデオを再生するための拡張プラグイン
 * jquery.m4w.input.js M4Wを使用し、マウスカーソルの位置などの入力情報を扱うための拡張プラグイン
 * jquery.m4w.sprite_ex.js M4Wを使用し、強力なスプライトを扱うための拡張プラグイン

# 最低限の前準備(よくある方法)：
 1. HTMLファイルを作成する
 2. HTML内で、どこにm4wの情報を表示するか決める
 3. HTML上でjQuery-X.Y.Z.jsのロードを追加する(jQuery-X.Y.Z.min.jsでも可)
 4. HTML上でjQuery.m4w.jsのロードを追加する
 5. jQueryオブジェクトのm4wメソッドを呼び出す
   * 例1・bodyブロック内
       $("body").m4w();
   * 例2・divブロック内(id=area1)
       $("div#area1").m4w();

実際の例は以下

[index.html]

    <DOCTYPE HTML>
    <html>
      <head>
        <meta charset=utf-8>
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Miyako 4 Web sample 0001</title>
        <link rel="stylesheet" href="main.css" type="text/css" />
        <script type="text/javascript" src="jquery-2.0.0.js"></script>
        <script type="text/javascript" src="jquery.m4w.js"></script>
        <script type="text/javascript" src="main.js"></script>
      </head>
      <body>
        <h2>10秒後に止まります</h2>
        <p>ボタンをクリックすると、少しずつスプライトが下に移動します</p>
        <div id="message1"></div>
        <div id="message2"></div>
        <div id="game"></div>
        <div id="button1"></div>
      </body>
    </html>

[main.css]

    div#game {
      background: #008000;
      position: absolute;
      top: 192px;
      left: 0;
      width: 640;
      height: 480;
    }

    div#button1 {
      background-image: url('img/clickme.gif');
      width: 128;
      height: 48;
      position: absolute;
      top: 128px;
      left: 0;
    }

[main.js]

    $(document).ready(function(){
      // メインロジック
      var main_logic = function(){
        window.m4w.screen.sprites[1].move({dx:1,dy:0});
      };

      // アセットロード終了時の処理
      // ・メインロジックの登録
      // ・ボタン押下次の処理の追加
      var on_ready = function(assets){
        window.m4w.screen.sprites.push(assets.sprite.s01);
        window.m4w.main_logic = main_logic;
        $("#button1").on("click", function(){
          window.m4w.screen.sprites[1].move({dx:0,dy:4});
        });
      }

      // M4Wの初期化
      var body = $("#game");
      body.m4w();

      // タイマー・カウント表示をスプライトとして実装
      // (本来は、メインロジックに入れるべきだが、スプライトの応用例として実装)
      window.count = 0;
      body.m4w.screen.sprites.push({
        render: function(ctx){
          window.count++;
          $("#message2").html("Time: "+(new Date()).getTime() + "/ Count: " + window.count);
        }
      });

      // スタート時の時間を表示
      $("#message1").html("Time: "+(new Date()).getTime());
      // アセットのロード
      AssetsLoader.load({
        assets: [{type: "sprite", id: "s01", src:"img/sampleimage.gif"}],
        success: on_ready
      });

      // メインループの開始
      window.m4w.main_loop();

      // 10秒後にメインループを終了するように設定
      window.setTimeout(window.m4w.stop_main_loop, 10000);
    });

# リファレンスマニュアル

展開した時に同梱される doc ディレクトリをご参照ください
`docディレクトリのドキュメントは、「JsDoc Toolkit v2.4.0」を使用しています。`

# ラインセンス

本プログラムの使用・再配布に関してMIT Lisenceを適応します。

> The MIT License (MIT)
> Copyright (c) 2012-2013 Cyross Makoto
>
> Permission is hereby granted, free of charge, to any person obtaining a copy ofis software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# 免責事項

本ソフトウェアは、MITライセンスに準拠し、無保証とします。
本ソフトウェアを使用したことにより、いかなる問題が発生したとしても、作者であるサイロス誠には一切の責任を負いません。

# 謝辞

本ソフトウェアやサンプルを実装する上で、以下のサイトの情報を参考にさせて頂きました。
この場を借りて御礼申し上げます。

本ソフトウェアの描画ループ実装は、Kudox.jpさんのブログ記事を参考に致しました。

http://kudox.jp/html-css/html5-canvas-animation

本ソフトウェアのUA判別の一部は、うのらぼ。さんのブログ記事を参考に致しました。

http://unolabo.boo.jp/archives/2011/07/21-%E3%80%90iphoneandroid%E3%80%91%E3%82%BF%E3%83%83%E3%83%81%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%81%8B%E3%81%A9%E3%81%86%E3%81%8B%E5%88%A4%E5%AE%9A%E3%81%99%E3%82%8B.html

Inputのキー押下状態監視は、West in the Far Eastさんのブログ記事を参考に致しました。

018.Javascriptでキーの同時押しを制御する
https://sites.google.com/site/westinthefareast/home/game-parts/laser

同じく、押下状態監視の一部処理は、三等兵さんのブログ記事を参考に致しました。

通常の数値かどうかはisNaN関数じゃなくてisFinite関数
http://d.hatena.ne.jp/sandai/20100206/p1

サンプルのキーコードの判別は、Programming Magicさんのブログ記事を参考に致しました。

各ブラウザでキーコードを取得してみた【JavaScript】
http://www.programming-magic.com/20080205235859/
各ブラウザのキーコード表
http://www.programming-magic.com/file/20080205232140/keycode_table.html

サンプルに使用している画像の一部は、以下のボタン作成サイトを利用しています。

http://box.aflat.com/buttonmaker/

# 連絡先

もし、何かしらの質問や要望などがございましたら、下記のメールアドレスかTwitterアカウントに連絡をお願い致します。
また、感想などを添えていただけると嬉しいです。

cyross _at_ po _dot_ twin _dot_ ne _dot_ jp
http://d.hatena.ne.jp/cyross/
http://twitter.com/cyross
