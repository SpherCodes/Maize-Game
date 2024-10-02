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

    // const ctx = canvas.getContext("2d");
    let cellSize;  // Adjust as needed
    let ballRadius;
    let endRadius ;
    let cols ;
    let rows  ;
    let ctx;// Declare context globally

    // Define constants
    const MAZE_WIDTH = 780;
    const MAZE_HEIGHT = 600;
    const SENSITIVITY = 40;
    

    document.getElementById("joinGame").addEventListener("click", () => {
        const name = document.getElementById("username").value.trim();
        const gameId = document.getElementById("gameId").value.trim();
        console.log(name);
        if (name && gameId) {
            startgame(name,gameId)
        } else {
            document.getElementById("errorMessage").textContent = "Please enter both Game ID and Username";
        }
    });
    function startgame(_name, gameId) {
        const game  = new Game(gameId);
        const player = new Player(gameId, _name);
        player.acceleration = acceleration;
        game .Addplayer(player)
        game .Startgame();
        LoadGame(game );
        

        // Update game status
        game .status = "in-progress";
      
        requestAnimationFrame(() => animate(game ));  // Start animation loop
    }

    // Function to check collisions with maze walls
function checkCollisions(player, newX, newY) {
    const cellX = Math.floor(player.position.x / cellSize);
    const cellY = Math.floor(player.position.y / cellSize);
    let bounceFactor = 0.5; // Reduced bounce to prevent infinite bouncing

    if (newX < 0 || newX >= cols * cellSize || newY < 0 || newY >= rows * cellSize) {
        return { newX: player.position.x, newY: player.position.y };
    }

    // Horizontal wall collisions
    if (velocity.x > 0) { // Moving right
        if (generatedMaze[cellX][cellY].walls.right && (newX + ballRadius) > (cellX + 1) * cellSize) {
            newX = (cellX + 1) * cellSize - ballRadius; // Move ball to the edge of the cell
            velocity.x = -velocity.x * bounceFactor; // Reverse and dampen horizontal velocity
        }
    } else if (velocity.x < 0) { // Moving left
        if (generatedMaze[cellX][cellY].walls.left && (newX - ballRadius) < cellX * cellSize) {
            newX = cellX * cellSize + ballRadius; // Move ball to the edge of the cell
            velocity.x = -velocity.x * bounceFactor; // Reverse and dampen horizontal velocity
        }
    }

    // Vertical wall collisions
    if (velocity.y > 0) { // Moving down
        if (generatedMaze[cellX][cellY].walls.bottom && (newY + ballRadius) > (cellY + 1) * cellSize) {
            newY = (cellY + 1) * cellSize - ballRadius; // Move ball to the edge of the cell
            velocity.y = -velocity.y * bounceFactor; // Reverse and dampen vertical velocity
        }
    } else if (velocity.y < 0) { // Moving up
        if (generatedMaze[cellX][cellY].walls.top && (newY - ballRadius) < cellY * cellSize) {
            newY = cellY * cellSize + ballRadius; // Move ball to the edge of the cell
            velocity.y = -velocity.y * bounceFactor; // Reverse and dampen vertical velocity
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
    function animate(game ) {
        const player  = game .players[0];
        
        // Ensure player exists
        if (!player) {
            console.error("Player is undefined!");
            return;
        }
        
        drawBall(player);
        updateBallPosition(player);
        updategameinfo(game )
        requestAnimationFrame(() => animate(game )); // Pass the game  object in recursive call
    }
    
   // Ball drawing function using the ballCanvas
    let prev;
    //let previousEndPoint = { x: null, y: null };
    function drawBall(player) {
        let canvas = document.getElementById("ballCanvas");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
        // Draw end point
        ctx.beginPath();
        ctx.arc(end.x, end.y, endRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
        // Log the calculated position
        //console.log(`Ball position: X=${player.position.c}, Y=${player.position.y}`);

        // Draw player's ball
        ctx.beginPath();
        ctx.arc(player.position.x,player.position.y, ballRadius, 0, Math.PI * 2);
        console.log(`Drawing ball at position X:${player.position.x}, Y:${player.position.y}  `)
        ctx.fillStyle = player.colour;
        ctx.fill();
        ctx.closePath();
    }
    
    function updateBallPosition(player) {
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
        generatedMaze = GenerateMaze(780, 600);
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
    function updategameinfo(game ){
        const currentRound = game .currentRound;
        document.getElementById('player-points').textContent = game .players[0].Totalscore;
        document.getElementById('time-left').textContent = currentRound ? currentRound.timer : 0;
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