// キーの押下状態を表示(同時押し可能)
$(document).ready(function(){
  var _m4w = window.m4w;
  var $body = $("#game");
  var screen_w = 640;
  var screen_h = 480;

  // M4Wの初期化
  // WebGLを使うため、コンテキストを取得しない
  $body.m4w({screen_options: {get_context: false}});

  // カメラ
  var camera = new THREE.PerspectiveCamera(
    10,
    screen_w / screen_h,
    1,
    10000
  );

  // シーン
  var scene = new THREE.Scene();

  // レンダラ
  var renderer = new THREE.WebGLRenderer({
    canvas: _m4w.screen.layer[0], // レイヤ(canvasタグ)を指定する
    antialias: true, // アンチエイリアス有効
    preserveDrawingBuffer: true,
  });

  // アセットロード終了時の処理
  var on_ready = function(assets){
    // 画像
    var img = assets.image.s01;
    // 移動距離
    var distance = 4;

    // テクスチャ
    var texture = new THREE.Texture(img, new THREE.UVMapping());
    texture.needsUpdate = true;
    texture.sourceFile = img.src;

    // マテリアル
    var material = new THREE.MeshBasicMaterial({map: texture});

    // ジオメトリ
    var plane_geometry = new THREE.PlaneGeometry(200, 200, 4, 4);

    // メッシュ
    var mesh = new THREE.Mesh(plane_geometry, material);

    // メインロジック
    var main_logic = function(){
      if(_m4w.Input.key_states[0]){ // 8キー
        mesh.position.y += distance;
      }
      else if(_m4w.Input.key_states[3]){ // 2キー
        mesh.position.y -= distance;
      }
      if(_m4w.Input.key_states[1]){ // 6キー
        mesh.position.x += distance;
      }
      else if(_m4w.Input.key_states[2]){ // 4キー
        mesh.position.x -= distance;
      }
      renderer.render(scene, camera);
    };

    scene.add(mesh);

    // [8キー, 6キー, 4キー, 2キー, zキー, xキー]
    _m4w.Input.init_key_status([[56,104],[54,102],[52,100],[50,98],90,88]);

    _m4w.Input.start_key_monitoring();

    _m4w.main_logic = main_logic;
  };

  camera.position.z = 4000;

  scene.add(camera);

  renderer.setSize(screen_w, screen_h);
  $body.append(renderer.domElement);

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
