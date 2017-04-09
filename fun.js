
///////// factory functions////////////////////
function tile_start(){
    var tile = {};
    tile.type = "start";
    tile.desc = "起始";
    return tile;
}

function tile_land(num){
    var tile = {};
    tile.type = "land";
    tile.desc = "地块";
    tile.owner = 0;
    tile.level = 0;
    tile.max_level = 3;
    tile.group = num;
    return tile;
}

function tile_event(){
    var tile = {};
    tile.type = "event";
    tile.desc = "事件";
    return tile;
}

function tile_bank(){
    var tile = {};
    tile.type = "bank";
    tile.desc = "银行";
    return tile;
}

function tile_parking(){
    var tile = {};
    tile.type = "parking";
    tile.desc = "停车";
    return tile;
}

function tile_cbd(num){
    var tile = {};
    tile.type = "cbd";
    tile.desc = "CBD";
    tile.level = 0;
    tile.max_level = 1;
    tile.group = num;
    return tile;
}

function make_track(){
    var track = [];
    track[0] = tile_start();
    track[1] = tile_land(0);
    track[2] = tile_land(0);
    track[3] = tile_land(0);
    track[4] = tile_land(1);
    track[5] = tile_land(1);
    track[6] = tile_land(1);
    track[7] = tile_bank();    
    track[8] = tile_land(2);
    track[9] = tile_cbd(2);
    track[10] = tile_land(2);
    track[11] = tile_land(3);
    track[12] = tile_cbd(3);
    track[13] = tile_land(3);
    
    track[14] = tile_parking();    
    track[15] = tile_land(4);
    track[16] = tile_land(4);
    track[17] = tile_land(4);
    track[18] = tile_land(5);
    track[19] = tile_land(5);
    track[20] = tile_land(5);
    track[21] = tile_bank();
    track[22] = tile_land(6);
    track[23] = tile_cbd(6);
    track[24] = tile_land(6);
    track[25] = tile_land(7);
    track[26] = tile_cbd(7);
    track[27] = tile_land(7);
    return track;
}

function bankrupt(track,state,p){
    for (var i=0;i<track.length;i++){
        if (track[i].type=="land"){
            if (track[i].owner==p){
                sell(track,state,i);
            }
        }
    }
    state.player_list[p].bankrupt = true;
    add_log(state.player_list[p].desc+" has gone bankrupt.")
}

function player(col){
    var p = {};
    p.ai = true;
    p.col = col;
    p.desc = col;
    p.wealth = 1000;
    p.debt = 0;
    p.pos = 0;
    p.bankrupt = false;
    p.cards = [];
    return p;
}

function asset_sum(track,state,p){
    var x = 0;
    for (var i=0;i<track.length;i++){
        if (track[i].type=="land"){
            if (track[i].owner==p){
                x += cost_price(i,track,state) / 2;
            }
        }
    }
    return x;
}

function rent_sum(track,state,p){
    var x = 0;
    for (var i=0;i<track.length;i++){
        if (track[i].type=="land"){
            if (track[i].owner==p){
                x += cost_rent(i,track,state);
            }
        }
    }
    return x;
}

function debt_ratio(track,state,p){
    var a = asset_sum(track,state,p);
    var b = state.player_list[p].wealth;
    if (a==0){
        return 0;
    }
    return Math.max(0,-b) / a;
}

function make_state(){
    var state = {};
    state.player_list = [player("black"),player("red"),player("blue"),player("orange"),player("green")];
    //state.player_list[1].ai = false;
    state.p = 0;
    state.price = [100,100,100,100,100,100,100,100];
    state.die = 6;
    state.q = null;
    state.rolled = true;
    state.over = false;
    return state;
}

//////////////event///////////////////////

function chance_0(track,state,p){
    earn(state,p,50);
}

function chance_1(track,state,p){
    pay(state,p,50);
}

function close_card(track,state,p,i){
    var f = function(){
        use_card(track,state,p,i);
    }
    return f;
}

function use_card(track,state,p,i){
    var card = state.player_list[p].cards[i];
    add_log(state.player_list[p].col+" used card " +"<b>"+card.desc+"</b>");
    card(track,state,p);
    state.player_list[p].cards.splice(i,1);
}

function rand_card(track,state,p){
    if (state.player_list[p].cards.length>=3){
        return;
    }
    var arr = [card_interest,card_inflation,card_refinance,card_tax,card_bull,card_bear];
    var i = Math.floor(Math.random() * arr.length);  
    state.player_list[p].cards.push(arr[i]);
}

function card_interest(track,state,p){
    for(var i=1;i<state.player_list.length;i++){
        if(state.player_list[i].bankrupt){
            continue;
        }
        var amt = state.player_list[i].wealth * 0.1;
        earn(state,i,Math.floor(amt));
    }
}
card_interest.desc = "加息";
card_interest.type = "interest";

function card_inflation(track,state,p){
    for(var i=1;i<state.player_list.length;i++){
        if(state.player_list[i].bankrupt){
            continue;
        }
        var amt = state.player_list[i].wealth;
        amt = Math.max(0,amt) * 0.2;
        pay(state,i,Math.floor(amt));
    }
}
card_inflation.desc = "通货膨胀";
card_inflation.type = "inflation";

function card_refinance(track,state,p){
    var amt = state.player_list[p].wealth;
    amt = - Math.min(0,amt) * 0.1;
    earn(state,p,Math.floor(amt));
}
card_refinance.desc = "债务重组";
card_refinance.type = "refinance";

