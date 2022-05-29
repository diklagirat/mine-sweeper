'use strict'

const MINE = '💣';
const FLAG = '🚩';

var gBoard;
var gGame = {
    isOn: false,
    openCellsCount: 0,
    flagsCount: 0,
    secsPassed: 0,
    life: 3,
    prevContent: null,
    minesLeft: 0

}

var gLevel = {
    size: 0,
    mines: 0
}
var gTimerInterval;
var gMines;

//  V- Init game.

function init() {

    updateGameLevel();
    console.log(gLevel);
    dropRandomMine();

    gBoard = createBoard();
    gGame.isOn = true;
    gGame.minesLeft = gLevel.mines;
    gGame.flagsCount = 0;
    gGame.openCellsCount = 0;
    gGame.life = 3;
    gTimerInterval = null;

    renderBoard();
    console.log(gBoard);
    updadeCellNegOnBoard();

    //DOM: Update scopes.

    const elSpanMine = document.querySelector('.mines-left');
    elSpanMine.innerText = gLevel.mines;

    const elSpanFlag = document.querySelector('.flags-text');
    elSpanFlag.innerText = gGame.flagsCount;

    const elSpanTimer = document.querySelector('.timer-text');
    elSpanTimer.innerText = '0000';


    const elSpanLife = document.querySelector('.life');
    elSpanLife.innerText = gGame.life;

}

// V- Create game board to the MODEL.
function createBoard() {
    var board = [];
    // var temp = dropRandomMine();
    const row = gLevel.size;
    const col = row;

    for (var i = 0; i < row; i++) {
        board[i] = [];
        for (var j = 0; j < col; j++) {
            var cell = {
                type: (gMines[i][j]) ? MINE : '',
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            if (cell.type === MINE) cell.isMine = true;
            board[i][j] = cell;
        }
    }
    return board;
}

// V- Generat the board to the DOM.
function renderBoard() {
    var strHTML = `<table border="0"><tbody>`;

    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            var className = (cell.isMine === true) ? 'mine' : '';

            if (cell.isMarked) className += ' marked';
            if (cell.isShown) className += ' show';

            strHTML += `\t<td class="cell cell-${i}-${j} ${className}"
                            onmousedown="cellClicked(event,this, ${i}, ${j})" >${' '}</td>\n`
        }
        strHTML += `</tr>\n`;
    }
    strHTML += `</tbody ></table >`;
    // console.log(strHTML);

    var elSeats = document.querySelector('.board-container');
    elSeats.innerHTML = strHTML;
}

// V- Render data cell to the DOM.
function renderCell(location, value) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerText = value;
}

// V- Get board length from user input.
function updateGameLevel() {
    var elLevels = document.getElementsByName('level');
    for (var i = 0; i < elLevels.length; i++) {
        if (elLevels[i].checked) {
            switch (elLevels[i].value) {
                case 'eazy':
                    gLevel.size = 4;
                    gLevel.mines = 2;
                    return;
                case 'hard':
                    gLevel.size = 8;
                    gLevel.mines = 12;
                    return;
                case 'ext':
                    gLevel.size = 12;
                    gLevel.mines = 30;
                    return;
                default:
            }
        }
    }
}

// V- Check for mines neighbor.
function findkMineNeg(rowIdx, colIdx) {
    var totalMineNeg = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        //Out of board range, continue
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            // Out of board range, continue
            if (j < 0 || j >= gBoard[i].length) continue
            // Skip current position
            if (i === rowIdx && j === colIdx) continue
            if (gBoard[i][j].isMine) {
                totalMineNeg++;
            }
        }
    }
    return totalMineNeg;
}

// V- Update every cell mines neg.  
function updadeCellNegOnBoard() {
    var cell;
    var totalNeg = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            cell = gBoard[i][j];
            if (cell.isMine) continue
            totalNeg = findkMineNeg(i, j);

            //MODEL: 
            cell.minesAroundCount = totalNeg;

            //DOM:
            renderCell({ i, j }, cell.type);
        }
    }
    // console.log(gBoard);
}

// TODO:  Game Logic.
function cellClicked(event, elCell, i, j) {
    // For debugge
    console.table(gMines);

    // Hide context menu on right click.
    window.addEventListener("contextmenu", e => e.preventDefault());

    if (!gGame.isOn) return;
    if (!gTimerInterval) startTimer();

    var value = elCell.innerText;

    if (event.button === 0) handelLeftClick(elCell, value, i, j);
    if (event.button === 2) handelRightClick(value, i, j);

    if (checkGameOver()) {
        clearInterval(gTimerInterval);
        const elButton = document.querySelector('.board-face');
        elButton.innerHTML = ` <img src="img/win-emoji.png">`;
    }
}

