let currentUser = null;

function getUsers(){
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users){
  localStorage.setItem("users", JSON.stringify(users));
}

function createId(){
  return Math.floor(10000 + Math.random() * 90000);
}

function register(){
  let users = getUsers();

  if(!username.value || !password.value){
    msg.innerText = "请输入账号和密码";
    return;
  }

  if(users.find(u => u.username === username.value)){
    msg.innerText = "账号已存在";
    return;
  }

  let user = {
    id: createId(),
    username: username.value,
    password: password.value,
    score: 100,
    streak: 0,
    times: 10
  };

  users.push(user);
  saveUsers(users);

  msg.innerText = "注册成功";
}

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

  updateUI();
}

function logout(){
  loginBox.style.display = "block";
  gameBox.classList.add("hidden");
}

function play(choice){
  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

  if(user.times <= 0){
    result.innerText = "今日次数已用完";
    return;
  }

  let coin = document.getElementById("coin");
  let coinImg = document.getElementById("coinImg");

  coin.classList.remove("flip");
  void coin.offsetWidth;
  coin.classList.add("flip");

  coinText.innerText = "翻转中...";
  result.innerText = "硬币正在翻转...";

  setTimeout(() => {
    let flipResult = Math.random() < 0.5 ? "正面" : "反面";

    if(flipResult === "正面"){
      coinImg.src = "coin.png.PNG";
    }else{
      coinImg.src = "coin.png2.PNG";
    }

    coinText.innerText = flipResult;

    if(choice === flipResult){
      user.score += 10;
      user.streak++;
      result.innerText = "💰 赢了！+10";
      explodeCoins();
    }else{
      user.score -= 5;
      user.streak = 0;
      result.innerText = "😌 惜败：" + flipResult;
    }

    user.times--;

    saveUsers(users);
    updateUI();

    coin.classList.remove("flip");

  }, 750);
}

function updateUI(){
  let user = getUsers().find(u => u.username === currentUser);
  if(!user) return;

  name.innerText = user.username;
  userId.innerText = user.id;
  score.innerText = user.score;
  streak.innerText = user.streak;
  times.innerText = user.times;
}

function explodeCoins(){
  const container = document.getElementById("coinExplosion");
  if(!container) return;

  container.innerHTML = "";

  for(let i = 0; i < 34; i++){
    let coin = document.createElement("div");
    coin.className = "coin-particle";

    let x = (Math.random() - 0.5) * 420 + "px";
    let y = (Math.random() - 0.5) * 420 + "px";

    coin.style.setProperty("--x", x);
    coin.style.setProperty("--y", y);
    coin.style.left = "50%";
    coin.style.top = "45%";

    container.appendChild(coin);
  }

  let flash = document.createElement("div");
  flash.className = "flash";
  document.body.appendChild(flash);

  setTimeout(() => {
    flash.remove();
  }, 400);
}
