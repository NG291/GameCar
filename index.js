const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const carImg = new Image();
carImg.src = 'car.png';
const bgImg = new Image();
bgImg.src = 'path.png';
const obstacleImg = new Image();
obstacleImg.src = 'obstacle.png';
const slowcarImg = new Image();
slowcarImg.src = 'obstacle2.png';
const slowCarWidth = 50;
const slowCarHeight = 100;
let slowCarX = canvas.width / 2 - slowCarWidth / 2;
let slowCarY = -slowCarHeight;
const slowCarSpeed = 2;

const carWidth = 50;
const carHeight = 100;
let carX = canvas.width / 2 - carWidth / 2;
let carY = canvas.height - carHeight - 20;
const carSpeed = 5;

const obstacles = [];
const obstacleWidth = 50;
const obstacleHeight = 100;
let obstacleSpeed = 3;

let score = 0;
let gameOver = false;

let highScores = [];

document.addEventListener('keydown', moveCar);
document.addEventListener('keyup', stopMoving);

let upPressed = false;
let downPressed = false;

function moveCar(e) {
    if (e.key === 'ArrowLeft' && carX > 0) {
        carX -= carSpeed;
    }
    if (e.key === 'ArrowRight' && carX < canvas.width - carWidth) {
        carX += carSpeed;
    }
    if (e.key === 'ArrowUp' && carY > 0) {
        carY -= carSpeed;
    }
    if (e.key === 'ArrowDown' && carY < canvas.height - carHeight) {
        carY += carSpeed;
    }
}

function stopMoving(e) {
    if (e.key === 'ArrowUp') {
        upPressed = false;
    }
    if (e.key === 'ArrowDown') {
        downPressed = false;
    }
}

let bgY1 = 0; // Vị trí Y của phần trên của hình ảnh path.png
let bgY2 = -canvas.height; // Vị trí Y của phần dưới của hình ảnh path.png

function updateBackground() {
    // Dịch chuyển hai phần của hình ảnh path.png theo chiều dọc
    bgY1 += obstacleSpeed;
    bgY2 += obstacleSpeed;

    // Kiểm tra nếu một phần đi ra khỏi khung hình, đặt lại vị trí của nó
    if (bgY1 >= canvas.height) {
        bgY1 = bgY2 - canvas.height;
    }
    if (bgY2 >= canvas.height) {
        bgY2 = bgY1 - canvas.height;
    }
}

function drawBackground() {
    // Vẽ hai phần của hình ảnh path.png
    ctx.drawImage(bgImg, 0, bgY1, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, bgY2, canvas.width, canvas.height);
}

function updateCarPosition() {
    if (upPressed && carY > 0) {
        carY -= carSpeed;
    }
    if (downPressed && carY < canvas.height - carHeight) {
        carY += carSpeed;
    }
}

function createObstacle() {
    const obstacleX = Math.random() * (canvas.width - obstacleWidth);
    obstacles.push({ x: obstacleX, y: 0 });
}

function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += obstacleSpeed;

        // Nếu người chơi vượt qua vật cản mà không va chạm
        if (obstacles[i].y > canvas.height && !obstacles[i].passed) {
            obstacles[i].passed = true;
            score++;
        }

        // Nếu va chạm với vật cản
        if (obstacles[i].x < carX + carWidth &&
            obstacles[i].x + obstacleWidth > carX &&
            obstacles[i].y < carY + carHeight &&
            obstacles[i].y + obstacleHeight > carY) {
            gameOver = true;
        }
    }
}

function drawCar() {
    ctx.drawImage(carImg, carX, carY, carWidth, carHeight);
}

function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        ctx.drawImage(obstacleImg, obstacles[i].x, obstacles[i].y, obstacleWidth, obstacleHeight);
    }
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
}
function saveHighScores() {
    localStorage.setItem('highScores', JSON.stringify(highScores));
}
function loadHighScores() {
    const storedScores = localStorage.getItem('highScores');
    if (storedScores) {
        highScores = JSON.parse(storedScores);
    }
}


function updateSlowCarPosition() {
    slowCarY += slowCarSpeed;
    if (slowCarY > canvas.height) {
        slowCarY = -slowCarHeight;
        slowCarX = Math.random() * (canvas.width - slowCarWidth);
    }
    // Nếu người chơi vượt qua slowcar mà không va chạm
    if (slowCarY > canvas.height && !slowCarPassed) {
        slowCarPassed = true;
        score += 5; // Tăng điểm nhiều hơn khi vượt qua slowcar
    }
    // Nếu va chạm với slowcar
    if (slowCarX < carX + carWidth &&
        slowCarX + slowCarWidth > carX &&
        slowCarY < carY + carHeight &&
        slowCarY + slowCarHeight > carY) {
        gameOver = true;
    }
}

function drawSlowCar() {
    ctx.drawImage(slowcarImg, slowCarX, slowCarY, slowCarWidth, slowCarHeight);
}
function clearHighScores() {
    localStorage.removeItem('highScores');
    highScores = [];
    updateScoreList();
}
function resetGame() {
    score = 0;
    carX = canvas.width / 2 - carWidth / 2;
    carY = canvas.height - carHeight - 20;
    gameOver = false;
    obstacles.length = 0;
    slowCarX = canvas.width / 2 - slowCarWidth / 2;
    slowCarY = -slowCarHeight;
    document.getElementById('scoreForm').style.display = 'none';
    updateScoreList();
    saveHighScores();
}

function drawGameOver() {
    document.getElementById('finalScore').textContent = score;
    document.getElementById('scoreForm').style.display = 'block';
}

function updateScoreList() {
    const scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = '';
    highScores.forEach(({ name, score }) => {
        const li = document.createElement('li');
        li.textContent = `${name}: ${score}`;
        scoreList.appendChild(li);
    });
    document.getElementById('highScores').style.display = 'block';
}

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    highScores.push({ name, score });
    highScores.sort((a, b) => b.score - a.score);
    saveHighScores();
    resetGame();
    gameLoop();
});

document.getElementById('playAgain').addEventListener('click', function() {
    resetGame();
    gameLoop();
});
document.getElementById('clearScores').addEventListener('click', function() {
    clearHighScores(); // Xóa danh sách điểm khi nhấn nút
});

canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    if (mouseX >= canvas.width / 2 - 50 && mouseX <= canvas.width / 2 + 50 &&
        mouseY >= canvas.height / 2 + 80 && mouseY <= canvas.height / 2 + 120) {
        resetGame();
        gameLoop();
    }
});
let level = 1;
const levelThreshold = 10; // Mỗi 10 điểm tăng 1 cấp độ

function updateLevel() {
    if (score >= levelThreshold * level) {
        level++;
        // Thực hiện các thay đổi cần thiết khi tăng cấp độ
        obstacleSpeed += 3; // Ví dụ: tăng tốc độ của vật cản
        alert('Tăng độ khó ' + level);
    }
}

function gameLoop() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    updateBackground();
    drawBackground();
    drawCar();
    updateObstacles();
    drawObstacles();
    drawScore();
    updateSlowCarPosition();
    updateCarPosition();
    drawSlowCar();
    updateLevel()

    if (slowCarX < carX + carWidth &&
        slowCarX + slowCarWidth > carX &&
        slowCarY < carY + carHeight &&
        slowCarY + slowCarHeight > carY) {
        gameOver = true;
    }

    requestAnimationFrame(gameLoop);
}

setInterval(createObstacle, 2000);
loadHighScores();
updateScoreList()
gameLoop();
