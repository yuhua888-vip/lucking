let currentUser = null;
let timer = 8;
let betting = true;
let userBet = {side:null, amount:0};

function startRound(){
  timer = 8;
  betting = true;
  userBet = {side:null, amount:0};

  let interval = setInterval(()=>{
    countdown.innerText = "倒计时：" + timer;

    timer--;

    if(timer < 0){
      clearInterval(interval);
      betting = false;
      roll();
    }

  },1000);
}

function bet(side, amount){
  if(!betting){
    result.innerText = "已停止下注";
    return;
  }

  let users = getUsers();
  let user = users.find(u=>u.username===currentUser);

  if(user.score < amount){
    result.innerText = "积分不足";
    return;
  }

  userBet.side = side;
  userBet.amount += amount;

  user.score -= amount;

  saveUsers(users);
  updateUI();

  result.innerText = "已下注：" + side + " " + userBet.amount;
}

function roll(){
  result.innerText = "停止下注，开奖中...";

  setTimeout(()=>{
    let resultSide = Math.random()<0.5?"正面":"反面";

    coinImg.src = resultSide==="正面"?"coin.png.PNG":"coin.png2.PNG";

    settle(resultSide);

  },1200);
}

function settle(resultSide){
  let users = getUsers();
  let user = users.find(u=>u.username===currentUser);

  if(userBet.side === resultSide){
    let win = userBet.amount * 1.9;
    user.score += win;

    result.innerText = "赢了 +" + (win - userBet.amount);
  }else{
    result.innerText = "输了 -" + userBet.amount;
  }

  user.road.push(resultSide);
  if(user.road.length>30) user.road.shift();

  saveUsers(users);
  updateUI();

  setTimeout(startRound,2000);
}
