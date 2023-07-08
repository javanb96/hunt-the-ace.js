/* eslint-disable no-unused-vars */
// Create Cards Dynamically - JS Code
// We have created the cards statically using html, now let's do that dynamically using JS

// Let's create an array of objects where each object in the array denotes a card or a card definition
// array
const cardObjectDefinitions = [
	// each object has an ID property and an image path property
	// the first item is the King of Hearts and has an ID of 1
	// object
	{ id: 1, imagePath: '/images/card-KingHearts.png' },
	{ id: 2, imagePath: '/images/card-JackClubs.png' },
	{ id: 3, imagePath: '/images/card-QueenDiamonds.png' },
	{ id: 4, imagePath: '/images/card-AceSpades.png' },
]

// declare global const of ace of spades id
const aceId = 4

const cardBackImgPath = '/images/card-back-blue.png'

// we will use this const to alter positions of grid cells
const cardContainerElem = document.querySelector('.card-container')

// lets write code to create a global variable that will store a reference to an array of the card elements
let cards = []

// lets store a reference to our start game button element in a global const
// this is the element that is updated with status information dynamically through our code at appropriate points during a game
const playGameButtonElem = document.getElementById('playGame')

// within loadGame method use js method addEventListener to add a click event handler to the start game button when user clicks start game button

// lets create a constant to store the grid area templates value that will be assigned to the grid area templates property to cause the grid to collapse as it were
const collapsedGridAreaTemplate = '"a a" "a a"'

// lets create a global constant that stores the class of the div element that represents the grid cell
// that will be the only cell in the grid once we modify the grid area templates property appropriately
// we are choosing the first cell in the grid to contain our stacked cards
const cardCollectionCellClass = '.card-pos-a'

const numCards = cardObjectDefinitions.length

// lets create a global variable that stores an array of card positions within the grid
let cardPositions = []

// we will set the values appropriately as we develop the game
let gameInProgress = false
let shufflingInProgress = false
let cardsRevealed = false

// updateStatusElement(currentGameStatusElem, "block", winColor, "Hit!! - Well Done!! :)")
// declare global staement for currentGameStatusElem
const currentGameStatusElem = document.querySelector('.current-status')
// global const to store container element for score
const scoreContainerElem = document.querySelector('.header-score-container')
// global const to store score element
const scoreElem = document.querySelector('.score')
// global const to store round element
const roundContainerElem = document.querySelector('.header-round-container')
// global const to store the round element
const roundElem = document.querySelector('.round')

// if user guesses correct card we want to output text in a green color, and if incorrect a red color
const winColor = 'green'
const loseColor = 'red'
const primaryColor = 'black'

// lets declare and initialize three global variables
let roundNum = 0
let maxRounds = 4
let score = 0

// the gameObj object where the score and the round number will be stored will have global scope
let gameObj = {}

// declare local storage key
const localStorageGameKey = 'HTA'

// here we can see the static html code that we created earlier to represent a card so that we can see what we are creating in code dynamically

{/*
<div class="card">
    <!--child div element-->
    <div class="card-inner">
        <!--two child div element-->
        <!--first child div element-->
        <div class="card-front">
            <img src="/images/card-JackClubs.png" alt="" class="card-img" />
        </div>
        <!--second child div element-->
        <div class="card-back">
            <img src="images/card-back-Blue.png" alt="" class="card-img" />
        </div>
    </div>
</div>
*/}

// Load Game and Start Game
// createCards()
loadGame()

// lets write a method named gameOver so when it is game over we want the score and round numbers to be hidden
function gameOver() {
	updateStatusElement(scoreContainerElem, 'none')
	updateStatusElement(roundContainerElem, 'none')

	// template literals documentation
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
	// displays game over message, and final score
	const gameOverMessage = `Game Over! Final Score - <span class='badge'>${score}</span> Click 'Play Game' button to play again`

	// we also want a game over message to be displayed to the user
	updateStatusElement(currentGameStatusElem,'block',primaryColor,gameOverMessage)

	// end the game and reengage the play game button
	gameInProgress = false
	playGameButtonElem.disabled = false
}

