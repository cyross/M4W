/**
 * @fileOverview Miyako4Web(Miyako for Web a.k.a M4W/m4w) Thread Extension<br>
 * M4W用スレッド対応拡張プラグイン
 * このファイルを読み込むと、window.m4wオブジェクトに以下のプロパティが追加される<br>
 * window.m4w.ThreadManager<br>
 * window.m4w.Thread<br>
 *
 * @name Miyako for Web(M4W) Thread extention
 * @author Cyross Makoto (サイロス誠)
 * @version 0.0.1
 * @revision 1
 * @require jQuery 1.9.0/2.0.0(or later)
 * @license MIT License (MITライセンス)
 */

(function($){
  /**
   * @constructor
   * @class 複数スレッドを一括管理・操作
   * @param [options.threads] Threadsクラスオブジェクトの配列<br>省略時は空配列
   * @param [options.interval] Threads.updateの呼び出し間隔<br>単位はミリ秒<br>省略時は10
   */
  ThreadManager = function(options){
    var o = $.extend({
      threads: [],
      interval: 10
    }, options);
   
    /**
     * IDとスレッドを関連付ける辞書オブジェクト
     */
    this.threads = o.threads;
    this.interval = o.interval;
    this.timer = null;
    /**
     * @property スレッド割り込みタイマー
     */
    this.thread_timer = null;
  };

  /**
   * @ignore
   */
  ThreadManager.prototype.update = function(){
    var ts = this.threads;
    for(var i=0; i<ts.length; i++){
      var th = ts[i];
      if(!('update' in th)){ continue; }
      if(th.is_exec && !th.waiting && !th.update()){ th.stop(); }
    }
  };

  /**
   * タイマーを使ったスプライト描画・スレッドの監視を開始する
   */
  ThreadManager.prototype.start = function(){
    this.threads.timer = setInterval(this.threads.update.bind(this.threads), this.threads.interval);
    var each_frame = requestAnimFrame(this.screen.interval);
    each_frame(this.screen.render.bind(this.screen));
    return this.body;
  };

  /**
   * スレッドの監視を停止する
   */
  ThreadManager.prototype.stop = function(){
    if(this.threads.timer != null){ clearInterval(this.threads.timer); }
    return this.body;
  };

  /**
   * @param [options.start] Thread#startで呼び出す関数(引数は同じ)
   * @param [options.update] Thread#updateで呼び出す関数(引数は同じ)<br>処理を継続するときはtrue、停止するときはfalseを返すこと
   * @param [options.stop] Thread#stopで呼び出す関数(引数は同じ)
   * @param [options.pause] Thread#pauseで呼び出す関数(引数は同じ)
   * @param [options.resume] Thread#resumeで呼び出す関数(引数は同じ)
   * @constructor
   * @class スレッドを実装
  */
  Thread = function(options){
    t = $.extend({
      start: function(params){ },
      update: function(){ return true; },
      stop: function(){ },
      pause: function(){ },
      resume: function(){ }
    }, options);

    this.is_exec = false;
    this.waiting = false;
    this.body = t;
  };

  /**
   * スレッドの開始処理
   * 開始時の処理内容をオーバーライドする
   * @param params スレッド開始時に渡したいオブジェクト
   */
  Thread.prototype.start = function(params){
    this.body.start(params);
    this.is_exec = true;
  };

  /**
   * スレッドのメイン処理
   * 処理の内容をオーバーライドする
   * 処理を継続するときはtrue、停止するときはfalseを返す
   */
  Thread.prototype.update = function(){
    return this.body.update();
  };

  /**
   * スレッドの停止処理
   * 停止時の処理内容をオーバーライドする
   */
  Thread.prototype.stop = function(){
    this.is_exec = false;
    this.body.stop();
  };

  /**
   * スレッドの中断
   * ただし、停止時には中断しない
   * 中断時の処理内容をオーバーライドする
   */
  Thread.prototype.pause = function(){
    if(!this.is_exec){ return; }
    this.waiting = true;
    this.body.pause();
  };

  /**
   * スレッドの再開処理
   * ただし、停止時には中断しない
   * 再開時の処理内容をオーバーライドする
   */
  Thread.prototype.resume = function(){
    if(!this.is_exec){ return; }
    this.waiting = false;
    this.body.resume();
  };

  window.m4w = $.extend({ThreadManager: ThreadManager, Thread: Thread}, window.m4w);
})(jQuery);
