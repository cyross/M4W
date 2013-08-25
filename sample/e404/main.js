var create_sprite = function(img, x, y){
  return new m4w.Sprite({
    value: img,
    x: x,
    y: y
  });
}

var GameObject = function(){
  this.bullets = [];
  this.ebullets = [];
  this.pindex = 0;
  this.score = 0;
};

GameObject.prototype.next_pindex = function(){
  return this.pindex++;
}

var BG = function(options){
  var o = $.extend({
    width: 640,
    height: 480,
    star: {
      stars: 50,
      color: "rgb(255,255,255)",
      radius: 2
    },
    wait: 60
  }, options);
  this.stars = o.star.stars;
  this.star_color = o.star.color;
  this.star_radius = o.star.radius;
  this.wait = o.wait;
  this.cnt = 0;
  this.width = o.width;
  this.height = o.height;
  this.game_object = o.game_object;
};

BG.prototype.render = function(ctx){
  if(this.cnt == 0){
    var r = this.star_radius;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = this.star_color;
    for(var i=0; i<this.stars; i++){
      var x = Math.random() * this.width;
      var y = Math.random() * this.height;
      ctx.fillRect(x, y, r, r);
    }
  }
  this.cnt = (this.cnt + 1) % this.wait;
}

var Bullet = function(options){
  var o = $.extend({
    x: 0,
    y: 0,
    width: 2,
    height: 4,
    color: "rgb(255,255,0)",
    wait: 1,
    speed: -4
  }, options);
  this.pos = {x: o.x, y: o.y};
  this.size = {w: o.width, h: o.height};
  this.color = o.color;
  this.screen = o.screen;
  this.speed = o.speed;
  this.wait = o.wait;
  this.wcnt = 0;
  this.game_object = o.game_object;
  this.pindex = this.game_object.next_pindex();
  this.state = "alive";
};

Bullet.prototype.show = function(){
  this.screen.sprites[this.pindex] = this;
}

Bullet.prototype.hide = function(){
  this.screen.sprites[this.pindex] = null;
}

Bullet.prototype.render = function(ctx){
  var pos = this.pos;
  var size = this.size;
  ctx.fillStyle = this.color;
  ctx.fillRect(pos.x, pos.y, size.w, size.h);
};

Bullet.prototype.is_inner = function(){
  return (this.pos.y + this.size.h >= 0) && (this.pos.y < this.game_object.screen_size.h);
};


Bullet.prototype.update = function(){
  if(this.wcnt == 0){
    this.pos.y += this.speed;
    if(!this.is_inner()){
      this.state = "dead";
    }
  }
  this.wcnt = (this.wcnt + 1) % this.wait;
};

Bullet.prototype.is_alive = function(){
  return this.state == "alive"
};

var Player = function(options){
  var o = $.extend({
    collision: {x: 16, y: 16, w: 16, h: 16}
  }, options);

  this.pos = {x: o.x, y: o.y};
  this.sprite = create_sprite(
    o.image,
    this.pos.x, this.pos.y);
  this.width = o.image.width;
  this.height = o.image.height;
  this.screen = o.screen;
  this.game_object = o.game_object;
  this.pindex = this.game_object.next_pindex();
  this.collision = o.collision;
  this.state = "alive";
};

Player.prototype.show = function(){
  this.screen.sprites[this.pindex] = this.sprite;
}

Player.prototype.hide = function(){
  this.screen.sprites[this.pindex] = null;
}

Player.prototype.move = function(x, y){
  if(x != null){
    var right = this.screen.width - this.width;
    this.pos.x = x;
    if(this.pos.x < 0){ this.pos.x = 0; }
    if(this.pos.x >= right){ this.pos.x = right; }
  }
  if(y != null){ this.pos.y = y; }
};

Player.prototype.update = function(){
  // 移動処理
  this.sprite.move(this.pos);

  // 敵の攻撃にあたった時
  var bullets = this.game_object.ebullets;
  var col_i = this.is_collision(bullets);
  if(col_i >= 0){
    bullets[col_i].hide();
    this.game_object.ebullets.splice(col_i, 1);
    this.hide();
    this.state = "dead";
  }
}

Player.prototype.is_alive = function(){
  return this.state == "alive";
}

Player.prototype.shot = function(){
  var bullet = new Bullet({
    x: this.pos.x + this.width/2,
    y: this.pos.y,
    width: 4,
    height: 6,
    screen: this.screen,
    game_object: this.game_object
  });
  bullet.show();
  this.game_object.bullets.push(bullet);
}

