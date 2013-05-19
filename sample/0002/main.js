$(document).ready(function(){
  // メインロジック
  var main_logic = function(){
    // 今回は何もしない
  };

  // 座標の更新
  var update_pos = function(e){
    e.preventDefault();
    var offset = this.offset();
    window.m4w.input_vars.gameX = e.pageX - offset.left;
    window.m4w.input_vars.gameY = e.pageY - offset.top;
  }

  // アセットロード終了時の処理
  // ・メインロジックの登録
  // ・ボタン押下次の処理の追加
  var on_ready = function(assets){
    window.m4w.screen.sprites.push(assets.sprite.s01);
    window.m4w.main_logic = main_logic;
    var $area = $("div#game");
    $area.on("mousedown", update_pos.bind($area));
    $area.on("mousemove", update_pos.bind($area));
    $area.on("mouseup", function(e){
      e.preventDefault();
      window.m4w.screen.sprites[0].move({x:window.m4w.input_vars.gameX,y:window.m4w.input_vars.gameY});
    });
  }

  // M4Wの初期化
  var body = $("#game");
  body.m4w();

  // アセットのロード
  AssetsLoader.load({
    assets: [{type: "sprite", id: "s01", src:"img/sampleimage.gif"}],
    success: on_ready
  });
  
  // メインループの開始
  window.m4w.main_loop();
});
