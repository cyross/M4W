// キーの押下状態を表示(同時押し可能)
$(document).ready(function(){
  var _m4w = window.m4w;
  var $body = $("#game");
  var screen_w = 640;
  var screen_h = 480;

  // M4Wの初期化
  // WebGLを使うため、コンテキストを取得しない
  $body.m4w({screen_options: _m4w.WebGL.screen_options});

  // WebGLオブジェクトの生成
  var webgl = new _m4w.WebGL($body, _m4w.screen, screen_w, screen_h);

  // アセットロード終了時の処理
  var on_ready = function(assets){
    // 画像
    var img = assets.image.s01;
    // 移動距離
    var distance = 4;

    // スプライト
    var sprite = new _m4w.WebGLSprite({id: "s01", value: img, scene: webgl.scene});

    // メインロジック
    var main_logic = function(){
      if(_m4w.Input.key_states[0]){ // 8キー
        sprite.move({dy: distance});
      }
      else if(_m4w.Input.key_states[3]){ // 2キー
        sprite.move({dy: -distance});
      }
      if(_m4w.Input.key_states[1]){ // 6キー
        sprite.move({dx: distance});
      }
      else if(_m4w.Input.key_states[2]){ // 4キー
        sprite.move({dx: -distance});
      }
      webgl.render();
    };

    // [8キー, 6キー, 4キー, 2キー, zキー, xキー]
    _m4w.Input.init_key_status([[56,104],[54,102],[52,100],[50,98],90,88]);

    _m4w.Input.start_key_monitoring();

    _m4w.main_logic = main_logic;
  };

  // アセットのロード
  AssetsLoader.load({
    assets: [
      {type: "image", id: "s01", src:"img/sample.png"}, // 今回は複数のスプライトを用意するため、画像のみ取得
    ],
    success: on_ready
  });

  // メインループの開始
  _m4w.main_loop();
});
