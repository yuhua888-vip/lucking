let currentUser=null;

function getUsers(){
return JSON.parse(localStorage.getItem("users")||"[]");
}

function saveUsers(u){
localStorage.setItem("users",JSON.stringify(u));
}

function createId(){
return Math.floor(10000+Math.random()*90000);
}

function register(){
let users=getUsers();

let u={
id:createId(),
username:username.value,
password:password.value,
score:100,
streak:0,
times:10
};

users.push(u);
saveUsers(users);
msg.innerText="注册成功";
}

function login(){
let users=getUsers();
let user=users.find(x=>x.username==username.value && x.password==password.value);

if(!user){
msg.innerText="错误";
return;
}

currentUser=user.username;

loginBox.style.display="none";
gameBox.classList.remove("hidden");

updateUI();
}

function logout(){
loginBox.style.display="block";
gameBox.classList.add("hidden");
}

function play(choice){
let users=getUsers();
let user=users.find(u=>u.username==currentUser);

let coin=document.getElementById("coin");
let coinImg=document.getElementById("coinImg");

coin.classList.add("flip");

setTimeout(()=>{

let result=Math.random()<0.5?"正面":"反面";

if(result=="正面"){
coinImg.src="coin.png.PNG";
}else{
coinImg.src="coin.png2.PNG";
}

coinText.innerText=result;

if(choice==result){
user.score+=10;
user.streak++;
result.innerText="💰 赢了！";
}else{
user.score-=5;
user.streak=0;
result.innerText="输了";
}

user.times--;

saveUsers(users);
updateUI();

coin.classList.remove("flip");

},700);
}

function updateUI(){
let user=getUsers().find(u=>u.username==currentUser);

name.innerText=user.username;
userId.innerText=user.id;
score.innerText=user.score;
streak.innerText=user.streak;
times.innerText=user.times;
}
