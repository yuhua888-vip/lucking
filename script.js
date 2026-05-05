let currentUser = null;

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
  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

  const resultBox = document.getElementById("result");
  const coinText = document.getElementById("coinText");

  resultBox.className = "result";
  resultBox.innerText = "硬币飞起来了...";
  coinText.innerText = "…";

  setTimeout(() => {
    if(user.times <= 0){
      resultBox.innerText = "今日次数用完";
      coinText.innerText = "?";
      return;
    }

    let result = Math.random() < 0.5 ? "正面" : "反面";

    user.times--;
    coinText.innerText = result;

    if(choice === result){
      user.score += 10;
      user.streak++;
      resultBox.className = "result win";
      resultBox.innerText = "🎉 猜中了！+10积分";
    }else{
      user.score -= 5;
      user.streak = 0;
      resultBox.className = "result lose";
      resultBox.innerText = "😅 猜错了！-5积分";
    }

    saveUsers(users);
    updateUI();
  }, 700);
}

function updateUI(){
  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

  document.getElementById("name").innerText = user.username;
  document.getElementById("score").innerText = user.score;
  document.getElementById("streak").innerText = user.streak;
  document.getElementById("times").innerText = user.times;
}
