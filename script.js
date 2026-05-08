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
let currentUserId = null;

let currentScore = 500;
let chips = 0;

let countdownNum = 8;

let userFrontBet = 0;
let userBackBet = 0;

let fakeFrontTotal = 0;
let fakeBackTotal = 0;

let baccaratSelected = null;

let baccaratBetData = {
  庄: 0,
  闲: 0,
  和: 0
};

let baccaratRoadData = [];

function register(){
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();

  if(username.length < 5 || password.length < 5){
    msg.innerText = "账号密码至少5位";
    return;
  }

  let startScore = username === "adm11" ? 999999999 : 500;

  localStorage.setItem(
    "user_" + username,
    JSON.stringify({
      password,
      score: startScore,
      chips: 0,
      id: Math.floor(10000 + Math.random() * 90000)
    })
  );

  msg.innerText = "注册成功";
}

function login(){
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();

  let user = localStorage.getItem("user_" + username);

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
  currentUserId = user.id;

  currentScore = Number(user.score || 500);
  chips = Number(user.chips || 0);

  loginBox.classList.add("hidden");
  gameBox.classList.remove("hidden");

  updateUserInfo();
}

function updateUserInfo(){
  nameText.innerText = currentUser;
  userIdText.innerText = currentUserId;

  score.innerText = currentScore.toFixed(2);

  baccaratScore.innerText = currentScore.toFixed(2);
  baccaratChips.innerText = chips.toFixed(2);

  settingName.innerText = currentUser;
  settingId.innerText = currentUserId;
  settingScore.innerText = currentScore.toFixed(2);
}

function saveUser(){
  let old = JSON.parse(localStorage.getItem("user_" + currentUser));

  old.score = currentScore;
  old.chips = chips;

  localStorage.setItem(
    "user_" + currentUser,
    JSON.stringify(old)
  );

  updateUserInfo();
}

function enterGame(type){
  document.getElementById("gameLobby").classList.add("hidden");

  if(type === "coin"){
    coinGamePanel.classList.remove("hidden");
    baccaratPanel.classList.add("hidden");
  }

  if(type === "baccarat"){
    baccaratPanel.classList.remove("hidden");
    coinGamePanel.classList.add("hidden");
    updateUserInfo();
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

  if(type === "entertainment"){
    entertainmentPanel.classList.remove("hidden");
    document.getElementById("tabEntertainment").classList.add("active");
  }

  if(type === "service"){
    servicePanel.classList.remove("hidden");
    document.getElementById("tabService").classList.add("active");
  }

  if(type === "settings"){
    settingsPanel.classList.remove("hidden");
    document.getElementById("tabSettings").classList.add("active");
  }
}

function logout(){
  location.reload();
}

/* 硬币玩法 */

function betCustom(side){
  let amount = Number(
    side === "正面"
    ? document.getElementById("frontAmount").value
    : document.getElementById("backAmount").value
  );

  if(amount <= 0) return;

  if(currentScore < amount){
    alert("积分不足");
    return;
  }

  currentScore -= amount;

  if(side === "正面"){
    userFrontBet += amount;
  }else{
    userBackBet += amount;
  }

  frontBet.innerText = userFrontBet.toFixed(2);
  backBet.innerText = userBackBet.toFixed(2);

  saveUser();
}

function updateFakeMarket(){
  if(coinGamePanel.classList.contains("hidden")) return;

  fakeFrontTotal += Math.random() * 500;
  fakeBackTotal += Math.random() * 500;

  document.getElementById("fakeFrontTotal").innerText =
    fakeFrontTotal.toFixed(0);

  document.getElementById("fakeBackTotal").innerText =
    fakeBackTotal.toFixed(0);

  let total = fakeFrontTotal + fakeBackTotal;

  let frontPercent = total
    ? (fakeFrontTotal / total) * 100
    : 50;

  let backPercent = 100 - frontPercent;

  document.getElementById("frontHeat").style.width =
    frontPercent + "%";

  document.getElementById("backHeat").style.width =
    backPercent + "%";

  document.getElementById("hotText").innerText =
    frontPercent > backPercent
    ? "🔥 热门：正面 " + frontPercent.toFixed(0) + "%"
    : "🔥 热门：反面 " + backPercent.toFixed(0) + "%";
}

setInterval(updateFakeMarket, 1500);

function roll(){
  coinText.innerText = "开奖中...";
  result.innerText = "停止下注，硬币高速翻转中...";

  let coin = document.getElementById("coin");

  coin.classList.add("rolling");

  let tempTimer = setInterval(() => {
    coinImg.src =
      coinImg.src.includes("coin.png2.PNG")
      ? "coin.png.PNG"
      : "coin.png2.PNG";
  }, 110);

  setTimeout(() => {
    clearInterval(tempTimer);

    let resultSide =
      Math.random() < 0.5
      ? "正面"
      : "反面";

    coinImg.src =
      resultSide === "正面"
      ? "coin.png.PNG"
      : "coin.png2.PNG";

    coin.classList.remove("rolling");

    coinText.innerText = resultSide;

    settle(resultSide);
  }, 1800);
}

function settle(side){
  let win = 0;

  if(side === "正面"){
    win = userFrontBet * 1.9;
  }

  if(side === "反面"){
    win = userBackBet * 1.9;
  }

  currentScore += win;

  result.innerText =
    win > 0
    ? "恭喜获胜 +" + win.toFixed(2)
    : "本局未中奖";

  addRoad(side);
  addWinRoad(win > 0 ? "赢" : "输");

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
    (side === "正面" ? "front" : "back");

  dot.innerText =
    side === "正面" ? "正" : "反";

  map.prepend(dot);

  if(map.children.length > 20){
    map.removeChild(map.lastChild);
  }
}

function addWinRoad(text){
  let map = document.getElementById("winRoadMap");
  if(!map) return;

  let dot = document.createElement("div");

  dot.className =
    "road-dot " +
    (text === "赢" ? "win" : "lose");

  dot.innerText = text;

  map.prepend(dot);

  if(map.children.length > 20){
    map.removeChild(map.lastChild);
  }
}

setInterval(() => {
  if(!currentUser) return;
  if(coinGamePanel.classList.contains("hidden")) return;

  countdownNum--;

  countdown.innerText =
    "倒计时：" + countdownNum;

  if(countdownNum <= 0){
    countdownNum = 8;
    roll();
  }
}, 1000);

/* 筹码百家乐 */

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

  document.getElementById("chipExchangeAmount").value = "";

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
    "当前选择：" + side;

  document.querySelectorAll(".baccarat-bet-zone").forEach(item => {
    item.classList.remove("selected");
  });

  if(side === "庄"){
    document.querySelector(".banker-zone").classList.add("selected");
  }

  if(side === "闲"){
    document.querySelector(".player-zone").classList.add("selected");
  }

  if(side === "和"){
    document.querySelector(".tie-zone").classList.add("selected");
  }
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

  document.getElementById("baccaratBetAmount").value = "";

  saveUser();
}

