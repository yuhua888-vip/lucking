let currentUser = null;

let timer = 8;
let roundTimer = null;
let betting = false;

let userBet = { front: 0, back: 0 };

let fakeFrontAmount = 0;
let fakeBackAmount = 0;
let fakeTimer = null;

let baccaratSelectedSide = null;
let baccaratBets = {
  banker: 0,
  player: 0,
  tie: 0
};

const fakeNames = [
  "龙哥","阿豪","金手","财神","小王","豹子","辉少","阿强",
  "老K","黑桃A","金链哥","赌神","小六","阿飞","东哥","凯哥",
  "小虎","夜王","大飞","火哥","阿超","老七","林少","虎哥"
];

function formatMoney(n){
  return Number(n || 0).toFixed(2);
}

function getUsers(){
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users){
  localStorage.setItem("users", JSON.stringify(users));
}

function createId(){
  return Math.floor(10000 + Math.random() * 90000);
}

function isValidAccount(value){
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5}$/.test(value);
}

function getCurrentUser(){
  let users = getUsers();
  return users.find(u => u.username === currentUser);
}

function updateCurrentUser(user){
  let users = getUsers();
  let index = users.findIndex(u => u.username === currentUser);

  if(index >= 0){
    users[index] = user;
    saveUsers(users);
  }
}

/* 注册 */
function register(){
  let users = getUsers();
  let account = username.value.trim();
  let pass = password.value.trim();

  if(!isValidAccount(account)){
    msg.innerText = "账号必须是5位字母+数字混合";
    return;
  }

  if(!isValidAccount(pass)){
    msg.innerText = "密码必须是5位字母+数字混合";
    return;
  }

  if(users.find(u => u.username === account)){
    msg.innerText = "账号已存在";
    return;
  }

  users.push({
    id: createId(),
    username: account,
    password: pass,
    score: 500,
    chips: 0,
    road: [],
    winRoad: [],
    baccaratRoad: []
  });

  saveUsers(users);
  msg.innerText = "注册成功，请登录";
}

/* 登录 */
function login(){
  let users = getUsers();
  let account = username.value.trim();
  let pass = password.value.trim();

  let user = users.find(u => u.username === account && u.password === pass);

  if(!user){
    msg.innerText = "账号或密码错误";
    return;
  }

  if(!user.road) user.road = [];
  if(!user.winRoad) user.winRoad = [];
  if(!user.baccaratRoad) user.baccaratRoad = [];
  if(user.chips === undefined) user.chips = 0;

  saveUsers(users);

  currentUser = user.username;

  loginBox.style.display = "none";
  gameBox.classList.remove("hidden");

  switchTab("entertainment");
  switchGame("lobby");

  updateUI();
}

/* 退出 */
function logout(){
  currentUser = null;

  loginBox.style.display = "block";
  gameBox.classList.add("hidden");

  clearInterval(roundTimer);
  stopFakePlayers();
}

/* 底部 Tab */
function switchTab(tab){
  entertainmentPanel.classList.add("hidden");
  servicePanel.classList.add("hidden");
  settingsPanel.classList.add("hidden");

  tabEntertainment.classList.remove("active");
  tabService.classList.remove("active");
  tabSettings.classList.remove("active");

  if(tab === "entertainment"){
    entertainmentPanel.classList.remove("hidden");
    tabEntertainment.classList.add("active");
  }

  if(tab === "service"){
    servicePanel.classList.remove("hidden");
    tabService.classList.add("active");
  }

  if(tab === "settings"){
    settingsPanel.classList.remove("hidden");
    tabSettings.classList.add("active");
  }

  updateUI();
}

/* 游戏大厅切换 */
function switchGame(type){
  gameLobby.classList.add("hidden");
  coinGamePanel.classList.add("hidden");
  baccaratPanel.classList.add("hidden");

  clearInterval(roundTimer);
  stopFakePlayers();

  if(type === "lobby"){
    gameLobby.classList.remove("hidden");
  }

  if(type === "coin"){
    coinGamePanel.classList.remove("hidden");
    startRound();
  }

  if(type === "baccarat"){
    baccaratPanel.classList.remove("hidden");
    updateBaccaratUI();
  }

  updateUI();
}

function enterGame(type){
  switchGame(type);
}

function backToLobby(){
  switchGame("lobby");
}

