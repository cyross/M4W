/**
 * @fileOverview Miyako4Web(Miyako for Web a.k.a M4W/m4w)本体<br>
 * Thanks Kudox.jp(http://kudox.jp/html-css/html5-canvas-animation)<br>
 * Thanks Asial blog(http://blog.asial.co.jp/883)
 *
 * @name Miyako for Web(M4W)
 * @author Cyross Makoto (サイロス誠)
 * @version 0.0.1
 * @revision 1
 * @require jQuery 1.9.0/2.0.0(or later)
 * @license MIT License (MITライセンス)
 */

(function($){

  /**
   * @constructor
   * @class アセット(画像、スプライト、音声など)をブラウザに読み込む
   */
  AssetsLoader = function(){
  };

  /** @ignore */
  AssetsLoader.loaders = {
    /** @ignore */
    image: function(options){ return Sprite.load_image(options); },
    /** @ignore */
    sprite: function(options){ return Sprite.load(options); }
  };

  /**
   * 画像などのアセットを読み込み、指定した関数をコールバックする<br>
   * すべてのロードに成功したときはsuccess関数、一つでも失敗したときはfailed関数を呼ぶ
   * success関数の引数は以下のキーを持つ辞書オブジェクト<br>
   * <table>
   * <tr><th>Key</th><th>Value</th></tr>
   * <tr><td>image</td><td>Imageオブジェクトの辞書オブジェクト</tr>
   * <tr><td>sprite</td><td>Spriteオブジェクトの辞書オブジェクト</tr>
   * </table>
   * failed関数の引数はdefer.when.failedメソッドの引数の配列が渡される<br>
   * @example 実際のImage/Sprite/Soundを取得するときは以下の方法でアクセス可能<br>
   * 例1)<br>
   * function success(assets){<br>
   *    var image = assets.image.(id);<br>
   *    var sprite = assets.sprite.(id);<br>
   * }<br>
   * 例2)<br>
   * function success(assets){<br>
   *    var image = assets["image"]["id"];<br>
   *    var sprite = assets["sprite"]["id"];<br>
   * }
   * @param options.assets アセット設定オブジェクトの配列
   * @param options.assets[].type アセットの形式<br>画像は"image"、スプライトは"sprite"と指定する
   * @param options.assets[].その他 Image,Spriteクラスコンストラクタの引数と同じものを指定
   * @param [options.success] ロードが全て完了したときに呼び出されるコールバック関数<br>引数はアセット管理オブジェクト<br>内容は後述
   * @param [options.failed] ロードに失敗した時に呼び出されるコールバック関数<br>引数は失敗した時に渡される引数リスト
   */
  AssetsLoader.load = function(options){
    var o = $.extend({
      success: function(assets){ return assets; },
      failed: function(args){ alert("error occured!"); return args; }
    }, options);

    var assets = {}

    for(var i=0, len=o.assets.length; i<len; i++){
      var asset = o.assets[i]
      assets[asset.id] = asset;
    }

    var exec_assets = [];
    for(var asset_id in assets){
      var asset = assets[asset_id];
      exec_assets.push((AssetsLoader.loaders[asset.type])(asset));
    }
    $.when.apply(this, exec_assets).then(function(){
      var loaded_assets = {
      };
      for(var i=0, alen=arguments.length; i<alen; i++){
        var asset = arguments[i];
        if (!(asset.type in loaded_assets)){ loaded_assets[asset.type] = {}; }
        loaded_assets[asset.type][asset.id] = asset.value;
      }
      o.success(loaded_assets);
    }).fail(function(){
      o.failed(arguments);
    });
  };

  /**
   * @constructor
   * @class 画面用レンダリングメソッドを定義
   */
  ScreenRenderer = function(){
    this.name= "Miyako4Web Renderer";
  };

  /**
   * 画面への描画を行う<br>
   * 次の順番で描画する
   * <ul>
   * <li>画面の内容を消去する</li>
   * <li>各スプライトを描画する</li>
   */
  ScreenRenderer.default_render = function(){
    var ctx = this.context;
    var ia = this.sprites;
    ctx.clearRect(0, 0, this.width, this.height);
    for(var i=0, ialen=ia.length; i<ialen; i++){
      var s = ia[i];
      if(!('render' in s)){ continue; }
      s.render(ctx);
    }
    return this;
  };

  /**
   * 画面の消去を行わない画面への描画を行う<br>
   * 次の順番で描画する
   * <ul>
   * <li>各スプライトを描画する</li>
   */
  ScreenRenderer.no_clear_render = function(){
    var ctx = this.context;
    var ia = this.sprites;
    for(var i=0, ialen=ia.length; i<ialen; i++){
      var s = ia[i];
      if(!('render' in s)){ continue; }
      s.render(ctx);
    }
    return this;
  };

  /**
   * 画面の描画を行わない
   */
  ScreenRenderer.no_render = function(){
    return this;
  };

  /**
   * @constructor
   * @class スプライト用レンダリングメソッドを定義
   */
  SpriteRenderer = function(){
    this.name= "Miyako4Web Renderer";
  };

  /**
   * 画面への描画を行う<br>
   * 隠蔽中の時は描画しない<br>
   * 次の順番で描画する
   * <ul>
   * <li>画像を描画する(image)</li>
   * </ul>
   */
  SpriteRenderer.default_render = function(context){
    context.globalAlpha = this.a;
    context.drawImage(this.image, this.x, this.y);
  };

  /**
   * @constructor
   * @class 画面(ブロック要素領域)・画面上で発生するイベントを管理<br>スプライトの描画制限は、sprites配列の要素のインデックスをマイナスにするか、数値以外の文字列にする
   * @param options.id 画面のID
   * @param [options.width] 画面の横幅<br>ピクセル単位<br>省略時は640
   * @param [options.height] 画面の高さ<br>ピクセル単位<br>省略時は480
   * @param [options.position] bodyからの位置関係(CSSのpositionと同じ)<br>省略時は"relative"
   * @param [options.left] ブラウザ(もしくは親ブロックからの右方向の位置<br>単位はピクセル<br>省略時は0(ブロックの左端)
   * @param [options.top] ブラウザ(もしくは親ブロックからの上方向の位置<br>単位はピクセル<br>省略時は0(ブロックの上端)
   * @param [options.body] 画面レイヤーを埋め込むブロック<br>jQueryオブジェクトを指定<br>省略時はbodyブロック($("body"))
   * @param [options.css] CSS値をオブジェクトで指定<br>省略時は{}
   * @param [options.attr] attr値をオブジェクトで指定<br>jQueryオブジェクトを指定<br>省略時は{}
   * @param [options.events] 登録したいイベントの関数群<br>"イベント名": イベントハンドラ本体で登録する<br>省略時は{}
   * @param [options.content_width] 描画領域の横幅<br>単位はピクセル<br>指定したときは、widthで指定した範囲まで拡大して表示される<br>省略時はwidthと同じ値
   * @param [options.content_height] 描画領域の高さ<br>単位はピクセル<br>指定したときは、heightで指定したはんいまで拡大して表示される<br>省略時はheightと同じ値
   * @param [options.renderer] 描画する際の処理関数<br>省略時はRenderer.default_render
   * @param [options.z] ブラウザ上の前後位置を指定する<br>省略時は0
   * @param [options.get_context] レイヤーのコンテキストを作成するかどうかのフラグ<br>WebGLを使う時など、コンテキストを作成する必要がないときはfalseを渡す<br>falseを渡したときは、画面のレンダラが自動的にScreenRenderer.no_renderメソッドが指定される<br>(trueの時はScreenRenderer.default_render)<br>省略時はtrue
   */
  Screen = function(options){
    var o = $.extend({
      width: 640,
      height: 480,
      position: "absolute",
      left: 0,
      top: 0,
      renderer: ScreenRenderer.default_render,
      body: $("body"),
      events: {},
      z: 0,
      get_context: true
    }, options);

    var cw = o.width;
    var ch = o.height;
    if("content_width" in o){ cw = o.content_width; }
    if("content_height" in o){ ch = o.content_height; }

    var $layer = window.m4w.create_canvas(o);

    $layer.appendTo(o.body);

    this.body = o.body;
    /**
     * @property 画面幅
     */
    this.width = o.width;
    /**
     * @property 画面高さ
     */
    this.height = o.height;
    /**
     * @property 描画領域幅
     */
    this.content_width = cw;
    /**
     * @property 描画領域高さ
     */
    this.content_height = ch;
    /**
     * @property 画面レイヤ
     */
    this.layer = $layer;
    /**
     * @property 画面ID
     */
    this.id = o.id;
    /**
     * @property 画面のデバイスコンテキスト(必要なとき)
     */
    if(o.get_context){
      this.context = this.layer[0].getContext("2d");
    }
    else{
      this.context = null;
      o.renderer = ScreenRenderer.no_render;
    }
    /**
     * @property スプライト配列
     */
    this.sprites = [];
    /**
     * @property 画面レンダラ
     */
    this.render = o.renderer.bind(this);

    for(name in o.css){ $layer.css(name, o.css[name]); }
    for(name in o.attr){ $layer.attr(name, o.attr[name]); }
    for(name in o.events){
      $screen.unbind(name);
      $screen.bind(name, o.events[name]);
    }
  };

  /** 画面の内容を消去する */
  Screen.prototype.clear = function(){
    this.context.clearRect(0, 0, this.width(), this.height());
  };

  /** 画面の横幅・高さを変更する
   * @param {int} width 横幅
   * @param {int} height 高さ
   */
  Screen.prototype.resize = function(width, height){
    var w = parseInt(width);
    var h = parseInt(height);
    this.width = w;
    this.height = h;
    this.layer.css("width", w);
    this.layer.css("height", h);
    this.layer[0].width = (typeof content_width !== 'undefined' ? parseInt(content_width) : w);
    this.layer[0].height = (typeof content_height !== 'undefined' ? parseInt(content_height) : h);
  };

  /** 画面の位置を変更する
   * @param {int} left 右方向の位置
   * @param {int} top 下方向の位置
   */
  Screen.prototype.move = function(left, top){
    this.body.css("left", left);
    this.body.css("top", top);
  };

  /**
   * @constructor
   * @class スプライトを管理・操作
   * @param options.id スプライトに一意に一位につけられるID<br>省略時はvalue属性(Imageオブジェクト)のidプロパティ
   * @param options.value スプライトの元にするImageクラス(Javascript標準クラス)のオブジェクト
   * @param [options.x] ブロックの左端から右方向の位置(左端を0とする)<br>省略時は0
   * @param [options.y] ブロックの左端から右方向の位置(左端を0とする)<br>省略時は0
   * @param [options.a] 描画時の透明度<br>0.0≦a≦1.0の間<br>0.0で完全透明、1.0で完全不透明<br>省略時は1.0
   */
  Sprite = function(options){
    var o = $.extend({
      id: options.value.id,
      x:0, y:0, a:1.0
    }, options);
    this.id = o.id;
    this.image = o.value;
    /** @property ブロックの左端から右方向の位置(左端を0とする) */
    this.x = o.x;
    /** @property ブロックの左端から右方向の位置(左端を0とする) */
    this.y = o.y;
    /** @property 描画時の透明度<br>0≦a≦1の間<br>0で完全透明、1で完全不透明 */
    this.a = o.a;
  };

  /**
   * 画像ファイルを読み込む<br>imgタグを作り、再生ができるときに指定した関数を呼び出す
   * @param options.id 画像に一意につけられるID
   * @param options.src 対象ファイルのURLを配列で指定(マルチブラウザ対応)
   * @return 画像を読み込んでいるDeferredオブジェクト<br>コールバック関数の引数は、以下の内容の示すオブジェクト
   * <ul>
   *  <li>type: "image"</li>
   *  <li>id: options.id</li>
   *  <li>value: 生成したImageオブジェクト</li>
   *  <li>options: 生成時のオプション</li>
   * </ul>
   */
  Sprite.load_image = function(options){
    var defer = $.Deferred();
    var img_id = options.id;
    var img = new Image();
    img.src = options.src+ "?" + new Date().getTime();
    img.onload = function(){ defer.resolve({type: "image", id: img_id, value: img, options: options}); };
    return defer.promise();
  };

  /**
   * 画像をロードし、読み込み終了後Spriteオブジェクトを作成する
   * @param options.id スプライトに一意に一位につけられるID<br>内部で生成するImageオブジェクトも同じIDになる
   * @param options.src 対象ファイルのURLを配列で指定(マルチブラウザ対応)
   * @return スプライトを生成しているDeferredオブジェクト<br>コールバック関数の引数は、以下のパラメータは以下の内容のオブジェクト
   * <ul>
   *  <li>type: "sprite"</li>
   *  <li>id: options.id</li>
   *  <li>value: 生成したSpriteオブジェクト</li>
   *  <li>options: 生成時のオプション</li>
   * </ul>
   */
  Sprite.load = function(options){
    var defer = $.Deferred();
    Sprite.load_image(options).then(function(obj){
      defer.resolve({type: "sprite", id: obj.id, value: new Sprite($.extend(options, obj)), options: options});
    });
    return defer.promise();
  };

  /**
   * スプライトを描画する<br>省略時はRenderer.default_render関数が指定される
   * @param {Object} context 対象のレイヤー(canvasタグ)が持つコンテキスト
   */
  Sprite.prototype.render = SpriteRenderer.default_render;

  /**
   * スプライトを移動させる<br>座標は、ブロックの左上が(0,0)で、値がプラスだと右・下方向、マイナスだと左・上方向となる
   * @param [options.x] 左端を0とした時の右方向の位置<br>省略時は現在位置
   * @param [options.y] 上端を0とした時の下方向の位置<br>省略時は現在位置
   * @param [options.dx] 右方向をプラスとした時の移動量<br>省略時は0
   * @param [options.dy] 下方向をプラスとした時の移動量<br>省略時は0
   */
  Sprite.prototype.move = function(options){
    var o = $.extend({x: this.x, y: this.y, dx: 0, dy: 0}, options);
    this.x = o.x + o.dx;
    this.y = o.y + o.dy;
  };

  /**
   * 描画開始関数を取得(内部で使用)<br>
   * Thanks Kudox.jp(http://kudox.jp/html-css/html5-canvas-animation)<br>
   */
  window.requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           window.oRequestAnimationFrame      ||
           window.msRequestAnimationFrame     ||
           function(/* function */ callback){ return window.setTimeout(callback, 1000/window.m4w.interval); };
  }());

  /**
   * 描画停止関数を取得(内部で使用)<br>
   * Thanks Kudox.jp(http://kudox.jp/html-css/html5-canvas-animation)<br>
   */
  window.cancelAnimFrame = (function() {
    return window.cancelAnimationFrame ||
           window.cancelRequestAnimationFrame ||
           window.webkitCancelAnimationFrame ||
           window.webkitCancelRequestAnimationFrame ||
           window.mozCancelAnimationFrame ||
           window.mozCancelRequestAnimationFrame ||
           window.msCancelAnimationFrame ||
           window.msCancelRequestAnimationFrame ||
           window.oCancelAnimationFrame ||
           window.oCancelRequestAnimationFrame ||
           function(id) { window.clearTimeout(id); };
  }());

  /**
   * @param options.body 処理対象のjQueryオブジェクト
   * @constructor
   * @class $.fn.m4w呼び出し後の各種処理をまとめる
  */
  M4W = function(options){
    this.body = options.body;
    // screen_optionsに"body"がないときは、this.bodyを追加
    if(!("screen_options" in options)){
      options["screen_options"] = {body: this.body};
    }
    else if(!("body" in options.screen_options)){
      options.screen_options["body"] = this.body;
    }
    /**
     * @property スクリーン共有オブジェクト<br>Screenクラス
     */
    this.screen = new Screen(options.screen_options);
    if(!(typeof window.m4w.screen === 'undefined')){
      throw new Error("Screen object is already registered in window.m4w!");
    }
    window.m4w.screen = this.screen;
  };

  /**
   * 対象のDOMオブジェクトにアセットを追加する
   * @param {Object} options AssetsLoader.loadメソッドの引数と同じ
   */
  M4W.prototype.add_assets = function(options){
    AssetsLoader.load(options);
    return this.body;
  };

  /**
   * windowオブジェクト
   * @name window
  */

  /**
   * @namespace それぞれのクラスのアクセス用名前空間<br>以下のクラスが利用可能
   * <ul>
   * <li>Screen</li>
   * <li>AssetsLoader</li>
   * <li>Sprite</li>
   * <li>SpriteRenderer</li>
   * <li>ScreenRenderer</li>
   * </ul>
   * また、以下の関数が利用可能
   * <ul>
   * <li>user_agent</li>
   * </ul>
   * また、以下のプロパティが利用可能
   * <ul>
   * <li>interval(画面の描画間隔、初期値は60(60fps相当)、ただし、間隔取得にsetTimeoutを使用するときのみ)</li>
   * <li>vars(データ共有オブジェクト　初期は空のオブジェクト)</li>
   * <li>input_vars(入力デバイス関連情報共有オブジェクト<br>初期は空のオブジェクト)</li>
   * </ul>
  */
  window.m4w = {
    Screen: Screen,
    AssetsLoader: AssetsLoader,
    Sprite: Sprite,
    SpriteRenderer: SpriteRenderer,
    ScreenRenderer: ScreenRenderer,
    /**
     * @property ユーザーエージェントを返す関数<br>
     * 返されるオブジェクトは、user_agent, versionの2つのプロパティを持つ<br>
     */
    user_agent: function(){
        var result = {};
        result.user_agent = window.navigator.userAgent.toLowerCase();
        result.version = window.navigator.appVersion.toLowerCase();
        return result;
      },
    /**
     * @property 画面更新間隔(初期値:60(fps))
     */
    interval: 60,
    /**
     * @property 画面更新ID(内部で使用)
     */
    rendering_id: null,
    /**
     * @property 画面更新終了フラグ(内部で使用)
     */
    is_stop: false,
    /**
     * @property ゲームロジック
     */
    main_logic: function(){ },
    /**
     * @property データ共有オブジェクト<br>初期は空のオブジェクト
     */
    vars: {},
    /**
     * @property 入力デバイス関連情報共有オブジェクト<br>初期は空のオブジェクト
     */
    input_vars: {}
  };

  /**
   * ゲームループ内部ロジック
   */
  window.m4w._game_loop = function(){
    var _m4w = window.m4w;
    // メインロジック実行
    _m4w.main_logic();
    // 外部から停止リクエストが来たときは終了
    if(_m4w.is_stop){
      window.cancelAnimFrame(_m4w.rendering_id);
      _m4w.is_stop = false;
      return;
    }
    // 画面描画
    _m4w.screen.render();
    // 次のループ実行を設定
    _m4w.rendering_id = window.requestAnimFrame(_m4w._game_loop.bind(_m4w));
  };

  /**
   * ゲームループ開始
   */
  window.m4w.main_loop = function(){
    var _m4w = window.m4w;
    _m4w.rendering_id = window.requestAnimFrame(_m4w._game_loop.bind(_m4w));
  };

  /**
   * ゲームループを停止する
   */
  window.m4w.stop_main_loop = function(){
    window.m4w.is_stop = true;
  };

  /**
   * Canvasタグを作成する
   * @param options.id 画面のID
   * @param [options.width] 画面の横幅<br>ピクセル単位<br>省略時は640
   * @param [options.height] 画面の高さ<br>ピクセル単位<br>省略時は480
   * @param [options.position] bodyからの位置関係(CSSのpositionと同じ)<br>省略時は"relative"
   * @param [options.left] ブラウザ(もしくは親ブロックからの右方向の位置<br>単位はピクセル<br>省略時は0(ブロックの左端)
   * @param [options.top] ブラウザ(もしくは親ブロックからの上方向の位置<br>単位はピクセル<br>省略時は0(ブロックの上端)
   * @param [options.content_width] 描画領域の横幅<br>単位はピクセル<br>指定したときは、widthで指定した範囲まで拡大して表示される<br>省略時はwidthと同じ値
   * @param [options.content_height] 描画領域の高さ<br>単位はピクセル<br>指定したときは、heightで指定したはんいまで拡大して表示される<br>省略時はheightと同じ値
   * @param [options.z] ブラウザ上の前後位置を指定する<br>省略時は0
   */
  window.m4w.create_canvas = function(options){
    var o = $.extend({
      width: 640,
      height: 480,
      position: "absolute",
      left: 0,
      top: 0,
      z: 0
    }, options);
    var $canvas = $('<canvas />', {width: o.width, height: o.height});
    var cw = o.width;
    var ch = o.height;
    if("content_width" in o){ cw = o.content_width; }
    if("content_height" in o){ ch = o.content_height; }
    $canvas.attr("id", o.id);
    $canvas.css("position", o.position);
    $canvas.css("left", o.left);
    $canvas.css("top", o.top);
    $canvas.css("z-index", o.z);
    $canvas[0].width = cw;
    $canvas[0].height = ch;
    return $canvas;
  };

  /**
   * jQueryオブジェクトの別名(http://jquery.com/)
   * @name $
   * @class
   */

  /**
   * jQueryオブジェクトのプラグイン関数(http://jquery.com/)
   * @name $.fn
   * @class
   */

   /**
   * 指定したブロックのm4w初期化
   * このメソッドを呼び出すと、以下の場所にオブジェクトが追加される
   * <table>
   * <tr><th>対象</th><th>名称</th><th>オブジェクト</th></tr>
   * <tr><td>jQueryオブジェクト</td><td>m4w</td><td>M4W</td></tr>
   * <tr><td>各ブロック要素のDOMオブジェクト</td><td>m4w</td><td>M4WDOM</td></tr>
   * </table>
   * @param [options.screen_options] screenオブジェクトに渡す引数<br>Screenコンストラクタの引数と同じ
   * @param [options.assets] 初期化時に作成したいアセットの配列。内容はAssetLoader.loadメソッドの引数と同じ<br>省略時はnull
   */
  $.fn.m4w = function(options){
    var o = $.extend({
      screen_options: {},
      assets: null,
      body: $(this)
    }, options);

    $.extend($(this).m4w, new M4W(o));
    if(o.assets != null){ $(this).m4w.add_assets(o.assets); }
  };
})(jQuery);
