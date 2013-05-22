/**
 * @fileOverview Miyako4Web(Miyako for Web a.k.a M4W/m4w) Drawer Extension<br>
 * M4W用図形描画応拡張プラグイン
 * このファイルを読み込むと、window.m4wオブジェクトに以下のプロパティが追加される<br>
 * window.m4w.Drawer<br>
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
   * @class スプライトと同じタイミングで図形描画を管理・操作(ドローワー)
   * @param options.id スプライトに一意に一位につけられるID<br>省略時はvalue属性(Imageオブジェクト)のidプロパティ
   * @param [options.func] ブラウザ画面関数配列<br>関数の引数には対象ブロックのコンテキスト(context)が渡る<br>省略時は空の関数
   */
  Drawer = function(options){
    var o = $.extend({
      func: function(ctx){ }
    }, options);
    // 直接インスタンスオブジェクトにパラメータの内容を結合
    $.extend(this, o);
  }

  /**
   * 画面の図形の描画を行う
   */
  Drawer.prototype.render = function(ctx){
 	  this.func(ctx);
  	return this;
  };

  window.m4w = $.extend({Drawer: Drawer}, window.m4w);
})(jQuery);