/* 硬币盘口 */
function startRound(){
  clearInterval(roundTimer);
  stopFakePlayers();

  timer = 8;
  betting = true;

  userBet = { front: 0, back: 0 };

  fakeFrontAmount = 0;
  fakeBackAmount = 0;

  frontBet.innerText = "0";
  backBet.innerText = "0";

  if(frontAmount) frontAmount.value = "";
  if(backAmount) backAmount.value = "";

  countdown.innerText = "倒计时：" + timer;
  coinText.innerText = "等待下注";
  result.innerText = "开始下注";

  updateFakeTotals();
  startFakePlayers();

  roundTimer = setInterval(() => {
    timer--;
    countdown.innerText = "倒计时：" + timer;

    if(timer <= 0){
      clearInterval(roundTimer);
      betting = false;
      roll();
    }
  }, 1000);
}

function betCustom(side){
  let amount = side === "正面"
    ? Number(frontAmount.value)
    : Number(backAmount.value);

  if(!amount || amount <= 0){
    result.innerText = "请输入正确的下注金额";
    return;
  }

  bet(side, amount);
}

function bet(side, amount){
  if(!betting){
    result.innerText = "已停止下注";
    return;
  }

  let user = getCurrentUser();

  if(!user){
    result.innerText = "请重新登录";
    return;
  }

  amount = Number(amount);

  if(user.score < amount){
    result.innerText = "积分不足";
    return;
  }

  user.score = Number((user.score - amount).toFixed(2));

  if(side === "正面"){
    userBet.front = Number((userBet.front + amount).toFixed(2));
    frontBet.innerText = formatMoney(userBet.front);
  }else{
    userBet.back = Number((userBet.back + amount).toFixed(2));
    backBet.innerText = formatMoney(userBet.back);
  }

  updateCurrentUser(user);
  updateUI();

  result.innerText =
    "正面：" + formatMoney(userBet.front) +
    " | 反面：" + formatMoney(userBet.back);
}

function roll(){
  stopFakePlayers();

  coinText.innerText = "旋转中...";
  result.innerText = "停止下注，开奖中...";

  let coin = document.getElementById("coin");

  if(coin){
    coin.classList.remove("flip");
    void coin.offsetWidth;
    coin.classList.add("flip");
  }

  setTimeout(() => {
    let resultSide = Math.random() < 0.5 ? "正面" : "反面";

    coinImg.src = resultSide === "正面" ? "coin.png.PNG" : "coin.png2.PNG";
    coinText.innerText = resultSide;

    settle(resultSide);

    if(coin){
      coin.classList.remove("flip");
    }
  }, 1350);
}

function settle(resultSide){
  let user = getCurrentUser();
  if(!user) return;

  let winAmount = resultSide === "正面" ? userBet.front : userBet.back;
  let loseAmount = resultSide === "正面" ? userBet.back : userBet.front;

  if(winAmount > 0){
    let payout = Number((winAmount * 1.9).toFixed(2));
    let profit = Number((payout - winAmount - loseAmount).toFixed(2));

    user.score = Number((user.score + payout).toFixed(2));
    result.innerText = "💰 开奖：" + resultSide + "，本局盈亏：" + formatMoney(profit);
    explodeCoins();
  }else{
    result.innerText = "😌 开奖：" + resultSide + "，损失：" + formatMoney(loseAmount);
  }

  user.road.push(resultSide);
  if(user.road.length > 30) user.road.shift();

  user.winRoad.push(winAmount > 0 ? "win" : "lose");
  if(user.winRoad.length > 30) user.winRoad.shift();

  updateCurrentUser(user);
  updateUI();

  setTimeout(startRound, 2500);
}

/* 假玩家 + 热度 */
function startFakePlayers(){
  clearInterval(fakeTimer);

  fakeTimer = setInterval(() => {
    if(!betting) return;

    let side = Math.random() < 0.5 ? "正面" : "反面";
    let amountList = [10,20,30,50,80,100,150,200,300,500,800];
    let amount = amountList[Math.floor(Math.random() * amountList.length)];
    let fakeName = fakeNames[Math.floor(Math.random() * fakeNames.length)];

    if(side === "正面"){
      fakeFrontAmount += amount;
    }else{
      fakeBackAmount += amount;
    }

    updateFakeTotals();

    let hotSide = fakeFrontAmount >= fakeBackAmount ? "正面" : "反面";
    let hotAmount = Math.max(fakeFrontAmount, fakeBackAmount);

    fakeFeed.innerText =
      fakeName + "：" + side + " " + amount + " 💰｜热门：" + hotSide + " " + hotAmount;
  }, 700);
}

function stopFakePlayers(){
  clearInterval(fakeTimer);
}