Player.prototype.is_collision = function(bullets){
  var x = this.pos.x + this.collision.x;
  var y = this.pos.y + this.collision.y;
  var w = this.collision.w;
  var h = this.collision.h;
  for(var i=0, len=bullets.length; i<len; i++){
    var bullet = bullets[i];
    var pos = bullet.pos;
    var size = bullet.size;
    if((x <= (pos.x + size.w)) && (pos.x <= (x + w)) && (y <= (pos.y + size.h)) && (pos.y <= (y + h))){
      return i;
    }
  }
  return -1;
};

var Enemy = function(options){
  var o = $.extend({
    score: 100,
    wait: 10,
    bwait: 5,
    attack_rate: 0.02,
    collision: {x: 0, y: 0, w: 48, h: 48}
  }, options);

  this.pos = {x: o.x, y: o.y};
  this.sprite = create_sprite(
    o.image,
    this.pos.x, this.pos.y);
  this.width = o.image.width;
  this.height = o.image.height;
  this.screen = o.screen;
  this.score = o.score;
  this.bullets = o.bullets;
  this.move_pattern = [0, -4, 0, -4, 0, 4, 0, 4, 0, 4, 0, 4, 0, -4, 0, -4];
  this.move_patterns = this.move_pattern.length;
  this.mindex = 0;
  this.wait = o.wait;
  this.cnt = 0;
  this.bwait = o.bwait;
  this.bcnt = 0;
  this.attack_rate = o.attack_rate;
  this.game_object = o.game_object;
  this.pindex = this.game_object.next_pindex();
  this.collision = o.collision;
  this.state = "alive";
};

Enemy.prototype.show = function(){
  this.screen.sprites[this.pindex] = this.sprite;
}

Enemy.prototype.hide = function(){
  this.screen.sprites[this.pindex] = null;
}

Enemy.prototype.move = function(x, y){
  if(x != null){
    var right = this.screen.width - this.width;
    this.pos.x = x;
    if(this.pos.x < 0){ this.pos.x = 0; }
    if(this.pos.x >= right){ this.pos.x = right; }
  }
  if(y != null){ this.pos.y = y; }
};

Enemy.prototype.update = function(){
  if(this.state != "alive"){ return; }
  this.cnt = (this.cnt + 1) % this.wait;
  if(this.cnt == 0){
    // 移動
    var diff = this.move_pattern[this.mindex];
    this.mindex = (this.mindex + 1) % this.move_patterns;
    this.pos.x = this.pos.x + diff;
    this.sprite.move(this.pos);
    // 弾の射出
    this.bcnt = (this.bcnt + 1) % this.bwait;
    var r = Math.random();
    if(this.bcnt==0 && r <= this.attack_rate){ this.shot(); }
  }

  var bullets = this.game_object.bullets;
  var col_i = this.is_collision(bullets);
  if(col_i >= 0){
    bullets[col_i].hide();
    this.game_object.bullets.splice(col_i, 1);
    this.hide();
    this.game_object.score += this.score;
    this.state = "dead";
  }
}

Enemy.prototype.is_collision = function(bullets){
  var x = this.pos.x + this.collision.x;
  var y = this.pos.y + this.collision.y;
  var w = this.collision.w;
  var h = this.collision.h;
  for(var i=0, len=bullets.length; i<len; i++){
    var bullet = bullets[i];
    var pos = bullet.pos;
    var size = bullet.size;
    if((x <= (pos.x + size.w)) && (pos.x <= (x + w)) && (y <= (pos.y + size.h)) && (pos.y <= (y + h))){
      return i;
    }
  }
  return -1;
};

Enemy.prototype.is_alive = function(){
  return this.state == "alive";
}

Enemy.prototype.shot = function(){
  var bullet = new Bullet({
    x: this.pos.x + this.width/2,
    y: this.pos.y + this.height,
    color: "rgb(80, 80, 255)",
    speed: 4,
    screen: this.screen,
    game_object: this.game_object
  });
  bullet.show();
  this.game_object.ebullets.push(bullet);
}

