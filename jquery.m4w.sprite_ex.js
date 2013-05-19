/**
 * @fileOverview Miyako4Web(Miyako for Web a.k.a M4W/m4w) Extend Sprite Extension<br>
 * M4W用強化版スプライト対応拡張プラグイン
 * このファイルを読み込むと、window.m4wオブジェクトに以下のプロパティが追加される<br>
 * window.m4w.SpriteEx<br>
 * window.m4w.SpriteExRenderer<br>
 * window.m4w.AssetsLoader.loaders.sprite_ex<br>
 * AssetLoader.prototype.success関数の引数に以下のキーが追加される<br>
 * <table>
 * <tr><th>Key</th><th>Value</th></tr>
 * <tr><td>sprite_ex</td><td>SpriteExオブジェクトの辞書オブジェクト</tr>
 * </table>
 * @example 実際のSpriteExを取得するときは以下の方法でアクセス可能<br>
 * 例1)<br>
 * function success(assets){<br>
 *    var sprite = assets.sprite_ex.(id);<br>
 * }<br>
 * 例2)<br>
 * function success(assets){<br>
 *    var sprite = assets["sprite_ex"]["id"];<br>
 * }<br>
 * AssetsLoader.load関数の引数も以下のように拡張される<br>
 * options.assets[].type には"sprite_ex"と指定する
 * options.assets[].その他 にはSpriteExクラスコンストラクタの引数と同じものを指定
 *
 * @name Miyako for Web(M4W) Sound extention
 * @author Cyross Makoto (サイロス誠)
 * @version 0.0.1
 * @revision 1
 * @require jQuery 1.9.0/2.0.0(or later)
 * @license MIT License (MITライセンス)
 */

