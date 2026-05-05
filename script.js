let currentUser = null;

function getUsers(){
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users){
  localStorage.setItem("users", JSON.stringify(users));
}

function createUserId(){
  let users = getUsers();
  let id;

  do {
    id = String(Math.floor(10000 + Math.random() * 90000));
  } while(users.find(u => u.id === id));

  return id;
}

function register(){
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!username || !password){
    document.getElementById("msg").innerText = "请输入用户名和密码";
    return;
  }

  let users = getUsers();

  if(users.find(u => u.username === username)){
    document.getElementById("msg").innerText = "用户名已存在";
    return;
  }

  let newUser = {
    id: createUserId(),
    username,
    password,
    displayName: username,
    avatar: "🪙",
    score: 100,
    streak: 0,
    times: 10
  };

  users.push(newUser);
  saveUsers(users);

  document.getElementById("msg").innerText = "注册成功！请登录";
}

function login(){
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  let users = getUsers();
  let user = users.find(u => u.username === username && u.password === password);

  if(!user){
    document.getElementById("msg").innerText = "账号或密码错误";
    return;
  }

  if(!user.id){
    user.id = createUserId();
  }

  if(!user.displayName){
    user.displayName = user.username;
  }

  if(!user.avatar){
    user.avatar = "🪙";
  }

  saveUsers(users);

  currentUser = user.username;

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("gameBox").classList.remove("game-hidden");
  document.getElementById("gameBox").style.display = "block";

  updateUI();
}

function logout(){
  currentUser = null;

  document.getElementById("loginBox").style.display = "block";
  document.getElementById("gameBox").style.display = "none";
}

function getCurrentUser(){
  let users = getUsers();
  return users.find(u => u.username === currentUser);
}

function updateCurrentUser(user){
  let users = getUsers();
  let index = users.findIndex(u => u.username === currentUser);
  users[index] = user;
  saveUsers(users);
}

function changeAvatar(avatar){
  let user = getCurrentUser();
  user.avatar = avatar;
  updateCurrentUser(user);
  updateUI();
}

function saveProfile(){
  let user = getCurrentUser();
  const newName = document.getElementById("displayNameInput").value.trim();

  if(newName){
    user.displayName = newName;
  }

  updateCurrentUser(user);
  updateUI();

  document.getElementById("result").innerText = "资料已更新";
}

function play(choice){
  let user = getCurrentUser();

  const coin = document.getElementById("coin");
  const coinImg = document.getElementById("coinImg");
  const coinText = document.getElementById("coinText");
  const resultBox = document.getElementById("result");

  if(user.times <= 0){
    resultBox.innerText = "今日次数已用完";
    return;
  }

  coin.classList.remove("flip");
  void coin.offsetWidth;
  coin.classList.add("flip");

  coinText.innerText = "翻转中...";
  resultBox.innerText = "硬币正在翻转...";

  setTimeout(() => {
    let result = Math.random() < 0.5 ? "正面" : "反面";

    if(result === "正面"){
      coinImg.src = "coin.png.PNG";
    }else{
      coinImg.src = "coin.png2.PNG";
    }

    coinText.innerText = result;
    user.times--;

    if(choice === result){
      user.score += 10;
      user.streak++;
      resultBox.innerText = "🎉 猜中了！+10积分";
    }else{
      user.score -= 5;
      user.streak = 0;
      resultBox.innerText = "😌 惜败！结果是" + result;
    }

    updateCurrentUser(user);
    updateUI();
  }, 750);
}

function updateUI(){
  let user = getCurrentUser();
  if(!user) return;

  document.getElementById("avatarShow").innerText = user.avatar;
  document.getElementById("name").innerText = user.displayName;
  document.getElementById("userId").innerText = user.id;
  document.getElementById("score").innerText = user.score;
  document.getElementById("streak").innerText = user.streak;
  document.getElementById("times").innerText = user.times;
  document.getElementById("displayNameInput").value = user.displayName;
}
