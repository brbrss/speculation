

/////////////////////////////track////////////////

function render_start(ctx,track,num,x,y,w,h){
    ctx.strokeStyle="black";
    ctx.rect(x,y,w,h); 
    ctx.strokeRect(x,y,w,h); 
    ctx.fillStyle="#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.font = "20px Arial";
    ctx.fillText("Go! \u261b",x+w/2,y+h/2);
}

function render_bank(ctx,track,num,x,y,w,h){

    //ctx.fillStyle="#FF0000"; 
    //ctx.fillRect(x,y,w,h); 
    ctx.strokeStyle="#000000";
    ctx.rect(x,y,w,h); 
    ctx.stroke(); 
    ctx.fillStyle="#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.font = "40px Arial";
    ctx.fillText("$",x+w/2,y+h/2);
}

function render_event(ctx,track,num,x,y,w,h){
    ctx.strokeStyle="#000000";
    ctx.strokeRect(x,y,w,h); 
 
    ctx.fillStyle="#000000";
    ctx.strokeStyle="#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.font = "60px Arial bold";
    ctx.fillText("?",x+w/2,y+h/2);
}

function render_parking(ctx,track,num,x,y,w,h){
    ctx.strokeStyle="#000000";
    ctx.strokeRect(x,y,w,h); 

    ctx.fillStyle="#000000";
    ctx.strokeStyle="#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.font = "60px Arial bold";
    ctx.fillText("P",x+w/2,y+h/2);
}

function render_cbd(ctx,track,num,x,y,w,h){
    ctx.strokeStyle="#000000";
    ctx.strokeRect(x,y,w,h);  

    ctx.fillStyle="#000000";
    ctx.strokeStyle="#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.font = "30px Arial bold";
        
    if (track[num].level==0){
        ctx.strokeText("CBD",x+w/2,y+h/2);
    } else if (track[num].level==1){
        ctx.fillText("CBD",x+w/2,y+h/2);
    }   
}

function render_land(ctx,track,num,x,y,w,h,state){
    ctx.strokeStyle="#000000";
    ctx.strokeRect(x,y,w,h); 

    ctx.font = "30px Arial bold";
    ctx.strokeStyle="#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    var owner = track[num].owner;
    if (owner==0){
        ctx.fillStyle="#000000";
    }else{
        ctx.fillStyle = state.player_list[owner].col;
    }
    var hallow_star = "\u2606";
    var solid_star = "\u2605";
    
    var lv = track[num].level;
    var t = Array(lv+1).join(solid_star) + Array(3-lv+1).join(hallow_star);
    ctx.fillText(t,x+w/2,y+h/2);
    
}

function cell_xy(num){
    var boxx;
    var boxy;
    var height = 60;
    var width = 80;
    var basex = 20;
    var basey = 40;
    if (num<=7){
        boxx = basex + width * num;
        boxy = basey;
    }else if(num<=14){
        boxx = basex + width * 7;
        boxy = basey + height * (num-7);
    }else if(num<=21){
        boxx = basex + width * (21 - num);
        boxy = basey + height * (14-7);
    }else{
        boxx = basex;
        boxy = basey + height * (28 - num);
    }
    return [boxx,boxy,width,height];
}

function render_tile(ctx,track,num){
    var xy = cell_xy(num);
    var boxx = xy[0];
    var boxy = xy[1];
    var width = xy[2];
    var height = xy[3];
    if (track[num].type=="start"){
        render_start(ctx,track,num,boxx,boxy,width,height);
    }else if(track[num].type=="land"){
        render_land(ctx,track,num,boxx,boxy,width,height,state);      
    }
    else if(track[num].type=="bank"){ 
        render_bank(ctx,track,num,boxx,boxy,width,height);
    }else if(track[num].type=="event"){
        render_event(ctx,track,num,boxx,boxy,width,height);      
    }else if(track[num].type=="cbd"){
        render_cbd(ctx,track,num,boxx,boxy,width,height);
    }else if(track[num].type=="parking"){
        render_parking(ctx,track,num,boxx,boxy,width,height);
    }
}

function render_track(ctx,track){
    for (i=0;i<track.length;i++){
        render_tile(ctx,track,i);
    }
}

////////////////////////////////state//////////////////

function render_bg(ctx){
    
}

function money(num){
    var s = (num>=0);
    if (s){
        return "$"+num.toString();
    }else{
        return "-$" + (-num).toString();
    }
}

