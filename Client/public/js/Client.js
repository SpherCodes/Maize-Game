import { GenerateMaze } from "./maze_generation.js";
import { Player,Game} from "./gameobjects.js";
// import { startBackgroundAnimation } from './Backgroundanimation.js';

document.addEventListener("DOMContentLoaded",()=>{
    //startBackgroundAnimation('backgroundCanvas');
    // Game state variables
    let generatedMaze;
    let velocity = { x: 0, y: 0 };
    let acceleration = { x: 0, y: 0 };
    const friction = 0.8;
    let lastUpdate = Date.now();
    let end;
    let previous_positions = {};
    let sensitivity = 75;
    let animationFrameId;

    // const ctx = canvas.getContext("2d");
    let cellSize;  // Adjust as needed
    let ballRadius;
    let endRadius ;
    let cols ;
    let rows  ;
    let ctx;


    // Define constants
    const MAZE_WIDTH = 780;
    const MAZE_HEIGHT = 600;
    const SENSITIVITY = 40;
    

    const joinGameButton = document.getElementById("joinGame");
    const usernameInput = document.getElementById("username");
    const gameIdInput = document.getElementById("gameId");
    const errorMessage = document.getElementById("errorMessage");

    joinGameButton.addEventListener("click", () => {
        const name = usernameInput.value.trim();
        const gameId = gameIdInput.value.trim();
        if (name && gameId) {
            startgame(name, gameId);
        } else {
            errorMessage.textContent = "Please enter both Game ID and Username";
        }
    });
    function startgame(_name, gameId) {
        const game = new Game(gameId);
        const player = new Player(gameId, _name)
    
        player.acceleration = acceleration;
        game.Addplayer(player);
        game.Startgame();
        LoadGame(game);
    
        game.status = "in-progress";
        animationFrameId = requestAnimationFrame(() => animate(game));
    }
    
     // Function to restart the game
     function restartGame(game) {
        console.log("Restarting game...");
        console.log("Current game state:", game); // Confirm game is defined and valid

        let canvas = document.getElementById("ballCanvas");
    
        // Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
        // Cancel the ongoing animation frame if it exists
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null; // Reset the animation frame ID
        }
    
        // Ensure game.players exists and has at least one player before accessing
        if (game && game.players && game.players.length > 0) {
            // Start the game with the first player's name and game ID
            startgame(game.players[0].name, game.gameId);
        } else {
            console.error("Players array is undefined or empty.");
            return; // Exit early if players are not defined
        }
    
        // Remove the game over container if it exists
        const gameOverContainer = document.getElementById('game-over-container');
        if (gameOverContainer) {
            gameOverContainer.remove();
        }
    }
    function NextRound(game){
        console.log("Restarting game...");
        console.log("Current game state:", game); // Confirm game is defined and valid
        let canvas = document.getElementById("ballCanvas");
    
        // Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
        // Cancel the ongoing animation frame if it exists
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null; // Reset the animation frame ID
        }
        // Remove the Winner container if it exists
        const gameOverContainer = document.getElementById('game-won-container');
        if (gameOverContainer) {
            gameOverContainer.remove();
        }
        game.Startgame();
        LoadGame(game );
        animationFrameId = requestAnimationFrame(() => animate(game));  // Store animation frame ID
    
    }
    

    // Function to quit the game
    function quitGame(game) {
        console.log("Quitting game...");
        game.StopGame();
        window.location.href = 'index.html';
    }

    // Function to check collisions with maze walls
