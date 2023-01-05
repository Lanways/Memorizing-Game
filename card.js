const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished',
}
//----------------常數儲存的資料不會變動，因此習慣上將首字母大寫以表示此特性---------------
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]
//--------------------view--------------------------
const view = {
  // 0-12：黑桃 1-13
  // 13 - 25：愛心 1 - 13
  // 26 - 38：方塊 1 - 13
  // 39 - 51：梅花 1 - 13
  // getCardElement(1)
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    // console.log(number)
    const symbol = Symbols[Math.floor(index / 13)]
    return `<p>${number}</p>
    <img src="${symbol}" />
      <p>${number}</p>`
  },
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  //------------處理數字轉換--------------------------------------
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  // displayCards: function displayCards () {}
  // Tips:當物件的屬性與函式/變數名稱相同時，可以省略不寫
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    //-----------------for迴圈的方式-------------------------
    // let render = []
    // for (let number = 0; number <= 51; number++) {
    //   const card = this.getCardElement(number)
    //   render.push(card)
    // }
    // rootElement.innerHTML = render.join('')
    //-----------------for迴圈的方式end-----------------------
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  //把參數變成陣列
  //cards = [1,2,3,4,5]
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        //回傳正面
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })


  },
  pairCards(...card) {
    card.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector(".socre").textContent = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`;
  },
  //----------------動畫
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animation', event => 
      event.target.classList.remove('wrong'), { once: true })
    }) 
  },
  //----------------gameover
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}
//--------------------model--------------------------
const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,

  triedTimes: 0
}
//--------------------controller--------------------------
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  //依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        //判斷配對成功
        if (model.isRevealedCardsMatched()) {
          //配對正確
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          //setTimeout要的是function本身不需帶入參數
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('current state:', this.currentState)
    console.log('revealed cards:', model.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    //this.currentState = GAME_STATE.FirstCardAwaits
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}
controller.generateCards()
// Node List (array-like) 不是真的array不是用map
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    // view.appendWrongAnimation(card)
    controller.dispatchCardAction(card)
  })
})
