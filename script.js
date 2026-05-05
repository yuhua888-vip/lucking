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

/* ===== 用户 ===== */
function getUsers(){
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users){
  localStorage.setItem("users", JSON.stringify(users));
}

/* ===== 登录 ===== */
function login(){
  let users = getUsers();
  let user = users.find(u => u.username === username.value && u.password === password.value);

  if(!user){
    msg.innerText = "账号错误";
    return;
  }

  currentUser = user.username;
  loginBox.style.display = "none";
  gameBox.classList.remove("hidden");

  startRound();
}

/* ===== 开局 ===== */
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

  coinText.innerText = "等待下注";
  result.innerText = "开始下注";

  startFakePlayers();
  updateFakeTotals();

  roundTimer = setInterval(()=>{
    countdown.innerText = "倒计时：" + timer;
    timer--;

    if(timer < 0){
      clearInterval(roundTimer);
      betting = false;
      roll();
    }
  },1000);
}

/* ===== 下注 ===== */
function betCustom(side){
  let amount = side === "正面"
    ? Number(frontAmount.value)
    : Number(backAmount.value);

  if(!amount || amount <= 0){
    result.innerText = "请输入金额";
    return;
  }

  bet(side, amount);
}

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
    frontBet.innerText = formatMoney(userBet.front);
  }else{
    userBet.back += amount;
    backBet.innerText = formatMoney(userBet.back);
  }

  saveUsers(users);
  updateUI();

  result.innerText = `正 ${userBet.front} | 反 ${userBet.back}`;
}

/* ===== 开奖（重点修复）===== */
function roll(){

  coinText.innerText = "旋转中...";
  result.innerText = "开奖中...";

  let coin = document.getElementById("coin");

  coin.classList.remove("flip");
  void coin.offsetWidth;
  coin.classList.add("flip");

  setTimeout(()=>{
    let resultSide = Math.random() < 0.5 ? "正面" : "反面";

    coinImg.src = resultSide === "正面"
      ? "coin.png.PNG"
      : "coin.png2.PNG";

    coinText.innerText = resultSide;

    settle(resultSide);

    coin.classList.remove("flip");

  },1300); // ← 关键延迟
}

/* ===== 结算 ===== */
function settle(resultSide){
  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

  let winAmount = resultSide === "正面" ? userBet.front : userBet.back;
  let loseAmount = resultSide === "正面" ? userBet.back : userBet.front;

  if(winAmount > 0){
    let payout = Number((winAmount * 1.9).toFixed(2));
    let profit = Number((payout - winAmount - loseAmount).toFixed(2));

    user.score += payout;

    result.innerText = "💰 赢 +" + profit;
  }else{
    result.innerText = "😌 输 -" + formatMoney(loseAmount);
  }

  user.road.push(resultSide);
  user.winRoad.push(winAmount > 0 ? "win" : "lose");

  if(user.road.length > 30) user.road.shift();
  if(user.winRoad.length > 30) user.winRoad.shift();

  saveUsers(users);
  updateUI();

  setTimeout(startRound,2000);
}

/* ===== 假玩家 ===== */
function startFakePlayers(){
  fakeTimer = setInterval(()=>{
    if(!betting) return;

    let side = Math.random() < 0.5 ? "正面" : "反面";
    let amount = [10,20,50,100,200][Math.floor(Math.random()*5)];
    let name = fakeNames[Math.floor(Math.random()*fakeNames.length)];

    if(side === "正面"){
      fakeFrontAmount += amount;
    }else{
      fakeBackAmount += amount;
    }

    fakeFeed.innerText = `${name} 押 ${side} ${amount}`;
    updateFakeTotals();

  },500);
}

function stopFakePlayers(){
  clearInterval(fakeTimer);
}

function updateFakeTotals(){
  document.getElementById("fakeFrontTotal").innerText = fakeFrontAmount;
  document.getElementById("fakeBackTotal").innerText = fakeBackAmount;
  updateHeatBar();
}

/* ===== 热度 ===== */
function updateHeatBar(){
  let total = fakeFrontAmount + fakeBackAmount;

  let f = document.getElementById("frontHeat");
  let b = document.getElementById("backHeat");
  let t = document.getElementById("hotText");

  if(!f || !b) return;

  if(total <= 0){
    f.style.width = "50%";
    b.style.width = "50%";
    return;
  }

  let fp = Math.round(fakeFrontAmount / total * 100);
  let bp = 100 - fp;

  f.style.width = fp + "%";
  b.style.width = bp + "%";

  t.innerText = fp > bp ? `🔥热门 正面 ${fp}%` : `🔥热门 反面 ${bp}%`;
}

/* ===== UI ===== */
function updateUI(){
  let user = getUsers().find(u => u.username === currentUser);
  if(!user) return;

  name.innerText = user.username;
  userId.innerText = user.id;
  score.innerText = formatMoney(user.score);

  renderRoad(user.road || []);
  renderWinRoad(user.winRoad || []);
}

/* ===== 路子 ===== */
function renderRoad(road){
  roadMap.innerHTML = "";
  road.forEach(r=>{
    let d = document.createElement("div");
    d.className = "road-dot " + (r === "正面" ? "front" : "back");
    d.innerText = r === "正面" ? "正" : "反";
    roadMap.appendChild(d);
  });
}

function renderWinRoad(road){
  winRoadMap.innerHTML = "";
  road.forEach(r=>{
    let d = document.createElement("div");
    d.className = "road-dot " + (r === "win" ? "win" : "lose");
    d.innerText = r === "win" ? "赢" : "输";
    winRoadMap.appendChild(d);
  });
}