function checkCollisions(player, newX, newY) {
    const cellX = Math.floor(player.position.x / cellSize);
    const cellY = Math.floor(player.position.y / cellSize);
    const bounceFactor = 1; // Dampen bounce slightly to avoid infinite bounces

    if (newX < 0 || newX >= cols * cellSize || newY < 0 || newY >= rows * cellSize) {
        return { newX: player.position.x, newY: player.position.y };
    }

    // Horizontal wall collisions
    if (velocity.x > 0) { // Moving right
        if (generatedMaze[cellX][cellY].walls.right && (newX + ballRadius) > (cellX + 1) * cellSize) {
            newX = (cellX + 1) * cellSize - ballRadius;
            velocity.x = -velocity.x * bounceFactor; // Reverse horizontal velocity
        }
    } else if (velocity.x < 0) { // Moving left
        if (generatedMaze[cellX][cellY].walls.left && (newX - ballRadius) < cellX * cellSize) {
            newX = cellX * cellSize + ballRadius;
            velocity.x = -velocity.x * bounceFactor;
        }
    }

    // Vertical wall collisions
    if (velocity.y > 0) { // Moving down
        if (generatedMaze[cellX][cellY].walls.bottom && (newY + ballRadius) > (cellY + 1) * cellSize) {
            newY = (cellY + 1) * cellSize - ballRadius;
            velocity.y = -velocity.y * bounceFactor; // Reverse vertical velocity
        }
    } else if (velocity.y < 0) { // Moving up
        if (generatedMaze[cellX][cellY].walls.top && (newY - ballRadius) < cellY * cellSize) {
            newY = cellY * cellSize + ballRadius;
            velocity.y = -velocity.y * bounceFactor;
        }
    }

    return { newX, newY };
}

     
 function ConfigureMaze(maze,cellSize,canvas,ctx){
        console.log(canvas)
        cols = Math.floor(canvas.width / cellSize);
        rows = Math.floor(canvas.height / cellSize);
        end = { x: canvas.width / 2, y: (rows * cellSize + cellSize) / 2 };
        ballRadius = cellSize / 6;
        endRadius = cellSize / 3;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw maze walls
        const drawCellWalls = (cell) => {
            const x = cell.x * cell.cellSize;
            const y = cell.y * cell.cellSize;

            ctx.beginPath();
            if (cell.walls.top) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + cell.cellSize, y);
            }
            if (cell.walls.right) {
                ctx.moveTo(x + cell.cellSize, y);
                ctx.lineTo(x + cell.cellSize, y + cell.cellSize);
            }
            if (cell.walls.bottom) {
                ctx.moveTo(x + cell.cellSize, y + cell.cellSize);
                ctx.lineTo(x, y + cell.cellSize);
            }
            if (cell.walls.left) {
                ctx.moveTo(x, y + cell.cellSize);
                ctx.lineTo(x, y);
            }
            
            ctx.strokeStyle = '#0d1b2a';
            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            ctx.stroke();
        };
        // Draw each cell's walls
        for (let i = 0; i < maze.length; i++) {
            for (let j = 0; j < maze[i].length; j++) {
                drawCellWalls(maze[i][j]);
            }
        }
    }
    function animate(game) {
        const player = game.players[0];
    
        // Ensure player exists
        if (!player) {
            console.error("Player is undefined!");
            return;
        }
    
        // Check if the current round is ongoing
        if (game.currentRound.isOngoing) {
            // Update ball position first
            updateBallPosition(player, game);
    
            // Draw the ball after updating its position
            drawBall(player);
    
            // Check win condition
            if (checkWinCondition(player,game)) {
                console.log(`Player ${player.name} has won!`);
                game.hasWon();
                GameWon(game); // Call to handle the winning scenario
                return; // Exit the animation loop if the player has won
            }
        } else {
            console.log(`Time up`);
            GameOver(game);
            return; // Exit the animation loop if the game is over
        }
    
        // Update the game info (score, time left, etc.)
        updategameinfo(game);
    
        // Call requestAnimationFrame to keep the animation going
        requestAnimationFrame(() => animate(game)); // Pass the game object in recursive call
    }    
    
    

    function drawBall(player) {
        let canvas = document.getElementById("ballCanvas");
    
        // Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw end point
        ctx.beginPath();
        ctx.arc(end.x, end.y, endRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
    
        // Draw player's ball
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = player.colour;
        ctx.fill();
        ctx.closePath();
    }
    
    
    function updateBallPosition(player,game) {
        const now = Date.now();
        const deltaTime = (now - lastUpdate) / 1000; // Time in seconds
        lastUpdate = now;
        
        // Update velocity using acceleration
        velocity.x += acceleration.x * deltaTime;
        velocity.y += acceleration.y * deltaTime;
    
        // Apply friction to velocity
        velocity.x *= friction;
        velocity.y *= friction;
    
        // Calculate new position
        let newX = player.position.x + velocity.x;
        let newY = player.position.y + velocity.y;
    
        // Check for collisions
        const correctedPosition = checkCollisions(player, newX, newY);
        newX = correctedPosition.newX;
        newY = correctedPosition.newY;
    
        // Update player's position
        player.position.x = newX;
        player.position.y = newY;
    }
    
    function LoadGame(game ) {
        // Generate the maze
        generatedMaze = GenerateMaze(780, 600,game.rounds.length);
        console.log(generatedMaze)
        cellSize = generatedMaze[0][0].cellSize;
    
        document.getElementById('Login-Conteiner').style.display = 'none';
        document.getElementById('game-container').style.display = "block";
    
        // Create canvas for the maze
        const mazeCanvas = document.createElement('canvas');
        mazeCanvas.width = MAZE_WIDTH;
        mazeCanvas.height = MAZE_HEIGHT;
        mazeCanvas.id = 'mazeCanvas';  // Unique ID for the maze
        const mazeCtx = mazeCanvas.getContext('2d');
    
        // Create canvas for the ball
        const ballCanvas = document.createElement('canvas');
        ballCanvas.width = MAZE_WIDTH;
        ballCanvas.height = MAZE_HEIGHT;
        ballCanvas.id = 'ballCanvas';  // Unique ID for the ball
        const ballCtx = ballCanvas.getContext('2d');
    
        if (!mazeCtx || !ballCtx) {
            console.error("Failed to get canvas context.");
            return;
        }
    
        // Append both canvases to the game container
        const gameContainer = document.getElementById('game-container');
        gameContainer.appendChild(mazeCanvas);
        gameContainer.appendChild(ballCanvas);
    
        // Configure the maze (draw it once)
        ConfigureMaze(generatedMaze, cellSize, mazeCanvas, mazeCtx);
        ctx = ballCtx; // Assign ball canvas context globally for ball drawing
        console.log('Canvas created');
        console.log(game )

        // Update the UI with player and game info
        const currentRound = game .currentRound;
        document.getElementById('player-name').textContent = game .players[0].name;
        document.getElementById('current-round').textContent = game .rounds.length;
       
    }
    function GameOver(game) {
        const gameContainer = document.getElementById('game-container');
        
        if (!gameContainer) {
            console.error("gameContainer element not found!");
            return;
        }
    
        // Create the game over container
        const container = document.createElement('div');
        container.id = 'game-over-container'; // Correctly set the id attribute
        
        // Append the container to the game container
        gameContainer.appendChild(container);
        
        // Create and append the "Game Over" heading
        const GameOverHeading = document.createElement('h1');
        GameOverHeading.textContent = "Game Over";
        container.appendChild(GameOverHeading);
    
        // Create the "Play Again" button
        const playAgainButton = document.createElement('button');
        playAgainButton.textContent = "Play Again";
        playAgainButton.onclick = () => {
            // Call a function to restart the game
            console.log(game)
            restartGame(game);
        };
        container.appendChild(playAgainButton);
    
        // Create the "Quit" button
        const quitButton = document.createElement('button');
        quitButton.textContent = "Quit";
        quitButton.onclick = () => {
            quitGame(game);
        };
        container.appendChild(quitButton);
    }
    function checkWinCondition(player) {
        const distance = Math.sqrt(
            Math.pow(player.position.x - end.x, 2) + 
            Math.pow(player.position.y - end.y, 2)
        );
        return distance <= ballRadius + endRadius; // Adjust condition based on ball and endpoint sizes
    }    
    function GameWon(game) {
        const gameContainer = document.getElementById('game-container');
    
        if (!gameContainer) {
            console.error("gameContainer element not found!");
            return;
        }
        game.players[0].points  +=  game.Calculatepoints(game.players[0])
        // Create the game won container
        const container = document.createElement('div');
        container.id = 'game-won-container'; // Set a unique ID for the winning screen
    
        // Append the container to the game container
        gameContainer.appendChild(container);
    
        // Create and append the "You Win!" heading
        const winHeading = document.createElement('h1');
        winHeading.textContent = `Congratulations You Win!`;
        container.appendChild(winHeading);
    
        // Create the "Play Again" button
        const playAgainButton = document.createElement('button');
       if(game.rounds.length < 3){
            playAgainButton.textContent = "Next round"
            playAgainButton.onclick = () => {
                NextRound(game); // Call a function to restart the game
            };
       }
       else{
        playAgainButton.textContent = "Play Again"
            playAgainButton.onclick = () => {
                restartGame(game); // Call a function to restart the game
            };
       }
        container.appendChild(playAgainButton);
    
        // Create the "Quit" button
        const quitButton = document.createElement('button');
        quitButton.textContent = "Quit";
        quitButton.onclick = () => {
            quitGame(game);
        };
        container.appendChild(quitButton);
    }    
    
    function updategameinfo(game ){
        console.log(game)
        const currentRound = game .currentRound;
        document.getElementById('player-points').textContent = game .players[0].score;
        document.getElementById('time-left').textContent = currentRound ? currentRound.remainingTime : 0;
    }
    
    function isIOS() {
        // Check if the user agent contains 'iPhone', 'iPad', or 'iPod'
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    function requestPermission() {
        // Attempt to request device orientation permission
        if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ and later
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        console.log('Device orientation permission granted');
                        // Start using device orientation data here
                    } else {
                        console.error('Device orientation permission denied');
                    }
                })
                .catch(error => {
                    console.error('Error requesting device orientation permission:', error);
                });
        } else {
            // For non-iOS devices or older iOS versions
            console.log('Device orientation permission is not required');
            // Start using device orientation data here
        }
    }

    if (isIOS()) {
        // Show the permission button if on iOS
        document.getElementById('permissionButton').style.display = 'block';

        // Add click event listener to the button
        document.getElementById('permissionButton').addEventListener('click', () => {
            requestPermission();
        });
    }

     // Gyroscope data handling
     window.addEventListener('deviceorientation', (event) => {
        if (event.gamma !== null && event.beta !== null) {
            acceleration.x = event.gamma; // Adjust sensitivity as needed
            acceleration.y = event.beta;  // Adjust sensitivity as needed
        }
    });    
})