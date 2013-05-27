/**
 * @fileOverview Miyako4Web(Miyako for Web a.k.a M4W/m4w) Input Extension<br>
 * M4W用デバイス入力対応拡張プラグイン
 * このファイルを読み込むと、window.m4wオブジェクトに以下のプロパティが追加される<br>
 * window.m4w.Input<br>
 *
 * @name Miyako for Web(M4W) Input extention
 * @author Cyross Makoto (サイロス誠)
 * @version 0.0.1
 * @revision 1
 * @require jQuery 1.9.0/2.0.0(or later)
 * @license MIT License (MITライセンス)
 */

(function($){
  /**
   * @namespace 各種クラスの外部アクセス用名前空間<br>
   * 以下の関数が利用可能
   * <ul>
   * <li>can_touch</li>
   * <li>is_windows8</li>
   * <li>get_xy_mouse</li>
   * <li>get_xy_touch</li>
   * <li>get_xy_multitouch</li>
   * <li>get_xy</li>
   * </ul>
   * また、以下のプロパティが利用可能
   * <ul>
   * <li>vars(入力デバイス関連情報共有オブジェクト<br>初期は空のオブジェクト)</li>
   * </ul>
   * @example if((window).m4w.Input.can_touch()){ ... }
  */
  Input = {
    /**
     * @property 入力デバイス関連情報共有オブジェクト<br>初期は空のオブジェクト
     */
    vars: {}
  };

  /**
   * User Agent から、タッチデバイスかどうか判別する<br>
   * 使用している端末・OSが以下の時、trueとなる
   * <ul>
   * <li>イベントにontouchstartが用意されている
   * <li>iPhone
   * <li>iPad
   * <li>iPod Touch
   * <li>Android端末
   * <li>Windows Phone
   * <li>Windows 8(ディスプレイがタッチ対応かどうかにかかわらず)
   * </ul>
   * @return タッチデバイスの時はtrue、それ以外はfalse
   */
  Input.can_touch = function(){
    var user_agent = window.navigator.userAgent.toLowerCase();
    var agents = ["iphone", "ipad", "ipod", "android", "windowsphone", "windows nt 6.2"];

    if(document.ontouchstart !== undefined){ return true; }

    for(var i=0; i<agents.length; i++){
      if(user_agent.indexOf(agents[i]) > -1){ return true; }
    }
    // その他
    return false;
  };

  /**
   * User Agent から、使用しているOSがWindows 8かどうか判別する<br>
   * @return Windows 8の時はtrue、それ以外はfalse
   */
  Input.is_windows8 = function(){
    var user_agent = window.navigator.userAgent.toLowerCase();
    if(user_agent.indexOf("windows nt 6.2") > -1){ return true; }
    // その他
    return false;
  };

  /**
   * 現在のマウスポインタの位置を取得する<br>
   * mousestart, mousemoveなどのイベントハンドリング時に使用する<br>
   * $areaで示したブロック(jQueryオブジェクト)の左上を[0,0]とする
   * @param ev 取得に使用するイベントオブジェクト
   * @param ev 取得に使用するイベントオブジェクト
   * @return [x,y]で示す配列
   */
  Input.get_xy_mouse = function($area, ev){
    var offset = $area.offset();
    return [ev.pageX - offset.left, ev.pageY - offset.top];
  };

  /**
   * 現在タッチしている位置を取得する<br>
   * touchstart, touchmoveなどのイベントハンドリング時に使用する<br>
   * $areaで示したブロック(jQueryオブジェクト)の左上を[0,0]とする
   * @param ev 取得に使用するイベントオブジェクト
   * @param ex 取得に使用するイベントオブジェクト
   * @return [x,y]で示す配列
   */
  Input.get_xy_touch = function($area, ev){
    var offset = $area.offset();
    var touch = ev.originalEvent.targetTouches[0];
    return [touch.pageX - offset.left, touch.pageY - offset.top];
  };

  /**
   * 現在全ての指がタッチしている位置を取得する<br>
   * touchstart, touchmoveなどのイベントハンドリング時に使用する<br>
   * $areaで示したブロック(jQueryオブジェクト)の左上を[0,0]とする
   * @param ev 取得に使用するイベントオブジェクト
   * @param ex 取得に使用するイベントオブジェクト
   * @return [x,y]で示す配列の配列
   */
  Input.get_xy_multitouch = function($area, ev){
    var result = [];
    var offset = $area.offset();
    var touches = ev.originalEvent.targetTouches;
    for(var i=0; i<touches.length; i++){
        var touch = touches[i];
        result.push([touch.pageX - offset.left, touch.pageY - offset.top]);
    }
    return result;
  };

  /**
   * @property Windows 8以外のタッチデバイスの時はget_xy_touchを、それ以外はget_xy_mouseを使用する
   */
  Input.get_xy = ((Input.can_touch() && !(Input.is_windows8())) ? Input.get_xy_touch : Input.get_xy_mouse);

  window.m4w = $.extend({Input: Input}, window.m4w);
})(jQuery);
