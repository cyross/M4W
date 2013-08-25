var setup_sprite_inner = function(img, x, y, img_w, img_h){
  return new m4w.SpriteEx({
    value: img,
    x: x,
    y: y,
    sx: 0,
    sy: 0,
    sw: img_w,
    sh: img_h,
    dw: img_w,
    dw: img_h
  });
}

var setup_map_chip = function(img, x, y, img_w, img_h, num){
  var w2 = img.width / img_w;
  var h2 = img.height / img_h;
  var x2 = (num / h2) | 0 ;
  var y2 = num % w2;
  return new m4w.SpriteEx({
    value: img, x: x*img_w, y: y*img_h,
    sx: x2*img_w, sy: y2*img_h, sw: img_w, sh: img_h,
    dx: 0, dy: 0, dw: img_w, dh: img_h
  });
}

var update_x = function(player, sprite, distance, num){
  var nx = player.x + distance;
  sprite.sx = num*player.map_chip_w;
  if(player.can_move(nx, player.y)){
    player.x = nx;
    sprite.move({x: player.x});
    player.moving_x = distance;
    player.state = "moving";
  }
}

var update_y = function(player, sprite, distance, num){
  var ny = player.y + distance;
  sprite.sx = num*player.map_chip_w;
  if(player.can_move(player.x, ny)){
    player.y = ny;
    sprite.move({y: player.y});
    player.moving_y = distance;
    player.state = "moving";
  }
}

var Player = function(options){
  var o = $.extend({
    distance: 4,
    x: 0,
    y: 0
  }, options);

  this.state = "idle";
  this.x = o.x;
  this.y = o.y;
  this.sprite = o.sprite;
  this.can_move_by_type = o.can_move_by_type;
  this.events = o.events,
  this.map = o.map;
  this.map_w = o.map_w;
  this.map_h = o.map_h;
  this.map_chip_w = o.map_chip_w;
  this.map_chip_h = o.map_chip_h;
  this.distance = o.distance;
  this.moving_x = 0;
  this.moving_y = 0;
};

Player.states = ["idle", "moving", "menu"];

Player.updates = {
  idle: function(player, input, menu, message){
    var sprite = player.sprite;
    var distance = player.distance;
    if(input.is_key_pushing(0)){ // 8キー
      update_y(player, sprite, -distance, 0);
    }
    else if(input.is_key_pushing(3)){ // 2キー
      update_y(player, sprite, distance, 3);
    }
    if(input.is_key_pushing(1)){ // 6キー
      update_x(player, sprite, distance, 1);
    }
    else if(input.is_key_pushing(2)){ // 4キー
      update_x(player, sprite, -distance, 2);
    }
    else if(input.is_key_pushed(4)){ // zキー
      if(menu != null){
        menu.enable();
        menu.show();
        player.state = "menu";
      }
    }
  },
  moving: function(player, input, menu, message){
    var sprite = player.sprite;
    player.x = player.x + player.moving_x;
    player.y = player.y + player.moving_y;
    sprite.move({x: player.x, y: player.y}); 
    if(player.x % player.map_chip_w == 0 && player.y % player.map_chip_h == 0){ 
      player.moving_x = 0;
      player.moving_y = 0;
      player.state = "idle";
    }
  },
  menu: function(player, input, menu, message){
    if(input.is_key_pushed(0)){ // 8キー
      menu.down();
    }
    else if(input.is_key_pushed(3)){ // 2キー
      menu.up();
    }
    if(input.is_key_pushed(4)){ // zキー
      message.text.text = menu.selected_item().text;
      menu.disable();
      menu.hide();
      message.show();
      player.state = "message";
    }
    else if(input.is_key_pushed(5)){ // xキー
      menu.disable();
      menu.hide();
      player.state = "idle";
    }
    menu.render();
  },
  message: function(player, input, menu, message){
    if(input.is_key_pushed(4)){ // zキー
      message.hide();
      player.state = "idle";
    }
    message.render();
  }
}

Player.prototype.change_state = function(state){
  this.state = state;
}

Player.prototype.update = function(input, menu, message){
  Player.updates[this.state](this, input, menu, message);
}

