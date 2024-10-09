const BALL_RADIUS_FACTOR = 4;
const END_RADIUS_FACTOR = 3;
const LINE_WIDTH = 5;

export class Player {
    constructor(gameId, name,game) {
        this.game = game;
        this.gameId = gameId;
        this.name = name;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.lastUpdate = Date.now();
        this.previousPosition = { x: 0, y: 0 };
        this.score = 0;
        this.hasReachedEnd = false;
        this.position = this.generateRandomStartPosition();
        this.colour = this.generateRandomColour();
    }
    
    generateRandomColour() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
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
    updateBallPosition() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000;  // Use this.lastUpdate, not just lastUpdate
        this.lastUpdate = now;

        // Store the current position as the previous position
        this.previousPosition.x = this.position.x;
        this.previousPosition.y = this.position.y;
        
        // Update velocity using acceleration
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;

        const friction = 0.9;  // You can tweak friction or pass it as a parameter

        // Apply friction to velocity
        this.velocity.x *= friction;
        this.velocity.y *= friction;

        // Calculate new position
        let newX = this.position.x + this.velocity.x;
        let newY = this.position.y + this.velocity.y;

        // Call the collision detection method from the Game class using the game reference
        const correctedPosition = this.game.checkCollisions(this, newX, newY);
        newX = correctedPosition.newX;
        newY = correctedPosition.newY;

        // Update player's position
        this.position.x = newX;
        this.position.y = newY;
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
        this.endpoint =  null;
        this.ballRadius = null;
        this.maze = this.maze;
        this.cols = null;
        this.rows = null;
        this.isOngoing = false;
        this.hasReachedEnd = false;
    }

    Addplayer(player) {
        this.players.push(player);
    }

    Startgame() {
        this.startNewRound();
        this.status = "Ongoing";
    }

    StopGame() {
        this.status = "stopped";
        this.isOngoing = false;
    }
    hasWon(){
        this.hasReachedEnd = true;
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
    checkWinCondition(player) {
        const distance = Math.sqrt(
            
            Math.pow(player.position.x - this.endpoint.x, 2) + 
            Math.pow(player.position.y - this.endpoint.y, 2)
        );
        return distance <= this.ballRadius + this.endRadius;
    }
    checkCollisions(player, newX, newY) {
        const cellSize = this.maze[0][0].cellSize;
        const cellX = Math.floor(player.position.x / cellSize);
        const cellY = Math.floor(player.position.y / cellSize);
        const bounceFactor = 1; // Dampen bounce slightly to avoid infinite bounces
    
        if (newX < 0 || newX >= this.cols * cellSize || newY < 0 || newY >= this.rows * cellSize) {
            return { newX: player.position.x, newY: player.position.y };
        }
    
        // Horizontal wall collisions
        if (player.velocity.x > 0) { // Moving right
            if (this.maze[cellX][cellY].walls.right && (newX + this.ballRadius) > (cellX + 1) * cellSize) {
                newX = (cellX + 1) * cellSize - this.ballRadius;
                player.velocity.x = -player.velocity.x * bounceFactor; // Reverse horizontal velocity
            }
        } else if (player.velocity.x < 0) { // Moving left
            if (this.maze[cellX][cellY].walls.left && (newX - this.ballRadius) < cellX * cellSize) {
                newX = cellX * cellSize + this.ballRadius;
                player.velocity.x = -player.velocity.x * bounceFactor;
            }
        }
    
        // Vertical wall collisions
        if (player.velocity.y > 0) { // Moving down
            if (this.maze[cellX][cellY].walls.bottom && (newY + this.ballRadius) > (cellY + 1) * cellSize) {
                newY = (cellY + 1) * cellSize - this.ballRadius;
                player.velocity.y = -player.velocity.y * bounceFactor; // Reverse vertical velocity
            }
        } else if (player.velocity.y < 0) { // Moving up
            if (this.maze[cellX][cellY].walls.top && (newY - this.ballRadius) < cellY * cellSize) {
                newY = cellY * cellSize + this.ballRadius;
                player.velocity.y = -player.velocity.y * bounceFactor;
            }
        }
    
        return { newX, newY };
    }
    
}
