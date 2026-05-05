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

  let user = {
    id: createId(),
    username: username.value,
    password: password.value,
    score: 100,
    streak: 0,
    times: 10,
    road: []
  };

  users.push(user);
  saveUsers(users);

  msg.innerText = "注册成功";
}

function login(){
  let users = getUsers();

  let user = users.find(u => u.username == username.value && u.password == password.value);

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
  let user = users.find(u => u.username == currentUser);

  let coin = document.getElementById("coin");
  let coinImg = document.getElementById("coinImg");

  coin.classList.remove("flip");
  void coin.offsetWidth;
  coin.classList.add("flip");

  setTimeout(() => {

    let result = Math.random() < 0.5 ? "正面" : "反面";

    coinImg.src = result === "正面" ? "coin.png.PNG" : "coin.png2.PNG";

    coinText.innerText = result;

    user.road.push(result);
    if(user.road.length > 30) user.road.shift();

    if(choice === result){
      user.score += 10;
      user.streak++;
      explodeCoins();
    }else{
      user.score -= 5;
      user.streak = 0;
    }

    user.times--;

    saveUsers(users);
    updateUI();

    coin.classList.remove("flip");

  }, 1350); /* ✅ 和动画同步 */
}

function updateUI(){
  let user = getUsers().find(u => u.username == currentUser);

  name.innerText = user.username;
  userId.innerText = user.id;
  score.innerText = user.score;
  streak.innerText = user.streak;
  times.innerText = user.times;

  renderRoad(user.road);
}

function renderRoad(road){
  let map = document.getElementById("roadMap");
  map.innerHTML = "";

  road.forEach(r=>{
    let dot = document.createElement("div");
    dot.className = "road-dot " + (r === "正面" ? "front" : "back");
    map.appendChild(dot);
  });
}

function explodeCoins(){
  let box = document.getElementById("coinExplosion");
  box.innerHTML = "";

  for(let i=0;i<20;i++){
    let c = document.createElement("div");
    c.className = "coin-particle";

    c.style.setProperty("--x",(Math.random()-0.5)*300+"px");
    c.style.setProperty("--y",(Math.random()-0.5)*300+"px");

    c.style.left="50%";
    c.style.top="50%";

    box.appendChild(c);
  }
}
c);
  }
}
