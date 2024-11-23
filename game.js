engineInit();
const canvas = mainCanvas;
const ctx = mainContext;

let gameRunning = false;
let gameOver = false;
let lastDirection = 'right';

const character = {
    x: canvas.width / 2 - 16,
    y: canvas.height / 2 - 16,
    width: 64,
    height: 64,
    speed: 5,
    animationFrame: 0,
    animationDelay: 0,
    animationSpeed: 5,
    moving: false,
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

const squirrelSprite = new Image();
squirrelSprite.src = './asset/run.png';

const treeSprite = new Image();
treeSprite.src = './asset/tree.png';
const tree = {
    x: 0,
    y: character.y + character.height - 64,
    width: canvas.width,
    height: 128,
};
function drawTree() {
    const partWidth = 32;
    const partHeight = 64;

    ctx.drawImage(treeSprite, 0, 0, partWidth, partHeight, tree.x, tree.y, partWidth, tree.height);
    let x = 0;
    for (let i = partWidth; i < tree.width - partWidth; i += partWidth) {
        if(treeSprite.width < x + 96){
            x = partWidth;
        } else {
            x += partWidth;
        }
        ctx.drawImage(treeSprite, x, 0, partWidth, partHeight, i, tree.y, partWidth, tree.height);
    }

    ctx.drawImage(treeSprite, partWidth * 7, 0, partWidth, partHeight, tree.width - partWidth, tree.y, partWidth, tree.height);
}

const backTreeSprite = new Image();
backTreeSprite.src = './asset/btree.png';

const backgroundTrees = [];
const canvesWidth = canvas.width;
const canvesHeight = canvas.height;
const backgroundTreesX = [canvesWidth - 600,canvesWidth - 800,canvesWidth - 1200,canvesWidth - 1600,canvesWidth - 1800];
const backgroundTreesY = [canvesHeight - 1250 ,canvesHeight - 1250,canvesHeight - 1250,canvesHeight - 1250,canvesHeight - 1250];
const backgroundTreesScale = [3,3,3,3,3];
const backgroundTreesOpacity = [1.5,1.5,1.5,1.5,1.5];
const treeCount = 5;

function initBackgroundTrees() {
    for (let i = 0; i < treeCount; i++) {
        backgroundTrees.push({
            x: backgroundTreesX[i],
            y: backgroundTreesY[i],
            width: 256 * backgroundTreesScale[i],
            height: 256 * backgroundTreesScale[i],
            opacity: backgroundTreesOpacity[i],
        });
    }
}

// 나무 그리기
function drawBackgroundTrees() {
    for (const tree of backgroundTrees) {
        ctx.globalAlpha = tree.opacity; // 투명도로 원근감 표현
        ctx.drawImage(backTreeSprite, tree.x, tree.y, tree.width, tree.height);
    }
    ctx.globalAlpha = 1; // 투명도 초기화
}
initBackgroundTrees();


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

    character.moving = false;
    if (keyLeft) {
        character.x -= character.speed;
        lastDirection = 'left';
        character.moving = true;
    }
    if (keyRight) {
        character.x += character.speed;
        lastDirection = 'right';
        character.moving = true;
    }
    character.x = Math.max(0, Math.min(canvas.width - character.width, character.x));

    for (const obstacle of obstacles) {
        obstacle.y += obstacle.speed * obstacle.direction;

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
// 배경 나무 그리기
    drawBackgroundTrees();
    drawTree();

    if (character.moving) {
        character.animationDelay++;
        if (character.animationDelay >= character.animationSpeed) {
            character.animationFrame = (character.animationFrame + 1) % 4;
            character.animationDelay = 0;
        }
    } else {
        character.animationFrame = 0;
    }

    const spriteX = character.animationFrame * 32;
    const spriteY = lastDirection === 0;
    if (lastDirection === 'left') {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
            squirrelSprite,
            spriteX, spriteY, 32, 32,
            -character.x - character.width, character.y, character.width, character.height
        );
        ctx.restore();
    } else {

        ctx.drawImage(
            squirrelSprite,
            spriteX, spriteY, 32, 32,
            character.x, character.y, character.width, character.height
        );
    }

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
    ctx.fillStyle = 'yellow';
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
    character.x = canvas.width / 2 - 32; // 캐릭터 초기 위치
    character.y = canvas.height / 2 - 32;
    obstacles.length = 0;
    score = 0;
    gameRunning = false;
    gameOver = false;
}

function showStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'yellow';
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