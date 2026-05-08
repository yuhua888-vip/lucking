let currentUser = null;
let currentScore = 500;
let chips = 0;

function registerUser(){
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if(username.length < 5 || password.length < 5){
    alert("账号密码至少5位");
    return;
  }

  localStorage.setItem("user_" + username, JSON.stringify({
    password: password,
    score: 500,
    chips: 0,
    id: Math.floor(10000 + Math.random() * 90000)
  }));

  alert("创建成功，现在可以登录");
}

function login(){
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  let user = localStorage.getItem("user_" + username);

  if(!user){
    alert("账号不存在，请先创建账号");
    return;
  }

  user = JSON.parse(user);

  if(user.password !== password){
    alert("密码错误");
    return;
  }

  currentUser = username;
  currentScore = Number(user.score || 500);
  chips = Number(user.chips || 0);

  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("hallPage").classList.remove("hidden");

  document.getElementById("playerName").innerText = username;
  document.getElementById("playerId").innerText = user.id;
  document.getElementById("playerScore").innerText = currentScore.toFixed(2);
}

function openBaccarat(){
  document.getElementById("hallPage").classList.add("hidden");
  document.getElementById("baccaratPanel").classList.remove("hidden");

  document.getElementById("baccaratScore").innerText = currentScore.toFixed(2);
  document.getElementById("chipBalance").innerText = chips.toFixed(2);
}

function openCoinGame(){
  alert("幸运硬币玩法稍后恢复，当前请先体验百家乐。");
}

function backHall(){
  document.getElementById("baccaratPanel").classList.add("hidden");
  document.getElementById("hallPage").classList.remove("hidden");
}