// to complete the choose card functionality we need to execute appropriate code that tests to see if the final round the fourth round has been reached by the user so lets write a method named end round
function endRound() {
	// lets use the setTimeout function to ensure that if the game is not yet over that the next round begins in three seconds or if the game is over that appropriate output text is presented to the user and a new round is not started
	setTimeout(() => {
		if (roundNum == maxRounds) {
			gameOver()
			return
		} else {
			startRound()
		}
	},3000)
}

// Choose Card
// lets create functionality so that when a user makes a choice and clicks on the back of the card that the user believes to be the Ace of Spades that the card that is chosen flips to the front and the user is made aware of whether the users choice is correct or not
// if the users choice is correct the user is awarded points depending on the relevant round number
// if the users choice is incorrect the user is awarded no points
// lets create a method named chooseCard
function chooseCard(card) {
	if (canChooseCard()) {
		evaluateCardChoice(card)
		// lets write the code that saves the data pertaining to a game after the user has selected a card
		saveGameObjectToLocalStorage(score, roundNum)

		// when a card is chosen by the user we want the relevent card to flip so we call flipCard method
		flipCard(card, false)
		// three seconds later we want all the cards to be revealed in case the user chooses incorrectly
		// here we use js setTimout method
		setTimeout(() => {
			flipCards(false)
			updateStatusElement(currentGameStatusElem, 'block', primaryColor, 'Card positions revealed')

			endRound()

		},3000)
		cardsRevealed = true
	}

}

// the number of points to add to the score depends on the round number so if roundNum variable is 1 add 100 points if 2 add 50 points, 3 add 25, else add 10
function calculateScoreToAdd(roundNum) {
	if (roundNum == 1) {
		return 100
	} else if (roundNum == 2) {
		return 50
	} else if (roundNum == 3) {
		return 25
	} else {
		return 10
	}
}

// the calculateScore method discovers the number of points too add to the users score through a call to the calculateScoreToAdd method
function calculateScore() {
	const scoreToAdd = calculateScoreToAdd(roundNum)
	score = score + scoreToAdd
}
// lets write the code for the updateScore method
// it calls the calculateScore method
function updateScore() {
	calculateScore()
	// updates the score and presents it to the user
	updateStatusElement(scoreElem, 'block', primaryColor, `<span class='badge'>${score}</span>`)

}

// lets create a method named updateStatusElement
// at times we only want to make the current status visible or invisible without updating the relevant elements text so if the calling code passes in only two arguements we can set the display appropriately
// however if the calling code passes in more than two arguements this indicates that the calling code wishes to update the text of the relevant element and possibly update the color of the element too
// this is a technique we can use in js for method overloading
function updateStatusElement(elem, display, color, innerHTML) {
	elem.style.display = display

	if (arguments.length > 2) {
		elem.style.color = color
		elem.innerHTML = innerHTML
	}
}

// lets write a reusable function to output feedback to the user so if the user hits the target outputs an appropriate message for winning/losing choices
function outputChoiceFeedBack(hit) {
	if (hit) {
		updateStatusElement(currentGameStatusElem, 'block', winColor, 'Hit!! - Well Done!! :)')
	} else {
		updateStatusElement(currentGameStatusElem, 'block', loseColor, 'Missed!! :(')
	}
}

// the next functionaity we want to express in code is the evaluation functionality which evaluates the users choice
// lets write a function named evaluateCardChoice
function evaluateCardChoice(card) {
	// this function is responsible forevaluating whether the card that th user chooses is the Ace of Spades or not
	if (card.id == aceId) {
		updateScore()
		outputChoiceFeedBack(true)
	} else {
		outputChoiceFeedBack(false)
	}
}


// lets create a method called canChooseCard which will be called in the chooseCard method
function canChooseCard() {
	// there are certain states that the game will be in whee we dont want the user to click on the back of the cards for example when the cards are shuffling so we dont want the chooseCard functionality executed while the cards are in motion
	// so canChooseCard will return a boolean valueto the calling code to indicate to the calling code that the game is in the right state where the chooseCard functionality can run
	// so basically if the game is in process and the shuffling process is not in progress and the cards are not in the process of being revealed the expression returns true
	// the user is able to choose a card when the expression returns false the functionality in the choose card method will not be executed if a card is clicked otherwise
	return gameInProgress == true && !shufflingInProgress && !cardsRevealed
	// lets declare and initialize the variables involved in the expression globally
}

