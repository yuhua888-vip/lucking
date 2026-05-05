let currentUser = null;
let audioCtx = null;

function getUsers(){
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users){
  localStorage.setItem("users", JSON.stringify(users));
}

function createId(){
  return Math.floor(10000 + Math.random() * 90000);
}

/* 音效 */
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

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration
  );

  osc.stop(audioCtx.currentTime + duration);
}

function soundClick(){
  playTone(520, 0.08, "square", 0.08);
}

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
    times: 10,
    road: [],
    winRoad: []
  };

  users.push(user);
  saveUsers(users);

  msg.innerText = "注册成功";
}

function login(){
  initAudio();

  let users = getUsers();

  let user = users.find(u => u.username === username.value && u.password === password.value);

  if(!user){
    msg.innerText = "账号错误";
    return;
  }

  if(!user.road) user.road = [];
  if(!user.winRoad) user.winRoad = [];

  saveUsers(users);

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
  soundClick();

  let users = getUsers();
  let user = users.find(u => u.username === currentUser);

  if(user.times <= 0){
    result.innerText = "今日次数已用完";
    soundLose();
    return;
  }

  let coin = document.getElementById("coin");
  let coinImg = document.getElementById("coinImg");

  coin.classList.remove("flip");
  void coin.offsetWidth;
  coin.classList.add("flip");

  coinText.innerText = "命运正在选择...";
  result.innerText = "硬币正在翻转...";

  setTimeout(() => {

    let flipResult = Math.random() < 0.5 ? "正面" : "反面";

    /* 差一点赢演出 */
    if(Math.random() < 0.35 && choice !== flipResult){
      coinText.innerText = choice;
    }

    setTimeout(() => {

      coinImg.src = flipResult === "正面" ? "coin.png.PNG" : "coin.png2.PNG";
      coinText.innerText = flipResult;

      user.road.push(flipResult);
      if(user.road.length > 30) user.road.shift();

      if(choice === flipResult){
        user.score += 10;
        user.streak++;
        result.innerText = "💰 赢了！+10";
        soundWin();
        explodeCoins();
        user.winRoad.push("win");
      }else{
        user.score -= 5;
        user.streak = 0;
        result.innerText = "😌 惜败：" + flipResult;
        soundLose();
        user.winRoad.push("lose");
      }

      if(user.winRoad.length > 30) user.winRoad.shift();

      user.times--;

      saveUsers(users);
      updateUI();

      coin.classList.remove("flip");

    }, 250);

  }, 1100);
}

function updateUI(){
  let user = getUsers().find(u => u.username === currentUser);
  if(!user) return;

  name.innerText = user.username;
  userId.innerText = user.id;
  score.innerText = user.score;
  streak.innerText = user.streak;
  times.innerText = user.times;

  renderRoad(user.road || []);
  renderWinRoad(user.winRoad || []);
}

function renderRoad(road){
  let map = document.getElementById("roadMap");
  if(!map) return;

  map.innerHTML = "";

  road.forEach(r => {
    let dot = document.createElement("div");
    dot.className = "road-dot " + (r === "正面" ? "front" : "back");
    dot.innerText = r === "正面" ? "正" : "反";
    map.appendChild(dot);
  });
}

function renderWinRoad(road){
  let map = document.getElementById("winRoadMap");
  if(!map) return;

  map.innerHTML = "";

  road.forEach(r => {
    let dot = document.createElement("div");
    dot.className = "road-dot " + (r === "win" ? "win" : "lose");
    dot.innerText = r === "win" ? "赢" : "输";
    map.appendChild(dot);
  });
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