function card_tax(track,state,p){
    for(var i=1;i<state.player_list.length;i++){
        if(state.player_list[i].bankrupt){
            continue;
        }
        var amt = asset_sum(track,state,i) * 0.1;
        pay(state,i,Math.floor(amt));
    }
}
card_tax.desc = "房地产税";
card_tax.type = "tax";

function card_bull(track,state,p){
    for(var i=0;i<state.price.length;i++){
        state.price[i] += 20;
    }
}
card_bull.desc = "利好消息";
card_bull.type = "bull";

function card_bear(track,state,p){
    for(var i=0;i<state.price.length;i++){
        state.price[i] -= 20;
    }
}
card_bear.desc = "利空消息";
card_bear.type = "bear";


//////////////////////display////////////////////

function cost_price(num,track,state){
    var g = track[num].group;
    var lv = track[num].level;
    return 160 * (lv+1) * state.price[g]/100;
}

function cost_rent(num,track,state){
    var g = track[num].group; 
    var lv = track[num].level;
    var factor = (state.price[g]-100) /2 + 100;
    return 20 * (2*lv+1) * factor/100;
}

function cost_upgrade(num,track,state){
    var g = track[num].group;
    var lv = track[num].level;
    return 120 * (lv+1) * state.price[g]/100;
}

///////////operation functions//////////////////
function rand6(){
    var x = Math.random() * 6;
    return Math.floor(x)+1;
}

function roll(track,state,player_num){
    var x = rand6();
    state.die = x;
    state.rolled = true;
    var p = state.player_list[player_num];
    p.pos = (p.pos+x) % 28;
 
    if (track[p.pos].type =="land"){
        if (track[p.pos].owner==0){
            state.q = q_empty(state,track,p.pos,player_num);
            
        }else if (player_num==track[p.pos].owner){
            if(track[p.pos].level < track[p.pos].max_level){
                state.q = q_build(state,track,p.pos,player_num);                
            }
        }else{
            state.q = q_buy(state,track,p.pos,player_num);            
        }
    } else if (track[p.pos].type =="cbd"){
        if (track[p.pos].level < track[p.pos].max_level){
            state.q = q_build(state,track,p.pos,player_num);
        }
    } else if (track[p.pos].type =="bank"){
        rand_card(track,state,player_num);
    }
}
function pay(state,p,amt){
    state.player_list[p].wealth -= amt;
    add_log(state.player_list[p].col+" paid "+money(amt));
}

function earn(state,p,amt){
    state.player_list[p].wealth += amt;
    add_log(state.player_list[p].col+" received "+money(amt));

}

function sell(track,state,num){
    var tile = track[num];
    var p = track[num].owner;
    var amt = cost_price(num,track,state) / 2;
    state.player_list[p].wealth += amt;
    track[num].owner = 0;
    state.price[tile.group] -= (tile.level +1)* 40
    tile.level = 0;
    tile.owner = 0;
    
    add_log(state.player_list[p].desc+" sold "+num+" for "+money(amt));
}

function buy(state,track,buyer,num,seller,amt){
    state.player_list[buyer].wealth -= amt;
    state.player_list[seller].wealth += amt;
    track[num].owner = buyer;
    var group = track[num].group;
    state.price[group] += 20;
    add_log(state.player_list[buyer].desc+" bought "+num+" for "+money(amt)+" from "+state.player_list[seller].desc);
}

function build(state,track,num,buyer,amt){
    track[num].level += 1;
    state.player_list[buyer].wealth -= amt;
    var group = track[num].group;
    if(track[num].type=="cbd"){
        state.price[group] *= 2;
    }else{
        state.price[group] += 20;
    }
    add_log(state.player_list[buyer].desc+" upgraded "+num+" for "+money(amt));
}

function q_buy(state,track,num,buyer){
    var q = {};
    q.type = "q_buy";
    q.num = num;
    
    var price = cost_price(q.num,track,state);
    var rent = cost_rent(q.num,track,state);
    var t1 = "购入地块，支付 " + money(price);
    var t2 = "支付房租 " + money(rent);
  
    var f1 = function(){
        buy(state,track,buyer,q.num,track[q.num].owner,price);
        state.q = null;
    }

    var f2 = function(){
        
        pay(state,buyer,rent);
        earn(state,track[q.num].owner,rent);
        state.q = null;
    }
    q.choices = [];
    q.choices[0] = {t:t1,f:f1};
    q.choices[1] = {t:t2,f:f2};
    
    return q;
}

function q_build(state,track,num,buyer){
    var q = {};
    q.type = "q_build";
    q.num = num;
    
    var price = cost_upgrade(q.num,track,state);

    var t1 = "升级地块，支付 " + money(price);
    var t2 = "放弃升级";
    var f1 = function(){
        build(state,track,num,buyer,price);
        state.q = null;
    }

    var f2 = function(){
        state.q = null;
    }
    q.choices = [];
    q.choices[0] = {t:t1,f:f1};
    q.choices[1] = {t:t2,f:f2};
    return q;
}

function q_empty(state,track,num,buyer){
    var q = {};
    q.type = "q_empty";
    q.num = num;
    
    var price = cost_price(q.num,track,state);

    var t1 = "购入地块，支付 " + money(price);
    var t2 = "放弃购买";
    var f1 = function(){
        buy(state,track,buyer,q.num,track[q.num].owner,price);
        state.q = null;
    }

    var f2 = function(){
        state.q = null;
    }
    q.choices = [];
    q.choices[0] = {t:t1,f:f1};
    q.choices[1] = {t:t2,f:f2};
    
    return q;
}
