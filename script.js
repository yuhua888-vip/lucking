let currentUser = null;
let audioCtx = null;
let timer = 8;
let roundTimer = null;
let betting = false;

let userBet = { front: 0, back: 0 };

// 假玩家数据
let fakeFrontAmount = 0;
let fakeBackAmount = 0;
let fakeTimer = null;

const fakeNames = [
  "龙哥","阿豪","金手","财神","小王","豹子","辉少","阿强",
  "老K","黑桃A","金链哥","赌神","小六","阿飞","东哥","凯哥",
  "小虎","夜王","大飞","火哥","阿超","老七","林少","虎哥",
  "三爷","亮哥","飞哥","九哥","赵总","陈哥","阿彪","阿俊",
  "周总","江哥","小龙","黑龙","财神爷","阿勇","胖虎","鬼手",
  "豹子王","冷锋","猎人","阿文","阿杰","金老板","夜行者"
];

// ========= 工具 =========
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

// ========= 音效 =========
function initAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTone(freq, duration){
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.frequency.value = freq;
  gain.gain.value = 0.1;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function soundClick(){ playTone(520, 0.08); }
function soundWin(){ playTone(880, 0.2); }
function soundLose(){ playTone(220, 0.2); }

// ========= 注册 / 登录 =========
function register(){
  let users = getUsers();
  let account = username.value.trim();
  let pass = password.value.trim();

  if(!isValidAccount(account) || !isValidAccount(pass)){
    msg.innerText = "账号密码必须5位字母+数字";
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
  msg.innerText = "注册成功";
}

function login(){
  let users = getUsers();
  let account = username.value.trim();
  let pass = password.value.trim();

  let user = users.find(u => u.username === account && u.password === pass);

  if(!user){
    msg.innerText = "账号或密码错误";
    return;
  }

  currentUser = user.username;

  loginBox.style.display = "none";
  gameBox.classList.remove("hidden");

  updateUI();
  startRound();
}

function logout(){
  currentUser = null;
  loginBox.style.display = "block";
  gameBox.classList.add("hidden");
}

// ========= 游戏 =========
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
  soundClick();

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

  result.innerText = `正面 ${userBet.front} | 反面 ${userBet.back}`;
}

function roll(){
  stopFakePlayers();

  result.innerText = "开奖中...";

  setTimeout(()=>{
    let resultSide = Math.random() < 0.5 ? "正面" : "反面";

    coinImg.src = resultSide === "正面"
      ? "coin.png.PNG"
      : "coin.png2.PNG";

    settle(resultSide);
  },1200);
}

function settle(resultSide){
  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

  let winAmount = resultSide === "正面" ? userBet.front : userBet.back;
  let loseAmount = resultSide === "正面" ? userBet.back : userBet.front;

  if(winAmount > 0){
    let payout = winAmount * 1.9;
    let profit = payout - winAmount - loseAmount;

    user.score += payout;

    result.innerText = "赢 +" + profit;
    soundWin();
  }else{
    result.innerText = "输 -" + loseAmount;
    soundLose();
  }

  user.road.push(resultSide);
  user.winRoad.push(winAmount > 0 ? "win" : "lose");

  saveUsers(users);
  updateUI();

  setTimeout(startRound,2000);
}

// ========= 假玩家 =========
function startFakePlayers(){
  fakeTimer = setInterval(()=>{
    if(!betting) return;

    let side = Math.random() < 0.5 ? "正面" : "反面";
    let amount = [10,20,50,100,200,500][Math.floor(Math.random()*6)];
    let name = fakeNames[Math.floor(Math.random()*fakeNames.length)];

    if(side === "正面"){
      fakeFrontAmount += amount;
    }else{
      fakeBackAmount += amount;
    }

    fakeFeed.innerText = `${name} 押 ${side} ${amount}`;
    updateFakeTotals();

  }, Math.random()*800 + 300);
}

function stopFakePlayers(){
  clearInterval(fakeTimer);
}

function updateFakeTotals(){
  document.getElementById("fakeFrontTotal").innerText = fakeFrontAmount;
  document.getElementById("fakeBackTotal").innerText = fakeBackAmount;
  updateHeatBar();
}

// ========= 热度条 =========
function updateHeatBar(){
  let total = fakeFrontAmount + fakeBackAmount;

  let front = document.getElementById("frontHeat");
  let back = document.getElementById("backHeat");
  let text = document.getElementById("hotText");

  if(!front || !back) return;

  if(total <= 0){
    front.style.width = "50%";
    back.style.width = "50%";
    return;
  }

  let f = Math.round(fakeFrontAmount / total * 100);
  let b = 100 - f;

  front.style.width = f + "%";
  back.style.width = b + "%";

  text.innerText = f > b ? `🔥热门：正面 ${f}%` : `🔥热门：反面 ${b}%`;
}

// ========= UI =========
function updateUI(){
  let user = getUsers().find(u => u.username === currentUser);
  if(!user) return;

  name.innerText = user.username;
  userId.innerText = user.id;
  score.innerText = user.score;
}
