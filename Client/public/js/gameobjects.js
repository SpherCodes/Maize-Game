// gameObjects.js
// constants.js
const BALL_RADIUS_FACTOR = 4;
const END_RADIUS_FACTOR = 3;
const LINE_WIDTH = 5;

export class Player {
    constructor(gameId, name) {
        this.gameId = gameId;
        this.name = name;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.Totalscore = 10;
        this.hasReachedEnd = false;
        this.position = this.generateRandomStartPosition();
        this.colour = this.generateRandomColour();
        this.time = null;
    }

    generateRandomColour() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }
    generateRandomStartPosition(canvasWidth = 780, canvasHeight = 600) {
        const ballRadius = canvasWidth / (BALL_RADIUS_FACTOR * 60); // Assuming cellSize is about 1/10 of canvas width
        const corners = [
            { x: ballRadius, y: ballRadius },                                    // Top-left corner
            { x: canvasWidth - ballRadius, y: ballRadius },                      // Top-right corner
            { x: ballRadius, y: canvasHeight - ballRadius },                     // Bottom-left corner
            { x: canvasWidth - ballRadius, y: canvasHeight - ballRadius }        // Bottom-right corner
        ];
    
        // Randomly pick one of the four corners
        const randomCornerIndex = Math.floor(Math.random() * 4);
        return corners[randomCornerIndex];
    }
    
    

    incrementScore(points) {
        this.score += points;
    }
}

export class Round {
    constructor(game) {
        this.isOngoing = false;
        this.roundEndTime = 0;
        this.timer = null;
        this.points = 0
        this.game = game;
    }

    start() {
        this.isOngoing = true;
       this.startTimer();
    }

    end() {
        this.isOngoing = false;
         this.endTime = new Date();
    }
    startTimer() {
        this.timer = setInterval(() => {
            const timeLeft = this.roundEndTime - Date.now();
            if (timeLeft < 0) {
                clearInterval(this.timer);
                this.end();
            } else {
                this.timer = Math.ceil(timeLeft / 1000);
            }
        }, 1000);
    }
    
}

export class Game {
    constructor(id) {
        this.id = id;
        this.rounds = [];
        this.status = "waiting";
        this.currentRound = null;
        this.players = [];
    }
    Addplayer(player){
        this.players.push(player);
    }
    Startgame(){
        this.startNewRound();
    }
    startNewRound(durationInSeconds = 120) {
        const newRound = new Round(this.rounds.length);
        newRound.roundEndTime = Date.now() + durationInSeconds * 1000;
        this.currentRound = newRound;
        this.rounds.push(newRound);
        newRound.start();
    }
    

    endCurrentRound() {
        const currentRound = this.rounds[this.rounds.length - 1];
        if (currentRound.isOngoing) {
            currentRound.end();
        }
    }
    
}
