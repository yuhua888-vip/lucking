let currentUser = null;
let timer = 8;
let roundTimer = null;
let betting = false;

let userBet = {
  front: 0,
  back: 0
};

/* 工具 */
function getUsers(){
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users){
  localStorage.setItem("users", JSON.stringify(users));
}

/* 开局 */
function startRound(){
  clearInterval(roundTimer);

  timer = 8;
  betting = true;

  userBet = {
    front: 0,
    back: 0
  };

  frontBet.innerText = "0";
  backBet.innerText = "0";

  result.innerText = "开始下注";
  coinText.innerText = "等待下注";

  roundTimer = setInterval(()=>{
    timer--;
    countdown.innerText = "倒计时：" + timer;

    if(timer <= 0){
      clearInterval(roundTimer);
      betting = false;
      roll();
    }

  },1000);
}

/* 自定义下注 */
function betCustom(side){
  let amount = 0;

  if(side === "正面"){
    amount = Number(frontAmount.value);
  }else{
    amount = Number(backAmount.value);
  }

  if(!amount || amount <= 0){
    result.innerText = "请输入正确金额";
    return;
  }

  bet(side, amount);
}

/* 核心下注 */
function bet(side, amount){

  if(!betting){
    result.innerText = "已停止下注";
    return;
  }

  let users = getUsers();
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

  saveUsers(users);
  updateUI();

  result.innerText =
    "正面：" + userBet.front +
    " | 反面：" + userBet.back;
}

/* 开奖 */
function roll(){

  result.innerText = "停止下注，开奖中...";
  coinText.innerText = "旋转中...";

  setTimeout(()=>{

    let resultSide = Math.random() < 0.5 ? "正面" : "反面";

    coinImg.src =
      resultSide === "正面"
      ? "coin.png.PNG"
      : "coin.png2.PNG";

    settle(resultSide);

  },1200);
}

/* 结算 */
function settle(resultSide){

  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

  let winAmount = 0;
  let loseAmount = 0;

  if(resultSide === "正面"){
    winAmount = userBet.front;
    loseAmount = userBet.back;
  }else{
    winAmount = userBet.back;
    loseAmount = userBet.front;
  }

  if(winAmount > 0){
    let payout = winAmount * 1.9;
    let profit = payout - winAmount;

    user.score += payout;

    result.innerText =
      "💰 开奖：" + resultSide +
      " 赢 +" + profit;
  }else{
    result.innerText =
      "😌 开奖：" + resultSide +
      " 全输 -" + loseAmount;
  }

  /* 路子 */
  user.road.push(resultSide);
  if(user.road.length > 30) user.road.shift();

  user.winRoad.push(winAmount > 0 ? "win" : "lose");
  if(user.winRoad.length > 30) user.winRoad.shift();

  saveUsers(users);
  updateUI();

  setTimeout(startRound, 2000);
}

/* UI */
function updateUI(){
  let user = getUsers().find(u => u.username === currentUser);
  if(!user) return;

  name.innerText = user.username;
  userId.innerText = user.id;
  score.innerText = user.score;

  renderRoad(user.road || []);
  renderWinRoad(user.winRoad || []);
}

/* 路子 */
function renderRoad(road){
  roadMap.innerHTML = "";

  road.forEach(r=>{
    let dot = document.createElement("div");
    dot.className = "road-dot " + (r === "正面" ? "front" : "back");
    dot.innerText = r === "正面" ? "正" : "反";
    roadMap.appendChild(dot);
  });
}

function renderWinRoad(road){
  winRoadMap.innerHTML = "";

  road.forEach(r=>{
    let dot = document.createElement("div");
    dot.className = "road-dot " + (r === "win" ? "win" : "lose");
    dot.innerText = r === "win" ? "赢" : "输";
    winRoadMap.appendChild(dot);
  });
}
