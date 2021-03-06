/**
 * @fileOverview Miyako4Web(Miyako for Web a.k.a M4W/m4w) Sound Extension<br>
 * M4W用音声(BGM/SE)対応拡張プラグイン
 * このファイルを読み込むと、window.m4wオブジェクトに以下のプロパティが追加される<br>
 * window.m4w.Video<br>
 * window.m4w.AssetsLoader.loaders.bgm<br>
 * window.m4w.AssetsLoader.loaders.se<br>
 * AssetLoader.prototype.success関数の引数に以下のキーが追加される<br>
 * <table>
 * <tr><th>Key</th><th>Value</th></tr>
 * <tr><td>bgm</td><td>BGMのSoundオブジェクトの辞書オブジェクト</tr>
 * <tr><td>se</td><td>効果音のSoundオブジェクトの辞書オブジェクト</td></tr>
 * </table>
 * @example 実際のBGM/SEを取得するときは以下の方法でアクセス可能<br>
 * 例1)<br>
 * function success(assets){<br>
 *    var bgm = assets.bgm.(id);<br>
 *    var se = assets.se.(id);<br>
 * }<br>
 * 例2)<br>
 * function success(assets){<br>
 *    var bgm = assets["bgm"]["id"];<br>
 *    var se = assets["se"]["id"];<br>
 * }<br>
 * AssetsLoader.load関数の引数も以下のように拡張される<br>
 * options.assets[].type には"sound"と指定する
 * options.assets[].その他 にはSoundクラスコンストラクタの引数と同じものを指定
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
   * @class 音声(audioタグ)を管理・操作
   * @param id 音声に固有に付けられるID(audioタグのidと共通にすればなお良い)
   */
  Sound = function(id){
    this.id = id;
    this.played = false;
    this.is_play = false;
    this.is_pause = false;
    this.tag = null;
    this.o = {};
  };

  /**
   * 音声ファイルを読み込む<br>audioタグを作り、再生ができるときに指定した関数を呼び出す
   * @example {id: "hoge", src: ["/sounds/hoge.mp3","/sounds/hoge.ogg","/sounds/hoge.wav"], bgm: false}
   * @param options.id audioタグに一位につけられるID
   * @param options.src 音声ファイルのURLを配列で指定(マルチブラウザ対応、ブラウザ内では指定したどれかを再生)
   * @param [options.bgm] BGMとして繰り返し再生可かどうかを指定(true:BGM/false:SE)
   * @return 音声を再生できる状態に持ち込んでいるDeferredオブジェクト<br>コールバック関数の引数は以下の内容のオブジェクト
   * <ul>
   *  <li>type: "bgm" or "se"</li>
   *  <li>id: options.id</li>
   *  <li>value: 生成したSoundオブジェクト</li>
   *  <li>options: 生成時のオプション</li>
   * </ul>
   */
  Sound.load = function(options){
    var o = $.extend({
      bgm: false,
      body: $("body")
    }, options);
    var $area = $("<audio />");
    var defer = $.Deferred();

    $area.attr("id", o.id);
    $area.attr("preload", "auto");

    for(var i=0; i<o.src.length; i++){
      var $src = $("<source />");
      var url = o.src[i] + "?" + new Date().getTime();
      $src.attr("id", o.id+"_"+i);
      $src.attr("name", o.id);
      $src.attr("src", url);
      $src.appendTo($area);
    }
    $area.appendTo(o.body);

    // Appleデバイスのときは、canplayイベントで待つ必要がある
    var event_name = (window.m4w.is_apple_device() ? "canplay" : "loadedmetadata");
    $area[0].addEventListener(event_name, (function(){
      var area = $area[0];
      var d = defer;
      var snd_id = o.id;
      var type = (o.bgm==true ? "bgm" : "se");
      var obj = new Sound(snd_id);

      obj.tag = area;
      obj.o = o;

      d.resolve({type: type, id: snd_id, value: obj, options: options});
    }).bind(this)());

    return defer.promise();
  };

  /**
   * 音声を再生する<br>最初から再生する(pauseした時も)
   */
  Sound.prototype.play = function(){
    var v = $("audio#"+this.id)[0];
    if(this.is_play){
      v.pause();
    }
    if(this.played){
      v.currentTime=0;
    }
    else{
      this.played = true;
      v.loop = this.o.bgm;
      v.load();
    }
    v.play();
    this.is_play = true;
    this.is_pause = false;
  };

  /**
   * 音声の再生を停止する<br>再生位置は停止した位置を保持する<br>resumeメソッドを呼ぶと、そこから再生する
   */
  Sound.prototype.pause = function(){
    if(!this.is_pause){
      $("audio#"+this.id)[0].pause();
      this.is_pause = true;
    }
  };

  /**
   * 音声を停止した位置から再生する
   */
  Sound.prototype.resume = function(){
    if(this.is_play && !this.is_pause){ return; }
    $("audio#"+this.id)[0].play();
    this.is_pause = false;
  };

  /**
   * 音声の再生を停止する<br>再生位置は最初に戻る(resumeしても)
   */
  Sound.prototype.stop = function(){
    if(!this.is_play){ return; }
    var v = $("audio#"+this.id)[0];
    v.pause();
    v.currentTime = 0;
    this.is_play = false;
    this.is_pause = false;
  };

  /**
   * 対象画面内から音声を削除する<br>audioタグを削除する
   */
  Sound.prototype.remove = function(){
    var $v = $("audio#"+this.id);
    if(this.is_play && !this.is_pause){ $v[0].pause(); }
    $v.remove();
  };

  /**
   * ロードした音声の長さを返す<br>単位：秒
   */
  Sound.prototype.length = function(){
    return $("audio#"+this.id)[0].duuration;
  };

  /**
   * 再生している位置を返す<br>単位：秒
   */
  Sound.prototype.pos = function(){
    return $("audio#"+this.id)[0].currentTime;
  };

  /**
   * 音声のボリューム(0.0(無音)～1.0(最大))を返す
   */
  Sound.prototype.volume = function(){
    return $("audio#"+this.id)[0].volume;
  };

  /**
   * 音声のボリューム(0.0(無音)～1.0(最大))を設定する
   */
  Sound.prototype.set_volume = function(vol){
    return $("audio#"+this.id)[0].volume = vol;
  };

  /**
   * エラー状態かどうかを返す
   * @return true/false
   */
  Sound.prototype.is_error = function(){
    return $("audio#"+this.id)[0].error != null;
  };

  window.m4w = $.extend({Sound: Sound}, window.m4w);

  /** @ignore */
  window.m4w.AssetsLoader.loaders.bgm = function(options){
    var o = $.extend({
      bgm: true
    }, options);
    return Sound.load(o);
  };

  /** @ignore */
  window.m4w.AssetsLoader.loaders.se = function(options){
    var o = $.extend({
      bgm: false
    }, options);
    return Sound.load(options);
  };
})(jQuery);
