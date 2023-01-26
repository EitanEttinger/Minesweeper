'use strict'

// vars

var gGame = {
  isOn: true,
  moveCount: 0,
  shownCount: 0,
  markedCount: 0,
  minesMarkedCount: 0,
  secsPassed: 0,
  liveCount: 3,
}
var gLevel = { SIZE: 4, MINES: 2 }
var gBoard
var gMines
var gCancelMark = false

const EMPTY = ``
const MINE = `&#128163`
const FLAG = `&#128681`

const FUN_SMILEY = `&#128515`
const VICTORY_SMILEY = `&#128526`
const LOSS_SMILEY = `&#128561`
const LIVE = `&#128153`

// onInit
function onInit(size, mines) {
  gLevel.SIZE = size
  gLevel.MINES = mines
  // Data Reset
  gGame.isOn = true
  gGame.moveCount = 0
  gGame.shownCount = 0
  gGame.markedCount = 0
  gGame.minesMarkedCount = 0
  gGame.secsPassed = 0
  gGame.liveCount = 3
  renderSmiley(FUN_SMILEY)
  renderLive(3)

  // Run
  buildBoard()
  renderBoard()
}

// buildBoard
function buildBoard() {
  const size = gLevel.SIZE
  gBoard = []

  for (var i = 0; i < size; i++) {
    gBoard.push([])

    for (var j = 0; j < size; j++) {
      gBoard[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        locationI: i,
        locationJ: j,
      }
    }
  }
}

// getEmptyPos
function getEmptyPos(locationI, locationJ) {
  const emptyPos = []

  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].isMine || (i === locationI && j === locationJ)) continue

      emptyPos.push({ i, j })
    }
  }
  var randIdx = getRandomInt(0, emptyPos.length)
  var randPos = emptyPos[randIdx]

  return gBoard[randPos.i][randPos.j]
}

function placeMines(locationI, locationJ) {
  const amount = gLevel.MINES
  gMines = []

  for (var m = 0; m < amount; m++) {
    var currCell = getEmptyPos(locationI, locationJ)

    currCell.isMine = true
    gMines.push(currCell)
  }
}

// setMinesNegsCount
function setMinesNegsCount() {
  for (var m = 0; m < gMines.length; m++) {
    var currCell = gMines[m]

    for (var i = currCell.locationI - 1; i <= currCell.locationI + 1; i++) {
      if (i < 0 || i >= gBoard.length) continue

      for (var j = currCell.locationJ - 1; j <= currCell.locationJ + 1; j++) {
        if (i === currCell.locationI && j === currCell.locationJ) continue
        if (j < 0 || j >= gBoard[i].length) continue
        gBoard[i][j].minesAroundCount++
      }
    }
  }
}

// renderBoard
function renderBoard() {
  var elBoard = document.querySelector('.board')
  var strHTML = ''

  for (var i = 0; i < gBoard.length; i++) {
    strHTML += '<tr>\n'

    for (var j = 0; j < gBoard[i].length; j++) {
      var currCell = gBoard[i][j]

      var cellClass = getClassName(i, j)

      if (currCell.isMine === true) cellClass += ' mine'
      else if (currCell.minesAroundCount === 0) cellClass += ' emptyCell'
      else if (currCell.minesAroundCount > 0) cellClass += ' negCell'

      strHTML += `\t<td class="cell ${cellClass}" onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(event, this, ${i}, ${j})">`

      strHTML += '\t</td>\n'
    }
    strHTML += '</tr>\n'
  }
  elBoard.innerHTML = strHTML
}

// getClassName
function getClassName(i, j) {
  var cellClass = 'cell-' + i + '-' + j
  return cellClass
}

// renderCell
function renderCell(i, j) {
  var currCell = gBoard[i][j]
  var cellSelector = '.' + getClassName(i, j)
  var elCell = document.querySelector(cellSelector)
  var value

  if (currCell.isMarked) {
    value = FLAG
  } else {
    if (gCancelMark) {
      value = ``
      gCancelMark = false
      elCell.innerHTML = value
      elCell.classList.remove(`shown`)
      return
    } else if (currCell.isMine) value = MINE
    else if (currCell.minesAroundCount === 0) value = EMPTY
    else if (currCell.minesAroundCount > 0) value = currCell.minesAroundCount
  }

  elCell.innerHTML = value
  elCell.classList.add(`shown`)
}

function renderSmiley(value) {
  var elSmiley = document.querySelector(`.smileyBtn`)
  elSmiley.innerHTML = value
}

function renderLive(lives) {
  var elLives = document.querySelector(`.lives`)
  var strLives = ''

  for (var i = 0; i < lives; i++) {
    strLives += LIVE
  }

  elLives.innerHTML = strLives
}

// onCellClicked
function onCellClicked(elCell, i, j) {
  var currCell = gBoard[i][j]

  if (!gGame.isOn || currCell.isShown || currCell.isMarked) return

  gGame.moveCount++

  if (gGame.moveCount === 1) {
    placeMines(i, j)
    setMinesNegsCount()
  }

  if (currCell.isMine) {
    gGame.liveCount--

    renderSmiley(LOSS_SMILEY)
    setTimeout(renderSmiley, 1000, FUN_SMILEY)

    renderLive(gGame.liveCount)

    if (gGame.liveCount > 0) return
    elCell.classList.add(`exploded`)
  }

  currCell.isShown = true

  if (currCell.minesAroundCount === 0 && !currCell.isMine)
    expandShown(elCell, i, j)

  gGame.shownCount++

  renderCell(i, j)

  checkGameOver(elCell, i, j)
}

// onCellMarked
function onCellMarked(e, elCell, i, j) {
  e.preventDefault()

  var currCell = gBoard[i][j]

  if (!gGame.isOn || currCell.isShown) return

  gGame.moveCount++

  if (currCell.isMarked) {
    currCell.isMarked = false
    gGame.markedCount--

    gCancelMark = true

    if (currCell.isMine) {
      gGame.minesMarkedCount--
    }
  } else {
    currCell.isMarked = true
    gGame.markedCount++

    if (currCell.isMine) {
      gGame.minesMarkedCount++
    }
  }

  renderCell(i, j)

  checkGameOver(elCell, i, j)
}

// expandShown
function expandShown(elCell, locationI, locationJ) {
  for (var i = locationI - 1; i <= locationI + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue

    for (var j = locationJ - 1; j <= locationJ + 1; j++) {
      if (i === locationI && j === locationJ) continue
      if (j < 0 || j >= gBoard[i].length) continue

      var currCell = gBoard[i][j]

      if (currCell.isShown === false && currCell.isMarked === false) {
        gGame.shownCount++
        currCell.isShown = true
      }

      renderCell(i, j)
    }
  }
}

// checkGameOver
function checkGameOver(elCell, i, j) {
  if (
    gGame.minesMarkedCount + gGame.shownCount === gLevel.SIZE ** 2 &&
    gGame.markedCount === gGame.minesMarkedCount
  ) {
    renderSmiley(VICTORY_SMILEY)
    gGame.isOn = false
  } else if (elCell.classList.contains(`exploded`)) {
    for (var m = 0; m < gMines.length; m++) {
      var currCell = gMines[m]
      i = currCell.locationI
      j = currCell.locationJ

      currCell.isShown = true

      currCell.isMarked = false
      renderCell(i, j)
    }
    setTimeout(renderSmiley, 1000, LOSS_SMILEY)
    gGame.isOn = false
  }
}

function showUndo() {
  console.log(`i do it with bugs and than i cut it`)
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
}