Player.prototype.can_move = function(x, y){
  var img_w  = this.map_chip_w;
  var img_h  = this.map_chip_h;
  var events = this.events;
  var map    = this.map;
  var map_w  = this.map_w;
  var map_h  = this.map_h;
  var flags  = this.can_move_by_type;
  var l = x / img_w | 0;
  var t = y / img_h | 0;
  var r = (x+img_w-1) / img_w | 0;
  var b = (y+img_h-1) / img_h | 0;
  for(var i=t; i>=0 && i<=b && i<map_h; i++){
    var mp2 = map[i];
    var ev2 = events[i];
    for(var j=l; j>=0 && j<=r && j<map_w; j++){
      var mp = mp2[j];
      var ev = ev2[j];
      if(!flags[mp] && (ev == null || !ev.can_over)){ return false; }
    }
  }
  return true;
}

Player.prototype.move = function(options){
  this.sprite.move(options);
}

var Event = function(options){
  var o = $.extend({
    distance: null,
    pos: {x: 0, y: 0},
    x: 0,
    y: 0,
    can_move: false,
    can_over: true
  }, options);

  this.state = "idle";
  this.x = o.x;
  this.y = o.y;
  this.sprite = o.sprite;
  this.can_move = o.can_move;
  this.can_over = o.can_over;
  this.distance = o.distance;
};

var Menu = function(options){
  var o = $.extend({
   items: [],
   x: 0,
   y: 0,
   w: 1,
   h: 1,
   margin: 2,
   font_size: 14,
   font_weight: "",
   cursor_width: 2,
   frame_width: 2,
   shadow_margin: 2,
   bg_color: "rgb(0,0,0)",
   frame_color: "rgb(255,255,255)",
   cursor_color: "rgb(200,200,255)",
   unselect_text_color: "rgb(255,255,255)",
   select_text_color: "rgb(255,0,0)",
   shadow_color: "rgb(128,128,128)"
  }, options);

  this.info = null;
  this.screen = o.screen;
  this.visible = false;
  this.avail = false;
  this.items = o.items;
  this.selected_pos = 0;
  this.o = o;
}

Menu.prototype.show = function(){
  this.visible = true;
}

Menu.prototype.hide = function(){
  var info = this.get_info();
  this.screen.context.clearRect(info.x,info.y,info.w,info.h);
  this.visible = false;
}

Menu.prototype.enable = function(){
  this.avail = true;
  this.items[this.selected_pos].selected = true;
};

Menu.prototype.disable = function(){
  this.avail = false;
};

Menu.prototype.down = function(){
  var len = this.items.length;
  for(var i=0; i<len; i++){ this.items[i].selected = false; }
  this.selected_pos = (this.selected_pos + 1) % len;
  this.items[this.selected_pos].selected = true;
}

Menu.prototype.up = function(){
  var len = this.items.length;
  for(var i=0; i<len; i++){ this.items[i].selected = false; }
  this.selected_pos = (len + this.selected_pos - 1) % len;
  this.items[this.selected_pos].selected = true;
}

Menu.prototype.get_info = function(update){
  if(this.info == null || update){
    var x = this.o.x;
    var y = this.o.y;
    var w = this.o.w;
    var h = this.o.h;
    var m = this.o.margin;
    var cw = this.o.cursor_width;
    var fw = this.o.frame_width;
    var len = this.items.length;
    var mwo = m+fw;
    var mwi = m+cw+m;
    var mho = m+fw;
    var mhi = m+cw+m;
    var bw = w+(mwo+mwi)*2;
    var bh = (h+mhi*2)*len+mho*2;
    var frame_l = x + m + fw;
    var frame_t = y + m + fw;
    var frame_w = bw - (m + fw) * 2;
    var frame_h = bh - (m + fw) * 2;
    var item_l = x + mwo;
    var item_t = y + mho;
    var item_w = w + mwi * 2;
    var item_h = h + mwi * 2;
    var cursor_l = item_l + m + cw;
    var cursor_t = item_t + m + cw;
    var cursor_w = w + m * 2;
    var cursor_h = h + m * 2;
    var text_l = item_l + mwi;
    var text_t = item_t + mhi;
    var font_style = this.o.font_size+"px "+this.o.font_weight;

    this.info = {
      x: x, y: y,
      frame_l: frame_l, frame_t: frame_t, frame_w: frame_w, frame_h: frame_h,
      item_l: item_l, item_t: item_t, item_w: item_w, item_h: item_h,
      text_l: text_l, text_t: text_t, text_w: w, text_h: h,
      cursor_l: cursor_l, cursor_t: cursor_t, cursor_w: cursor_w, cursor_h: cursor_h,
      w: bw, h: bh, 
      m: m, mwo: mwo, mwi: mwi, mho: mho, mhi: mhi,
      font_size: this.o.font_size, shadow_margin: this.o.shadow_margin, fw: fw, cw: cw,
      len: len,
      bg_color: this.o.bg_color, frame_color: this.o.frame_color, cursor_color: this.o.cursor_color,
      unselect_text_color: this.o.unselect_text_color, select_text_color: this.o.select_text_color,
      shadow_color: this.o.shadow_color, font_style: font_style
    };
  }
  return this.info;
}