// V-  Add flage and marked the cell in board.
function addFlag(value, i, j) {
    gGame.flagsCount++;
    gBoard[i][j].prevContent = value;
    gBoard[i][j].isMarked = true;
    renderCell({ i, j }, FLAG);

    const elSpan = document.querySelector('.flags-text');
    elSpan.innerText = gGame.flagsCount;
}

// V-  Reamove flage and unmarked the cell in board.
function removeFlag(value, i, j) {

    var prevValue = gBoard[i][j].prevContent;
    var value = gBoard[i][j].minesAroundCount;
    gBoard[i][j].isMarked = false;
    gGame.flagsCount--;

    if (prevValue === MINE) value = MINE;
    else if (prevValue === ' ') value = ' ';
    else value = prevValue;

    renderCell({ i, j }, value);

    const elSpan = document.querySelector('.flags-text');
    elSpan.innerText = gGame.flagsCount;
}

// V- handle right click on the cell.
function handelRightClick(value, i, j) {
    if (gBoard[i][j].isShown) return;
    if (value === FLAG) removeFlag(value, i, j);
    else addFlag(value, i, j);
}

//TODO:  handle left click on the cell.
function handelLeftClick(elCell, value, i, j) {
    if (value === FLAG) return;
    if (gBoard[i][j].isShown) return;

    if (gBoard[i][j].isMine) {

        //MODEL: 
        gGame.life--;
        gGame.minesLeft--;

        //DOM: Update Life  and Mines  left scopes.
        const elSpanLife = document.querySelector('.life');
        elSpanLife.innerText = gGame.life;

        const elSpanMines = document.querySelector('.mines-left');
        elSpanMines.innerText = gGame.minesLeft;
    }

    gGame.openCellsCount++;

    //MODEL: 
    gBoard[i][j].isShown = true;

    // DOM: Show cell content.
    var elCell = document.querySelector(`.cell-${i}-${j}`);
    elCell.classList.add('show');

    //DOM: Update Life  and Mines  left scopes.
    const elSpanLife = document.querySelector('.life');
    elSpanLife.innerText = gGame.life;

    //DOM:
    if (gBoard[i][j].type === MINE) value = MINE;
    else if (gBoard[i][j].minesAroundCount === 0) value = '';
    else value = gBoard[i][j].minesAroundCount
    renderCell({ i, j }, value);
}

// V- Start Game Timer 
function startTimer() {

    var startTime = Date.now();
    if (gTimerInterval) stopTimer();

    gTimerInterval = setInterval(() => {
        var seconds = ((Date.now() - startTime) / 1000).toFixed(3);
        var elSpan = document.querySelector('.timer-text');
        elSpan.innerText = seconds;
    }, 59);
}

// V- Stop Game Timer 
function stopTimer() {
    clearInterval(gTimerInterval);
}

// V-  Open all cells with content -mine.
function shownAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];
            if (cell.type === MINE) {
                var elCell = document.querySelector(`.cell-${i}-${j}`);
                elCell.classList.add('show');
                renderCell({ i, j }, MINE);
            }
        }
    }
}

// V- Check victory
function checkGameOver() {
    // Check for lose
    if (gGame.life === 0) {
        stopTimer();
        gameOver();
        return;
    }

    // Check if victory
    if (gGame.openCellsCount != (gBoard.length * gBoard.length) - gLevel.mines) return false;

    var count = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {

            if (gBoard[i][j].isMine && gBoard[i][j].isMarked) count++;
            if (gBoard[i][j].isShown) count++;

        }
    }
    return (count === gBoard.length * gBoard.length);
}
// V- Life is end.
function gameOver() {

    const elButton = document.querySelector('.board-face');
    elButton.innerHTML = ` <img src="img/sad-emoji.png">`;

    gGame.isOn = false;
    shownAllMines();
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// V- Return random board with random mine.  
function dropRandomMine() {
    var boardWithMines = [];

    for (var rowIdx = 0; rowIdx < gLevel.size; rowIdx++) {
        boardWithMines[rowIdx] = [];
        for (var colIdx = 0; colIdx < gLevel.size; colIdx++) {
            boardWithMines[rowIdx][colIdx] = '';
        }
    }

    for (var d = 0; d < gLevel.mines; d++) {
        var i = getRandomIntInclusive(0, gLevel.size - 1);
        var j = getRandomIntInclusive(0, gLevel.size - 1);
        boardWithMines[i][j] = MINE
    }
    gMines = boardWithMines;
}

function startNewGame() {
    stopTimer();

    const elButton = document.querySelector('.board-face');
    elButton.innerHTML = ` <img src="img/start-emoji.png">`;

    init();
}
