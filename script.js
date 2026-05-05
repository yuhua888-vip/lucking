let currentUser = null;
let audioCtx = null;
let timer = 8;
let roundTimer = null;
let betting = false;

let userBet = { front: 0, back: 0 };

let fakeFrontTotal = 0;
let fakeBackTotal = 0;
let fakeTimer = null;
const fakeNames = [
  "龙哥","阿豪","金手","财神","小王","豹子","辉少","阿强",
  "老K","黑桃A","金链哥","赌神","小六","阿飞","东哥","凯哥",
  "小虎","夜王","大飞","火哥","阿超","老七","林少","虎哥",
  "三爷","亮哥","飞哥","九哥","赵总","陈哥","阿彪","阿俊",
  "周总","江哥","小龙","黑龙","财神爷","阿勇","胖虎","鬼手",
  "豹子王","冷锋","猎人","阿文","阿杰","金老板","夜行者"
];

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

function initAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTone(freq, duration, type = "sine", volume = 0.12){
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.stop(audioCtx.currentTime + duration);
}

function soundClick(){ playTone(520, 0.08, "square", 0.08); }
function soundWin(){
  playTone(660, 0.1, "sine", 0.13);
  setTimeout(() => playTone(880, 0.12, "sine", 0.15), 100);
  setTimeout(() => playTone(1200, 0.18, "sine", 0.18), 230);
}
function soundLose(){
  playTone(260, 0.18, "sawtooth", 0.1);
  setTimeout(() => playTone(180, 0.2, "sawtooth", 0.08), 180);
}

function register(){
  let users = getUsers();
  const account = username.value.trim();
  const pass = password.value.trim();

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

  let user = {
    id: createId(),
    username: account,
    password: pass,
    score: 500,
    streak: 0,
    times: 999,
    road: [],
    winRoad: [],
    banker: 0
  };

  users.push(user);
  saveUsers(users);
  msg.innerText = "注册成功，请登录";
}

function login(){
  initAudio();

  let users = getUsers();
  const account = username.value.trim();
  const pass = password.value.trim();

  let user = users.find(u => u.username === account && u.password === pass);

  if(!user){
    msg.innerText = "账号或密码错误";
    return;
  }

  if(!user.road) user.road = [];
  if(!user.winRoad) user.winRoad = [];
  if(!user.banker) user.banker = 0;

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

function startFakePlayers(){
  clearInterval(fakeTimer);

  fakeFrontTotal = 0;
  fakeBackTotal = 0;

  updateFakeTotals();

  fakeFeed.innerText = "模拟玩家正在入场...";

  fakeTimer = setInterval(() => {
    if(!betting) return;

    let side;

    // 热门盘口倾向：哪边多，偶尔继续追哪边
    if(fakeFrontTotal > fakeBackTotal && Math.random() < 0.58){
      side = "正面";
    }else if(fakeBackTotal > fakeFrontTotal && Math.random() < 0.58){
      side = "反面";
    }else{
      side = Math.random() < 0.5 ? "正面" : "反面";
    }

    let amountList = [10,20,30,50,80,100,150,200,300,500,800];
    let amount = amountList[Math.floor(Math.random() * amountList.length)];
    let fakeName = fakeNames[Math.floor(Math.random() * fakeNames.length)];

    if(side === "正面"){
      fakeFrontTotal += amount;
    }else{
      fakeBackTotal += amount;
    }

    updateFakeTotals();

    let hotSide = fakeFrontTotal >= fakeBackTotal ? "正面" : "反面";
    let hotAmount = Math.max(fakeFrontTotal, fakeBackTotal);

    fakeFeed.innerText =
      fakeName + "：" + side + " " + amount + " 💰｜热门：" + hotSide + " " + hotAmount;

  }, Math.random() * 700 + 400);
}
  clearInterval(roundTimer);
  stopFakePlayers();

  timer = 8;
  betting = true;
  userBet = { front: 0, back: 0 };

  countdown.innerText = "倒计时：" + timer;
  result.innerText = "开始下注";
  coinText.innerText = "等待下注";
  frontBet.innerText = "0";
  backBet.innerText = "0";
  frontAmount.value = "";
  backAmount.value = "";

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
  let amount = side === "正面" ? Number(frontAmount.value) : Number(backAmount.value);

  if(!amount || amount <= 0){
    result.innerText = "请输入正确的下注金额";
    soundLose();
    return;
  }

  bet(side, amount);
}

