// メートル/ピクセルの換算比率
var SCALE = 1/30;

// ２次元配列の作成
function createVector(x, y){
  return new Box2D.Common.Math.b2Vec2(x, y);
}

// 物理世界の生成
function createPhysicsWorld(grav_x, grav_y){
  return new Box2D.Dynamics.b2World(createVector(grav_x, grav_y), true);
}

// 剛体定義の生成
function createPhysicsBodyDef(type, x, y, user_data){
  var body_def = new Box2D.Dynamics.b2BodyDef();

  // 動く剛体を指定
  body_def.type = type;
  // 初期位置を設定
  body_def.position.Set(x*SCALE, y*SCALE);
  // 同期データを設定
  body_def.userData = user_data;

  return body_def;
}

// フィクスチャ定義の生成
function createPhysicsFixtureDef(shape, density, friction, restitution){
  var fixture_def = new Box2D.Dynamics.b2FixtureDef();

  // コリジョンを設定
  fixture_def.shape = shape;
  // 密度を設定
  fixture_def.density = density;
  // 摩擦係数を設定
  fixture_def.friction = friction;
  // 弾性を設定
  fixture_def.restitution = restitution;

  return fixture_def;
}

// コリジョンの生成
function createPhysicsCollision(w, h){
  var shape = new Box2D.Collision.Shapes.b2PolygonShape();

  // コリジョンの大きさを設定
  shape.SetAsBox(w*SCALE, h*SCALE);

  return shape;
}

//剛体の生成
function createPhysicsBody(world, body_def, fixture_def){
  var body = world.CreateBody(body_def);

  // 剛体にフィクスチャ定義を設定
  body.CreateFixture(fixture_def);

  return body;
}

$(document).ready(function(){
  // アセットロード終了時の処理
  var on_ready = function(assets){
    // アニメーション関係
    var wait = 4;
    var cnt = 0;
    var pattern = 0;

    // 物理シミュレーション関係
    var physics_time = 1/60;
    var velocity_iterations = 10;
    var position_iterations = 10;

    // スプライト初期位置(メートル)
    var sprite_pos = {x: 32, y: 64};

    // 床初期位置(メートル)
    var floor_pos = {x: 0, y: 400};

    // 画像
    var img = assets.image.s01;

    // スプライトの幅・高さ
    var img_w = 64;
    var img_h = 64;

    // 床の幅・高さ
    var floor_w = 640;
    var floor_h = 16;

    // スプライトを作成
    var sprite = new SpriteEx({
      value: img,
      sh: img_w,
      dh: img_h,
      x: 0,
      y: 0,
      a: 1.0,
      scx: 1.0,
      scy: 1.0,
      ty: 32 // 画像の高さが違うため、tyを指定
    });

    // 物理世界を生成
    var world = createPhysicsWorld(0, 9.8);
    // スプライト用
    // 剛体定義を生成
    var body_def = createPhysicsBodyDef(
      Box2D.Dynamics.b2Body.b2_dynamicBody, // 動く剛体
      sprite_pos.x, sprite_pos.y, // 初期位置
      sprite // 同期データ
    );
    // コリジョンを生成
    var shape = createPhysicsCollision(img_w, img_h);
    // フィクスチャ定義を生成
    var fixture_def = createPhysicsFixtureDef(shape, 1.0, 0.5, 0.5);
    // 剛体を生成
    var sbody = createPhysicsBody(world, body_def, fixture_def);
    // 移動方向を指定
    sbody.SetLinearVelocity(createVector(4,0));

    // 地面用
    // 剛体定義を生成
    var body_def = createPhysicsBodyDef(
      Box2D.Dynamics.b2Body.b2_staticBody, // 停止した剛体
      floor_pos.x, floor_pos.y, // 初期位置
      null // 同期データ
    );
    // コリジョンを生成
    var shape = createPhysicsCollision(floor_w, floor_h);
    // フィクスチャ定義を生成
    var fixture_def = createPhysicsFixtureDef(shape, 1.0, 0.5, 0.0);
    // 剛体を生成
    createPhysicsBody(world, body_def, fixture_def);

    // メインロジック
    var main_logic = function(){
      world.Step(physics_time, velocity_iterations, position_iterations);

      var body = world.GetBodyList();
      while(body != null){
        var sprite = body.GetUserData();
        if(sprite){
          var pos = body.GetPosition();
          sprite.move({x: pos.x/SCALE, y:pos.y/SCALE});
          sprite.r = body.GetAngle();
        }
        body = body.GetNext();
      }

      cnt++;
      if(cnt == wait){
        pattern = (pattern + 1) % 4;
        // パターンの変更
        window.m4w.screen.sprites[0].sy = pattern * 64;
        cnt = 0;
      }
    };

    window.m4w.screen.sprites[0] = sprite; // わざとインデックスを付けて登録
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
