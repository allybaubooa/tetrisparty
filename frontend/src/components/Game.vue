<template>
    <div class="game-container" :class="{ 'line-clear': isLineClearing }">
        <div class="sidebar-left">
            <div class="score-board">
                <h2>Score</h2>
                <p>{{ score }}</p>
            </div>
            <div class="next-piece">
                <h2>Next</h2>
                <canvas ref="nextPieceCanvas" width="80" height="80"></canvas>
            </div>
            <div class="speed-display">
                <h2>Speed</h2>
                <p>{{ speed }}</p>
            </div>
            <button @click="toggleMute" class="mute-button">{{ isMuted.value ? 'Unmute' : 'Mute' }}</button>
        </div>
        <div class="game">
            <canvas ref="gameCanvas" width="300" height="600"></canvas>
            <button @click="pauseGame">{{ isPaused ? 'Resume' : 'Pause' }}</button>
        </div>
        <div class="sidebar-right">
            <div class="controls">
                <h2>Controls</h2>
                <div class="control-item">
                    <i class="ri-arrow-left-fill"></i>
                    <p>Move Left</p>
                </div>
                <div class="control-item">
                    <i class="ri-arrow-right-fill"></i>
                    <p>Move Right</p>
                </div>
                <div class="control-item">
                    <i class="ri-arrow-down-fill"></i>
                    <p>Move Down</p>
                </div>
                <div class="control-item">
                    <i class="ri-arrow-up-fill"></i>
                    <p>Rotate</p>
                </div>
                <div class="control-item">
                    <i class="ri-space"></i>
                    <p>Drop</p>
                </div>
                <div class="control-item">
                    <i class="ri-pause-fill"></i>
                    <p>Pause/Resume</p>
                </div>
            </div>
            <button @click="goToMainMenu" class="main-menu-button">Main Menu</button>
        </div>
        <div v-if="gameOver" class="modal">
            <div class="modal-content">
                <h2>Game Over</h2>
                <p>Would you like to try again or go back to the main menu?</p>
                <button @click="resetGame">Try Again</button>
                <button @click="goToMainMenu">Main Menu</button>
            </div>
        </div>
        <div v-if="showSpecialEffect" class="special-effect">
            <h2>Level Up!!!</h2>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { playSound, playBackgroundSound, stopBackgroundSound, toggleMuteSound, isMuted } from '../utils/sound';

const router = useRouter();

const gameCanvas = ref<HTMLCanvasElement | null>(null);
const nextPieceCanvas = ref<HTMLCanvasElement | null>(null);
const isPaused = ref(false);
const score = ref(0);
const gameOver = ref(false);
const showSpecialEffect = ref(false);
const isLineClearing = ref(false);
const nextSpecialScore = ref(100);
const dropInterval = ref(500); // Initial drop interval
const speed = ref(1); // Initial speed level

const canvasWidth = 300;
const canvasHeight = 600;
const rows = 20;
const cols = 10;
const blockSize = canvasWidth / cols;

const radiantColors = [
    '#00FFFF', // Cyan
    '#0000FF', // Blue
    '#FFA500', // Orange
    '#FFFF00', // Yellow
    '#00FF00', // Green
    '#800080', // Purple
    '#FF0000', // Red
];

const pieces = [
    [
        [1, 1, 1, 1], // I
    ],
    [
        [1, 1, 1],    // T
        [0, 1, 0],
    ],
    [
        [1, 1, 1],    // L
        [1, 0, 0],
    ],
    [
        [1, 1, 1],    // J
        [0, 0, 1],
    ],
    [
        [0, 1, 1],    // S
        [1, 1, 0],
    ],
    [
        [1, 1, 0],    // Z
        [0, 1, 1],
    ],
    [
        [1, 1],       // O
        [1, 1],
    ]
];

const state = reactive({
    board: Array.from({ length: rows }, () => Array(cols).fill(0)),
    currentPiece: null as number[][] | null,
    currentX: 0,
    currentY: 0,
    currentColor: '',
    nextPiece: null as number[][] | null,
    nextColor: ''
});

const drawBoard = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (state.board[row][col]) {
                ctx.fillStyle = radiantColors[state.board[row][col] - 1];
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                ctx.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
            }
        }
    }
};

const drawPiece = (ctx: CanvasRenderingContext2D, piece: number[][], color: string, x: number, y: number) => {
    ctx.fillStyle = color;
    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (piece[row][col]) {
                ctx.fillRect((x + col) * blockSize, (y + row) * blockSize, blockSize, blockSize);
                ctx.strokeRect((x + col) * blockSize, (y + row) * blockSize, blockSize, blockSize);
            }
        }
    }
};