function percent(num){
    var x = Math.floor(num * 1000) / 10;
    return x.toString() + "%";
}

function render_dashboard(ctx,track,state){
    var x = 750;
    var xx = x - 70;
    var y = 40;
    var gap = 30;
    var width = 60;
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    
    ctx.textBaseline = 'alphabetic';
    
    ctx.textAlign = "left";
    ctx.fillText("不动产:",xx,y+gap);
    ctx.fillText("现金:",xx,y+gap*2);
    ctx.fillText("负债:",xx,y+gap*3);
    ctx.fillText("净资产:",xx,y+gap*4);
    ctx.fillText("收益:",xx,y+gap*5);
    ctx.fillText("负债率:",xx,y+gap*6);
    ctx.fillText("道具数:",xx,y+gap*7);
    
    ctx.textAlign = "end";
    for (var i=1;i<state.player_list.length;i++){
        var player = state.player_list[i];
        ctx.fillStyle = player.col;
        if (player.bankrupt){
            ctx.fillText("X",x+width*i,y);
            ctx.strokeText("X",x+width*i,y);
        }else{
            ctx.fillText("\u2691",x+width*i,y);
            ctx.strokeText("\u2691",x+width*i,y);
        }
        
        ctx.fillStyle = "black";
        var asset = asset_sum(track,state,i);
        ctx.fillText(money(asset),x+width*i,y+gap*1);
        var w = player.wealth;
        var cash = Math.max(w,0);
        ctx.fillStyle = "black";
        ctx.fillText(money(cash),x+width*i,y+gap*2);
        var debt = -Math.min(w,0);
        ctx.fillStyle = "red";
        ctx.fillText(money(debt),x+width*i,y+gap*3);
        ctx.fillStyle = "black";
        var total = asset+cash-debt;
        ctx.fillText(money(total),x+width*i,y+gap*4);
        
        var rent = rent_sum(track,state,i);
        ctx.fillText(money(rent),x+width*i,y+gap*5);
        ctx.fillText(percent(Math.max(0,-w)/asset),x+width*i,y+gap*6);
        ctx.fillText(state.player_list[i].cards.length,x+width*i,y+gap*7);
    }
}

function render_player(ctx,state){
    var flag = "\u2691";
    for (var i=1;i<state.player_list.length;i++){
        var player = state.player_list[i];
        if (player.bankrupt){
            continue;
        }
        var xywh = cell_xy(player.pos);
        
        var x = xywh[2] / 4 * (i-0.5);
        var y = xywh[3] / 4 * 3;
        ctx.fillStyle = player.col;
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.strokeText(flag,xywh[0]+x,xywh[1]+y);
        ctx.fillText(flag,xywh[0]+x,xywh[1]+y);
    } 
}



function grid(m,n){
    var height = 60;
    var width = 80;
    var basex = 20;
    var basey = 40;
    var x = basex + m * width;
    var y = basey + n * height;
    return [x+width/2,y+height/2];
}

function grid_write(t,m,n){
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    var xy;
    xy = grid(m,n);
    ctx.fillText(t,xy[0],xy[1]);
}

function render_price(ctx,state){
    var t;
    t = state.price[0].toString() + "%";
    grid_write(t,2,1);
    t = state.price[1].toString() + "%";
    grid_write(t,5,1);
    t = state.price[2].toString() + "%";
    grid_write(t,6,2);
    t = state.price[3].toString() + "%";
    grid_write(t,6,5);
    t = state.price[4].toString() + "%";
    grid_write(t,5,6);
    t = state.price[5].toString() + "%";
    grid_write(t,2,6);
    t = state.price[6].toString() + "%";
    grid_write(t,1,5);
    t = state.price[7].toString() + "%";
    grid_write(t,1,2);
}

function render_state(ctx,track,state){
    render_price(ctx,state);
    render_player(ctx,state);
    render_dashboard(ctx,track,state);
}

///////////////////////////top level//////////////////
function render(ctx,track,state,ui){
    ctx.clearRect(0, 0, 1000,560);
    render_bg(ctx);
    render_track(ctx,track);
    render_state(ctx,track,state);
    
    render_ui(ctx,ui,track,state);
}

