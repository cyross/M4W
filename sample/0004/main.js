/*
 * M4W de ライフゲーム Version 4.0
 * ブラウザ画面一杯でライフゲームをやります
 * 2013 Cyross Makoto
 */

(function(){
  // セルオブジェクトクラス
  Cell = function(){
    this.state = 0; // 生死状態
    this.generation = 0; // 世代
  }
  
  Cell.prototype.birth = function(){
    this.state = 1; // 生きている
    this.generation = 0; // 世代はゼロ
  }

  Cell.prototype.proceed = function(){
    this.state = 1; // 死んでいる
    this.generation = 1; // 世代を増やす
  }

  Cell.prototype.death = function(){
    this.state = 0; // 死んでいる
    this.generation = 0; // 世代を戻す
  }

  // 最初に生きさせる格子の数
  var live_cells = 800;

  // 格子ひとつのピクセル数
  var matrix_width = 16;
  var matrix_height = 16;

  // 更新ウェイト数
  // ゲームループ5回分
  var wait = 5;

  // 画面の情報
  var base = {
    left: 0,
    top: 0,
    width: $(window).width(),
    height: $(window).height()
  }

  // 格子の数
  var mwidth = base.width / matrix_width;
  var mheight = base.height / matrix_height;

  // 格子オブジェクトを生成
  // わざと余白分のセルを作っておくために、オブジェクトを使用
  var create_matrix = function(w, h){
    var matrix = {w: w, h: h};
    for(var y=-1; y<h+1; y++){
      var row = {};
      for(var x=-1; x<w+1; x++){ row[x] = new Cell(); }
      matrix[y] = row;
    }
    return matrix;
  };

  // 格子を初期化
  var setup = function(matrix){
    for(var l=0; l<live_cells; l++){
      var x = parseInt(Math.random() * matrix.w)+1;
      var y = parseInt(Math.random() * matrix.h)+1;
      matrix[y][x].birth();
    }
  };

  // 格子一つの生命状態を格納するマトリックス
  var matrix = create_matrix(mwidth, mheight);

  $(document).ready(function(){
    // m4w実行対象のdivタグ
    var $area = $("body");

    var reset = function(width, height, drawer, cells){
      // 基本データを変更
      live_cells = cells;
      base.width = width;
      base.height = height;

      // マトリックスの再生成
      matrix = create_matrix(base.width / matrix_width, base.height / matrix_height);

      drawer.mx = matrix;

      setup(matrix);

      // 画面のリサイズ
      $area.m4w.screen.resize(base.width, base.height);
    };

    // アセットロード終了時の処理
    var on_ready = function(assets){
      // メインロジックでのカウンタ
      var count = 0;

      // 画面に格子を描く処理
      var dw = new Drawer({
        id: "d01",
        width: base.width,
        height: base.height,
        mw: matrix_width,
        mh: matrix_height,
        mx: matrix,
        state: {"2": "yellow", "1": "red", "0": "black"},
        func: function(context){
          var w = this.mx.w;
          var h = this.mx.h;
          context.lineWidth = 1;
          for(var y=0; y<h; y++){
            var yy = y * this.mh;
            var m = this.mx[y];
            for(var x=0; x<w; x++){
              var state = this.state[m[x].state+m[x].generation];
              context.save();
              context.beginPath();
              context.fillStyle = state;
              context.fillRect(x*this.mw, yy, this.mw, this.mh);
              context.restore();
            }
          }
        }
      });

      // メインロジック
      var main_logic = function(){
        var mx = matrix;
        if(count < wait){
          count++;
          return;
        }
        count = 0;
        for(var y=0; y<mx.h; y++){
          var m = mx[y];
          for(var x=0; x<mx.w; x++){
            var cell = m[x];
            var lives = mx[y-1][x-1].state
                      + mx[y-1][x].state
                      + mx[y-1][x+1].state
                      + mx[y][x-1].state
                      + mx[y][x+1].state
                      + mx[y+1][x-1].state
                      + mx[y+1][x].state
                      + mx[y+1][x+1].state;
            if(cell.state == 0){
              if(lives==3){ cell.birth(); } // 誕生
            }
            else{
              if(lives <= 1 || lives >= 4){ // 過疎or過密
                cell.death();
              }
              else{                         // 生存
                cell.proceed();
              }
            }
          }
        }
      };

      // クリックした箇所のセルの生死を反転
      $area.off('click');
      $area.on('click', function(event){
        var x = parseInt(event.pageX / matrix_width);
        var y = parseInt(event.pageY / matrix_height);
        var m = matrix[y][x];
        if(m.state == 0){
          m.birth();
          assets.se.se_umareta.play();
        }
        else{
          m.death();
          assets.se.se_shinda.play();
        }
      });

      window.m4w.screen.sprites[0] = dw; // 描画命令を登録
      window.m4w.main_logic = main_logic;
      window.m4w.input_vars.pushed = false;

      // セットアップ
      setup(matrix);
  
      // 画面サイズが変わったときの処理
      $(window).off('resize');
      $(window).on('resize', function(event){
        reset($(window).width(), $(window).height(), dw, live_cells);
      });
    
      // メインループの開始
      window.m4w.main_loop();
    };

    // M4Wの初期化
    $area.m4w({screen_options: base});
  
    // アセットのロード
    AssetsLoader.load({
      assets: [
        {type: "se", id: "se_umareta", src: [ "snd/umareta.mp3", "snd/umareta.ogg" ]}, // 「生まれた♪」
        {type: "se", id: "se_shinda", src: [ "snd/shinda.mp3", "snd/shinda.ogg" ]} // 「死んだ♪」
      ],
      success: on_ready
    });
  });
})();
