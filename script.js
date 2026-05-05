// ===== 在最上面加 =====
function vibrate(type){
  if(!navigator.vibrate) return;

  if(type === "click") navigator.vibrate(20);
  if(type === "win") navigator.vibrate([50,30,80]);
  if(type === "lose") navigator.vibrate([100]);
  if(type === "result") navigator.vibrate([30,50,30]);
}

// ===== 原来的变量 =====
let currentUser = null;
let timer = 8;
let roundTimer = null;
let betting = false;

let userBet = { front: 0, back: 0 };


// ===== 下注 =====
function bet(side, amount){

  vibrate("click");   // 👉 自动加震动

  if(!betting){
    result.innerText = "已停止下注";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let user = users.find(u => u.username === currentUser);

  if(user.score < amount){
    result.innerText = "积分不足";
    return;
  }

  user.score -= amount;

  if(side === "正面"){
    userBet.front += amount;
    frontBet.innerText = userBet.front;
  }else{
    userBet.back += amount;
    backBet.innerText = userBet.back;
  }

  localStorage.setItem("users", JSON.stringify(users));

  result.innerText = "正面：" + userBet.front + " | 反面：" + userBet.back;
}


// ===== 开奖 =====
function roll(){

  vibrate("result");  // 👉 开奖震动

  result.innerText = "开奖中...";

  setTimeout(()=>{

    let resultSide = Math.random() < 0.5 ? "正面" : "反面";

    coinImg.src = resultSide === "正面" ? "coin.png.PNG" : "coin.png2.PNG";

    settle(resultSide);

  },1200);
}


// ===== 结算 =====
function settle(resultSide){

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let user = users.find(u => u.username === currentUser);

  let winAmount = resultSide === "正面" ? userBet.front : userBet.back;
  let loseAmount = resultSide === "正面" ? userBet.back : userBet.front;

  if(winAmount > 0){
    let payout = winAmount * 1.9;
    let profit = payout - winAmount - loseAmount;

    user.score += payout;

    result.innerText = "💰 赢：" + profit;

    vibrate("win");  // 👉 赢震动
  }else{
    result.innerText = "😌 输：" + loseAmount;

    vibrate("lose"); // 👉 输震动
  }

  localStorage.setItem("users", JSON.stringify(users));

  setTimeout(startRound,2000);
}
