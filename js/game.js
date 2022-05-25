'use strict'

const MINE = '💣';
var FLAG = '🚩';

var gBoard;
var gGame = {
    isOn: false,
    openCellsCount: 0,
    flagsCount: 0,
    secsPassed: 0,
    life: 3,
    prevContent: null
}

var gLevel = {
    size: 0,
    mines: 0
}

// Init game.

function init() {

    updateGameLevel();
    gBoard = createBoard();

    gGame.isOn = true;
    renderBoard();
    console.log(gBoard);
    updadeCellNegOnBoard();
}

// Create game board to the MODEL.
function createBoard() {
    var board = [];
    var row = gLevel.size;
    var col = row;

    for (var i = 0; i < row; i++) {
        board[i] = [];
        for (var j = 0; j < col; j++) {
            var cell = {
                //  Add mine in board[0][0] &  board[2][2] location.
                //TODO: use dropMines(gLevel.mines) to add mines random.

                type: (i === 0 && j === 0 || i === 2 && j === 2) ? MINE : '', // @@
                minesAroundCount: 0,// TODO: add Function - findkMineNeg(location -i,j) return amount neg.
                isShown: true,
                isMine: false,
                isMarked: false // for flag
            }
            if (cell.type === MINE) cell.isMine = true;
            board[i][j] = cell;
        }
    }
    return board;
}

// Generat the board to the DOM.
function renderBoard() {
    var strHTML = `<table border="0"><tbody>`;

    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];

            // For cell of type Mine add mine class
            var className = (cell.isMine === true) ? 'mine' : '';
            if (cell.isMarked) className += ' marked';
            if (cell.isShown) className += ' show';

            // TODO: change 'cell.type' angd use 'minesAroundCount' only 
            strHTML += `\t<td class="cell cell-${i}-${j} ${className}"
                            onmousedown="cellClicked(event,this, ${i}, ${j})" >${cell.type}</td>\n`
        }
        strHTML += `</tr>\n`;
    }
    strHTML += `</tbody ></table >`;
    console.log(strHTML);

    var elSeats = document.querySelector('.board-container');
    elSeats.innerHTML = strHTML;
}
// Render data cell to the DOM.
function renderCell(location, value) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerText = value;
}

// Get board length from user input.
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

// TODO: add rundom mines on board.
function dropMines(amont) {

}

// Check for mines neighbor.
function findkMineNeg(rowIdx, colIdx) {
    var totalMineNeg = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        // If out of board range, continue
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            // If out of board range, continue
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

// Update every cell mines neg.  
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
            if (totalNeg === 0) renderCell({ i, j }, '');

            //DOM: 
            else renderCell({ i, j }, cell.minesAroundCount);
        }
    }
}

function cellClicked(event, elButton, i, j) {
    var value = elButton.innerText;

    if (event.button === 0) {
        console.log('Left clicked');
        elButton.classList.add('show');

        if (value === MINE) {
            if (gGame.life === 0) {
                console.log(' call gameOver()');
                gameOver();
            }
            gGame.life--;
            console.log('gGame.life:', gGame.life);
        }
        renderCell({ i, j }, value);
    }
    if (event.button === 2) {
        if (value === FLAG) removeFlag(value, i, j);
        else addFlag(value, i, j);
    }
}

//TODO:
function startGame() {
    // Smile button
    console.log('Start new game');
    init();
}
// TODO: 
function gameOver() {
    console.log('gameOver()');
    // if (gGame.life === 0) {
    //     // change button status to sad and stop timmer
    // }
}
function addFlag(value, i, j) {
    console.log('addFlag');
    gBoard[i][j].prevContent = value;
    renderCell({ i, j }, FLAG);
    console.log('gBoard[i][j]', gBoard[i][j]);

}
function removeFlag(value, i, j) {
    var prevValue = gBoard[i][j].prevContent;
    var value = gBoard[i][j].minesAroundCount;

    console.log('prevValue', prevValue, 'value', value);

    if (prevValue === MINE) value = MINE;
    else if (prevValue === ' ') value = ' ';
    else value = prevValue;
    console.log('value::', value);
    renderCell({ i, j }, value);
}