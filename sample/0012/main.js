// キーの押下状態を表示(同時押し可能)
$(document).ready(function(){
  var _m4w = window.m4w;
  var $body = $("#game");
  var screen_w = 640;
  var screen_h = 480;
  var img_w = 32;
  var img_h = 32;

  // M4Wの初期化
  // WebGLを使うため、コンテキストを取得しない
  $body.m4w({screen_options: _m4w.WebGL.screen_options});

  // WebGLオブジェクトの生成
  var webgl = new _m4w.WebGLOrtho($body, _m4w.screen, screen_w, screen_h, {});

  // アセットロード終了時の処理
  var on_ready = function(assets){
    // 画像
    var imgs = [assets.image.s01, assets.image.s02, assets.image.s03];
    // 移動距離
    var distance = 4;
    // スプライトの数
    var sprites_w = screen_w / img_w;
    var sprites_h = screen_h / img_h;
    // スプライト
    var sprites = [];
    // 移動距離
    var distances = [];
    var imglen = imgs.length;
    var i = 0;
    var bx = -((screen_w-img_w)/2);
    var by = -((screen_h-img_h)/2);
    var br = bx + screen_w - img_w;
    var bb = by + screen_h - img_h;
    for(var y=0; y<sprites_h; y++){
      sprites[y] = [];
      distances[y] = [];
      for(var x=0; x<sprites_w; x++){
        var img = imgs[i];
        var sprite = new _m4w.WebGLSprite({id: img.id, value: img, scene: webgl.scene, gw: img_w, gh: img_h});
        sprite.move({x: bx+x*img_w, y: by+y*img_h});
        sprites[y][x] = sprite;
        distances[y][x] = {dx: Math.random()*8, dy: Math.random()*8};
        i = (i+1) % imglen;
      }
    }

    // メインロジック
    var main_logic = function(){
      webgl.render();
      for(var y=0; y<sprites_h; y++){
        var sprite2 = sprites[y];
        var distance2 = distances[y];
        for(var x=0; x<sprites_w; x++){
          var distance = distance2[x];
          var position = sprite2[x].mesh.position;
          sprite2[x].move(distance);
          if(position.x <= bx){ 
            position.x = bx
            distance.dx = -(distance.dx);
          }
          if(position.x >= br){
            position.x = br;
            distance.dx = -(distance.dx);
          }
          if(position.y <= by){
            position.y = by
            distance.dy = -(distance.dy);
          }
          if(position.y >= bb){
            position.y = bb;
            distance.dy = -(distance.dy);
          }
        }
      }
    };

    _m4w.main_logic = main_logic;
  };

  // アセットのロード
  AssetsLoader.load({
    assets: [
      {type: "image", id: "s01", src:"img/sample.png"},
      {type: "image", id: "s02", src:"img/sample2.png"},
      {type: "image", id: "s03", src:"img/sample3.png"}
    ],
    success: on_ready
  });

  // メインループの開始
  _m4w.main_loop();
});