Menu.prototype.render = function(){
  if(!this.visible){ return; }
  var ctx = this.screen.context;
  var info = this.get_info();
  var len = info.len;
  ctx.fillStyle = info.bg_color;
  ctx.fillRect(info.x, info.y, info.w, info.h);
  ctx.strokeStyle = info.frame_color;
  ctx.lineWidth = info.fw;
  ctx.strokeRect(info.frame_l, info.frame_t, info.frame_w, info.frame_h);
  ctx.font = info.font_style;
  for(var i=0; i<len; i++){
    this.items[i].render(ctx, i, info);
  }
};

Menu.prototype.selected_item = function(){
  return this.items[this.selected_pos];
}

MenuItem = function(title, index, text){
  this.title = title;
  this.index = index;
  this.selected = false;
  this.text = text;
};

MenuItem.prototype.render = function(ctx, index, info){
  var imh = info.item_h * index;
  var x = info.item_l;
  var y = info.item_t + imh;
  var tx = info.text_l;
  var ty = info.text_t + imh + info.font_size;

  ctx.fillStyle = info.shadow_color;
  ctx.fillText(this.title, tx+info.shadow_margin, ty+info.shadow_margin);
  if(this.selected){
    ctx.fillStyle = info.select_text_color;
  }
  else{
    ctx.fillStyle = info.unselect_text_color;
  }
  ctx.fillText(this.title, tx, ty);
  if(this.selected){
    var cx = info.cursor_l;
    var cy = info.cursor_t + imh;

    ctx.strokeStyle = info.cursor_color;
    ctx.lineWidth = info.cw;
    ctx.strokeRect(cx, cy, info.cursor_w, info.cursor_h);
  }
};

MessageText = function(options){
  var o = $.extend({
  }, options);
  this.screen = o.screen;
  this.info = o.info;
  this.o = o;
  this.text = [""];
  this.x = 0;
  this.y = 0;
};

MessageText.prototype.show = function(){
}

MessageText.prototype.hide = function(){
  var screen = this.screen;
  screen.context.clearRect(0, 0, screen.width, screen.height);
}

MessageText.prototype.render = function(){
  var lh = this.info.line_height;
  var x = this.info.text_l + this.x;
  var y = this.info.text_t + this.y + lh;
  var screen = this.screen;
  var ctx = screen.context;
  var info = this.info;
  var text_list = this.text;

  ctx.clearRect(0, 0, screen.width, screen.height);
  ctx.font = info.font_style;
  for(var i=0, len=text_list.length; i<len; i++){
    var text = text_list[i];
    ctx.fillStyle = info.shadow_color;
    ctx.fillText(text, x+info.shadow_margin, y+info.shadow_margin);
    ctx.fillStyle = info.text_color;
    ctx.fillText(text, x, y);
    y += lh;
  }
};

Message = function(options){
  var o = $.extend({
   x: 0,
   y: 0,
   tw: 40,
   th: 8,
   margin: 2,
   line_margin: 2,
   font_size: 14,
   font_weight: "",
   frame_width: 2,
   shadow_margin: 2,
   visible: false,
   bg_color: "rgb(0,0,0)",
   frame_color: "rgb(255,255,255)",
   text_color: "rgb(255,255,255)",
   shadow_color: "rgb(128,128,128)"
  }, options);

  this.screen = o.screen;
  this.visible = o.visible;
  this.o = o;
  this.info = this.get_info();
  this.text = new MessageText({
    screen: o.text_screen,
    info: this.info
  });
}

Message.prototype.show = function(){
  this.text.show();
  this.visible = true;
};