function clearBaccaratBets(){
  chips +=
    baccaratBetData["庄"] +
    baccaratBetData["闲"] +
    baccaratBetData["和"];

  baccaratBetData = {
    庄: 0,
    闲: 0,
    和: 0
  };

  document.getElementById("bankerBet").innerText = "0";
  document.getElementById("playerBet").innerText = "0";
  document.getElementById("tieBet").innerText = "0";

  saveUser();
}

function randomCard(){
  const suits = ["♠","♥","♦","♣"];
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

  return {
    suit: suits[Math.floor(Math.random() * suits.length)],
    value: values[Math.floor(Math.random() * values.length)]
  };
}

function cardPoint(card){
  if(card.value === "A") return 1;

  if(["10","J","Q","K"].includes(card.value)){
    return 0;
  }

  return Number(card.value);
}

function baccaratPoint(cards){
  let total = 0;

  cards.forEach(card => {
    total += cardPoint(card);
  });

  return total % 10;
}

function cardHTML(card, id){
  let red =
    card.suit === "♥" ||
    card.suit === "♦";

  return `
    <div class="playing-card" id="${id}">
      <div class="card-inner">
        <div class="card-back">★</div>
        <div class="card-front ${red ? "red" : "black"}">
          ${card.suit}${card.value}
        </div>
      </div>
    </div>
  `;
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function revealCard(id){
  let card = document.getElementById(id);

  if(card){
    card.classList.add("revealed");
  }
}

async function dealCard(targetId, card, cardId, text){
  let target = document.getElementById(targetId);

  document.getElementById("baccaratResult").innerText = text;

  target.innerHTML += cardHTML(card, cardId);

  await sleep(420);

  revealCard(cardId);

  await sleep(650);
}

async function startBaccaratRound(){
  let totalBet =
    baccaratBetData["庄"] +
    baccaratBetData["闲"] +
    baccaratBetData["和"];

  if(totalBet <= 0){
    alert("请先下注");
    return;
  }

  document.getElementById("bankerCards").innerHTML = "";
  document.getElementById("playerCards").innerHTML = "";

  document.getElementById("bankerPoint").innerText = "-";
  document.getElementById("playerPoint").innerText = "-";

  document.getElementById("baccaratResult").innerText =
    "洗牌中...";

  await sleep(500);

  let bankerCards = [];
  let playerCards = [];

  playerCards.push(randomCard());
  await dealCard("playerCards", playerCards[0], "playerCard1", "闲家第一张...");

  bankerCards.push(randomCard());
  await dealCard("bankerCards", bankerCards[0], "bankerCard1", "庄家第一张...");

  playerCards.push(randomCard());
  await dealCard("playerCards", playerCards[1], "playerCard2", "闲家第二张...");

  bankerCards.push(randomCard());
  await dealCard("bankerCards", bankerCards[1], "bankerCard2", "庄家第二张...");

  let bankerPoint = baccaratPoint(bankerCards);
  let playerPoint = baccaratPoint(playerCards);

  document.getElementById("bankerPoint").innerText = bankerPoint;
  document.getElementById("playerPoint").innerText = playerPoint;

  await sleep(800);

  document.getElementById("baccaratResult").innerText =
    "正在比点...";

  await sleep(700);

  let resultSide = "";

  if(bankerPoint > playerPoint){
    resultSide = "庄";
  }else if(playerPoint > bankerPoint){
    resultSide = "闲";
  }else{
    resultSide = "和";
  }

  let reward = 0;

  if(resultSide === "庄"){
    reward = baccaratBetData["庄"] * 1.95;
  }

  if(resultSide === "闲"){
    reward = baccaratBetData["闲"] * 2;
  }

  if(resultSide === "和"){
    reward = baccaratBetData["和"] * 9;
  }

  chips += reward;

  document.getElementById("baccaratResult").innerText =
    "本局结果：" + resultSide +
    " ｜ 获得：" + reward.toFixed(2);

  baccaratRoadData.unshift(resultSide);

  updateBaccaratRoad();

  baccaratBetData = {
    庄: 0,
    闲: 0,
    和: 0
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

  baccaratRoadData.forEach(item => {
    let dot = document.createElement("div");

    dot.className =
      "road-dot " +
      (
        item === "庄"
        ? "banker"
        : item === "闲"
        ? "player"
        : "tie"
      );

    dot.innerText = item;

    road.appendChild(dot);
  });
}
