let currentUser = null;

/* ===== 本地数据 ===== */
function getUsers(){
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users){
  localStorage.setItem("users", JSON.stringify(users));
}

/* ===== 生成5位ID ===== */
function createId(){
  return Math.floor(10000 + Math.random() * 90000);
}

/* ===== 注册 ===== */
function register(){
  let users = getUsers();

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const msg = document.getElementById("msg");

  if(!usernameInput.value || !passwordInput.value){
    msg.innerText = "请输入账号和密码";
    return;
  }

  if(users.find(u => u.username === usernameInput.value)){
    msg.innerText = "账号已存在";
    return;
  }

  let user = {
    id: createId(),
    username: usernameInput.value,
    password: passwordInput.value,
    score: 100,
    streak: 0,
    times: 10
  };

  users.push(user);
  saveUsers(users);

  msg.innerText = "注册成功，请登录";
}

/* ===== 登录 ===== */
function login(){
  let users = getUsers();

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const msg = document.getElementById("msg");

  let user = users.find(u => 
    u.username === usernameInput.value &&
    u.password === passwordInput.value
  );

  if(!user){
    msg.innerText = "账号或密码错误";
    return;
  }

  currentUser = user.username;

  // 🔥 切换页面（关键）
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("gameBox").classList.remove("hidden");

  updateUI();
}

/* ===== 退出 ===== */
function logout(){
  currentUser = null;

  document.getElementById("loginBox").style.display = "block";
  document.getElementById("gameBox").classList.add("hidden");
}

/* ===== 获取当前用户 ===== */
function getCurrentUser(){
  let users = getUsers();
  return users.find(u => u.username === currentUser);
}

/* ===== 更新当前用户 ===== */
function updateCurrentUser(user){
  let users = getUsers();
  let index = users.findIndex(u => u.username === currentUser);
  users[index] = user;
  saveUsers(users);
}

/* ===== 游戏核心 ===== */
function play(choice){
  let user = getCurrentUser();

  if(user.times <= 0){
    document.getElementById("result").innerText = "今日次数已用完";
    return;
  }

  const coin = document.getElementById("coin");
  const coinImg = document.getElementById("coinImg");
  const coinText = document.getElementById("coinText");
  const resultBox = document.getElementById("result");

  // 动画触发
  coin.classList.remove("flip");
  void coin.offsetWidth;
  coin.classList.add("flip");

  coinText.innerText = "...";
  resultBox.innerText = "翻转中...";

  setTimeout(() => {

    let flipResult = Math.random() < 0.5 ? "正面" : "反面";

    // 切换图片
    if(flipResult === "正面"){
      coinImg.src = "coin.png.PNG";
    }else{
      coinImg.src = "coin.png2.PNG";
    }

    coinText.innerText = flipResult;

    // 结果判定
    if(choice === flipResult){
      user.score += 10;
      user.streak++;
      resultBox.innerText = "💰 赢了！+10";
    }else{
      user.score -= 5;
      user.streak = 0;
      resultBox.innerText = "😌 惜败：" + flipResult;
    }

    user.times--;

    updateCurrentUser(user);
    updateUI();

    coin.classList.remove("flip");

  }, 700);
}

/* ===== UI更新 ===== */
function updateUI(){
  let user = getCurrentUser();
  if(!user) return;

  document.getElementById("name").innerText = user.username;
  document.getElementById("userId").innerText = user.id;
  document.getElementById("score").innerText = user.score;
  document.getElementById("streak").innerText = user.streak;
  document.getElementById("times").innerText = user.times;
}
