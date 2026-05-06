/* ===== 高级翻牌百家乐 ===== */

function drawCard(){
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

  return {
    suit: suits[Math.floor(Math.random() * suits.length)],
    value: values[Math.floor(Math.random() * values.length)]
  };
}

function cardPoint(card){
  if(card.value === "A") return 1;

  if(["10","J","Q","K"].includes(card.value)){
    return 0;
  }

  return Number(card.value);
}

function handPoint(cards){

  let total = cards.reduce(
    (sum, c) => sum + cardPoint(c),
    0
  );

  return total % 10;
}

function cardHTML(card, id){

  const red =
    card.suit === "♥" ||
    card.suit === "♦";

  return `
    <div class="playing-card" id="${id}">

      <div class="card-inner">

        <div class="card-back">
          ★
        </div>

        <div class="card-front ${red ? "red" : "black"}">
          ${card.suit}${card.value}
        </div>

      </div>

    </div>
  `;
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function revealCard(id){

  const card = document.getElementById(id);

  if(card){
    card.classList.add("revealed");
  }
}

async function playBaccarat(choice){

  let amount = Number(
    baccaratAmount.value
  );

  if(!amount || amount <= 0){

    baccaratResult.innerText =
      "请输入下注积分";

    return;
  }

  let users = getUsers();

  let user = users.find(
    u => u.username === currentUser
  );

  if(!user){

    baccaratResult.innerText =
      "请重新登录";

    return;
  }

  if(user.score < amount){

    baccaratResult.innerText =
      "积分不足";

    return;
  }

  user.score = Number(
    (user.score - amount).toFixed(2)
  );

  saveUsers(users);

  updateUI();

  baccaratAmount.value = "";

  bankerCards.innerHTML = "";

  playerCards.innerHTML = "";

  bankerPoint.innerText = "-";

  playerPoint.innerText = "-";

  baccaratResult.classList.add("dealing");

  baccaratResult.innerText =
    "洗牌中...";

  let banker = [];

  let player = [];

  await sleep(500);

  /* 闲1 */

  baccaratResult.innerText =
    "发闲家第一张...";

  player.push(drawCard());

  playerCards.innerHTML +=
    cardHTML(player[0], "playerCard1");

  await sleep(500);

  revealCard("playerCard1");

  await sleep(700);

  /* 庄1 */

  baccaratResult.innerText =
    "发庄家第一张...";

  banker.push(drawCard());

  bankerCards.innerHTML +=
    cardHTML(banker[0], "bankerCard1");

  await sleep(500);

  revealCard("bankerCard1");

  await sleep(700);

  /* 闲2 */

  baccaratResult.innerText =
    "发闲家第二张...";

  player.push(drawCard());

  playerCards.innerHTML +=
    cardHTML(player[1], "playerCard2");

  await sleep(500);

  revealCard("playerCard2");

  await sleep(700);

  /* 庄2 */

  baccaratResult.innerText =
    "发庄家第二张...";

  banker.push(drawCard());

  bankerCards.innerHTML +=
    cardHTML(banker[1], "bankerCard2");

  await sleep(500);

  revealCard("bankerCard2");

  await sleep(900);

  /* 比点 */

  let bankerP = handPoint(banker);

  let playerP = handPoint(player);

  baccaratResult.innerText =
    "正在比点...";

  await sleep(700);

  bankerPoint.innerText = bankerP;

  playerPoint.innerText = playerP;

  await sleep(600);

  /* 结果 */

  let resultSide = "";

  if(bankerP > playerP){

    resultSide = "庄";

  }else if(playerP > bankerP){

    resultSide = "闲";

  }else{

    resultSide = "和";
  }

  let payout = 0;

  if(choice === resultSide){

    if(resultSide === "庄"){

      payout = amount * 1.95;

    }else if(resultSide === "闲"){

      payout = amount * 2;

    }else{

      payout = amount * 9;
    }

    payout = Number(
      payout.toFixed(2)
    );

    user.score = Number(
      (user.score + payout).toFixed(2)
    );

    baccaratResult.innerText =
      "💰 " +
      resultSide +
      "赢！返还 " +
      formatMoney(payout);

    explodeCoins();

  }else{

    baccaratResult.innerText =
      "😌 " +
      resultSide +
      "赢，损失 " +
      formatMoney(amount);
  }

  baccaratResult.classList.remove("dealing");

  if(!user.baccaratRoad){

    user.baccaratRoad = [];
  }

  user.baccaratRoad.push(resultSide);

  if(user.baccaratRoad.length > 30){

    user.baccaratRoad.shift();
  }

  saveUsers(users);

  updateUI();
}