// lets write a method called loadGame
// the method is called when the game is first launched so we want our cards to be created dynamically when the game is first launched
function loadGame() {
	createCards()

	// lets write code to assign the results of a query for all card elements to our card's global array variable
	cards = document.querySelectorAll('.card')

	// we want fly-in effect when we first launch so we call it here in the loadGame method
	cardFlyInEffect()

	// lets write code to wire up a click event to the start game button element that we just created within our html code
	playGameButtonElem.addEventListener('click', ()=>startGame())

	// hides the score and round stats when game is inactive
	updateStatusElement(scoreContainerElem, 'none')
	updateStatusElement(roundContainerElem, 'none')

}
// lets create a function called checkForIncompleteGame
function checkForIncompleteGame() {
	// this method checks local storage for a unique key
	// if the relevant key exists in local storae then that means the user has data for an incomplete game saved to local storage
	const serialedGameObj = getLocalStorageItemValue(localStorageGameKey)
	// if the relevant local storage item exists we want to ask the user if they wish to continue with the relevant unfinished game
	// we use the confirm js dialog for this purpose
	if (serialedGameObj) {
		gameObj = getObjectFromJSON(serialedGameObj)
		// if the user presses ok then our code will update the score and round number from the previous incomplete game saved to local storage. else the score and round number will be initialized to zero which means the user has chosen to start a new game
		if (gameObj.round >= maxRounds) {
			removeLocalStorageItem(localStorageGameKey)
		} else {
			if (confirm('Would you like to continue with your last game?')) {
				score = gameObj.score
				roundNum = gameObj.round
			}
		}
	}
}


// lets write a method called startGame
// this method will be called when a user clicks a button used for starting a game otherwise known as the gameplay button lets go to our html file and include a button element that the user can click to start the game
function startGame() {
	initializeNewGame()
	startRound()
	// event listener test
	// alert('')

}

// lets write a definition for a method that will be called when a new round is started
function initializeNewGame() {
	score = 0
	roundNum = 0

	checkForIncompleteGame()

	shufflingInProgress = false

	// whhen a new game is started we want to make the score and round container elements visible
	updateStatusElement(scoreContainerElem, 'flex')
	updateStatusElement(roundContainerElem, 'flex')

	// update score and round elements with appropriate values
	updateStatusElement(scoreElem, 'block', primaryColor, `Score <span class='badge'>${score}</span>`)
	updateStatusElement(roundElem, 'block', primaryColor, `Round <span class='badge'>${roundNum}</span>`)
}

// let's write a definition for a method that will be called when a new round is started
function startRound() {
	// lets call our initializeNewRound method
	initializeNewRound()
	// lets call our collectCards method
	collectCards()
	// lets call flipCards method
	// lets comment out flip cards method to see if the positions of the cards are being randomized by our shuffle functionality
	flipCards(true)
	// lets call shuffleCards method
	shuffleCards()

}

// lets write a definition for a method that will initialize a new round
function initializeNewRound() {
	// increment roundNum
	roundNum++
	// disable gameplay button
	playGameButtonElem.disabled = true

	gameInProgress = true
	shufflingInProgress = true
	cardsRevealed = false

	// update shuffle status of game
	updateStatusElement(currentGameStatusElem, 'block', primaryColor, 'Shuffling...')

	// when a new round has started we want to update the round element appropriately
	updateStatusElement(roundElem, 'block', primaryColor, `Round <span class='badge'>${roundNum}</span>`)

}

// Stack Card

// so when the user clicks the start game button and before the cards are shuffled i.e. their positions are randomized we want the user to see the cards stacked one on top of the other and positioned centrally within the gameplay area i.e. the grid so we are going to first collapse the grid
// as it were the collapse grid functionality simply involves modifying the grid area template property so the grid consists of just one one cell then our code will add the cards to this one cell
// to achieve this lets create a method named collectCards
function collectCards() {
	// lets create a global constant collapsedGridAreaTemplate and cardCollectionCellClass
	// lets call a method named transformGridArea and pass the approprtiate global constant we have just declared as an arguement to the transform grid area method
	transformGridArea(collapsedGridAreaTemplate)
	// lets call our addCardsToGridAreaCell method
	addCardsToGridAreaCell(cardCollectionCellClass)
}

