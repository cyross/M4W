$(document).ready(function(){
  // アセットロード終了時の処理
  var on_ready = function(assets){
    // m4w実行対象のdivタグ
    var $area = $("div#game");

    // メインロジック
    var main_logic = function(){
      // 今回は何もしない
    };

    // スプライトの大きさ
    var img_w = assets.sprite.s01.image.width;
    var img_h = assets.sprite.s01.image.height;

    // 座標の更新
    var update_pos = function(e){

      e.preventDefault();

      var pos = window.m4w.Input.get_xy(this, e);
      var l = img_w / 2;
      var t = img_h / 2;
      var x = pos[0] - l;
      var y = pos[1] - t;
      var w = 640 - window.m4w.screen.sprites[0].image.width;
      var h = 480 - window.m4w.screen.sprites[0].image.height;

      // 画像がはみ出ないように調整
      if(x < l){ x = 0; }
      if(y < t){ y = 0; }
      if(x > w){ x = w; }
      if(y > h){ y = h; }
      window.m4w.input_vars.gameX = x;
      window.m4w.input_vars.gameY = y;
    }.bind($area);

    // 座標の設定
    var update_sprite = function(e){
      window.m4w.screen.sprites[0].move({
        x:window.m4w.input_vars.gameX,
        y:window.m4w.input_vars.gameY
      });
    };

    window.m4w.screen.sprites[0] = assets.sprite.s01; // わざとインデックスを付けて登録
    window.m4w.main_logic = main_logic;
    window.m4w.input_vars.pushed = false;

    // マウスのボタンを押した時、移動を開始
    $area.on("mousedown touchstart", function(e){
      e.preventDefault();

      // 右ボタンを押したときは対象外
      if(e.button == 2){ return; }

      // 画像の移動を許可
      window.m4w.input_vars.pushed = true;

      // マウスカーソルの非表示化
      this.css("cursor", "url('img/empty_mouse_cursor.png')");

      // 画像の切り替え
      window.m4w.screen.sprites[0] = assets.sprite.s02;

      // 位置の更新
      update_pos(e);

      // スプライトの移動
      update_sprite(e);
    }.bind($area));

    // マウスカーソルが動いた時、位置を更新
    $area.on("mousemove touchmove", function(e){
      // ボタンを押していないときは何もしない
      if(!window.m4w.input_vars.pushed){ return; }

      e.preventDefault();

      // 位置の更新
      update_pos(e);

      // スプライトの移動
      update_sprite(e);
    }.bind($area));

    // マウスボタンを離した時と
    //、マウスカーソルが外に出た時は移動させない
    $area.on("mouseup mouseout touchend",   function(e){
      // ボタンを押していないときは何もしない
      if(!window.m4w.input_vars.pushed){ return; }

      // 画像の移動を禁止
      window.m4w.input_vars.pushed = false;

      // マウスカーソルをもとに戻す
      this.css("cursor", "auto");

      // 画像の切り替え
      window.m4w.screen.sprites[0] = assets.sprite.s01;

      // 現在の位置を切り替えたスプライトと共有
      update_sprite(e);

    }.bind($area));
  };

  // M4Wの初期化
  var body = $("#game");
  body.m4w();

  // アセットのロード
  AssetsLoader.load({
    assets: [
      {type: "sprite", id: "s01", src:"img/sampleimage.gif"}, // 通常の画像
      {type: "sprite", id: "s02", src:"img/sampleimage2.gif"} // 押下時の画像
    ],
    success: on_ready
  });

  // メインループの開始
  window.m4w.main_loop();
});
