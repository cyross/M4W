$(document).ready(function(){
  // アセットロード終了時の処理
  var on_ready = function(assets){
    var pattern = 0;
    var cnt = 0;
    var wait = 10;
    var num = 10;
    var angle = 0;
    var base_angle = 10;
    var angle_pats = 360 / base_angle;

    // 画像を取得
    var img = assets.image.s01;

    // スプライトを作成
    var sprites1 = [];
    var sprites2 = [];
    for(var i=0; i<num; i++){
      var scx = (i%2==0?1.0:2.0);
      var scy = (i%2==0?1.0:0.5);
      // 拡大縮小用スプライト
      sprites1.push(new SpriteEx({
          value: img,
          sh: 64,
          dh: 64,
          x: i*64,
          y: i*16,
          a: (i%2==0?0.5:1.0),
          scx: scx,
          scy: scy,
          tx: 32,
          ty: 32
         }));
      // 回転用スプライト
      sprites2.push(new SpriteEx({
          value: img,
          sh: 64,
          dh: 64,
          x: i*64,
          y: 240+i*16,
          a: (i%2==0?0.5:1.0),
          tx: 32,
          ty: 32
         }));
    }

    sprites1.render = function(ctx){
      for(var i=0; i<sprites1.length; i++){
        sprites1[i].render(ctx);
      }
    };

    sprites2.render = function(ctx){
        for(var i=0; i<sprites2.length; i++){
          sprites2[i].render(ctx);
        }
      };

    // メインロジック
    var main_logic = function(){
      cnt++;
      if(cnt == wait){
        pattern = (pattern + 1) % 4;
        for(var i=0; i<num; i++){
          // パターンの変更
          window.m4w.screen.sprites[0][i].sy = pattern * 64;
          window.m4w.screen.sprites[1][i].sy = pattern * 64;

          // 画像の回転
          // 15度単位で回転
          angle = (angle + 1) % angle_pats;
          if(i%2!=0){
            sprites2[i].r = (angle * base_angle / 180) * Math.PI;
          }
        }
        cnt = 0;
      }
    };

    window.m4w.screen.sprites[0] = sprites1; // わざとインデックスを付けて登録
    window.m4w.screen.sprites[1] = sprites2; // わざとインデックスを付けて登録
    window.m4w.main_logic = main_logic;
  };

  // M4Wの初期化
  var body = $("#game");
  body.m4w();

  // アセットのロード
  AssetsLoader.load({
    assets: [
      {type: "image", id: "s01", src:"img/sample.png"}, // 今回は複数のスプライトを用意するため、画像のみ取得
    ],
    success: on_ready
  });

  // メインループの開始
  window.m4w.main_loop();
});
