const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Make canvas full-screen for desktop & mobile
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Load images
const bg = new Image();
bg.src = "bg.jpeg";

const birdImg = new Image();
birdImg.src = "bird.png";

const pipeTop = new Image();
pipeTop.src = "top.png";

const pipeBottom = new Image();
pipeBottom.src = "buttom.png";

// Bird properties
let bird = {
    x: 100,
    y: canvas.height / 2,
    radius: 24, // Circular bird
    gravity: 0.6,
    lift: -12,
    velocity: 0
};

// Pipe properties
let pipes = [];
let pipeWidth = 200; // Updated pipe width
let pipeGap = 180;
let pipeSpeed = 3;
let score = 0;

// Game state
let gameStarted = false;
let gameOver = false;

// Handle touch and keyboard controls
function flap() {
    if (!gameStarted) {
        gameStarted = true;
    }
    if (!gameOver) {
        bird.velocity = bird.lift;
    } else {
        resetGame();
    }
}

// Touch support
canvas.addEventListener("click", flap);
canvas.addEventListener("touchstart", flap);

// Keyboard support
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") flap();
});

// Generate pipes
function generatePipe() {
    let pipeHeight = Math.floor(Math.random() * (canvas.height / 2)) + 50;
    pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
        bottomY: pipeHeight + pipeGap,
        scored: false
    });
}

// Circular collision detection
function isColliding(bird, pipe) {
    let birdCenterX = bird.x + bird.radius;
    let birdCenterY = bird.y + bird.radius;

    // Pipe hitboxes
    let withinX = birdCenterX > pipe.x && birdCenterX < pipe.x + pipeWidth;
    let hitsTop = withinX && (birdCenterY - bird.radius < pipe.topHeight);
    let hitsBottom = withinX && (birdCenterY + bird.radius > pipe.bottomY);

    return hitsTop || hitsBottom;
}

// Reset game
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    gameStarted = false;
}

// Game loop
function update() {
    if (gameStarted) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        // Prevent bird from going off-screen
        if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
            gameOver = true;
        }

        // Pipe movement
        for (let i = 0; i < pipes.length; i++) {
            pipes[i].x -= pipeSpeed;

            // Check collision
            if (isColliding(bird, pipes[i])) {
                gameOver = true;
            }

            // Score update
            if (pipes[i].x + pipeWidth < bird.x && !pipes[i].scored) {
                score++;
                pipes[i].scored = true;
            }
        }

        // Remove off-screen pipes
        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

        // Generate new pipes
        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
            generatePipe();
        }
    }

    draw();
    requestAnimationFrame(update);
}

// Draw elements
function draw() {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("Tap or Press Space to Start", canvas.width / 2 - 140, canvas.height / 2);
    }

    // Draw pipes
    for (let i = 0; i < pipes.length; i++) {
        ctx.drawImage(pipeTop, pipes[i].x, 0, pipeWidth, pipes[i].topHeight);
        ctx.drawImage(pipeBottom, pipes[i].x, pipes[i].bottomY, pipeWidth, canvas.height - pipes[i].bottomY);
    }

    // Draw bird
    ctx.drawImage(birdImg, bird.x, bird.y, bird.radius * 2, bird.radius * 2);

    // Draw score
    ctx.fillStyle = "black";
    ctx.font = "25px Arial";
    ctx.fillText(`Score: ${score}`, 20, 50);

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.fillText("Game Over!", canvas.width / 2 - 100, canvas.height / 2);
        ctx.fillText("Tap to Restart", canvas.width / 2 - 100, canvas.height / 2 + 50);
    }
}

// Start game loop
update();