const drawNextPiece = () => {
    if (nextPieceCanvas.value) {
        const ctx = nextPieceCanvas.value.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, nextPieceCanvas.value.width, nextPieceCanvas.value.height);
            if (state.nextPiece) {
                const scale = nextPieceCanvas.value.width / 4;
                ctx.fillStyle = state.nextColor;
                for (let row = 0; row < state.nextPiece.length; row++) {
                    for (let col = 0; col < state.nextPiece[row].length; col++) {
                        if (state.nextPiece[row][col]) {
                            ctx.fillRect(col * scale, row * scale, scale, scale);
                            ctx.strokeRect(col * scale, row * scale, scale, scale);
                        }
                    }
                }
            }
        }
    }
};

const spawnPiece = () => {
    if (state.nextPiece) {
        state.currentPiece = state.nextPiece;
        state.currentColor = state.nextColor;
    } else {
        const pieceIndex = Math.floor(Math.random() * pieces.length);
        state.currentPiece = pieces[pieceIndex];
        state.currentColor = radiantColors[pieceIndex];
    }
    state.currentX = Math.floor(cols / 2) - Math.floor(state.currentPiece[0].length / 2);
    state.currentY = 0;

    // Prepare the next piece
    const nextPieceIndex = Math.floor(Math.random() * pieces.length);
    state.nextPiece = pieces[nextPieceIndex];
    state.nextColor = radiantColors[nextPieceIndex];
    drawNextPiece();
};

const movePieceDown = () => {
    state.currentY++;
    if (collision()) {
        state.currentY--;
        mergePiece();
        clearLines();
        spawnPiece();
        if (collision()) {
            endGame();
        }
    }
};

const dropPiece = () => {
    playSound('/sounds/drop.mp3');
    while (!collision()) {
        state.currentY++;
    }
    state.currentY--;
    mergePiece();
    clearLines();
    spawnPiece();
    if (collision()) {
        endGame();
    }
};

const mergePiece = () => {
    for (let row = 0; row < state.currentPiece!.length; row++) {
        for (let col = 0; col < state.currentPiece![row].length; col++) {
            if (state.currentPiece![row][col]) {
                state.board[state.currentY + row][state.currentX + col] = radiantColors.indexOf(state.currentColor) + 1;
            }
        }
    }
};

const collision = () => {
    if (!state.currentPiece) return false;
    for (let row = 0; row < state.currentPiece.length; row++) {
        for (let col = 0; col < state.currentPiece[row].length; col++) {
            if (state.currentPiece[row][col]) {
                if (
                    state.currentY + row >= rows ||
                    state.currentX + col < 0 ||
                    state.currentX + col >= cols ||
                    state.board[state.currentY + row][state.currentX + col]
                ) {
                    return true;
                }
            }
        }
    }
    return false;
};

const clearLines = () => {
    let linesCleared = 0;
    for (let row = rows - 1; row >= 0; row--) {
        if (state.board[row].every(col => col !== 0)) {
            state.board.splice(row, 1);
            state.board.unshift(Array(cols).fill(0));
            linesCleared++;
            row++; // Recheck this row after clearing
        }
    }
    score.value += linesCleared * 10;
    if (linesCleared > 0) {
        triggerLineClearAnimation();
    }
    if (score.value >= nextSpecialScore.value) {
        triggerSpecialEffect();
        nextSpecialScore.value += 100;
        dropInterval.value = Math.max(100, dropInterval.value - 50); // Increase difficulty
        speed.value++; // Increase speed level
    }
};

const resetGame = () => {
    state.board = Array.from({ length: rows }, () => Array(cols).fill(0));
    score.value = 0;
    gameOver.value = false;
    isPaused.value = false;
    nextSpecialScore.value = 100;
    dropInterval.value = 500; // Reset to initial drop interval
    speed.value = 1; // Reset to initial speed level
    spawnPiece();
    if (!isMuted.value) {
        playBackgroundSound('/sounds/bgm1.mp3');
    }
};

const handleKeyPress = (event: KeyboardEvent) => {
    if (gameOver.value) return;
    switch (event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            state.currentX--;
            if (collision()) {
                state.currentX++;
            }
            break;
        case 'ArrowRight':
            event.preventDefault();
            state.currentX++;
            if (collision()) {
                state.currentX--;
            }
            break;
        case 'ArrowDown':
            event.preventDefault();
            movePieceDown();
            break;
        case 'ArrowUp':
            event.preventDefault();
            rotatePiece();
            break;
        case ' ':
            event.preventDefault();
            dropPiece();
            break;
        case 'p':
        case 'P':
            event.preventDefault();
            pauseGame();
            break;
    }
};

