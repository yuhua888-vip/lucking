let currentUser = null;
let currentScore = 500;
let currentChips = 0;

let selectedSide = null;

let bets = {
  "庄": 0,
  "闲": 0,
  "和": 0
};

let roadHistory = [];

function registerUser(){
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if(username.length < 5 || password.length < 5){
    alert("账号密码至少5位");
    return;
  }

  localStorage.setItem("user_" + username, JSON.stringify({
    password,
    score: 500,
    chips: 0,
    id: Math.floor(10000 + Math.random() * 90000)
  }));

  alert("创建成功，请登录");
}

function login(){
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  let user = localStorage.getItem("user_" + username);

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
  currentScore = Number(user.score || 500);
  currentChips = Number(user.chips || 0);

  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("hallPage").classList.remove("hidden");

  document.getElementById("playerName").innerText = username;
  document.getElementById("playerId").innerText = user.id;
  document.getElementById("playerScore").innerText = currentScore.toFixed(2);
}

function saveUser(){
  if(!currentUser) return;

  let user = JSON.parse(localStorage.getItem("user_" + currentUser));

  user.score = currentScore;
  user.chips = currentChips;

  localStorage.setItem("user_" + currentUser, JSON.stringify(user));
}

function openBaccarat(){
  document.getElementById("hallPage").classList.add("hidden");
  document.getElementById("baccaratPage").classList.remove("hidden");
  updateWallet();
}

function backHall(){
  document.getElementById("baccaratPage").classList.add("hidden");
  document.getElementById("hallPage").classList.remove("hidden");

  document.getElementById("playerScore").innerText = currentScore.toFixed(2);
}

function openCoinGame(){
  alert("幸运硬币正在维护升级");
}

function updateWallet(){
  document.getElementById("baccaratScore").innerText = currentScore.toFixed(2);
  document.getElementById("chipBalance").innerText = currentChips.toFixed(2);
  saveUser();
}

function exchangeToChips(){
  const amount = Number(document.getElementById("exchangeAmount").value);

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

  document.getElementById("exchangeAmount").value = "";

  updateWallet();
}

function exchangeBack(){
  if(currentChips <= 0){
    alert("没有可兑换筹码");
    return;
  }

  currentScore += currentChips;
  currentChips = 0;

  updateWallet();
}

function selectBet(side){
  selectedSide = side;

  document.getElementById("selectedSide").innerText = "当前选择：" + side;
}

function setChip(num){
  document.getElementById("betAmount").value = num;
}

function placeBet(){
  if(!selectedSide){
    alert("请先选择庄闲和");
    return;
  }

  const amount = Number(document.getElementById("betAmount").value);

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

  document.getElementById("betAmount").value = "";

  updateWallet();
  updateBetView();
}

function updateBetView(){
  document.getElementById("playerBet").innerText = bets["闲"].toFixed(2);
  document.getElementById("tieBet").innerText = bets["和"].toFixed(2);
  document.getElementById("bankerBet").innerText = bets["庄"].toFixed(2);
}

function clearBets(){
  const total = bets["庄"] + bets["闲"] + bets["和"];

  currentChips += total;

  bets = {
    "庄": 0,
    "闲": 0,
    "和": 0
  };

  updateWallet();
  updateBetView();
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomCard(){
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const suits = ["♠","♥","♦","♣"];

  return {
    value: values[Math.floor(Math.random() * values.length)],
    suit: suits[Math.floor(Math.random() * suits.length)]
  };
}

function cardPoint(card){
  if(card.value === "A") return 1;
  if(["10","J","Q","K"].includes(card.value)) return 0;
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
  const red = card.suit === "♥" || card.suit === "♦";

  return `
    <span class="mini-card" id="${id}">
      <span class="card-back">▧</span>
      <span class="card-face ${red ? "red-card" : "black-card"}">
        ${card.suit}${card.value}
      </span>
    </span>
  `;
}

function revealCard(id){
  const card = document.getElementById(id);
  if(card){
    card.classList.add("show");
  }
}

async function dealOneCard(targetId, card, cardId, text){
  document.getElementById("baccaratResult").innerText = text;

  const target = document.getElementById(targetId);
  target.innerHTML += cardHTML(card, cardId);

  await sleep(450);
  revealCard(cardId);
  await sleep(650);
}

async function startBaccarat(){
  const total = bets["庄"] + bets["闲"] + bets["和"];

  if(total <= 0){
    alert("请先下注");
    return;
  }

  document.getElementById("bankerCards").innerHTML = "";
  document.getElementById("playerCards").innerHTML = "";

  document.getElementById("bankerPoint").innerText = "-";
  document.getElementById("playerPoint").innerText = "-";

  document.getElementById("baccaratResult").innerText = "洗牌中...";

  await sleep(700);

  const bankerCards = [];
  const playerCards = [];

  playerCards.push(randomCard());
  await dealOneCard("playerCards", playerCards[0], "playerCard1", "发闲家第一张...");

  bankerCards.push(randomCard());
  await dealOneCard("bankerCards", bankerCards[0], "bankerCard1", "发庄家第一张...");

  playerCards.push(randomCard());
  await dealOneCard("playerCards", playerCards[1], "playerCard2", "发闲家第二张...");

  bankerCards.push(randomCard());
  await dealOneCard("bankerCards", bankerCards[1], "bankerCard2", "发庄家第二张...");

  const bankerFinal = baccaratPoint(bankerCards);
  const playerFinal = baccaratPoint(playerCards);

  document.getElementById("bankerPoint").innerText = bankerFinal;
  document.getElementById("playerPoint").innerText = playerFinal;

  document.getElementById("baccaratResult").innerText = "正在比点...";

  await sleep(900);

  let result = "";

  if(bankerFinal > playerFinal){
    result = "庄";
  }else if(playerFinal > bankerFinal){
    result = "闲";
  }else{
    result = "和";
  }

  settleGame(result);
  addRoad(result);
}

function settleGame(result){
  let win = 0;

  if(result === "庄"){
    win = bets["庄"] * 1.95;
  }

  if(result === "闲"){
    win = bets["闲"] * 2;
  }

  if(result === "和"){
    win = bets["和"] * 9;
  }

  currentChips += win;

  document.getElementById("baccaratResult").innerText =
    "本局结果：" + result + "　获得：" + win.toFixed(2);

  bets = {
    "庄": 0,
    "闲": 0,
    "和": 0
  };

  updateWallet();
  updateBetView();
}

function addRoad(result){
  roadHistory.unshift(result);

  const road = document.getElementById("baccaratRoad");
  road.innerHTML = "";

  roadHistory.slice(0, 30).forEach(item => {
    const dot = document.createElement("div");

    dot.className = "road-dot";

    if(item === "庄"){
      dot.classList.add("red");
    }

    if(item === "闲"){
      dot.classList.add("blue");
    }

    if(item === "和"){
      dot.classList.add("green");
    }

    dot.innerText = item;

    road.appendChild(dot);
  });
}
