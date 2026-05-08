const loginBox = document.getElementById("loginBox");
const gameBox = document.getElementById("gameBox");

const entertainmentPanel = document.getElementById("entertainmentPanel");
const servicePanel = document.getElementById("servicePanel");
const settingsPanel = document.getElementById("settingsPanel");

const coinGamePanel = document.getElementById("coinGamePanel");
const baccaratPanel = document.getElementById("baccaratPanel");

const score = document.getElementById("score");
const baccaratScore = document.getElementById("baccaratScore");
const baccaratChips = document.getElementById("baccaratChips");

const nameText = document.getElementById("name");
const userIdText = document.getElementById("userId");

const settingName = document.getElementById("settingName");
const settingId = document.getElementById("settingId");
const settingScore = document.getElementById("settingScore");

const msg = document.getElementById("msg");

const coinImg = document.getElementById("coinImg");
const coinText = document.getElementById("coinText");
const result = document.getElementById("result");
const countdown = document.getElementById("countdown");

const frontBet = document.getElementById("frontBet");
const backBet = document.getElementById("backBet");

let currentUser = null;

let currentScore = 500;

let chips = 0;

let countdownNum = 8;

let userFrontBet = 0;
let userBackBet = 0;

let fakeFrontTotal = 0;
let fakeBackTotal = 0;

let baccaratSelected = null;

let baccaratBetData = {
  庄:0,
  闲:0,
  和:0
};

let baccaratRoadData = [];

function register(){

  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();

  if(username.length < 5 || password.length < 5){
    msg.innerText = "账号密码至少5位";
    return;
  }

  localStorage.setItem(
    "user_"+username,
    JSON.stringify({
      password,
      score:500,
      id:Math.floor(Math.random()*99999999)
    })
  );

  msg.innerText = "注册成功";
}

function login(){

  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();

  let user = localStorage.getItem("user_"+username);

  if(!user){
    msg.innerText = "账号不存在";
    return;
  }

  user = JSON.parse(user);

  if(user.password !== password){
    msg.innerText = "密码错误";
    return;
  }

  currentUser = username;

  currentScore = user.score || 500;

  loginBox.classList.add("hidden");
  gameBox.classList.remove("hidden");

  updateUserInfo(user.id);
}

function updateUserInfo(id){

  nameText.innerText = currentUser;
  userIdText.innerText = id;

  score.innerText = currentScore.toFixed(2);

  baccaratScore.innerText = currentScore.toFixed(2);
  baccaratChips.innerText = chips.toFixed(2);

  settingName.innerText = currentUser;
  settingId.innerText = id;
  settingScore.innerText = currentScore.toFixed(2);
}

function saveUser(){

  let old = JSON.parse(localStorage.getItem("user_"+currentUser));

  old.score = currentScore;

  localStorage.setItem(
    "user_"+currentUser,
    JSON.stringify(old)
  );

  updateUserInfo(old.id);
}

function enterGame(type){

  document.getElementById("gameLobby").classList.add("hidden");

  if(type==="coin"){
    coinGamePanel.classList.remove("hidden");
  }

  if(type==="baccarat"){
    baccaratPanel.classList.remove("hidden");
  }
}

function backToLobby(){

  coinGamePanel.classList.add("hidden");
  baccaratPanel.classList.add("hidden");

  document.getElementById("gameLobby").classList.remove("hidden");
}

function switchTab(type){

  entertainmentPanel.classList.add("hidden");
  servicePanel.classList.add("hidden");
  settingsPanel.classList.add("hidden");

  document.getElementById("tabEntertainment").classList.remove("active");
  document.getElementById("tabService").classList.remove("active");
  document.getElementById("tabSettings").classList.remove("active");

  if(type==="entertainment"){
    entertainmentPanel.classList.remove("hidden");
    document.getElementById("tabEntertainment").classList.add("active");
  }

  if(type==="service"){
    servicePanel.classList.remove("hidden");
    document.getElementById("tabService").classList.add("active");
  }

  if(type==="settings"){
    settingsPanel.classList.remove("hidden");
    document.getElementById("tabSettings").classList.add("active");
  }
}

function logout(){
  location.reload();
}

function betCustom(side){

  let amount = Number(
    side==="正面"
    ? document.getElementById("frontAmount").value
    : document.getElementById("backAmount").value
  );

  if(amount <= 0) return;

  if(currentScore < amount){
    alert("积分不足");
    return;
  }

  currentScore -= amount;

  if(side==="正面"){
    userFrontBet += amount;
  }else{
    userBackBet += amount;
  }

  frontBet.innerText = userFrontBet.toFixed(2);
  backBet.innerText = userBackBet.toFixed(2);

  saveUser();
}

function updateFakeMarket(){

  fakeFrontTotal += Math.random()*500;
  fakeBackTotal += Math.random()*500;

  document.getElementById("fakeFrontTotal").innerText =
    fakeFrontTotal.toFixed(0);

  document.getElementById("fakeBackTotal").innerText =
    fakeBackTotal.toFixed(0);

  let total = fakeFrontTotal + fakeBackTotal;

  let frontPercent = total
    ? (fakeFrontTotal / total)*100
    : 50;

  let backPercent = 100 - frontPercent;

  document.getElementById("frontHeat").style.width =
    frontPercent+"%";

  document.getElementById("backHeat").style.width =
    backPercent+"%";
}

setInterval(updateFakeMarket,1500);