Message.prototype.hide = function(){
  var info = this.get_info();
  this.text.hide();
  this.screen.context.clearRect(info.x,info.y,info.w,info.h);
  this.visible = false;
};

Message.prototype.get_info = function(update){
  if(this.info == null || update){
    var x = this.o.x;
    var y = this.o.y;
    var m = this.o.margin;
    var fs = this.o.font_size;
    var lm = this.o.line_margin;
    var lh = fs + lm;
    var fw = this.o.frame_width;
    var mw = m+fw+m;
    var mh = m+fw+m;
    var text_l = x + m + fw + m;
    var text_t = y + m + fw + m;
    var text_w = this.o.tw * fs;
    var text_h = this.o.th * lh;
    var w = text_w + mw;
    var h = text_h + mh;
    var frame_l = x + m + fw;
    var frame_t = y + m + fw;
    var frame_w = w - (m + fw) * 2;
    var frame_h = h - (m + fw) * 2;
    var font_style = fs + "px " + this.o.font_weight;
    this.info = {
      x: x, y: y, w: w, h: h,
      text_l: text_l, text_t: text_t, text_w: text_w, text_h: text_h,
      frame_l: frame_l, frame_t: frame_t, frame_w: frame_w, frame_h: frame_h,
      m: m, mw: mw, mh: mh,
      font_size: fs, shadow_margin: this.o.shadow_margin,
      line_margin: lm, line_height: lh,
      fw: fw,
      bg_color: this.o.bg_color, frame_color: this.o.frame_color,
      text_color: this.o.text_color,
      shadow_color: this.o.shadow_color, font_style: font_style
    };
  }
  return this.info;
}

Message.prototype.render = function(){
  if(!this.visible){ return; }
  var ctx = this.screen.context;
  var info = this.get_info();
  var x = this.x;
  var y = this.y;
  var w = this.w;
  var h = this.h;
  var m = this.margin;
  ctx.fillStyle = info.bg_color;
  ctx.fillRect(info.x, info.y, info.w, info.h);
  ctx.strokeStyle = info.frame_color;
  ctx.lineWidth = info.fw;
  ctx.strokeRect(info.frame_l, info.frame_t, info.frame_w, info.frame_h);
  this.text.render();
}

