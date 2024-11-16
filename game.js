engineInit();
const canvas = mainCanvas;
const ctx = mainContext;

let gameRunning = false;
let gameOver = false;

const character = {
    x: canvas.width / 2 - 10,
    y: canvas.height / 2 - 10,
    width: 20,
    height: 20,
    speed: 5,
};

const obstacles = [];
let score = 0;

let keyLeft = false, keyRight = false;
document.onkeydown = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keyLeft = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keyRight = true;
};
document.onkeyup = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keyLeft = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keyRight = false;
};

// 장애물 생성
function spawnObstacle() {
    const size = 20;
    const x = Math.random() * canvas.width;
    const startFromTop = Math.random() > 0.5;
    const y = startFromTop ? -size : canvas.height + size;
    const speed = 3 + Math.random() * 2;
    const direction = startFromTop ? 1 : -1;
    obstacles.push({ x, y, size, speed, direction });
}

function gameLoop() {
    if (!gameRunning) return;

    // 캐릭터 이동
    if (keyLeft) character.x -= character.speed;
    if (keyRight) character.x += character.speed;
    character.x = Math.max(0, Math.min(canvas.width - character.width, character.x));

    // 장애물 이동
    for (const obstacle of obstacles) {
        obstacle.y += obstacle.speed * obstacle.direction;

        // 충돌 감지
        if (
            character.x < obstacle.x + obstacle.size &&
            character.x + character.width > obstacle.x &&
            character.y < obstacle.y + obstacle.size &&
            character.y + character.height > obstacle.y
        ) {
            gameRunning = false;
            gameOver = true;
            showGameOverScreen();
            return;
        }
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].y < -obstacles[i].size || obstacles[i].y > canvas.height + obstacles[i].size) {
            obstacles.splice(i, 1);
            score++;
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'blue';
    ctx.fillRect(character.x, character.y, character.width, character.height);

    ctx.fillStyle = 'red';
    for (const obstacle of obstacles) {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);
    }

    ctx.fillStyle = 'black';
    ctx.font = '18px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    requestAnimationFrame(gameLoop);
}

function showGameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 3);
    ctx.fillText(`Your Score: ${score}`, canvas.width / 2, canvas.height / 2);

    const restartButton = document.createElement('button');
    restartButton.innerText = 'Restart Game';
    restartButton.style.position = 'absolute';
    restartButton.style.left = `${canvas.width / 2 - 50}px`;
    restartButton.style.top = `${canvas.height / 1.5}px`;
    document.body.appendChild(restartButton);

    restartButton.onclick = () => {
        document.body.removeChild(restartButton);
        resetGame();
        showStartScreen();
    };
}

function resetGame() {
    character.x = canvas.width / 2 - 10; // 캐릭터 초기 위치
    character.y = canvas.height / 2 - 10;
    obstacles.length = 0;
    score = 0;
    gameRunning = false;
    gameOver = false;
}

function showStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Welcome to Horizon Dodge!', canvas.width / 2, canvas.height / 3);
    ctx.fillText('Press Start to Begin', canvas.width / 2, canvas.height / 2);

    const startButton = document.createElement('button');
    startButton.innerText = 'Start Game';
    startButton.style.position = 'absolute';
    startButton.style.left = `${canvas.width / 2 - 50}px`;
    startButton.style.top = `${canvas.height / 1.5}px`;
    document.body.appendChild(startButton);

    startButton.onclick = () => {
        document.body.removeChild(startButton);
        gameRunning = true;
        gameLoop();
    };
}

showStartScreen();
setInterval(() => {
    if (gameRunning) spawnObstacle();
}, 1000);