//////////////////////////ui////////////////////////////////
function render_ui(ctx,ui,track,state){
    //ui.tile_num = state.player_list[ui.player].pos;
    ui.q = state.q;
    ui.list = []
    add_q(ctx,ui,track,state);
    
    render_choice(ctx,ui);
    ui.die.d = state.die;
    render_die(ctx,ui.die); 
    
    render_info(ctx,ui,track,state); 
    ctx.lineWidth = 1;
    render_card(ctx,ui,track,state);
    // current player
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("当前回合:",720,290);
    var flag = "\u2691";
    ctx.font = "30px Arial";
    ctx.fillStyle = state.player_list[ui.player].col;
    ctx.strokeText(flag,780,290);
    ctx.fillText(flag,780,290);    
}

function render_card(ctx,ui,track,state){
    ui.cards = [];
    var pp = state.player_list[ui.player];
    for (var i=0;i<pp.cards.length;i++){
        var rect = {};
        rect.x = 680 + i * 110;
        rect.y = 420 ;
        rect.w = 90;
        rect.h = 100;
        
        ctx.strokeStyle="#000000";
        ctx.strokeRect(rect.x,rect.y,rect.w,rect.h); 

        if (!ui.ai){
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            ctx.fillStyle = "black";
            ctx.font = "16px Arial";
            ctx.fillText(pp.cards[i].desc,rect.x+rect.w/2,rect.y+rect.h/2);
        }
        var card = pp.cards[i];
        var f = close_card(track,state,ui.player,i);
        ui.cards[i] = {rect:rect,f:f};
    }
}

function render_info(ctx,ui,track,state){
    var tile = track[ui.tile_num];
    var xy = grid(2,2);
    var x = xy[0];
    var y = xy[1];
    var h = 60 * 3;
    var w = 80 * 3;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    if (tile.type=="land"){
        ctx.strokeStyle = state.player_list[tile.owner].col;
    }
    ctx.strokeRect(x,y,w,h); 

    ctx.beginPath();
    ctx.moveTo(x,y+30);
    ctx.lineTo(x+w,y+30);
    ctx.stroke(); 
    ctx.beginPath();
    ctx.moveTo(x+70,y);
    ctx.lineTo(x+70,y+30);
    ctx.stroke(); 
    ctx.beginPath();
    ctx.moveTo(x+160,y);
    ctx.lineTo(x+160,y+30);
    ctx.stroke(); 
    // ctx.beginPath();
    // ctx.moveTo(x,y+h-30);
    // ctx.lineTo(x+w,y+h-30);
    // ctx.stroke(); 
    
    ctx.fillStyle="#000000";
    ctx.strokeStyle="#000000";
    ctx.textAlign = "left";
    ctx.textBaseline = 'alphabetical';
    ctx.font = "15px Arial";
    ctx.fillText("位置: "+ui.tile_num,x+10,y+20);
    ctx.fillText("类别: "+track[ui.tile_num].desc,x+80,y+20);
    var midx = x + 10;
    var midy = y + 50;
    ui.sell_button = null;
    if (tile.type=="start"){
        ctx.fillText("起始格。",midx,midy);
    } else if (tile.type=="land"){
        ctx.fillText("Group: "+tile.group,x+170,y+20);
        ctx.fillStyle="#000000";
        
        if(tile.owner==ui.player){
            var rect = {x:midx+170,y:midy,w:50,h:50};
            ctx.fillStyle="black";
            ctx.fillRect(rect.x,rect.y,rect.w,rect.h);
            ctx.fillStyle="white";
            ctx.textBaseline = 'middle';
            ctx.textAlign = "center";
            ctx.font = "20px Arial";
            ctx.fillText("卖",rect.x+rect.w/2,rect.y+rect.h/2);
            ui.sell_button = {rect:rect,f:function(){sell(track,state,ui.tile_num);}}
            ctx.font = "15px Arial";
        }
        
        ctx.fillStyle="black";
        ctx.textAlign = "left";
        ctx.textBaseline = 'alphabetical';
        var price = cost_price(ui.tile_num,track,state);
        var rent = cost_rent(ui.tile_num,track,state);
        var upgrade = cost_upgrade(ui.tile_num,track,state);
        ctx.fillText("价格: "+money(price),midx,midy);
        ctx.fillText("升级: "+money(upgrade),midx,midy+30);
        ctx.fillText("房租: "+money(rent),midx,midy+60);
        ctx.fillText("回报率: "+percent(rent/price),midx,midy+90);
    }else if (tile.type=="cbd"){
        ctx.fillText("建造后同区房价指数翻倍。",midx,midy);
    }else if (tile.type=="bank"){
        ctx.fillText("领取一张卡片。",midx,midy);
    }else if (tile.type=="event"){
        ctx.fillText("Desc ",midx,midy);
    }
    else if (tile.type=="parking"){
        ctx.fillText("免费停车。",midx,midy);
    }

}

