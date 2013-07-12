$(document).ready(function(){
  var _m4w = window.m4w;
  var $body = $("#game");
  var screen_w = 640;
  var screen_h = 480;
  var img_w = 32;
  var img_h = 32;
  var fov = 10;
  var z = _m4w.WebGL.z_from_fov(fov, screen_h);

  // M4Wの初期化
  // WebGLを使うため、コンテキストを取得しない
  $body.m4w({screen_options: _m4w.WebGL.screen_options});

  // WebGLオブジェクトの生成
  // 今回はz軸のみなのでOrthographicでOK
  var webgl = new _m4w.WebGL($body, _m4w.screen, screen_w, screen_h, {fov: fov, z: z});

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
    // 回転角度
    var degrees = [];
    var imglen = imgs.length;
    var i = 0;
    var bx = -((screen_w-img_w)/2);
    var by = -((screen_h-img_h)/2);
    var br = bx + screen_w - img_w;
    var bb = by + screen_h - img_h;
    var o = {scene: webgl.scene, dw: img_w, dh: img_h, gw: img_w, gh: img_h};
    for(var y=0; y<sprites_h; y++){
      sprites[y] = [];
      degrees[y] = [];
      for(var x=0; x<sprites_w; x++){
        var img = imgs[i];
        var sprite = new _m4w.WebGLSprite($.extend({id: img.id, value: img}, o));
        sprite.move({x: bx+x*img_w, y: by+y*img_h});
        sprites[y][x] = sprite;
        var axis = (Math.random() * 3) | 0;
        var d = ((Math.random() * 90) / 30) * 30 | 0;
        switch(axis){
          case 0: // x軸で回転
            degrees[y][x] = new THREE.Vector3(d, 0, 0);
            break;
          case 1: // y軸で回転
            degrees[y][x] = new THREE.Vector3(0, d, 0);
            break;
          case 2: // z軸で回転
            degrees[y][x] = new THREE.Vector3(0, 0, d);
            break;
        }
        i = (i+1) % imglen;
      }
    }

    // メインロジック
    var main_logic = function(){
      webgl.render();
      for(var y=0; y<sprites_h; y++){
        var sprite2 = sprites[y];
        var degree2 = degrees[y];
        for(var x=0; x<sprites_w; x++){
          sprite2[x].rotatev(degree2[x]);
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
