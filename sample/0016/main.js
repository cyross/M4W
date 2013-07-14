var setup_sprite_inner = function(img, x, y){
  return new m4w.Sprite({
    value: img,
    x: x,
    y: y
  });
}

var setup_static_body_inner = function(physics, screen, list, img, x, y, w, h, static_common){
  var sprite = setup_sprite_inner(img, x, y);
  var options = {user_data: sprite, x: x, y: y, w: w, h: h};
  var body = new m4w.StaticBody(physics, $.extend(options, static_common));

  screen.sprites.push(sprite);
  list.push(body);

  return list;
}

$(document).ready(function(){
  // 0: 何もない
  // 1: 壁
  // 2: 床
  var map_chips = [
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,2,2,2,2,2,0,0,0,2,2,2,2,2,2,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
  ];

  // アセットロード終了時の処理
  var on_ready = function(assets){
    var screen = window.m4w.screen;
    // 画面の大きさ
    var screen_w = 640;
    var screen_h = 480;

    // スプライト初期位置(ピクセル)
    var sprite_pos = {x: 10, y: 10};

    // マップチップの幅・高さ
    var img_w = 32;
    var img_h = 32;

    // ブロックの数
    var block_w = screen_w / img_w;
    var block_h = screen_h / img_h;

    // スプライトを作成
    var sprite = setup_sprite_inner(assets.image.s01, sprite_pos.x*img_w, sprite_pos.y*img_h);

    // スプライト更新時の処理を定義
    sprite.update = function(body){
      var pos = body.getPosition();
      this.move({x: pos.x/Physics.SCALE, y:pos.y/Physics.SCALE});

      // 画面をクリックした？
      if(touch_pos != null){
        var dx = touch_pos[0] - sprite.x;
        var dy = touch_pos[1] - sprite.y;
        // Sleepしているときは起こす
        body.body.SetAwake(true);
        // 移動方向を指定
        body.setLinearVelocity(Physics.createVector(dx*Physics.SCALE,dy*Physics.SCALE));
        touch_pos = null;
      }
    }.bind(sprite);
    screen.sprites[0] = sprite; // わざとインデックスを付けて登録

    // Physicsオブジェクトを生成
    var physics = new m4w.Physics({});
    // 剛体を生成
    var body = new m4w.DynamicBody(physics, {
      x:sprite_pos.x*img_w, y:sprite_pos.y*img_h,
      w:img_w, h:img_h,
      density:1.0, friction:0.5, restitution:0.5,
      user_data: sprite});
    // 移動方向を指定
    body.setLinearVelocity(m4w.Physics.createVector(4,0));

    // 剛体リストの作成
    var body_map = [];
    // 固定剛体共通のプロパティ
    var static_common = {density: 1.0, fricton: 0.5, restitution: 0.0, user_data: null};
    // マップチップ配列から剛体を生成
    for(var i=0, height=map_chips.length; i<height; i++){
      var mp = map_chips[i];
      var y = i * img_h;
      for(var j=0, width=mp.length; j<width; j++){
        var x = j*img_w;
        switch(mp[j]){
          case 1: // 壁
            setup_static_body_inner(physics, screen, body_map, assets.image.w01, x, y, img_w, img_h, static_common);
            break;
          case 2: // 床
            setup_static_body_inner(physics, screen, body_map, assets.image.f01, x, y, img_w, img_h, static_common);
            break;
        }
      }
    }

    // 画面をクリックした時の処理
    var touch_pos = null;
    var tmp_pos = [0,0];
    var can_touch = window.m4w.Input.can_touch() && !(Input.is_windows8());
    var $area = $("#game");
    if(can_touch){ Input.set_event_mode("touch"); }
    $area.on(Input.start_event_name(), function(ev){
      tmp_pos = window.m4w.Input.get_xy($area, ev);
    });
    $area.on(Input.move_event_name(), function(ev){
      tmp_pos = window.m4w.Input.get_xy($area, ev);
    });
    $area.on(Input.end_event_name(), function(ev){
      touch_pos = tmp_pos;
    });

    // メインロジック
    var main_logic = function(){
      physics.step();
      physics.update();
    };

    window.m4w.main_logic = main_logic;
  };

  // M4Wの初期化
  var body = $("#game");
  body.m4w();

  // アセットのロード
  AssetsLoader.load({
    assets: [
      {type: "image", id: "s01", src:"img/chara1.png"}, // 今回は複数のスプライトを用意するため、画像のみ取得
      {type: "image", id: "f01", src:"img/floor1.png"}, // 今回は複数のスプライトを用意するため、画像のみ取得
      {type: "image", id: "w01", src:"img/wall1.png"}, // 今回は複数のスプライトを用意するため、画像のみ取得
    ],
    success: on_ready
  });

  // メインループの開始
  window.m4w.main_loop();
});