// lets write transformGridArea method
function transformGridArea(areas) {
	// using the cardContainerElem element that contains the grid cells which has been designated through appropriate css code as our grid lets change its grid template area property using appropriate js
	cardContainerElem.style.gridTemplateAreas = areas
}

// next write a method to add the cards to the cell that at this point takes up the entire grid so the grid now consists of only one cell
function addCardsToGridAreaCell(cellPositionClassName) {
	const cellPositionElem = document.querySelector(cellPositionClassName)

	cards.forEach((card, _index) =>{
		addChildElement(cellPositionElem, card)
	})

}

// create a method named flipCard
// this method accepts two arguments
// the first argument will store the relevant card element
// the second argument will contain the boolean flip to back value
function flipCard(card, flipToBack) {
	// so we know the inner card element is the element that is used for creating the flip effect so the inner element is the first child contained within the card element
	// so we can use the relevant card elements first child property to reference the inner card element
	// the logic is if the flip to back argument is true and the inner card element oesnt contain the flipped class then add the flip it class to the inner card element
	// if the card is already back facing then ewe dont want to flip the card
	// so we want the card to have its back facing the user else if the inner card element contains the flip it class we want to remove it
	const innerCardElem = card.firstChild

	if (flipToBack && !innerCardElem.classList.contains('flip-it')) {
		innerCardElem.classList.add('flip-it')
	} else if (innerCardElem.classList.contains('flip-it')) {
		innerCardElem.classList.remove('flip-it')
	}

}

// create a method named flipCards
// contains one parameter if the card is on it's front and the flip to back arguement is true our code will flip the card so that  back faces the user
function flipCards(flipToBack) {
	cards.forEach((card, index)=>{
		setTimeout(()=>{
			flipCard(card,flipToBack)
		},index * 100)
	})
}

// Shuffle Cards
// now we want to randomize the positions of the cards so let's create a method named shuffle cards
// we are going to use js set interval method to run a function named shuffle so every 12 milliseconds (ms) the shuffle method will execute

// lets create a method called cardFlyInEffect that removes the card.fly-in class from the card elements at controlled time intervals we use js setInterval method to call the flyIn method at a pre-defined interval
function cardFlyInEffect() {
	const id = setInterval(flyIn, 5)
	let cardCount = 0

	let count = 0

	// then we are further controlling when the fly-in class is removed from the relevant card element through the use of an if statement
	function flyIn() {
		count++
		if (cardCount == numCards) {
			clearInterval(id)
			// add button display inline-block after fly-in completes
			playGameButtonElem.style.display = 'inline-block'
		} if (count == 1 || count == 250 || count == 500 || count == 750) {
			cardCount++
			let card = document.getElementById(cardCount)
			card.classList.remove('fly-in')
		}
	}
}

// once shuffle is completed we want to make sure that none of the card elements contain the shuffle left class or the shuffle right class
// this wont work without transition code in the css file
function removeShuffleClasses() {
	cards.forEach((card) => {
		card.classList.remove('shuffle-left')
		card.classList.remove('shuffle-right')
	})
}

// Animation
// lets create an illusion that the cards are being shuffled
// lets create a method named animateShuffle that contains a parameter a numeric argument will be passed to this parameter which will be a numeric value that is incremented for every time the shuffle function is called
function animateShuffle(shuffleCount) {
	// lets create code to generate two random numbers between one and four
	const random1 = Math.floor(Math.random() * numCards) + 1
	const random2 = Math.floor(Math.random() * numCards) + 1

	// lets reference two cards of our four cards randomly through the two random numbers that we are generating in this method then we can modify the positions of the cards and the relevent card element z-index properties
	let card1 = document.getElementById(random1)
	let card2 = document.getElementById(random2)

	// then we can modify the positions of the cards and the relevent card element z-index properties
	if (shuffleCount % 4 == 0) {
		card1.classList.toggle('shuffle-left')
		card1.style.zIndex = 100
	} if (shuffleCount % 10 == 0) {
		card2.classList.toggle('shuffle-right')
		card2.style.zIndex = 200
	}
}