$(document).ready(function(){
  var _m4w = window.m4w;
  var input = _m4w.Input;
  var keys  = _m4w.Input.KEYS;
  var body = $("#game");
  var map_chips = [
    [4,4,4,4,4,4,4,4,4,4,6,4,6,4,4,4,4,4,4,4],
    [4,1,1,1,1,1,1,1,1,1,6,1,6,1,1,5,5,5,5,4],
    [4,1,1,1,1,1,1,1,1,1,6,1,6,1,1,5,5,5,5,4],
    [4,1,1,1,1,1,1,1,1,2,6,1,6,1,1,5,5,5,5,4],
    [4,1,1,1,1,1,1,1,2,2,6,6,6,1,1,1,5,5,5,4],
    [4,1,1,1,1,1,1,1,2,2,6,2,2,1,1,1,1,1,1,4],
    [4,1,1,1,2,2,2,2,2,2,6,2,1,1,1,1,1,1,1,4],
    [4,1,1,2,2,2,6,6,6,6,6,2,1,1,1,1,1,1,1,4],
    [4,1,1,1,1,2,6,2,1,1,1,1,1,1,1,1,1,1,1,4],
    [4,1,1,1,1,2,6,1,1,1,1,1,1,1,1,1,1,1,1,4],
    [4,1,1,1,1,2,6,1,1,1,1,1,1,1,1,1,1,1,3,4],
    [4,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,3,3,4],
    [6,6,6,6,6,6,6,1,1,1,1,1,1,1,1,1,3,3,3,4],
    [6,6,6,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,4],
    [6,6,6,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
  ];
  var event_chips = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ];
  var can_move_by_type = [true, true, true, true, false, true, false];

  var map_layer = new _m4w.Screen({body: body, z: -2});
  var event_layer = new _m4w.Screen({body: body, z: -1});
  var menu_layer = new _m4w.Screen({body: body, z: 10});
  var text_layer = new _m4w.Screen({body: body, z: 20});

  // アセットロード終了時の処理
  var on_ready = function(assets){
    var screen = window.m4w.screen;
    // 画面の大きさ
    var screen_w = 640;
    var screen_h = 480;

    // スプライト初期位置
    var sprite_pos = {x: 1, y: 1};

    // マップチップの幅・高さ
    var img_w = 32;
    var img_h = 32;

    // ブロックの数
    var block_w = screen_w / img_w;
    var block_h = screen_h / img_h;

    // イベントID毎の画像の設定
    var eid2img = [null, assets.image.b01];
    var eid2canover = [false, true];

    // マップチップリストの作成
    var mapchips = [];
    // マップチップ配列から画像リストを生成
    for(var i=0, height=map_chips.length; i<height; i++){
      var mp = map_chips[i];
      var y = i * img_h;
      for(var j=0, width=mp.length; j<width; j++){
        var x = j*img_w;
        var chip_sprite = setup_map_chip(assets.image.m01, j, i, img_w, img_h, mp[j]);
        map_layer.sprites.push(chip_sprite);
      }
    }
    map_layer.render();

    // イベントリストの作成
    var events = [];
    // マップチップ配列から画像リストを生成
    for(var i=0, height=event_chips.length; i<height; i++){
      var ep = event_chips[i];
      var y = i * img_h;
      var tmp = [];
      for(var j=0, width=ep.length; j<width; j++){
        var x = j*img_w;
        var eid = ep[j];
        if(eid == 0){
          tmp.push(null);
        }
        else{
          var event_sprite = null;
          var chip_sprite = null;
          if(eid2img[eid] != null){
            chip_sprite = setup_sprite_inner(eid2img[eid], j*img_w, i*img_h, img_w, img_h);
            map_layer.sprites.push(chip_sprite);
          }
          var ev = new Event({
            x: j*img_w,
            y: i*img_h,
            sprite: chip_sprite,
            can_over: eid2canover[eid]
          })
          tmp.push(ev);
        }
        event_layer.sprites.push(chip_sprite);
      }
      events.push(tmp);
    }
    event_layer.render();

    // メニューオブジェクトを作成
    var menu = new Menu({
      screen: menu_layer,
      text_screen: text_layer,
      x: 16,
      y: 16,
      w: 128,
      h: 32,
      margin: 4,
      font_size: 24,
      font_weight: "bold",
      items: [
        new MenuItem("はなす", 1, ["今日はいい天気だ。"]),
        new MenuItem("しらべる", 2, ["足元を調べた。","しかし、何もなかった。"])
      ]
    });

    // メッセージオブジェクトを作成
    var message = new Message({
      screen: menu_layer,
      x: 16,
      y: 240,
      tw: 24,
      th: 8,
      margin: 4,
      font_size: 24,
      font_weight: "bold",
      text_screen: text_layer
    });

    // スプライトを作成
    var sprite = setup_sprite_inner(assets.image.s01, sprite_pos.x*img_w, sprite_pos.y*img_h, img_w, img_h);
    screen.sprites.push(sprite);

    // プレイヤーキャラオブジェクトを作成
    var player = new Player({
      x: sprite.x,
      y: sprite.y,
      sprite: sprite,
      map: map_chips,
      events: events,
      map_w: block_w,
      map_h: block_h,
      map_chip_w: img_w,
      map_chip_h: img_h,
      can_move_by_type: can_move_by_type
    });

    // メインロジック
    var main_logic = function(){
      player.update(input, menu, message);
    };

    // [8キー, 6キー, 4キー, 2キー, zキー, xキー]
    input.init_key_status([keys.num8,keys.num6,keys.num4,keys.num2,keys.Z,keys.X]);
    input.start_key_monitoring();

    window.m4w.main_logic = main_logic;
    
    assets.bgm.bgm01.play();
    
    $("input#toggle_bgm").on("click", function(){
      var bgm = assets.bgm.bgm01;
      if(bgm.is_play){
        bgm.stop();
      }
      else{
        bgm.play();
      }
    });
  };

  // M4Wの初期化
  body.m4w();

  // アセットのロード
  AssetsLoader.load({
    assets: [
      {type: "image", id: "s01", src:"img/chara1.png"},
      {type: "image", id: "m01", src:"img/mapchip.png"},
      {type: "image", id: "b01", src:"img/bridge1.png"},
      {type: "bgm", id: "bgm01", src: ["sound/bgm001.mp3", "sound/bgm001.ogg"]}
    ],
    success: on_ready
  });

  // メインループの開始
  window.m4w.main_loop();
});