function bet(side, amount){
  soundClick();

  if(!betting){
    result.innerText = "已停止下注";
    return;
  }

  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

  if(user.score < amount){
    result.innerText = "积分不足";
    soundLose();
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

  result.innerText = "正面：" + userBet.front + " | 反面：" + userBet.back;
}

function roll(){
  stopFakePlayers();

  result.innerText = "停止下注，硬币正在旋转...";
  coinText.innerText = "开奖中...";

  let coin = document.getElementById("coin");
  coin.classList.remove("flip");
  void coin.offsetWidth;
  coin.classList.add("flip");

  setTimeout(() => {
    let resultSide = Math.random() < 0.5 ? "正面" : "反面";
    coinImg.src = resultSide === "正面" ? "coin.png.PNG" : "coin.png2.PNG";
    coinText.innerText = resultSide;
    settle(resultSide);
    coin.classList.remove("flip");
  }, 1350);
}

function settle(resultSide){
  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

  user.road.push(resultSide);
  if(user.road.length > 30) user.road.shift();

  let winAmount = resultSide === "正面" ? userBet.front : userBet.back;
  let loseAmount = resultSide === "正面" ? userBet.back : userBet.front;

  if(winAmount <= 0 && loseAmount <= 0){
    result.innerText = "本局未下注，结果：" + resultSide;
  }else if(winAmount > 0){
    let payout = Math.floor(winAmount * 1.9);
    let profit = payout - winAmount - loseAmount;
    let commission = Math.floor(winAmount * 0.1);

    user.score += payout;
    user.streak++;
    user.banker += commission;
    user.winRoad.push(profit >= 0 ? "win" : "lose");

    result.innerText = "💰 开奖：" + resultSide + "，本局盈亏：" + profit + "，佣金：" + commission;
    soundWin();
    explodeCoins();
  }else{
    user.streak = 0;
    user.winRoad.push("lose");
    result.innerText = "😌 开奖：" + resultSide + "，损失：" + loseAmount;
    soundLose();
  }

  if(user.winRoad.length > 30) user.winRoad.shift();

  saveUsers(users);
  updateUI();

  setTimeout(startRound, 2500);
}

function updateUI(){
  let user = getUsers().find(u => u.username === currentUser);
  if(!user) return;

  name.innerText = user.username;
  userId.innerText = user.id;
  score.innerText = user.score;

  settingName.innerText = user.username;
  settingId.innerText = user.id;
  settingScore.innerText = user.score;

  renderRoad(user.road || []);
  renderWinRoad(user.winRoad || []);
}

function renderRoad(road){
  roadMap.innerHTML = "";

  road.forEach(r => {
    let dot = document.createElement("div");
    dot.className = "road-dot " + (r === "正面" ? "front" : "back");
    dot.innerText = r === "正面" ? "正" : "反";
    roadMap.appendChild(dot);
  });
}

function renderWinRoad(road){
  winRoadMap.innerHTML = "";

  road.forEach(r => {
    let dot = document.createElement("div");
    dot.className = "road-dot " + (r === "win" ? "win" : "lose");
    dot.innerText = r === "win" ? "赢" : "输";
    winRoadMap.appendChild(dot);
  });
}

function startFakePlayers(){
  clearInterval(fakeTimer);

  fakeFrontTotal = 0;
  fakeBackTotal = 0;

  updateFakeTotals();

  fakeFeed.innerText = "等待玩家下注...";

  fakeTimer = setInterval(() => {
    if(!betting) return;

    let side = Math.random() < 0.5 ? "正面" : "反面";
    let amountList = [10, 20, 30, 50, 80, 100, 150, 200];
    let amount = amountList[Math.floor(Math.random() * amountList.length)];
    let fakeName = fakeNames[Math.floor(Math.random() * fakeNames.length)];

    if(side === "正面"){
      fakeFrontTotal += amount;
    }else{
      fakeBackTotal += amount;
    }

    updateFakeTotals();
    fakeFeed.innerText = fakeName + " 押了 " + side + " " + amount + " 积分";
  }, 900);
}

function stopFakePlayers(){
  clearInterval(fakeTimer);
}

function updateFakeTotals(){
  fakeFrontTotal.innerText = fakeFrontTotal;
  fakeBackTotal.innerText = fakeBackTotal;
}

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
