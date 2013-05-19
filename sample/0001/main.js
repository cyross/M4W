$(document).ready(function(){
  // メインロジック
  var main_logic = function(){
    window.m4w.screen.sprites[1].move({dx:1,dy:0});
  };

  // アセットロード終了時の処理
  // ・メインロジックの登録
  // ・ボタン押下次の処理の追加
  var on_ready = function(assets){
    window.m4w.screen.sprites.push(assets.sprite.s01);
    window.m4w.main_logic = main_logic;
    $("#button1").on("click", function(e){
      window.m4w.screen.sprites[1].move({dx:0,dy:4});
      e.preventDefault();
    });
  }

  // M4Wの初期化
  var body = $("#game");
  body.m4w();
  
  // タイマー・カウント表示をスプライトとして実装
  // (本来は、メインロジックに入れるべきだが、スプライトの応用例として実装)
  window.count = 0;
  body.m4w.screen.sprites.push({
    render: function(ctx){
      window.count++;
      $("#message2").html("Time: "+(new Date()).getTime() + "/ Count: " + window.count);
    }
  });
  
  // スタート時の時間を表示
  $("#message1").html("Time: "+(new Date()).getTime());
  // アセットのロード
  AssetsLoader.load({
    assets: [{type: "sprite", id: "s01", src:"img/sampleimage.gif"}],
    success: on_ready
  });
  
  // メインループの開始
  window.m4w.main_loop();
  
  // 10秒後にメインループを終了するように設定
  window.setTimeout(window.m4w.stop_main_loop, 10000);
});