function shuffleCards() {
	// lets use a variable named shuffleCount to count the amount of times the shuffle method is called.
	let shuffleCount = 0
	const id = setInterval(shuffle, 12)

	function shuffle() {
		// lets call a method named randomize card positions
		randomizeCardPositions()
		// this randomized card positions method will continuously be called until the clearInterval js method is executed
		// at this point the position of the card should be unpredictable to the user

		// call the animateShuffle method
		animateShuffle(shuffleCount)

		// when the shuffle count variable is equal to 500 we can use js clearInterval method to stop the shuffle method being called
		if (shuffleCount == 500) {
			clearInterval(id)

			// we need to set the shuffle and progress variable to false at this point in the code. this code executes one the shuffle process is completed
			shufflingInProgress = false
			removeShuffleClasses()
			// call the dealCards method
			dealCards()

			// we also want appropriate output text shown to the user
			updateStatusElement(currentGameStatusElem, 'block', primaryColor, 'Please click the card that you think is the Ace of Spades...')
		} else {
			// the shuffleCount variable is incremented every time the shuffle function is called
			shuffleCount++
		}
	}
}

// we are going to create a method to randomize the positions of the cards within the shuffle function
function randomizeCardPositions() {
	// we want two random numbers generated and we will do this using js math.random functionality appropriately so that we generate a random whole number between 1 and 4
	const random1 = Math.floor(Math.random() * numCards) + 1
	const random2 = Math.floor(Math.random() * numCards) + 1

	// then we can use these two random numbers to swap the positions value for the relevant cards within the card positions array
	const temp = cardPositions[random1 - 1]

	cardPositions[random1 - 1] = cardPositions[random2 - 1]
	cardPositions[random2 - 1] = temp

	// this creates a shuffle-like effect for our four cards
}

// Deal Cards
// I want to create a method named dealCards that will execute when shuffleCount = 500 so dealCards will be called after shuffling or randomizing of the card positions is complete
// the dealCards method will in effect restore the grid to contain four grid cells and add each card to their original positions in the grid
// the div elements that make up the grid i.e. he grid cells will then have their positions within the grid altered in accordance with the random positions stored in the card positions array
// this randomization of their positions was of course caused through the randomization functionality executed within the randomizedCardPositions method
function dealCards() {
	// lets call the addCardsToAppropriateCell method
	addCardsToAppropriateCell()
	// this will in effect restore the grid back to its original state with four cells and each cell containing a card element the grid cells will at this point be in their original order
	// lets call a method named returnGridAreasMappedToCardPos
	const areasTemplate = returnGridAreasMappedToCardPos()
	// this method will return a grid area template value containing a new positional configuration of the grid cells basd on the randomized positions now stored in the card positions array
	// this randomization of positions was caused through the execution of the randomized card positions method called from within the shuffle method

	// we can then transform the grid as it were to change the positions of the grid cells by assigning the grid the new grid area template value returned from the returned grid areas mappedToCardPos method
	transformGridArea(areasTemplate)
}

// lets create the returnGridAreasMappedToCardPos method
// this method simply generates a grid area template that contains a new position configuration for the cells in the grid based on the random positions generated through our shuffle functionality Stored within the card positions array
//
function returnGridAreasMappedToCardPos() {
	let firstPart = ''
	let secondPart = ''
	let areas = ''

	// conditional statement
	cards.forEach((_card, index) => {
		if (cardPositions[index] == 1) {
			areas = areas + 'a '
		} else if (cardPositions[index] == 2) {
			areas = areas + 'b '
		} else if (cardPositions[index] == 3) {
			areas = areas + 'c '
		} else if (cardPositions[index] == 4) {
			areas = areas + 'd '
		}
		if (index == 1) {
			firstPart = areas.substring(0, areas.length - 1)
			areas = ''
		} else if (index == 3) {
			secondPart = areas.substring(0, areas.length - 1)
		}

	})
	// be sure return statement is outside of the conditional statement
	return `"${firstPart}" "${secondPart}"`
	// notice im using the backtick characters to envelop the value returned from the returned gridAreasMappedToCardPos method
	// these characters allow us to interpolate a string by appropriately using the dollar symbol and curly brackets to wrap the relevant variables.
	// link for more information on string interpolation
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#string_interpolation
}

