const BALL_RADIUS_FACTOR = 4;
const END_RADIUS_FACTOR = 3;
const LINE_WIDTH = 5;

export class Player {
    constructor(gameId, name) {
        this.gameId = gameId;
        this.name = name;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.score = 0; 
        this.hasReachedEnd = false;
        this.position = this.generateRandomStartPosition();
        this.colour = this.generateRandomColour();
    }
    

    generateRandomColour() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    generateRandomStartPosition(canvasWidth = 780, canvasHeight = 600) {
        const ballRadius = canvasWidth / (BALL_RADIUS_FACTOR * 10);  // Adjusted to scale properly with canvas size
        const padding = ballRadius + 10;  // Additional padding to avoid boundary issues
    
        const corners = [
            { x: padding, y: padding },                                     // Top-left corner
            { x: canvasWidth - padding, y: padding },                       // Top-right corner
            { x: padding, y: canvasHeight - padding },                      // Bottom-left corner
            { x: canvasWidth - padding, y: canvasHeight - padding }         // Bottom-right corner
        ];
    
        // Randomly pick one of the four corners
        const randomCornerIndex = Math.floor(Math.random() * 4);
        return corners[randomCornerIndex];
    }
    

}

export class Round {
    constructor(game) {
        this.isOngoing = false;
        this.roundEndTime = 0;
        this.timer = null;
        this.game = game;
        this.remainingTime = 0;
    }

    start() {
        this.isOngoing = true;
        if(this.rounds > 0){
            this.position = generateRandomStartPosition();
        }
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
                this.remainingTime = Math.ceil(timeLeft / 1000);
                
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

    Addplayer(player) {
        this.players.push(player);
    }

    Startgame() {
        this.startNewRound();
        this.players[0].velocity = { x: 0, y: 0 };
        this.players[0].acceleration = { x: 0, y: 0 };
        this.status = "Ongoing";
    }

    StopGame() {
        this.status = "stopped";
        this.isOngoing = false;
    }
    hasWon(){
        this.hasReachedEnd = true;
        console.log(this.currentRound)
        //this.end();
    }

    startNewRound() {
        const durationInSeconds = this.calculateroundtime();  // Get round-specific duration
        const newRound = new Round(this);  // Create a new round with the game reference
        newRound.roundEndTime = Date.now() + durationInSeconds * 1000;  // Set round end time in milliseconds
        this.currentRound = newRound;
        this.rounds.push(newRound);
        newRound.start();  // Start the round timer
    }

    endCurrentRound() {
        const currentRound = this.rounds[this.rounds.length - 1];
        if (currentRound.isOngoing) {
            currentRound.end();
        }
    }
    Calculatepoints(player){
        if(this.rounds.length == 1){
            player.score = 10;
            return;
        }
        else if(this.rounds.length == 2){
            player.score = 20;
            return;
        }
        else if(this.rounds.length == 3){
             player.score = 30;
            return;
        }
    }

    calculateroundtime() {
        if (this.rounds.length === 0) {
            return 60;  // 2 minutes for round 1
        } else if (this.rounds.length === 1) {
            return 120;   // 1.5 minutes for round 2
        } else if (this.rounds.length === 2) {
            return 180;   // 1 minute for round 3
        }
        return 120;  // Default time for any extra rounds, if needed
    }
}