function updateFakeTotals(){
  if(document.getElementById("fakeFrontTotal")){
    fakeFrontTotal.innerText = fakeFrontAmount;
  }

  if(document.getElementById("fakeBackTotal")){
    fakeBackTotal.innerText = fakeBackAmount;
  }

  updateHeatBar();
}

function updateHeatBar(){
  let total = fakeFrontAmount + fakeBackAmount;

  let front = document.getElementById("frontHeat");
  let back = document.getElementById("backHeat");
  let text = document.getElementById("hotText");

  if(!front || !back || !text) return;

  if(total <= 0){
    front.style.width = "50%";
    back.style.width = "50%";
    text.innerText = "盘口正在变化...";
    return;
  }

  let frontPercent = Math.round(fakeFrontAmount / total * 100);
  let backPercent = 100 - frontPercent;

  front.style.width = frontPercent + "%";
  back.style.width = backPercent + "%";

  if(frontPercent > backPercent){
    text.innerText = "🔥 热门：正面 " + frontPercent + "%";
  }else if(backPercent > frontPercent){
    text.innerText = "🔥 热门：反面 " + backPercent + "%";
  }else{
    text.innerText = "⚖️ 当前盘口均衡";
  }
}

/* 筹码百家乐 */
function updateBaccaratUI(){
  let user = getCurrentUser();
  if(!user) return;

  if(user.chips === undefined) user.chips = 0;

  baccaratScore.innerText = formatMoney(user.score);
  baccaratChips.innerText = formatMoney(user.chips);

  playerBet.innerText = formatMoney(baccaratBets.player);
  bankerBet.innerText = formatMoney(baccaratBets.banker);
  tieBet.innerText = formatMoney(baccaratBets.tie);

  renderBaccaratRoad(user.baccaratRoad || []);
}

function exchangeToChips(){
  let user = getCurrentUser();
  if(!user) return;

  let amount = Number(chipExchangeAmount.value);

  if(!amount || amount <= 0){
    baccaratResult.innerText = "请输入兑换积分";
    return;
  }

  if(user.score < amount){
    baccaratResult.innerText = "积分不足，无法兑换";
    return;
  }

  user.score = Number((user.score - amount).toFixed(2));
  user.chips = Number(((user.chips || 0) + amount).toFixed(2));

  chipExchangeAmount.value = "";

  updateCurrentUser(user);
  updateUI();
  updateBaccaratUI();

  baccaratResult.innerText = "已兑换 " + formatMoney(amount) + " 筹码";
}

function exchangeChipsBack(){
  let user = getCurrentUser();
  if(!user) return;

  if(!user.chips || user.chips <= 0){
    baccaratResult.innerText = "当前没有可兑换筹码";
    return;
  }

  let chips = Number(user.chips.toFixed(2));

  user.score = Number((user.score + chips).toFixed(2));
  user.chips = 0;

  updateCurrentUser(user);
  updateUI();
  updateBaccaratUI();

  baccaratResult.innerText = "筹码已兑换回积分：" + formatMoney(chips);
}

function selectBaccaratBet(side){
  baccaratSelectedSide = side;
  selectedBetSide.innerText = "当前选择：" + side;

  document.querySelectorAll(".baccarat-bet-zone").forEach(el => {
    el.classList.remove("selected");
  });

  if(side === "闲"){
    document.querySelector(".player-zone").classList.add("selected");
  }

  if(side === "和"){
    document.querySelector(".tie-zone").classList.add("selected");
  }

  if(side === "庄"){
    document.querySelector(".banker-zone").classList.add("selected");
  }
}

function placeBaccaratBet(){
  let user = getCurrentUser();
  if(!user) return;

  let amount = Number(baccaratBetAmount.value);

  if(!baccaratSelectedSide){
    baccaratResult.innerText = "请先选择庄 / 闲 / 和";
    return;
  }

  if(!amount || amount <= 0){
    baccaratResult.innerText = "请输入下注筹码";
    return;
  }

  if((user.chips || 0) < amount){
    baccaratResult.innerText = "筹码不足";
    return;
  }

  user.chips = Number((user.chips - amount).toFixed(2));

  if(baccaratSelectedSide === "庄"){
    baccaratBets.banker = Number((baccaratBets.banker + amount).toFixed(2));
  }

  if(baccaratSelectedSide === "闲"){
    baccaratBets.player = Number((baccaratBets.player + amount).toFixed(2));
  }

  if(baccaratSelectedSide === "和"){
    baccaratBets.tie = Number((baccaratBets.tie + amount).toFixed(2));
  }

  baccaratBetAmount.value = "";

  updateCurrentUser(user);
  updateUI();
  updateBaccaratUI();

  baccaratResult.innerText = "已下注：" + baccaratSelectedSide + " " + formatMoney(amount);
}

