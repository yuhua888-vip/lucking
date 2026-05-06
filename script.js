let currentUser = null;
let timer = 8;
let roundTimer = null;
let betting = false;

let userBet = { front: 0, back: 0 };

let fakeFrontAmount = 0;
let fakeBackAmount = 0;
let fakeTimer = null;

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
    road: [],
    winRoad: []
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

  saveUsers(users);

  currentUser = user.username;

  loginBox.style.display = "none";
  gameBox.classList.remove("hidden");

  switchTab("entertainment");
  updateUI();
  startRound();
}

function logout(){
  currentUser = null;
  loginBox.style.display = "block";
  gameBox.classList.add("hidden");

  clearInterval(roundTimer);
  stopFakePlayers();
}

/* Tab */
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

/* 开始一局 */
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

  if(document.getElementById("frontAmount")) frontAmount.value = "";
  if(document.getElementById("backAmount")) backAmount.value = "";

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

/* 自定义下注 */
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

/* 下注 */
function bet(side, amount){
  if(!betting){
    result.innerText = "已停止下注";
    return;
  }

  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

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

  saveUsers(users);
  updateUI();

  result.innerText = "正面：" + formatMoney(userBet.front) + " | 反面：" + formatMoney(userBet.back);
}

/* 开奖 */
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

/* 结算 */
function settle(resultSide){
  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

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

  saveUsers(users);
  updateUI();

  setTimeout(startRound, 2500);
}

/* 假玩家 */
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

    fakeFeed.innerText = fakeName + "：" + side + " " + amount + " 💰｜热门：" + hotSide + " " + hotAmount;
  }, 700);
}

function stopFakePlayers(){
  clearInterval(fakeTimer);
}

/* 假玩家总注 + 热度 */
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

/* UI */
function updateUI(){
  let user = getUsers().find(u => u.username === currentUser);
  if(!user) return;

  name.innerText = user.username;
  userId.innerText = user.id;
  score.innerText = formatMoney(user.score);

  if(document.getElementById("settingName")) settingName.innerText = user.username;
  if(document.getElementById("settingId")) settingId.innerText = user.id;
  if(document.getElementById("settingScore")) settingScore.innerText = formatMoney(user.score);

  renderRoad(user.road || []);
  renderWinRoad(user.winRoad || []);
}

/* 路子 */
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