$(document).ready(function(){
  var _m4w = window.m4w;
  var input = _m4w.Input;
  var keys  = _m4w.Input.KEYS;
  // ゲームオブジェクト
  var game_object = new GameObject({
    screen_size: {w: 480, h: 480},
    image_size: {w: 48, h: 48},
    block_size: {w: 10, h: 10}
  });
  // 画面の大きさ
  game_object.screen_size = {w: 480, h: 480};
  // ブロックの大きさ
  game_object.image_size  = {w: 48,  h: 48};
  // ブロックの数
  game_object.block_size  = {w: 10,  h: 10};
  // プレイヤーのy座標
  var player_y = game_object.image_size.w*8;

  var $body = $("#game");

  var enemy_map = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,2,0,0,2,0,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ];

  // メイン画面はz=0

  // バックグラウンド(星空)
  var bg = new BG({
    width: game_object.screen_size.w,
    height: game_object.screen_size.h,
    game_object: game_object
  });
  var bg_layer = new _m4w.Screen({
    width: game_object.screen_size.w,
    height: game_object.screen_size.h,
    body: $body, z: -2});

  // スコアなど
  var info_layer = new _m4w.Screen({width: 480, height: 480, body: $body, z: 10});

  // アセットロード終了時の処理
  var on_ready = function(assets){
    var screen = window.m4w.screen;
    var pos = null;

    // プレイヤー
    var player = new Player({
      x: 0, y: player_y,
      image: assets.image.p001,
      screen: screen,
      game_object: game_object
    });

    // 敵
    var enemies = [];
    var image_w = game_object.image_size.w;
    var image_h = game_object.image_size.h;
    for(var i=0, len = enemy_map.length; i<len; i++){
      var emap2 = enemy_map[i];
      for(var j=0, len2 = emap2.length; j<len2; j++){
        var e = emap2[j];
        if(e == 0){ continue; } // 敵なし
        var eid = ("e00" + e).substring(0, 4);
        var enemy = new Enemy({
          x: image_w*j, y: image_h*i, 
          image: assets.image[eid],
          screen: screen,
          score: e * 100,
          game_object: game_object
        });
        enemy.show();
        enemies.push(enemy);
      }
    }

    // メインロジック
    var main_logic = function(){
      var i=0;
      var len = game_object.bullets.length;
      if(pos != null){ player.move(pos[0], null); }
      bg.render(bg_layer.context);
      // 自機弾の処理 
      while(i<len){
        var bullet = game_object.bullets[i];
        // 弾が死んだら削除
        if(!bullet.is_alive()){
          bullet.hide();
          game_object.bullets.splice(i, 1);
          len = game_object.bullets.length;
          continue;
        }
        bullet.update();
        i++;
      }
      i = 0;
      len = game_object.ebullets.length;
      // 敵弾の処理 
      while(i<len){
        var bullet = game_object.ebullets[i];
        // 弾が死んだら削除
        if(!bullet.is_alive()){
          bullet.hide();
          game_object.ebullets.splice(i, 1);
          len = game_object.ebullets.length;
          continue;
        }
        bullet.update();
        i++;
      }
      // 自機の処理
      player.update();
      // 敵の処理
      i = 0;
      len = enemies.length;
      while(i<len){
        var enemy = enemies[i];
        enemy.update();
        i++;
      }
    };

    // ローディング画像を消去
    $("div#loading").css("display", "none");

    // マウス(タッチ)の座標取得設定
    // Input.is_touch_deviceがtrueならタッチの座標、falseのときはマウスの座標となる
    input.set_auto_event_mode();
    input.apply_events($body, {
      enter: function(ev){
        $body.css("cursor", "url(img/empty.gif)");
        if(player.is_alive()){ pos = input.get_xy($body, ev); }
      },
      move: function(ev){
        if(player.is_alive()){ pos = input.get_xy($body, ev); }
      },
      leave: function(ev){
        $body.css("cursor", "default");
        pos = null;
      },
      click: function(ev){
        if(player.is_alive() && pos != null){ player.shot(); }
      }
    });

    // キー毎のイベントを設定
    // [6キー, 4キー, 2キー, zキー]
    input.init_key_status([keys.num6,keys.num4,keys.Z]);
    input.start_key_monitoring();

    player.show();

    window.m4w.main_logic = main_logic;
  };

  // M4Wの初期化
  $body.m4w({
    screen_options: {
      width: 480,
      height: 480
    }
  });

  // アセットのロード
  AssetsLoader.load({
    assets: [
      {type: "image", id: "p001", src:"img/p001.png"},
      {type: "image", id: "p001_00", src:"img/p001_00.png"},
      {type: "image", id: "p001_10", src:"img/p001_10.png"},
      {type: "image", id: "p001_01", src:"img/p001_01.png"},
      {type: "image", id: "p001_11", src:"img/p001_11.png"},
      {type: "image", id: "e001", src:"img/e001.png"},
      {type: "image", id: "e002", src:"img/e002.png"},
    ],
    success: on_ready
  });

  // メインループの開始
  window.m4w.main_loop();
});