// lets create a function called addCardsToAppropriateCell
function addCardsToAppropriateCell() {
	// lets call the addCardToGridCell and pass in each card element to the add card to grid cell method within a loop that traverses all of the card elements
	cards.forEach((card) => {
		addCardToGridCell(card)
	})
}

// Let's write a method called createCards that will loop through each of the objects stored within the card object definitions array, create the relevant cards and add the card to their appropriate grid positions
function createCards() {
	// calls the create card method within the for each loop that loops through each card definition to create the cards dynamically and add the cards to their appropriate position within the grid
	cardObjectDefinitions.forEach((cardItem) => {
		createCard(cardItem)
	})
}

// Let's create a function named createCard
// This function is responsible for creating a card dynamically through JavaScript code
function createCard(cardItem) {
	// const cardElem = document.createElement('div')
	// Let's use the create element method to create the div tags/elements that make up a card
	const cardElem = createElement('div')
	// so basically we have a card element, an inner card element within the card element, and a front and back card element within the inner card element
	const cardInnerElem = createElement('div')
	const cardFrontElem = createElement('div')
	const cardBackElem = createElement('div')

	// create front and back image elements for a card
	const cardFrontImg = createElement('img')
	const cardBackImg = createElement('img')

	// adds class to card element
	addClassToElement(cardElem, 'card')

	// call code to add the fly-in css class to the card element
	addClassToElement(cardElem, 'fly-in')

	// i'll create a card method that accepts one arguement which will be an item from the card object definitions array
	// adds id to card element
	addIdToElement(cardElem, cardItem.id)

	// add class to inner card element
	addClassToElement(cardInnerElem, 'card-inner')

	// add class to front card element
	addClassToElement(cardFrontElem, 'card-front')

	// add class to back card element
	addClassToElement(cardBackElem, 'card-back')

	// add src attribute and appropriate value to img element - back of card

	// before we assign the image path properties for the card to the appropriate image elements lets create a const to store the path for the image that represents the back of a card
	// addSrcToImageElem(cardBackElem, cardBackImgPath) *incorrect
	addSrcToImageElem(cardBackImg, cardBackImgPath)

	// add src attribute and appropriate value to img element - front of card
	// addSrcToImageElem(cardFrontElem, cardItem.imagePath) *incorrect
	addSrcToImageElem(cardFrontImg, cardItem.imagePath)


	// assigns class to back image element of back of card
	// addClassToElement(cardBackElem, 'card-img') *incorrect
	addClassToElement(cardBackImg, 'card-img')


	// assigns class to front image element of front of card
	// addClassToElement(cardFrontElem, 'card-img') *incorrect
	addClassToElement(cardFrontImg, 'card-img')


	// add front image element as child element to front card element
	addChildElement(cardFrontElem, cardFrontImg)

	// add back image element as child element to back card element
	addChildElement(cardBackElem, cardBackImg)

	// add front card element as child element to inner card element
	addChildElement(cardInnerElem, cardFrontElem)

	// add back card element as child element to inner card element
	addChildElement(cardInnerElem, cardBackElem)

	// add inner card element as child element to card element
	addChildElement(cardElem, cardInnerElem)

	// lets create a global const and store a reference to the card-container element
	// each grid cell will contain one of our cards. the cells of the grid are child elements of the card container element.
	// we are using the CSS Grid system for grid functionality which represents gameplay area

	// Initialize Card Positions

	// add card element as child element to appropriate grid cell
	addCardToGridCell(cardElem)

	// call initializeCardPositions so each initial position of the card is established when the game is first loaded through the relevant card elements id
	initializeCardPositions(cardElem)

	// call attatchClickEventHandlerToCard
	attatchClickEventHandlerToCard(cardElem)

}

// Reusable functions or methods for createCard()

// in order for choose card method to be executed in response to user click we need an event listener on each card element
function attatchClickEventHandlerToCard(card) {
	card.addEventListener('click', () => chooseCard(card))
}

// lets write a method named initializeCardPositions that contains the code to store the initial positions of the cards in the grid
// the gameplay area within the cards positions array
function initializeCardPositions(card) {
	cardPositions.push(card.id)
}

// Let's create a reusable function responsible for creating an html element and name it createElement
function createElement(elemType) {
	// we can create a html element through the line of code on line 36
	return document.createElement(elemType)
}