function add_q(ctx,ui,track,state){
    if (ui.q==null){
        ui.die.active = true;
        return;
    }
    ui_choice(ctx,ui,ui.q.choices);
}

function render_die(ctx,die){
    var d1 = "\u2680";
    var d2 = "\u2681";
    var d3 = "\u2682";
    var d4 = "\u2683";
    var d5 = "\u2684";
    var d6 = "\u2685";
    var d = [d1,d2,d3,d4,d5,d6];
    var t = d[die.d-1];
    ctx.font = "80px Arial";
    if (die.active){
        ctx.fillStyle = "black";
    }else{
        ctx.fillStyle = "grey";
    }
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    var x = die.rect.x+die.rect.w/2;
    var y = die.rect.y+die.rect.h/2;
    ctx.fillText(t,x,y);
}

function make_ui(track,state){
    var ui = {};
    ui.tile_num = 1;
    ui.q = null;
    ui.list = [];
    ui.die = make_die(track,state);
    ui.player = 1;
    ui.ai = false;
    ui.sell_button = null;
    ui.cards = [];
    ui.map = [];
    for (var i=0;i<28;i++){
        r = cell_xy(i);
        var rect = {x:r[0],y:r[1],w:r[2],h:r[3]};
        ui.map[i] = rect;
    }
    return ui;
}

function make_die(track,state){
    var widget = {};
    widget.d = 6;
    widget.active = true;
    widget.f = function(){
        if (widget.active){
            roll(track,state,1);
            widget.d = state.die;
            ui.tile_num = state.player_list[ui.player].pos;
        }
    }
    var rect = {};
    rect.x = 880;
    rect.y = 270;
    rect.w = 50;
    rect.h = 50;
    widget.rect = rect;
    return widget;
}

function ui_choice(ctx,ui,choice_list){
    for (var i=0;i<choice_list.length;i++){
        var t = choice_list[i].t;
        var f = choice_list[i].f;
          
        var rect1 = {};
        rect1.x = 750;
        rect1.y = 330 + 40 *  i;
        rect1.w = 200;
        rect1.h = 40;
     
        var widget = {rect:rect1,f:f,t:t};
        ui.list[ui.list.length] = widget;
    }
    ui.die.active = false;
}

function render_choice(ctx,ui){
    ctx.font = "16px Arial";
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = "left";
    
    for (var i=0;i<ui.list.length;i++){
        var t = ui.list[i].t;
        var rect = ui.list[i].rect;

        ctx.strokeStyle = "black";
        ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);
        ctx.fillStyle = "black";
        ctx.fillText(t,rect.x + 16,rect.y+rect.h/2+6);
    }
}


function event_pos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function in_rect(pos, rect){
    return pos.x > rect.x && pos.x < rect.x+rect.w && pos.y < rect.y+rect.h && pos.y > rect.y
}

function add_listener(canvas,ui,refresh){
    var f = function(evt){
        if(ui.ai){
            return;
        }
        var pos = event_pos(canvas, evt);
        
        for (var i=0;i<ui.list.length;i++){
            var widget = ui.list[i];
            if (in_rect(pos,widget.rect)){
                 widget.f();
                 ui.list = [];
                 ui.die.active = true;
                 refresh();
            }
        }
        for (var i=0;i<ui.cards.length;i++){
            var widget = ui.cards[i];
            if (in_rect(pos,widget.rect)){
                 widget.f();
                 refresh();
            }
        }
        if(in_rect(pos,ui.die.rect)){
            ui.die.f();
            refresh();
        }
        if(ui.sell_button!=null){
            if(in_rect(pos,ui.sell_button.rect)){
                ui.sell_button.f();
                refresh();
            }
        }
        for (var i=0;i<28;i++){
            if (in_rect(pos,ui.map[i])){
                ui.tile_num = i;
                refresh();
            }
        }
    }
    canvas.addEventListener('click',f);
}