function clearBaccaratBets(){
  let user = getCurrentUser();
  if(!user) return;

  let total =
    baccaratBets.banker +
    baccaratBets.player +
    baccaratBets.tie;

  if(total <= 0){
    baccaratResult.innerText = "当前没有下注";
    return;
  }

  user.chips = Number(((user.chips || 0) + total).toFixed(2));

  baccaratBets = {
    banker: 0,
    player: 0,
    tie: 0
  };

  updateCurrentUser(user);
  updateUI();
  updateBaccaratUI();

  baccaratResult.innerText = "已清空下注，筹码已退回";
}

/* 发牌规则 */
function drawCard(){
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

  return {
    suit: suits[Math.floor(Math.random() * suits.length)],
    value: values[Math.floor(Math.random() * values.length)]
  };
}

function cardPoint(card){
  if(card.value === "A") return 1;
  if(["10","J","Q","K"].includes(card.value)) return 0;
  return Number(card.value);
}

function handPoint(cards){
  let total = cards.reduce((sum, c) => sum + cardPoint(c), 0);
  return total % 10;
}

function cardHTML(card, id){
  const red = card.suit === "♥" || card.suit === "♦";

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
  const card = document.getElementById(id);
  if(card){
    card.classList.add("revealed");
  }
}

function shouldPlayerDraw(playerPoint){
  return playerPoint <= 5;
}

function shouldBankerDraw(bankerPoint, playerThirdPoint, playerDrew){
  if(!playerDrew){
    return bankerPoint <= 5;
  }

  if(bankerPoint <= 2) return true;
  if(bankerPoint === 3) return playerThirdPoint !== 8;
  if(bankerPoint === 4) return playerThirdPoint >= 2 && playerThirdPoint <= 7;
  if(bankerPoint === 5) return playerThirdPoint >= 4 && playerThirdPoint <= 7;
  if(bankerPoint === 6) return playerThirdPoint === 6 || playerThirdPoint === 7;

  return false;
}

async function dealBaccaratCard(target, card, id, text){
  baccaratResult.innerText = text;
  target.innerHTML += cardHTML(card, id);
  await sleep(500);
  revealCard(id);
  await sleep(700);
}

async function startBaccaratRound(){
  let user = getCurrentUser();
  if(!user) return;

  let totalBet =
    baccaratBets.banker +
    baccaratBets.player +
    baccaratBets.tie;

  if(totalBet <= 0){
    baccaratResult.innerText = "请先下注筹码";
    return;
  }

  bankerCards.innerHTML = "";
  playerCards.innerHTML = "";
  bankerPoint.innerText = "-";
  playerPoint.innerText = "-";

  baccaratResult.classList.add("dealing");
  baccaratResult.innerText = "筹码已锁定，洗牌中...";

  let banker = [];
  let player = [];

  await sleep(600);

  player.push(drawCard());
  await dealBaccaratCard(playerCards, player[0], "playerCard1", "发闲家第一张...");

  banker.push(drawCard());
  await dealBaccaratCard(bankerCards, banker[0], "bankerCard1", "发庄家第一张...");

  player.push(drawCard());
  await dealBaccaratCard(playerCards, player[1], "playerCard2", "发闲家第二张...");

  banker.push(drawCard());
  await dealBaccaratCard(bankerCards, banker[1], "bankerCard2", "发庄家第二张...");

  let playerP = handPoint(player);
  let bankerP = handPoint(banker);

  playerPoint.innerText = playerP;
  bankerPoint.innerText = bankerP;

  await sleep(700);

  let natural = playerP >= 8 || bankerP >= 8;
  let playerDrew = false;
  let playerThirdPoint = null;

  if(natural){
    baccaratResult.innerText = "天牌！不补牌，直接比点...";
    await sleep(900);
  }else{
    if(shouldPlayerDraw(playerP)){
      let third = drawCard();
      player.push(third);
      playerDrew = true;
      playerThirdPoint = cardPoint(third);

      await dealBaccaratCard(playerCards, third, "playerCard3", "闲家补第三张...");
      playerP = handPoint(player);
      playerPoint.innerText = playerP;

      await sleep(500);
    }else{
      baccaratResult.innerText = "闲家停牌...";
      await sleep(700);
    }

    bankerP = handPoint(banker);

    if(shouldBankerDraw(bankerP, playerThirdPoint, playerDrew)){
      let third = drawCard();
      banker.push(third);

      await dealBaccaratCard(bankerCards, third, "bankerCard3", "庄家补第三张...");
      bankerP = handPoint(banker);
      bankerPoint.innerText = bankerP;

      await sleep(500);
    }else{
      baccaratResult.innerText = "庄家停牌...";
      await sleep(700);
    }
  }

  baccaratResult.innerText = "正在比点...";
  await sleep(800);

  playerP = handPoint(player);
  bankerP = handPoint(banker);

  playerPoint.innerText = playerP;
  bankerPoint.innerText = bankerP;

  let resultSide = "";

  if(bankerP > playerP){
    resultSide = "庄";
  }else if(playerP > bankerP){
    resultSide = "闲";
  }else{
    resultSide = "和";
  }

  let payout = 0;

  if(resultSide === "庄" && baccaratBets.banker > 0){
    payout += baccaratBets.banker * 1.95;
  }

  if(resultSide === "闲" && baccaratBets.player > 0){
    payout += baccaratBets.player * 2;
  }

  if(resultSide === "和" && baccaratBets.tie > 0){
    payout += baccaratBets.tie * 9;
  }

  payout = Number(payout.toFixed(2));

  if(payout > 0){
    user.chips = Number(((user.chips || 0) + payout).toFixed(2));
    baccaratResult.innerText =
      "💰 " + resultSide + "赢！返还筹码 " + formatMoney(payout);
    explodeCoins();
  }else{
    baccaratResult.innerText =
      "😌 " + resultSide + "赢，本局未命中";
  }

  baccaratResult.classList.remove("dealing");

  if(!user.baccaratRoad){
    user.baccaratRoad = [];
  }

  user.baccaratRoad.push(resultSide);
  if(user.baccaratRoad.length > 30){
    user.baccaratRoad.shift();
  }

  baccaratBets = {
    banker: 0,
    player: 0,
    tie: 0
  };

  updateCurrentUser(user);
  updateUI();
  updateBaccaratUI();
}

