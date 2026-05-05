let currentUser = null;

function getUsers(){
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users){
  localStorage.setItem("users", JSON.stringify(users));
}

function login(){
  let u = username.value;
  let p = password.value;
  let users = getUsers();
  let user = users.find(x=>x.username===u && x.password===p);

  if(user){
    currentUser = user;
    loginBox.style.display="none";
    gameBox.style.display="block";
    updateUI();
  }else{
    msg.innerText="账号错误";
  }
}

function register(){
  let users = getUsers();
  users.push({username:username.value,password:password.value,score:100,streak:0,times:10});
  saveUsers(users);
  msg.innerText="注册成功";
}

function logout(){
  loginBox.style.display="block";
  gameBox.style.display="none";
}

function play(choice){
  let users = getUsers();
  let user = users.find(u=>u.username===currentUser.username);

  let coin = document.getElementById("coin");
  let coinImg = document.getElementById("coinImg");
  let coinText = document.getElementById("coinText");

  coin.classList.add("flip");

  setTimeout(()=>{
    let result = Math.random()<0.5?"正面":"反面";

    if(result==="正面"){
      coinImg.src="coin.png.PNG";
    }else{
      coinImg.src="coin.png2.PNG";
    }

    coinText.innerText=result;

    user.times--;

    if(choice===result){
      user.score+=10;
      user.streak++;
    }else{
      user.score-=5;
      user.streak=0;
    }

    saveUsers(users);
    updateUI();
    coin.classList.remove("flip");

  },700);
}

function updateUI(){
  let user = getUsers().find(u=>u.username===currentUser.username);
  name.innerText=user.username;
  score.innerText=user.score;
  streak.innerText=user.streak;
  times.innerText=user.times;
}