(function($){
  /**
   * @constructor
   * @class スプライト用レンダリングメソッドを定義
   */
  SpriteExRenderer = function(){
    this.name= "Miyako4Web SpriteEx Renderer";
  };

  /**
   * 画面への描画を行う<br>
   * 隠蔽中の時は描画しない<br>
   * 次の順番で描画する
   * <ul>
   * <li>回転/拡大/縮小を行う(m11,m12,m21,m22,x,dx,y,dy)<li>
   * <li>描画位置をずらす(dx,dy)</li>
   * <li>透明度を設定(a)</li>
   * <li>画像を描画する(image,sx,sy,sw,sh,dw,dh)</li>
   * <li>設定を元に戻す</li>
   * </ul>
   */
  SpriteExRenderer.default_render = function(context){
    context.save();
    context.setTransform(this.m11,this.m12,this.m21,this.m22,this.x-this.dx,this.y-this.dy);
    context.translate(this.dx,this.dy);
    context.globalAlpha = this.a;
    context.drawImage(this.image, this.sx, this.sy, this.sw, this.sh, 0, 0, this.dw, this.dh);
    context.restore();
  };

  /**
   * 画面への描画を行う<br>
   * 隠蔽中の時は描画しない<br>
   * 次の順番で描画する
   * <ul>
   * <li>画像を描画する(image)</li>
   * </ul>
   */
  SpriteExRenderer.fast_render = function(context){
    context.drawImage(this.image, 0, 0);
  };

  /**
   * 画面への描画を行う<br>
   * 隠蔽中の時は描画しない<br>
   * 次の順番で描画する
   * <ul>
   * <li>透明度を設定(a)</li>
   * <li>画像を描画する(image,sx,sy,sw,sh,dw,dh)</li>
   * </ul>
   */
  SpriteExRenderer.fast_render2 = function(context){
    context.globalAlpha = this.a;
    context.drawImage(this.image, this.sx, this.sy, this.sw, this.sh, 0, 0, this.dw, this.dh);
  };

  /**
   * @constructor
   * @class スプライトを管理・操作
   * @param options.id スプライトに一意に一位につけられるID<br>省略時はvalue属性(Imageオブジェクト)のidプロパティ
   * @param options.value スプライトの元にするImageクラス(Javascript標準クラス)のオブジェクト
   * @param [options.x] ブロックの左端から右方向の位置(左端を0とする)<br>省略時は0
   * @param [options.y] ブロックの左端から右方向の位置(左端を0とする)<br>省略時は0
   * @param [options.a] 描画時の透明度<br>0.0≦a≦1.0の間<br>0.0で完全透明、1.0で完全不透明<br>省略時は1.0
   * @param [options.m11] 変換マトリクスの左上値<br>transform,reset_matrixメソッドでも操作可<br>省略時は1.0
   * @param [options.m12] 変換マトリクスの右上値<br>transform,reset_matrixメソッドでも操作可<br>省略時は0.0
   * @param [options.m21] 変換マトリクスの左下値<br>transform,reset_matrixメソッドでも操作可<br>省略時は0.0
   * @param [options.m22] 変換マトリクスの右下値<br>transform,reset_matrixメソッドでも操作可<br>省略時は1.0
   * @param [options.sx] 画像内の右方向の描画開始位置<br>省略時は0
   * @param [options.sy] 画像内の下方向の描画開始位置
   * @param [options.sw] 画像内の描画幅<br>省略時は画像と同じ幅
   * @param [options.sh] 画像内の描画高さ<br>省略時は画像と同じ高さ
   * @param [options.dx] レイヤ内の右方向の描画開始位置<br>Sprite.xの位置より右にずれる<br>省略時は0
   * @param [options.dy] レイヤ内の下方向の描画開始位置<br>Sprite.yの位置より下にずれる<br>省略時は0
   * @param [options.dw] レイヤ内の描画幅<br>Sprite.swの値から拡大/縮小して描画される<br>省略時はSprite.swと同じ値
   * @param [options.dh] レイヤ内の描画高さ<br>Sprite.shの値から拡大/縮小して描画される<br>省略時はSprite.shと同じ値
   */
  SpriteEx = function(options){
    var o = $.extend({
      id: options.value.id,
      x:0, y:0, a:1.0,
      m11:1.0, m12:0.0, m21:0.0, m22:1.0,
      sx:0, sy:0, sw:options.value.width, sh:options.value.height,
      dx:0, dy:0, dw:options.value.width, dh:options.value.height }, options);
    this.id = o.id;
    this.image = o.value;
    /** @property ブロックの左端から右方向の位置(左端を0とする) */
    this.x = o.x;
    /** @property ブロックの左端から右方向の位置(左端を0とする) */
    this.y = o.y;
    /** @property 描画時の透明度<br>0≦a≦1の間<br>0で完全透明、1で完全不透明 */
    this.a = o.a;
    /** @property 変換マトリクスの左上値<br>transform,reset_matrixメソッドでも操作可 */
    this.m11 = o.m11;
    /** @property 変換マトリクスの右上値<br>transform,reset_matrixメソッドでも操作可 */
    this.m12 = o.m12;
    /** @property 変換マトリクスの左下値<br>transform,reset_matrixメソッドでも操作可 */
    this.m21 = o.m21
    /** @property 変換マトリクスの右下値<br>transform,reset_matrixメソッドでも操作可 */
    this.m22 = o.m22;
    /** @property 画像内の右方向の描画開始位置<br>省略時は0 */
    this.sx = o.sx;
    /** @property 画像内の下方向の描画開始位置 */
    this.sy = o.sy;
    /** @property 画像内の描画幅<br>省略時は画像と同じ幅 */
    this.sw = o.sw;
    /** @property 画像内の描画高さ<br>省略時は画像と同じ高さ */
    this.sh = o.sh;
    /** @property レイヤ内の右方向の描画開始位置<br>xの位置より右にずれる<br>省略時は0 */
    this.dx = o.dx;
    /** @property レイヤ内の下方向の描画開始位置<br>yの位置より下にずれる<br>省略時は0 */
    this.dy = o.dy;
    /** @property レイヤ内の描画幅<br>swの値から拡大/縮小して描画される<br>省略時はswと同じ値 */
    this.dw = o.dw;
    /** @property レイヤ内の描画高さ<br>shの値から拡大/縮小して描画される<br>省略時はshと同じ値 */
    this.dh = o.dh;
  };

  /**
   * 音声ファイルを読み込む<br>audioタグを作り、再生ができるときに指定した関数を呼び出す
   * @param options.id スプライトに一意に一位につけられるID<br>内部で生成するImageオブジェクトも同じIDになる
   * @param options.src 対象ファイルのURLを配列で指定(マルチブラウザ対応)
   * @return スプライトを生成しているDeferredオブジェクト<br>コールバック関数の引数は、{type: "sprite", id: options.id, value: 生成したImageオブジェクト}で示すオブジェクト
   */
  SpriteEx.load = function(options){
    var defer = $.Deferred();
    SpriteEx.load_image(options).then(function(obj){
      defer.resolve({type: "sprite", id: obj.id, value: new Sprite(obj)});
    });
    return defer.promise();
  };

  /**
   * スプライトを描画する<br>省略時はRenderer.default_render関数が指定される
   * @param {Object} context 対象のレイヤー(canvasタグ)が持つコンテキスト
   */
  SpriteEx.prototype.render = SpriteExRenderer.default_render;

  /**
   * スプライトを回転・拡大・縮小させる<br>一旦指定すると、transformかreset_matrixメソッドを呼ばない限り、この値が有効に鳴る
   * @param [options.deg] 回転させる角度<br>単位:度<br>省略時は0
   * @param [options.sx] sx 横方向の拡大縮小割合(右への方向)<br>省略時は1.0
   * @param [options.sy] sy 縦方向の拡大縮小割合(下への方向)<br>省略時は1.0
   */
  SpriteEx.prototype.transform = function(options){
    var o = $.extend({deg: 0, sx: 1.0, sy: 1.0}, options);
    var rad = 2.0 * o.deg * Math.PI / 360.0;
    this.m11 = o.sx * Math.cos(rad);
    this.m12 = o.sx * Math.sin(rad);
    this.m21 = o.sy * -(Math.sin(rad));
    this.m22 = o.sy * Math.cos(rad);
  };

  /**
   * transformメソッドで指定したか回転・拡大・縮小をリセット(回転0度、拡大1.0倍)する
   */
  SpriteEx.prototype.reset_matrix = function(){
    this.m11 = 1.0;
    this.m12 = 0.0;
    this.m21 = 0.0;
    this.m22 = 1.0;
  };

  /**
   * スプライトを移動させる<br>座標は、ブロックの左上が(0,0)で、値がプラスだと右・下方向、マイナスだと左・上方向となる
   * @param [options.x] 左端を0とした時の右方向の位置<br>省略時は現在位置
   * @param [options.y] 上端を0とした時の下方向の位置<br>省略時は現在位置
   * @param [options.dx] 右方向をプラスとした時の移動量<br>省略時は0
   * @param [options.dy] 下方向をプラスとした時の移動量<br>省略時は0
   */
  SpriteEx.prototype.move = function(options){
    var o = $.extend({x: this.x, y: this.y, dx: 0, dy: 0}, options);
    this.x = o.x + o.dx;
    this.y = o.y + o.dy;
  };

  window.m4w = $.extend({SpriteEx: SpriteEx, SpriteExRenderer: SpriteExRenderer}, window.m4w);

  /** @ignore */
  window.m4w.AssetsLoader.loaders.sprite_ex = function(options){
    return SpriteEx.load(options);
  };
})(jQuery);
