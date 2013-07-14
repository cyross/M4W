/**
 * @fileOverview Miyako4Web(Miyako for Web a.k.a M4W/m4w) physics Extension(needs Box2dWeb-X.X.X.X.js)<br>
 * M4W用物理演算対応拡張プラグイン(要Box2dWeb-X.X.X.X.js)
 * このファイルを読み込むと、window.m4wオブジェクトに以下のプロパティが追加される<br>
 * window.m4w.WebGLRenderer<br>
 * window.m4w.WebGLSpriteRenderer<br>
 * window.m4w.WebGLSprite<br>
 *
 * @name Miyako for Web(M4W) physics extention
 * @author Cyross Makoto (サイロス誠)
 * @version 0.0.1
 * @revision 1
 * @require jQuery 1.9.0/2.0.0(or later)
 * @license MIT License (MITライセンス)
 */

(function($){
  // メートル/ピクセルの換算比率
  var SCALE = 1/30; // 1メートルあたり30ピクセル

  // ２次元配列の作成
  function createVector(x, y){
    return new Box2D.Common.Math.b2Vec2(x, y);
  }

  /**
   * @constructor
   * @class 物理演算を管理・操作するオブジェクトの生成
   * @param [options.grav_x] x方向の重力<br>省略時は0
   * @param [options.grav_y] y方向の重力<br>省略時は9.8
   * @param [options.doSleep] trueのときは、動かしていないオブジェクトを計算しない<br>省略時はtrue
   * @param [options.physics_time] stepメソッドを呼び出した時に進む時間(秒)<br>省略時は1/60(秒)
   * @param [options.velocity_iterations] stepメソッドを呼び出した時に行う速さ計算の回数<br>多くすれば精度は上がるが時間がかかる<br>省略時は5(回)
   * @param [options.position_iterations] stepメソッドを呼び出した時に行う位置計算の回数<br>多くすれば精度は上がるが時間がかかる<br>省略時は5(回)
   */
  Physics = function(options){
    var o = $.extend({
      grav_x: 0,
      grav_y: 9.8,
      doSleep: true,
      physics_time: 1/60,
      velocity_iterations: 5,
      position_iterations: 5
    }, options);

    // 物理シミュレーション関係
    this.physics_time = o.physics_time;
    this.velocity_iterations = o.velocity_iterations;
    this.position_iterations = o.position_iterations;

    // 物理世界の生成
    this.world = new Box2D.Dynamics.b2World(createVector(o.grav_x, o.grav_y), o.doSleep);

    this.body_list = [];
  }

  // ２次元配列の作成
  Physics.createVector = createVector;

  // メートル/ピクセルの換算比率
  Physics.SCALE = SCALE;

  Physics.bodyDefProperties = {"body_def_type": "type", "user_data": "userData", "allow_sleep": "allowSleep"};
  Physics.fixtureDefProperties = {"density": "density", "friction": "friction", "restitution": "restitution"};

  // 剛体定義の生成
  Physics.prototype.createBodyDef = function(options){
    var o = $.extend({
      body_def_type: Box2D.Dynamics.b2Body.b2_dynamicBody,
      allow_sleep: true,
      x: 0,
      y: 0,
      user_data: null}, options);
    var body_def = new Box2D.Dynamics.b2BodyDef();

    // 初期位置を設定
    body_def.position.Set(o.x*SCALE, o.y*SCALE);
    for(var p in Physics.bodyDefProperties){
      var name = Physics.bodyDefProperties[p];
      body_def[name] = o[p];
    }

    return body_def;
  }

  // フィクスチャ定義の生成
  Physics.prototype.createFixtureDef = function(shape, options){
    var o = $.extend({
      fixture_def: Box2D.Dynamics.b2FixtureDef,
      density: 0,
      friction: 0,
      restitution: 0
    }, options);

    var fixture_def = new o.fixture_def();

    fixture_def.shape = shape;

    for(var p in Physics.fixtureDefProperties){
      var name = Physics.fixtureDefProperties[p];
      fixture_def[name] = o[p];
    }

    return fixture_def;
  }

  // シェイプの生成
  Physics.prototype.createShape = function(options){
    var o = $.extend({ shape_def: Box2D.Collision.Shapes.b2PolygonShape, w:100, h:100 }, options);
    var shape = new o.shape_def();

    // シェイプの大きさを設定
    shape.SetAsBox((o.w/2)*SCALE, (o.h/2)*SCALE);

    return shape;
  }

  // 剛体の生成
  Physics.prototype.createBody = function(body_def, fixture_def){
    var body = this.world.CreateBody(body_def);
    body.CreateFixture(fixture_def);
    return body;
  }

  // 時間をすすめる
  Physics.prototype.step = function(){
    this.world.Step(this.physics_time, this.velocity_iterations, this.position_iterations);
  }

  // 時間を進めた剛体の情報からuser_dataを更新する
  Physics.prototype.update = function(){
    for(var i=0, len=this.body_list.length; i<len; i++){
      var body = this.body_list[i];
      if(body == null){ continue; }
      var data = body.getUserData();
      if(data){ data.update(body); }
    }
  }

  function createInner(obj, physics, options){
    var o = $.extend({}, options);
    // シェイプを生成
    obj.shape = physics.createShape(o);
    // フィクスチャ定義を生成
    obj.fixture_def = physics.createFixtureDef(obj.shape, o);
    //  剛体を生成
    obj.body = physics.createBody(obj.body_def, obj.fixture_def);

    physics.body_list.push(obj);
  }

  /**
   * @constructor
   * @class 動く剛体を生成
   * @param physics m4w.Physicsクラスのオブジェクト
   * @param options.w 剛体の幅
   * @param options.h 剛体の高さ
   * @param [options.x] x方向の位置<br>省略時は0
   * @param [options.y] y方向の位置<br>省略時は0
   * @param [options.density] 剛体の密度(1立方メートルあたり質量densityキログラム)<br>省略時は0
   * @param [options.friction] 剛体の摩擦係数<br>省略時は0
   * @param [options.restitution] 剛体の弾性(反発係数)<br>省略時は0
   * @param [options.user_data] 付帯させるデータ(要update()メソッド)<br>省略時はnull(update()メソッド不要)
   * @param [options.body_def_type] 剛体の形式の数値<br>省略時はBox2D.Dynamics.b2Body.b2_dynamicBody
   * @param [options.fixture_def] フィクスチャ定義のクラス<br>省略時はBox2D.Dynamics.b2FixtureDef
   * @param [options.shape_def] シェイプのクラス<br>省略時はBox2D.Collision.Shapes.b2PolygonShape
   * @param [options.allow_sleep] 動かないときは物理演算の対象から外すかを指定<br>省略時はtrue
   */
  DynamicBody = function(physics, options){
    var o = $.extend({
      body_def_type: Box2D.Dynamics.b2Body.b2_dynamicBody,
      x: 0,
      y: 0,
      user_data: null}, options);
    // 剛体定義を生成
    this.body_def = physics.createBodyDef(o);
    createInner(this, physics, o);
  }

  DynamicBody.prototype.getUserData = function(){
    return this.body.GetUserData();
  }

  DynamicBody.prototype.getPosition = function(){
    return this.body.GetPosition();
  }

  // 移動方向を指定
  DynamicBody.prototype.setLinearVelocity = function(vector){
    this.body.SetLinearVelocity(vector);
  }

  /**
   * @constructor
   * @class 固定剛体を生成
   * @param physics m4w.Physicsクラスのオブジェクト
   * @param options.w 剛体の幅
   * @param options.h 剛体の高さ
   * @param [options.x] x方向の位置<br>省略時は0
   * @param [options.y] y方向の位置<br>省略時は0
   * @param [options.density] 剛体の密度(1立方メートルあたり質量densityキログラム)<br>省略時は0
   * @param [options.friction] 剛体の摩擦係数<br>省略時は0
   * @param [options.restitution] 剛体の弾性(反発係数)<br>省略時は0
   * @param [options.user_data] 付帯させるデータ(要update()メソッド)<br>省略時はnull(update()メソッド不要)
   * @param [options.body_def_type] 剛体の形式の数値<br>省略時はBox2D.Dynamics.b2Body.b2_staticBody
   * @param [options.fixture_def] フィクスチャ定義のクラス<br>省略時はBox2D.Dynamics.b2FixtureDef
   * @param [options.shape_def] シェイプのクラス<br>省略時はBox2D.Collision.Shapes.b2PolygonShape
   * @param [options.allow_sleep] 動かないときは物理演算の対象から外すかを指定<br>省略時はtrue
   */
  StaticBody = function(physics, options){
    var o = $.extend({
      body_def_type: Box2D.Dynamics.b2Body.b2_staticBody,
      x: 0,
      y: 0,
      user_data: null}, options);
    // 剛体定義を生成
    this.body_def = physics.createBodyDef(o);
    createInner(this, physics, o);
  }

  StaticBody.prototype.getUserData = function(){
    return this.body.GetUserData();
  }

  StaticBody.prototype.getPosition = function(){
    return this.body.GetPosition();
  }

  window.m4w = $.extend({Physics: Physics, DynamicBody: DynamicBody, StaticBody: StaticBody}, window.m4w);
})(jQuery);