const rotatePiece = () => {
    if (!state.currentPiece) return;
    const newPiece = state.currentPiece[0].map((_, colIndex) =>
        state.currentPiece!.map(row => row[colIndex])
    ).reverse();
    const originalPiece = state.currentPiece;
    state.currentPiece = newPiece;
    if (collision()) {
        state.currentPiece = originalPiece;
    }
};

const endGame = () => {
    gameOver.value = true;
    isPaused.value = true;
    playSound('/sounds/gameover.mp3');
    stopBackgroundSound();

    // Save score to localStorage
    const storedScores = JSON.parse(localStorage.getItem('tetrisScores') || '[]');
    storedScores.push(score.value);
    localStorage.setItem('tetrisScores', JSON.stringify(storedScores.sort((a, b) => b - a).slice(0, 10)));
};

let lastTime = 0;

const gameLoop = (timestamp: number, ctx: CanvasRenderingContext2D) => {
    const deltaTime = timestamp - lastTime;
    if (!isPaused.value) {
        if (deltaTime > dropInterval.value) {
            movePieceDown();
            lastTime = timestamp;
        }
        drawBoard(ctx);
        if (!gameOver.value) {
            drawPiece(ctx, state.currentPiece!, state.currentColor, state.currentX, state.currentY);
        }
    }
    requestAnimationFrame((time) => gameLoop(time, ctx));
};

const pauseGame = () => {
    isPaused.value = !isPaused.value;
    playSound('/sounds/pause.wav');
    if (isPaused.value) {
        stopBackgroundSound();
    } else {
        if (!isMuted.value) {
            playBackgroundSound('/sounds/bgm1.mp3');
        }
    }
};

const goToMainMenu = () => {
    stopBackgroundSound();
    router.push('/');
};

const triggerLineClearAnimation = () => {
    isLineClearing.value = true;
    playSound('/sounds/line-clear.mp3');
    setTimeout(() => {
        isLineClearing.value = false;
    }, 500); // Match the duration of the animation
};

const triggerSpecialEffect = () => {
    showSpecialEffect.value = true;
    playSound('/sounds/special-effect.wav');
    setTimeout(() => {
        showSpecialEffect.value = false;
    }, 2000); // Duration of the special effect
};

const toggleMute = () => {
    toggleMuteSound();
    if (isMuted.value) {
        stopBackgroundSound();
    } else {
        playBackgroundSound('/sounds/bgm1.mp3');
    }
};

onMounted(() => {
    if (gameCanvas.value && nextPieceCanvas.value) {
        const ctx = gameCanvas.value.getContext('2d');
        if (ctx) {
            resetGame();
            window.addEventListener('keydown', handleKeyPress);
            requestAnimationFrame((timestamp) => gameLoop(timestamp, ctx));
            if (!isMuted.value) {
                playBackgroundSound('/sounds/bgm1.mp3');
            }
        }
    }
});
</script>

<style scoped>
.game-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: radial-gradient(circle, rgba(147, 68, 103, 1) 20%, rgba(0, 0, 0, 1) 100%);
    position: relative;
}

.game-container.line-clear {
    animation: line-clear-animation 0.5s ease;
}

@keyframes line-clear-animation {
    0% {
        background-color: rgba(255, 255, 255, 0.5);
    }

    100% {
        background-color: rgba(0, 0, 0, 1);
    }
}

.special-effect {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 2em;
    text-align: center;
    animation: special-effect-animation 2s ease;
}

@keyframes special-effect-animation {
    0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }

    50% {
        transform: translate(-50%, -50%) scale(1.5);
        opacity: 0.5;
    }

    100% {
        transform: translate(-50%, -50%) scale(2);
        opacity: 0;
    }
}

.sidebar-left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    margin-right: 20px;
    text-align: center;
    color: white;
}

.sidebar-right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    margin-left: 20px;
    text-align: center;
    color: white;
}

.controls {
    margin-bottom: 20px;
}

.control-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.control-item i {
    font-size: 24px;
    margin-right: 10px;
}

.score-board,
.next-piece,
.speed-display {
    margin-bottom: 20px;
}

.game {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

canvas {
    background: #000;
    display: block;
    margin: 0 auto;
    border: 2px solid #fff;
    transition: background-color 0.3s ease;
}

canvas:hover {
    background-color: #111;
}

button {
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #555;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #777;
}

.mute-button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #777;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.mute-button:hover {
    background-color: #999;
}

.main-menu-button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #ff4444;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.main-menu-button:hover {
    background-color: #ff6666;
}

.score-board h2,
.next-piece h2,
.speed-display h2 {
    color: #fff;
}

.score-board p,
.speed-display p {
    color: #fff;
    font-size: 24px;
    margin: 0;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background: #fff;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
}

.modal-content button {
    margin: 10px;
    padding: 10px 20px;
    background-color: #555;
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.modal-content button:hover {
    background-color: #777;
}
</style>