function roll(){

  coinText.innerText = "开奖中...";

  result.innerText = "停止下注，硬币高速翻转中...";

  let coin = document.getElementById("coin");

  coin.classList.add("rolling");

  let tempTimer = setInterval(()=>{

    coinImg.src =
      coinImg.src.includes("coin.png2.PNG")
      ? "coin.png.PNG"
      : "coin.png2.PNG";

  },120);

  setTimeout(()=>{

    clearInterval(tempTimer);

    let resultSide =
      Math.random()<0.5
      ? "正面"
      : "反面";

    coinImg.src =
      resultSide==="正面"
      ? "coin.png.PNG"
      : "coin.png2.PNG";

    coin.classList.remove("rolling");

    coinText.innerText = resultSide;

    settle(resultSide);

  },1800);
}

function settle(side){

  let win = 0;

  if(side==="正面"){
    win = userFrontBet*1.9;
  }

  if(side==="反面"){
    win = userBackBet*1.9;
  }

  currentScore += win;

  result.innerText =
    win>0
    ? "恭喜获胜 +" + win.toFixed(2)
    : "本局未中奖";

  addRoad(side);

  userFrontBet = 0;
  userBackBet = 0;

  frontBet.innerText = "0";
  backBet.innerText = "0";

  saveUser();
}

function addRoad(side){

  let map = document.getElementById("roadMap");

  let dot = document.createElement("div");

  dot.className =
    "road-dot " +
    (side==="正面" ? "front" : "back");

  dot.innerText =
    side==="正面"
    ? "正"
    : "反";

  map.prepend(dot);

  if(map.children.length > 20){
    map.removeChild(map.lastChild);
  }
}

setInterval(()=>{

  countdownNum--;

  countdown.innerText =
    "倒计时："+countdownNum;

  if(countdownNum <= 0){

    countdownNum = 8;

    roll();
  }

},1000);

function exchangeToChips(){

  let amount =
    Number(
      document.getElementById("chipExchangeAmount").value
    );

  if(amount <= 0) return;

  if(currentScore < amount){
    alert("积分不足");
    return;
  }

  currentScore -= amount;
  chips += amount;

  saveUser();
}

function exchangeChipsBack(){

  if(chips <= 0) return;

  currentScore += chips;
  chips = 0;

  saveUser();
}

function selectBaccaratBet(side){

  baccaratSelected = side;

  document.getElementById("selectedBetSide").innerText =
    "当前选择："+side;
}

function placeBaccaratBet(){

  if(!baccaratSelected){
    alert("请选择下注区域");
    return;
  }

  let amount =
    Number(
      document.getElementById("baccaratBetAmount").value
    );

  if(amount <= 0) return;

  if(chips < amount){
    alert("筹码不足");
    return;
  }

  chips -= amount;

  baccaratBetData[baccaratSelected] += amount;

  document.getElementById("bankerBet").innerText =
    baccaratBetData["庄"].toFixed(2);

  document.getElementById("playerBet").innerText =
    baccaratBetData["闲"].toFixed(2);

  document.getElementById("tieBet").innerText =
    baccaratBetData["和"].toFixed(2);

  saveUser();
}

function clearBaccaratBets(){

  chips +=
    baccaratBetData["庄"] +
    baccaratBetData["闲"] +
    baccaratBetData["和"];

  baccaratBetData = {
    庄:0,
    闲:0,
    和:0
  };

  document.getElementById("bankerBet").innerText = "0";
  document.getElementById("playerBet").innerText = "0";
  document.getElementById("tieBet").innerText = "0";

  saveUser();
}

function randomCard(){

  let arr = [
    "A","2","3","4","5",
    "6","7","8","9","10",
    "J","Q","K"
  ];

  return arr[
    Math.floor(Math.random()*arr.length)
  ];
}

function baccaratPoint(cards){

  let total = 0;

  cards.forEach(card=>{

    if(card==="A"){
      total += 1;
    }else if(
      ["10","J","Q","K"].includes(card)
    ){
      total += 0;
    }else{
      total += Number(card);
    }

  });

  return total % 10;
}

function startBaccaratRound(){

  let bankerCards = [
    randomCard(),
    randomCard()
  ];

  let playerCards = [
    randomCard(),
    randomCard()
  ];

  let bankerPoint =
    baccaratPoint(bankerCards);

  let playerPoint =
    baccaratPoint(playerCards);

  document.getElementById("bankerCards").innerText =
    bankerCards.join(" ");

  document.getElementById("playerCards").innerText =
    playerCards.join(" ");

  document.getElementById("bankerPoint").innerText =
    bankerPoint;

  document.getElementById("playerPoint").innerText =
    playerPoint;

  let resultSide = "";

  if(bankerPoint > playerPoint){
    resultSide = "庄";
  }else if(playerPoint > bankerPoint){
    resultSide = "闲";
  }else{
    resultSide = "和";
  }

  let reward = 0;

  if(resultSide==="庄"){
    reward =
      baccaratBetData["庄"]*1.95;
  }

  if(resultSide==="闲"){
    reward =
      baccaratBetData["闲"]*2;
  }

  if(resultSide==="和"){
    reward =
      baccaratBetData["和"]*9;
  }

  chips += reward;

  document.getElementById("baccaratResult").innerText =
    "本局结果："+resultSide+
    " ｜ 获得："+reward.toFixed(2);

  baccaratRoadData.unshift(resultSide);

  updateBaccaratRoad();

  baccaratBetData = {
    庄:0,
    闲:0,
    和:0
  };

  document.getElementById("bankerBet").innerText = "0";
  document.getElementById("playerBet").innerText = "0";
  document.getElementById("tieBet").innerText = "0";

  saveUser();
}

function updateBaccaratRoad(){

  let road =
    document.getElementById("baccaratRoad");

  road.innerHTML = "";

  baccaratRoadData.forEach(item=>{

    let dot = document.createElement("div");

    dot.className =
      "road-dot " +
      (
        item==="庄"
        ? "banker"
        : item==="闲"
        ? "player"
        : "tie"
      );

    dot.innerText = item;

    road.appendChild(dot);

  });
}
