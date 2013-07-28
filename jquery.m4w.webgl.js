/**
 * @fileOverview Miyako4Web(Miyako for Web a.k.a M4W/m4w) WebGL Extension(needs three.js)<br>
 * M4W用WebGL対応拡張プラグイン(要three.js)
 * このファイルを読み込むと、window.m4wオブジェクトに以下のプロパティが追加される<br>
 * window.m4w.WebGLRenderer<br>
 * window.m4w.WebGLSpriteRenderer<br>
 * window.m4w.WebGLSprite<br>
 *
 * @name Miyako for Web(M4W) WebGL extention
 * @author Cyross Makoto (サイロス誠)
 * @version 0.0.1
 * @revision 1
 * @require jQuery 1.9.0/2.0.0(or later)
 * @license MIT License (MITライセンス)
 */

(function($){
  /**
   * @constructor
   * @class スプライトを管理・操作
   * @param options.id スプライトに一意に一位につけられるID<br>省略時はvalue属性(Imageオブジェクト)のidプロパティ
   * @param options.value スプライトの元にするImageクラス(Javascript標準クラス)のオブジェクト
   * @param options.scene スプライトを追加するシーンオブジェクト
   * @param [options.x] ブロックの左端から右方向の位置(左端を0とする)<br>省略時は0
   * @param [options.y] ブロックの左端から右方向の位置(左端を0とする)<br>省略時は0
   * @param [options.gw] ジオメトリの幅<br>省略時はWebGLSprite.swと同じ値
   * @param [options.gh] ジオメトリの高さ<br>省略時はWebGLSprite.shと同じ値
   * @param [options.alphaTest] アルファテストのしきい値<br>省略時は0.5
   */
  WebGLSprite = function(options){
    var o = $.extend({
      id: options.value.id,
      x:0, y:0,
      gw:options.value.width, gh:options.value.height,
      alphaTest: 0.5 }, options);
    this.id = o.id;
    this.image = o.value;
    /** @property テクスチャ */
    this.texture = new THREE.Texture(this.image, new THREE.UVMapping());
    this.texture.needsUpdate = true;
    this.texture.sourceFile = this.image.src;

    /** @property マテリアル */
    this.material = new THREE.MeshBasicMaterial({map: this.texture, alphaTest: o.alphaTest});

    /** @property ジオメトリ */
    this.geometry = new THREE.PlaneGeometry(o.gw, o.gh, 4, 4);

    /** @property メッシュ */
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    o.scene.add(this.mesh);

    /** @property 位置情報<br>ブロックの左端から右方向の位置(中心を0とする) */
    this.position = this.mesh.position;

    /** @property クオータニオン */
    this.quaternion = this.mesh.quaternion;
    this.mesh.useQuaternion = true;
    this.tmp_quaternion = new THREE.Quaternion();

    this.position.x = o.x;
    this.position.y = o.y;
  };

  /**
   * スプライトを移動させる<br>座標は、ブロックの中心が(0,0)で、値がプラスだと右・上方向、マイナスだと左・下方向となる
   * @param [options.x] 中心を0とした時の右方向の位置<br>省略時は現在位置
   * @param [options.y] 中心を0とした時の下方向の位置<br>省略時は現在位置
   * @param [options.z] 中心を0とした時の手前方向の位置<br>省略時は現在位置
   * @param [options.dx] 右方向をプラスとした時の移動量<br>省略時は0
   * @param [options.dy] 上方向をプラスとした時の移動量<br>省略時は0
   * @param [options.dz] 手前方向を0とした時の移動量<br>省略時は0
   */
  WebGLSprite.prototype.move = function(options){
    var o = $.extend({x: this.position.x, y: this.position.y, z: this.position.z, dx: 0, dy: 0, dz: 0}, options);
    this.position.x = o.x + o.dx;
    this.position.y = o.y + o.dy;
    this.position.z = o.z + o.dz;
  };

  /**
   * スプライトを回転させる<br>回転の中心は画像の中心<br>x,y,zの単位は度数(ラジアンではない)
   * @param x x軸方向の回転角度
   * @param y y軸方向の回転角度
   * @param z z軸方向の回転角度
   */
  WebGLSprite.prototype.rotate = function(x, y, z){
    this.tmp_quaternion.setFromEuler(new THREE.Vector3(x, y, z));
    this.quaternion.multiply(this.tmp_quaternion);
  };

  /**
   * ベクトルを渡してスプライトを回転させる<br>回転の中心は画像の中心<br>x,y,zの単位は度数(ラジアンではない)
   * @param vector THREE.Vector3クラスのベクトル。x,y,zはx軸・y軸・z軸それぞれの回転角度
   */
  WebGLSprite.prototype.rotatev = function(vector){
    this.tmp_quaternion.setFromEuler(vector);
    this.quaternion.multiply(this.tmp_quaternion);
  };

  var construct_inner = function(obj, $body, screen, screen_w, screen_h, options){
    // シーン
    obj.scene = new THREE.Scene();

    // レンダラ
    obj.renderer = new THREE.WebGLRenderer({
      canvas: screen.layer[0], // レイヤ(canvasタグ)を指定する
      antialias: true, // アンチエイリアス有効
      preserveDrawingBuffer: true
    });
    obj.renderer.setSize(screen_w, screen_h);

    obj.camera.position.z = options.z;

    obj.scene.add(obj.camera);

    $body.append(obj.renderer.domElement);
  }

  WebGL = function($body, screen, screen_w, screen_h, options){
    var _m4w = window.m4w;
    var o = $.extend({
      fov: 10,
      near: 1,
      far: 10000,
      z: 10000
    }, options);

    // カメラ
    this.camera = new THREE.PerspectiveCamera(
      o.fov,
      screen_w / screen_h,
      o.near,
      o.far
    );

    construct_inner(this, $body, screen, screen_w, screen_h, o);
  };

  WebGL.screen_options = {get_context: false};

  WebGL.z_from_fov = function(fov, screen_h){
    return screen_h / Math.tan(fov * Math.PI / 180.0) - 1;
  }

  WebGL.prototype.render = function(context){
    this.renderer.render(this.scene, this.camera);
  }

  WebGLOrtho = function($body, screen, screen_w, screen_h, options){
    var _m4w = window.m4w;
    var o = $.extend({
      near: 1,
      far: 10000,
      z: 1
    }, options);

    // カメラ
    this.camera = new THREE.OrthographicCamera(
      screen_w / -2,
      screen_w / 2,
      screen_h / 2,
      screen_h / -2,
      o.near,
      o.far
    );

    construct_inner(this, $body, screen, screen_w, screen_h, o);
  }

  WebGLOrtho.screen_options = WebGL.screen_options;

  WebGLOrtho.z_from_fov = WebGL.z_from_fov;

  WebGLOrtho.prototype.render = function(context){
    this.renderer.render(this.scene, this.camera);
  }


  window.m4w = $.extend({WebGL: WebGL, WebGLOrtho: WebGLOrtho, WebGLSprite: WebGLSprite}, window.m4w);
})(jQuery);