// let's create a reusable method that adds a class to a html element
function addClassToElement(elem, className) {
	elem.classList.add(className)
}

// let's write a method that adds an id to an html element so each card will be assigned a unique id that will come from the array of card object definitions created earlier
function addIdToElement(elem, id) {
	elem.id = id
}

// lets write a reusable method that assigns a path for the relevant image to the src attribute of an image element
function addSrcToImageElem(imgElem, src) {
	imgElem.src = src
}

// now that we have our basic elements created in code let's assign the child elements appropriately to their parent elements
// lets create a reusable method named add child element
function addChildElement(parentElem, childElem) {
	parentElem.appendChild(childElem)
}

// lets create a method named addCardToGridCell
function addCardToGridCell(card) {
	// finds the appropriate parent element for the child card element using the mapCardIdToGridCell method then adds the child card element to it's designated parent element
	const cardPositionClassName = mapCardIdToGridCell(card)

	const cardPosElem = document.querySelector(cardPositionClassName)

	addChildElement(cardPosElem, card)
}

// lets create a method called mapCardIdToGridCell to call in the addCardToGridCell method
function mapCardIdToGridCell(card) {
	// if card id is 1 we want it to be added as child element to first position in the grid which is denoted by a div element with card-pos-a CSS class
	if (card.id == 1)
	{
		return '.card-pos-a'
	}
	// if card id is 2 we want it to be added as child element to second position in the grid which is denoted by a div element with card-pos-b CSS class
	else if (card.id == 2)
	{
		return '.card-pos-b'
	}
	// if card id is 3 we want it to be added as child element to third position in the grid which is denoted by a div element with card-pos-c CSS class
	else if (card.id == 3)
	{
		return '.card-pos-c'
	}
	// if card id is 4 we want it to be added as child element to fourth position in the grid which is denoted by a div element with card-pos-d CSS class
	else if (card.id == 4)
	{
		return '.card-pos-d'
	}
}

// Local Storage
// so our game is pretty much complete but id like to include functionality so that if a user closes the browser for some reason before the user completes a game that the user is able to continue the game when the game is launched at a later point in time.
// we create this functionality by using local storage. this allows us to persist data to our browser through our javascript code when the browser is closed
// the data stored in local storage is not lost and can be retrieved from local storage through js code at a later time when the relevant game or application is launched in the user's browser.
// lets write a few reusable methods to abstract common local storage related functionality
// local storage function
// lets create a method called getSerializedObjectAsJSON
function getSerializedObjectAsJSON(obj) {
	// so we are going to persist an object to local storage in JSON format
	// so when we pass an object to this method it will return a string value in JSON format that represents the object passed into this method
	// we will then be able to save the returned string to local storage
	return JSON.stringify(obj)
}

// lets create a method named getObjectFromJSON
function getObjectFromJSON(json) {
	// when we read the json formatted string from local storage we are going to want to convert the json string back into a javascript object so that we can use the object in our javascript code
	return JSON.parse(json)
}

// lets create a method named updateLocalStorage
function updateLocalStorageItem(key, value) {
	// this method saves a key, value pair to local storage
	// you can see the first parameter is the key which is the unique identifier for the value that will be passed into the second parameter which will of course be a string in json format representing a javascript object
	localStorage.setItem(key, value)
}

// lets create a method called removeLocalStorageItem
function removeLocalStorageItem(key) {
	// this function removes a local storage item
	localStorage.removeItem(key)
}

// lets create a helper method that returns a value from local storage based on the key argument passed into this method
function getLocalStorageItemValue(key) {
	// eslint-disable-next-line no-undef
	return localStorage.getItem(key)
}

// lets write a method named updateGameObject
function updateGameObject(score, round) {
	// the object that we are going to persist to local storage contains the score and the round number pertaining to the relevant game object
	// this method can be used to update the relevant game object
	// the gameObj object where the score and the round number will be stored will have global scope
	gameObj.score = score
	gameObj.round = round
}

// lets create a method that will handle saving the game object to local storage
function saveGameObjectToLocalStorage(score, round) {
	updateGameObject(score, round)
	// eslint-disable-next-line no-undef
	updateLocalStorageItem(localStorageGameKey, getSerializedObjectAsJSON(gameObj))
}