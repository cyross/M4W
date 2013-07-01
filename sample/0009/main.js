// キーの押下状態を表示(同時押し可能)
$(document).ready(function(){
  var _m4w = window.m4w;

  // メインロジック
  var main_logic = function(){
    for(var i=0, klen=_m4w.Input.key_states.length; i<klen; i++){
      $("#keys_"+i).html(Input.key_states[i] ? "ON": "OFF");
    }
  };

  // M4Wの初期化
  var body = $("#game");
  body.m4w();

  // キー監視の初期化
  // 56,104: 8キー
  // 54,102: 6キー
  // 52,100: 4キー
  // 50, 98: 2キー
  // 90    : zキー
  // 88    : xキー
  _m4w.Input.init_key_status([[56,104],[54,102],[52,100],[50,98],90,88]);

  _m4w.Input.start_key_monitoring();

  _m4w.main_logic = main_logic;
  // メインループの開始
  _m4w.main_loop();
});
