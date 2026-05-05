let currentUser = null;

function getUsers(){
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users){
  localStorage.setItem("users", JSON.stringify(users));
}

function register(){
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

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
  document.getElementById("msg").innerText = "注册成功";
}

function login(){
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

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

  if(user.times <= 0){
    document.getElementById("result").innerText = "今日次数用完";
    return;
  }

  let result = Math.random() < 0.5 ? "正面" : "反面";

  user.times--;

  if(choice === result){
    user.score += 10;
    user.streak++;
    document.getElementById("result").innerText = "赢了！结果：" + result;
  }else{
    user.score -= 5;
    user.streak = 0;
    document.getElementById("result").innerText = "输了！结果：" + result;
  }

  saveUsers(users);
  updateUI();
}

function updateUI(){
  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

  document.getElementById("name").innerText = user.username;
  document.getElementById("score").innerText = user.score;
  document.getElementById("streak").innerText = user.streak;
  document.getElementById("times").innerText = user.times;
}
