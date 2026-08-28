let player;
let platforms = {};
let ground;
let gravity = 0.4;      
let jumpForce = -10;     

let score = 0;
let gameState = "start"; 
let groundActive = true;


const MIN_PLATFORM_GAP = 60;
const MAX_PLATFORM_GAP = 90;




function setup() {
  createCanvas(400, 600);
  resetGame();
}


function resetGame() {
  score = 0;
  platforms = [];
  groundActive = true;


  ground = {
    x: 0,
    y: height - 20,
    w: width,
    h: 20
  };


  player = {
    x: width / 2,
    y: ground.y - 15,
    w: 30,
    h: 30,
    vy: 0
  };

  
  for (let i = 0; i < 7; i++) {
    platforms.push(
      createPlatform(
        random(width - 60),
        height - 120 - i * 80
      )
    );
  }
}

function draw() {
  background(240);

  if (gameState === "start") {
    drawStartScreen();
  } 
  else if (gameState === "play") {
    updatePlayer();
    updatePlatforms();
    drawPlatforms();
    if (groundActive) drawGround();
    drawPlayer();
    drawScore();
  } 
  else if (gameState === "gameover") {
    drawGameOverScreen();
  }
}


function updatePlayer() {
  player.vy += gravity;
  player.y += player.vy;


  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) player.x -= 5;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) player.x += 5;

  
  player.x = constrain(
    player.x,
    player.w / 2,
    width - player.w / 2
  );

 
  if (
    groundActive &&
    player.vy > 0 &&
    player.y + player.h / 2 > ground.y
  ) {
    player.y = ground.y - player.h / 2;
    player.vy = jumpForce;
  }


  for (let p of platforms) {
    if (
      player.vy > 0 && // Only land when falling
      player.x + player.w / 2 > p.x &&
      player.x - player.w / 2 < p.x + p.w &&
      player.y + player.h / 2 > p.y &&
      player.y + player.h / 2 < p.y + p.h &&
      !p.broken
    ) {
      player.vy = jumpForce;

   
      groundActive = false;

      
      if (p.type === "break") p.broken = true;
    }
  }

  if (player.y < height / 2) {
    let diff = height / 2 - player.y;
    player.y = height / 2;

   
    for (let p of platforms) p.y += diff;
    if (groundActive) ground.y += diff;


    score += floor(diff);
  }

  /* Losing condition */
  if (!groundActive && player.y > height) {
    gameState = "gameover";
  }
}

function drawPlayer() {
  fill(50, 150, 255);
  rectMode(CENTER);
  rect(player.x, player.y, player.w, player.h, 6);
}




function createPlatform(x, y) {
  let r = random();
  let type = "normal";
  if (r < 0.2) type = "break";
  else if (r < 0.4) type = "move";

  return {
    x, y,
    w: 60,
    h: 10,
    type,
    broken: false,
    dir: random([-1, 1]),
    speed: random(1, 2)
  };
}

function updatePlatforms() {
  platforms = platforms.filter(
    p => p.y < height + 20 && !p.broken
  );


  let highestY = height;
  for (let p of platforms) {
    if (p.y < highestY) highestY = p.y;
  }

 
  while (platforms.length < 7) {
    let gap = random(MIN_PLATFORM_GAP, MAX_PLATFORM_GAP);
    let newY = highestY - gap;
    let newX = random(width - 60);
    platforms.push(createPlatform(newX, newY));
    highestY = newY;
  }

 
  for (let p of platforms) {
    if (p.type === "move") {
      p.x += p.speed * p.dir;
      if (p.x <= 0 || p.x + p.w >= width) {
        p.dir *= -1;
      }
    }
  }
}

function drawPlatforms() {
  for (let p of platforms) {
    if (p.type === "normal") fill(0, 200, 100);
    if (p.type === "move") fill(255, 170, 0);
    if (p.type === "break") fill(200, 50, 50);
    rect(p.x, p.y, p.w, p.h, 3);
  }
}

function drawGround() {
  fill(120);
  rect(ground.x, ground.y, ground.w, ground.h);
}


function drawScore() {
  fill(0);
  textSize(16);
  textAlign(LEFT);
  text("Score: " + score, 10, 20);
}

function drawStartScreen() {
  textAlign(CENTER);
  fill(0);
  textSize(32);
  text("Doodle Jump", width / 2, height / 2 - 40);
  textSize(16);
  text("← → or A / D to move", width / 2, height / 2);
  text("Press SPACE to start", width / 2, height / 2 + 30);
}

function drawGameOverScreen() {
  textAlign(CENTER);
  fill(0);
  textSize(32);
  text("Game Over", width / 2, height / 2 - 40);
  textSize(18);
  text("Score: " + score, width / 2, height / 2);
  textSize(16);
  text("Press SPACE to restart", width / 2, height / 2 + 40);
}

function keyPressed() {
  if (key === " " && gameState !== "play") {
    resetGame();
    gameState = "play";
  }
}
