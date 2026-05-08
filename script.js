let currentUser = null;
let currentScore = 500;
let currentChips = 0;

let selectedSide = null;
let selectedChip = 100;

let bets = {
  "庄":0,
  "闲":0,
  "和":0
};

let roadHistory = [];

/* 注册 */

function registerUser(){

  const username =
  document.getElementById("username").value.trim();

  const password =
  document.getElementById("password").value.trim();

  if(username.length < 5 || password.length < 5){
    alert("账号密码至少5位");
    return;
  }

  const userData = {
    password,
    score:500,
    chips:0,
    id:Math.floor(10000 + Math.random()*90000)
  };

  localStorage.setItem(
    "user_" + username,
    JSON.stringify(userData)
  );

  alert("创建成功，请登录");
}

/* 登录 */

function login(){

  const username =
  document.getElementById("username").value.trim();

  const password =
  document.getElementById("password").value.trim();

  let user =
  localStorage.getItem("user_" + username);

  if(!user){
    alert("账号不存在");
    return;
  }

  user = JSON.parse(user);

  if(user.password !== password){
    alert("密码错误");
    return;
  }

  currentUser = username;
  currentScore = Number(user.score);
  currentChips = Number(user.chips);

  document
  .getElementById("loginPage")
  .classList.add("hidden");

  document
  .getElementById("hallPage")
  .classList.remove("hidden");

  document.getElementById("playerName").innerText =
  username;

  document.getElementById("playerId").innerText =
  user.id;

  document.getElementById("playerScore").innerText =
  currentScore.toFixed(2);
}

/* 进入百家乐 */

function openBaccarat(){

  document
  .getElementById("hallPage")
  .classList.add("hidden");

  document
  .getElementById("baccaratPage")
  .classList.remove("hidden");

  updateWallet();
}

/* 返回大厅 */

function backHall(){

  document
  .getElementById("baccaratPage")
  .classList.add("hidden");

  document
  .getElementById("hallPage")
  .classList.remove("hidden");

  document.getElementById("playerScore").innerText =
  currentScore.toFixed(2);
}

/* 幸运硬币 */

function openCoinGame(){
  alert("幸运硬币正在维护升级");
}

/* 更新钱包 */

function updateWallet(){

  document.getElementById("baccaratScore").innerText =
  currentScore.toFixed(2);

  document.getElementById("chipBalance").innerText =
  currentChips.toFixed(2);
}

/* 兑换筹码 */

function exchangeToChips(){

  const amount =
  Number(document.getElementById("exchangeAmount").value);

  if(amount <= 0){
    alert("请输入正确积分");
    return;
  }

  if(amount > currentScore){
    alert("积分不足");
    return;
  }

  currentScore -= amount;
  currentChips += amount;

  updateWallet();

  alert("兑换成功");
}

/* 筹码换积分 */

function exchangeBack(){

  if(currentChips <= 0){
    alert("没有可兑换筹码");
    return;
  }

  currentScore += currentChips;
  currentChips = 0;

  updateWallet();

  alert("兑换成功");
}

/* 选择下注区域 */

function selectBet(side){

  selectedSide = side;

  document.getElementById("selectedSide").innerText =
  "当前选择：" + side;
}

/* 选择筹码 */

function setChip(num){

  selectedChip = num;

  document.getElementById("betAmount").value = num;
}

/* 放置下注 */

function placeBet(){

  if(!selectedSide){
    alert("请先选择庄闲和");
    return;
  }

  const amount =
  Number(document.getElementById("betAmount").value);

  if(amount <= 0){
    alert("请输入下注金额");
    return;
  }

  if(amount > currentChips){
    alert("筹码不足");
    return;
  }

  currentChips -= amount;

  bets[selectedSide] += amount;

  updateWallet();
  updateBetView();
}

/* 更新下注 */

function updateBetView(){

  document.getElementById("playerBet").innerText =
  bets["闲"].toFixed(2);

  document.getElementById("tieBet").innerText =
  bets["和"].toFixed(2);

  document.getElementById("bankerBet").innerText =
  bets["庄"].toFixed(2);
}

/* 清空下注 */

function clearBets(){

  const total =
  bets["庄"] + bets["闲"] + bets["和"];

  currentChips += total;

  bets["庄"] = 0;
  bets["闲"] = 0;
  bets["和"] = 0;

  updateWallet();
  updateBetView();
}

/* 发牌 */

function startBaccarat(){

  const total =
  bets["庄"] + bets["闲"] + bets["和"];

  if(total <= 0){
    alert("请先下注");
    return;
  }

  const cards = [
    "A","2","3","4","5",
    "6","7","8","9","10"
  ];

  const b1 = cards[Math.floor(Math.random()*cards.length)];
  const b2 = cards[Math.floor(Math.random()*cards.length)];

  const p1 = cards[Math.floor(Math.random()*cards.length)];
  const p2 = cards[Math.floor(Math.random()*cards.length)];

  document.getElementById("bankerCards").innerHTML =
  "🂠 " + b1 + "　🂠 " + b2;

  document.getElementById("playerCards").innerHTML =
  "🂠 " + p1 + "　🂠 " + p2;

  const bankerPoint =
  baccaratPoint(b1) + baccaratPoint(b2);

  const playerPoint =
  baccaratPoint(p1) + baccaratPoint(p2);

  const bFinal = bankerPoint % 10;
  const pFinal = playerPoint % 10;

  document.getElementById("bankerPoint").innerText =
  bFinal;

  document.getElementById("playerPoint").innerText =
  pFinal;

  let result = "";

  if(bFinal > pFinal){
    result = "庄";
  }else if(pFinal > bFinal){
    result = "闲";
  }else{
    result = "和";
  }

  settleGame(result);

  addRoad(result);
}

/* 点数 */

function baccaratPoint(card){

  if(card === "A"){
    return 1;
  }

  return Number(card);
}

/* 结算 */

function settleGame(result){

  let win = 0;

  if(result === "庄"){
    win += bets["庄"] * 1.95;
  }

  if(result === "闲"){
    win += bets["闲"] * 2;
  }

  if(result === "和"){
    win += bets["和"] * 9;
  }

  currentChips += win;

  document.getElementById("baccaratResult").innerText =
  "本局结果：" + result +
  "　获得：" + win.toFixed(2);

  bets["庄"] = 0;
  bets["闲"] = 0;
  bets["和"] = 0;

  updateWallet();
  updateBetView();
}

/* 路子 */

function addRoad(result){

  roadHistory.push(result);

  const road =
  document.getElementById("baccaratRoad");

  road.innerHTML = "";

  roadHistory.forEach(item=>{

    const dot =
    document.createElement("div");

    dot.classList.add("road-dot");

    if(item === "庄"){
      dot.classList.add("red");
    }

    if(item === "闲"){
      dot.classList.add("blue");
    }

    if(item === "和"){
      dot.classList.add("green");
    }

    road.appendChild(dot);
  });
}
