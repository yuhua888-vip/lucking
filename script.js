let currentUser = null;

// ===== 音效系统 =====
const clickSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3");
const winSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3");
const loseSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3");

function getUsers(){
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users){
  localStorage.setItem("users", JSON.stringify(users));
}

function register(){
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();

  if(!username || !password){
    document.getElementById("msg").innerText = "请输入用户名和密码";
    return;
  }

  let users = getUsers();

  if(users.find(u => u.username === username)){
    document.getElementById("msg").innerText = "用户已存在";
    return;
  }

  users.push({
    username,
    password,
    score: 100,
    streak: 0,
    bestStreak: 0,
    times: 10
  });

  saveUsers(users);
  document.getElementById("msg").innerText = "注册成功，可以登录了";
}

function login(){
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();

  let users = getUsers();
  let user = users.find(u => u.username === username && u.password === password);

  if(!user){
    document.getElementById("msg").innerText = "账号或密码错误";
    return;
  }

  if(user.bestStreak === undefined){
    user.bestStreak = user.streak || 0;
    saveUsers(users);
  }

  currentUser = username;
  showGame();
}

function showGame(){
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("gameBox").style.display = "block";
  updateUI();
}

function logout(){
  currentUser = null;
  document.getElementById("loginBox").style.display = "block";
  document.getElementById("gameBox").style.display = "none";
}

function play(choice){

  clickSound.currentTime = 0;
  clickSound.play().catch(()=>{});

  if (navigator.vibrate) {
    navigator.vibrate(50);
  }

  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

  const resultBox = document.getElementById("result");
  const coin = document.getElementById("coin");
  const coinText = document.getElementById("coinText");

  if(user.times <= 0){
    resultBox.className = "result lose";
    resultBox.innerText = "次数用尽，请联系上级！";
    coinText.innerText = "?";
    return;
  }

  resultBox.className = "result";
  resultBox.innerText = "硬币正在翻转...";
  coinText.innerText = "？";

  coin.classList.remove("flip");
  void coin.offsetWidth;
  coin.classList.add("flip");

  setTimeout(() => {
    let result = Math.random() < 0.5 ? "正面" : "反面";
    let bonus = 0;

    user.times--;
    coinText.innerText = result;

    if(choice === result){

      winSound.currentTime = 0;
      winSound.play().catch(()=>{});

      user.streak++;
      user.score += 10;

      if(user.streak >= 3){
        bonus += 10;
      }

      if(user.streak >= 5){
        bonus += 20;
      }

      if(user.streak >= 8){
        bonus += 50;
      }

      user.score += bonus;

      if(user.streak > user.bestStreak){
        user.bestStreak = user.streak;
      }

      resultBox.className = "result win";

      if(user.streak >= 8){
        resultBox.innerText = `👑 硬币之王！连胜${user.streak}次，+${10 + bonus}积分`;
      }else if(user.streak >= 5){
        resultBox.innerText = `🚀 运气爆棚！连胜${user.streak}次，+${10 + bonus}积分`;
      }else if(user.streak >= 3){
        resultBox.innerText = `🔥 手感来了！连胜${user.streak}次，+${10 + bonus}积分`;
      }else{
        resultBox.innerText = `🎉 猜中了！连胜${user.streak}次，+10积分`;
      }

    }else{

      loseSound.currentTime = 0;
      loseSound.play().catch(()=>{});

      user.score -= 5;
      user.streak = 0;

      resultBox.className = "result lose";
      resultBox.innerText = `😌 惜败！结果是${result}`;
    }

    saveUsers(users);
    updateUI();
  }, 750);
}

function updateUI(){
  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

  document.getElementById("name").innerText = user.username;
  document.getElementById("score").innerText = user.score;
  document.getElementById("streak").innerText = user.streak;
  document.getElementById("times").innerText = user.times;
}