/* UI */
function updateUI(){
  let user = getCurrentUser();
  if(!user) return;

  name.innerText = user.username;
  userId.innerText = user.id;
  score.innerText = formatMoney(user.score);

  if(document.getElementById("settingName")) settingName.innerText = user.username;
  if(document.getElementById("settingId")) settingId.innerText = user.id;
  if(document.getElementById("settingScore")) settingScore.innerText = formatMoney(user.score);

  renderRoad(user.road || []);
  renderWinRoad(user.winRoad || []);
  renderBaccaratRoad(user.baccaratRoad || []);

  if(document.getElementById("baccaratScore")){
    updateBaccaratUI();
  }
}

function renderRoad(road){
  let map = document.getElementById("roadMap");
  if(!map) return;

  map.innerHTML = "";

  road.forEach(r => {
    let dot = document.createElement("div");
    dot.className = "road-dot " + (r === "正面" ? "front" : "back");
    dot.innerText = r === "正面" ? "正" : "反";
    map.appendChild(dot);
  });
}

function renderWinRoad(road){
  let map = document.getElementById("winRoadMap");
  if(!map) return;

  map.innerHTML = "";

  road.forEach(r => {
    let dot = document.createElement("div");
    dot.className = "road-dot " + (r === "win" ? "win" : "lose");
    dot.innerText = r === "win" ? "赢" : "输";
    map.appendChild(dot);
  });
}

function renderBaccaratRoad(road){
  let map = document.getElementById("baccaratRoad");
  if(!map) return;

  map.innerHTML = "";

  road.forEach(r => {
    let dot = document.createElement("div");

    if(r === "庄"){
      dot.className = "road-dot banker";
      dot.innerText = "庄";
    }else if(r === "闲"){
      dot.className = "road-dot player";
      dot.innerText = "闲";
    }else{
      dot.className = "road-dot tie";
      dot.innerText = "和";
    }

    map.appendChild(dot);
  });
}

/* 爆金币 */
function explodeCoins(){
  let box = document.getElementById("coinExplosion");
  if(!box) return;

  box.innerHTML = "";

  for(let i = 0; i < 30; i++){
    let c = document.createElement("div");
    c.className = "coin-particle";

    c.style.setProperty("--x", (Math.random() - 0.5) * 360 + "px");
    c.style.setProperty("--y", (Math.random() - 0.5) * 360 + "px");

    c.style.left = "50%";
    c.style.top = "45%";

    box.appendChild(c);
  }

  let flash = document.createElement("div");
  flash.className = "flash";
  document.body.appendChild(flash);

  setTimeout(() => {
    flash.remove();
  }, 400);
}
