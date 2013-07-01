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
   * <li>key_states(キーの押下状態)</li>
   * </ul>
   * @example if((window).m4w.Input.can_touch()){ ... }
  */
  Input = {
    /**
     * @property 入力デバイス関連情報共有オブジェクト<br>初期は空のオブジェクト
     */
    vars: {},
    start_events: {touch: "touchstart", mouse: "mousedown"},
    move_events: {touch: "touchmove", mouse: "mousemove"},
    end_events: {touch: "touchend", mouse: "mouseup"},
    click_events: {touch: "touchstart", mouse: "click"},
    event_mode: "mouse",
    pressed_keys: [],
    key_states: []
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
   * イベントモードを切り替える<br>
   * タッチ対応かマウス対応可を選択<br>
   * 初期値は”mouse”<br>
   * @param mode イベントモード<br>"touch"か"mouse”のみ指定可能<br>その他はfalseが返る
   * @return mode引数が正しければtrue、正しくなければfalse
   */
  Input.set_event_mode = function(mode){
    if(!mode in Input.start_events){ return false; }
    Input.event_mode = mode;
    if(mode == "touch"){
      Input.get_xy = Input.get_xy_touch;
    }
    else{
      Input.get_xy = Input.get_xy_mouse;
    }
    return true;
  }

  /**
   * クリックイベント名を取得<br>
   * @return mouseのときは"click"、touchのときは"touchstart"
   */
  Input.click_event_name = function(){
    return Input.click_events[Input.event_mode];
  }

  /**
   * 開始イベント名を取得<br>
   * @return mouseのときは"mousestart"、touchのときは"touchstart"
   */
  Input.start_event_name = function(){
    return Input.start_events[Input.event_mode];
  }

  /**
   * 移動中イベント名を取得<br>
   * @return mouseのときは"mousemove"、touchのときは"touchmove"
   */
  Input.move_event_name = function(){
    return Input.move_events[Input.event_mode];
  }

  /**
   * 終了イベント名を取得<br>
   * @return mouseのときは"mouseend"、touchのときは"touchend"
   */
  Input.end_event_name = function(){
    return Input.end_events[Input.event_mode];
  }

  /**
   * @property event_modeによって、get_xy_touch、get_xy_mouseを切り替える
   */
  Input.get_xy = Input.get_xy_mouse;

  /**
   * キーの押下状態を初期化する<br>
   * キーの押下状態の監視対象を設定する<br>
   * キーは、キーコードの配列を指定する<br>
   * 押下対象になったキーは、引数keycodesで指定した順番に、状態を参照できる<br>
   * keycodesは整数(キーコード)の配列だが、複数のキーでひとつの状態とするときは、キーコードの配列をひとつの要素で指定する<br>
   * 例1:Input.init_key_status([56,54,52,50]); <- 8,6,4,2のキーに対応<br>
   * 例2:Input.init_key_status([[56,104],[54,102],[52,100],[50,98]]); <- テンキーの8,6,4,2にも同時に対応<br>
   * 例3:Input.init_key_status([[56,104],[54,102],[52,100],[50,98],90,88]); <- 更に、Z,Xキーにも対応
   * 押下状態は、Input.key_states配列で参照する<br>
   * キーが押されていたら、その要素がtrue、離れていたらfalseを返す<br>
   * @param keycodes 監視対象にするキーコードの配列
   */
  Input.init_key_status = function(keycodes){
    Input.pressed_keys = [];
    Input.key_states = [];
    for(var i=0, klen=keycodes.length; i<klen; i++){
      var codes = keycodes[i];
      if(isFinite(codes)){
        Input.pressed_keys.push([codes]);
      }
      else{
        Input.pressed_keys.push(codes);
      }
      Input.key_states.push(false);
    }
  }

  /**
   * キーの押下状態監視を開始する<br>
   */
  Input.start_key_monitoring = function(){
    $(document).on("keydown", function(ev){
      var keys = Input.pressed_keys;
      for(var i = 0, klen = keys.length; i < klen; i++){
        var kkeys = keys[i];
        for(var j = 0, kklen = kkeys.length; j < kklen; j++){
          if(ev.keyCode == kkeys[j]){
            Input.key_states[i] = true;
            ev.preventDefault();
            return;
          }
        }
      }
    });
    $(document).on("keyup", function(ev){
      var keys = Input.pressed_keys;
      for(var i = 0, klen = keys.length; i < klen; i++){
        var kkeys = keys[i];
        for(var j = 0, kklen = kkeys.length; j < kklen; j++){
          if(ev.keyCode == kkeys[j]){
            Input.key_states[i] = false;
            ev.preventDefault();
            return;
          }
        }
      }
    });
  }

  /**
   * キーの押下状態監視を停止する<br>
   */
  Input.stop_key_monitoring = function(){
    $(document).off("keydown");
    $(document).off("keyup");
  }

  window.m4w = $.extend({Input: Input}, window.m4w);
})(jQuery);
