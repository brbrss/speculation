function ai_control(track,state,p){
    for (var i=0;i<state.player_list[p].cards.length;i++){
        var card = state.player_list[p].cards[i];
        if (ponder_card(track,state,p,card)){
            use_card(track,state,p,i);
            return;
        }
    }
    if(!state.rolled){
        roll(track,state,p);
        return;
    }
    if(state.q!=null){
        var n = answer_q(track,state,p);
        state.q.choices[n].f();
        return;
    }
}

function is_min_asset(track,state,p){
    var arr = [ Number.MAX_VALUE];
    for (var i=1;i<state.player_list.length;i++){
        if(state.player_list[i].bankrupt){
            arr[i] =  Number.MAX_VALUE;
        }else{
            arr[i] = asset_sum(track,state,i);
        }
        
    }
    var result = (arr[p]==Math.min(arr[1],arr[2],arr[3],arr[4]));
    return result;
}
function is_max_asset(track,state,p){
    var arr = [999999];
    for (var i=1;i<state.player_list.length;i++){
        if(state.player_list[i].bankrupt){
            arr[i] =  -Number.MAX_VALUE;
        }else{
            arr[i] = asset_sum(track,state,i);
        }
    }
    var result = (arr[p]==Math.max(arr[1],arr[2],arr[3],arr[4]));
    return result;
}

function is_max_money(track,state,p){
    var arr = [0];
    for (var i=1;i<state.player_list.length;i++){
        if(state.player_list[i].bankrupt){
            arr[i] =  -Number.MAX_VALUE;
        }else{
            arr[i] = state.player_list[i].wealth;
        }
    }
    var result = (arr[p]==Math.max(arr[1],arr[2],arr[3],arr[4]));
    return result;
}
function is_min_money(track,state,p){
    var arr = [0];
    for (var i=1;i<state.player_list.length;i++){
        if(state.player_list[i].bankrupt){
            arr[i] =  Number.MAX_VALUE;
        }else{
            arr[i] = state.player_list[i].wealth;
        }
    }
    var result = (arr[p]==Math.min(arr[1],arr[2],arr[3],arr[4]));
    return result;
}

function ponder_card(track,state,p,card){
    if(card.type=="refinance"){
        return ponder_refinance(track,state,p);
    }else if(card.type=="tax"){
        return ponder_tax(track,state,p);
    }else if(card.type=="interest"){
        return ponder_interest(track,state,p);
    }else if(card.type=="inflation"){
        return ponder_inflation(track,state,p);
    }else if(card.type=="bull"){
        return ponder_bull(track,state,p);
    }else if(card.type=="bear"){
        return ponder_bear(track,state,p);
    }
}
function ponder_interest(track,state,p){
    var arr = [0];
    for (var i=1;i<state.player_list.length;i++){
        if(state.player_list[i].bankrupt){
            arr[i] =  Number.MAX_VALUE;
        }else{
            arr[i] = state.player_list[i].wealth;
        }
    }
    var vmin = Math.min(arr[1],arr[2],arr[3],arr[4]);
    var a = asset_sum(track,state,p);
    var gap = arr[p] - vmin;
    var myworth = a+arr[p];
    return (gap>myworth) && (debt_ratio(track,state,p)<0.9);
}
function ponder_tax(track,state,p){
    return is_min_asset(track,state,p)&& (debt_ratio(track,state,p)<0.9);
}
function ponder_inflation(track,state,p){
    return (state.player_list[p].wealth<0);
}
function ponder_refinance(track,state,p){
    var r = debt_ratio(track,state,p);
    if (r>0.7){
        return true;
    }else{
        return false;
    }
}
function ponder_bull(track,state,p){
    return is_max_asset(track,state,p);
}
function ponder_bear(track,state,p){
    return is_min_asset(track,state,p) && (debt_ratio(track,state,p)<0.85);
}

function answer_q(track,state,p){
    if(state.q==null){
        return;
    }else if(state.q.type=="q_buy"){
        return answer_buy(track,state,p);
    }else if(state.q.type=="q_build"){
        return answer_build(track,state,p);
    }else if(state.q.type=="q_empty"){
        return answer_empty(track,state,p);
    }
    return 0;
}

function answer_build(track,state,p){
    if (track[state.q.num].type=="cbd"){
        return 1-(track[state.q.num-1].owner==p && track[state.q.num+1].owner==p);
    }
    var aw = state.player_list[p].wealth + asset_sum(track,state,p);
    var pi = cost_upgrade(state.q.num,track,state);
    if(aw>pi){
        return 0;
    }else{
        return 1;
    }
}

function answer_buy(track,state,p){
    var w = state.player_list[p].wealth;
    var a = asset_sum(track,state,p);
    var pi = cost_price(state.q.num,track,state);

    if (a+w-pi>(a+w)*0.2){
        return 0;
    }
    return 1;
}

function answer_empty(track,state,p){
    var a = asset_sum(track,state,p);
    var w = state.player_list[p].wealth;
    var pi = cost_price(state.q.num,track,state);
    if(a+w>pi){
        return 0;
    }else{
        return 1;
    }
}