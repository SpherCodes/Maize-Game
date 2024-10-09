import { Player,Game} from "./gameobjects.js";
import { GenerateMaze } from "./maze_generation.js";

export class UI {
    constructor() {
        this.mazeCanvas = document.createElement('canvas');
        this.ballCanvas = document.createElement('canvas');
        this.mazeCtx = this.mazeCanvas.getContext('2d');
        this.ballCtx = this.ballCanvas.getContext('2d');
        this.player = null;
        this.maze = null;
        this.game = null;
        this.animationFrameId = null;
    }

    ConfigureMaze() {
        const cellSize = this.maze[0][0].cellSize;
        const cols = Math.floor(this.ballCanvas.width / cellSize);
        const rows = Math.floor(this.ballCanvas.height / cellSize);
        this.game.endpoint = { x: this.ballCanvas.width / 2, y: (rows * cellSize + cellSize) / 2 };
        this.game.ballRadius = cellSize / 6;
        this.game.endRadius = cellSize / 3;

        this.mazeCtx.clearRect(0, 0, this.ballCanvas.width, this.ballCanvas.height);

        const drawCellWalls = (cell) => {
            const x = cell.x * cell.cellSize;
            const y = cell.y * cell.cellSize;

            this.ballCtx.beginPath();
            if (cell.walls.top) {
                this.mazeCtx.moveTo(x, y);
                this.mazeCtx.lineTo(x + cell.cellSize, y);
            }
            if (cell.walls.right) {
                this.mazeCtx.moveTo(x + cell.cellSize, y);
                this.mazeCtx.lineTo(x + cell.cellSize, y + cell.cellSize);
            }
            if (cell.walls.bottom) {
                this.mazeCtx.moveTo(x + cell.cellSize, y + cell.cellSize);
                this.mazeCtx.lineTo(x, y + cell.cellSize);
            }
            if (cell.walls.left) {
                this.mazeCtx.moveTo(x, y + cell.cellSize);
                this.mazeCtx.lineTo(x, y);
            }

            this.mazeCtx.strokeStyle = '#0d1b2a';
            this.mazeCtx.lineWidth = 5;
            this.mazeCtx.lineCap = "round";
            this.mazeCtx.stroke();
        };

        for (let i = 0; i < this.maze.length; i++) {
            for (let j = 0; j < this.maze[i].length; j++) {
                drawCellWalls(this.maze[i][j]);
            }
        }
    }

    LoadGame() {
        document.getElementById('Login-Conteiner').style.display = 'none';
        document.getElementById('game-container').style.display = "block";

        // Set up maze and ball canvases
        this.mazeCanvas.width = 700;
        this.mazeCanvas.height = 600;
        this.mazeCanvas.id = 'mazeCanvas';

        this.ballCanvas.width = 700;
        this.ballCanvas.height = 600;
        this.ballCanvas.id = 'ballCanvas';

        const gameContainer = document.getElementById('game-container');
        gameContainer.appendChild(this.mazeCanvas);
        gameContainer.appendChild(this.ballCanvas);

        this.ConfigureMaze(this.maze);
        console.log('Game loaded:', this.game);

        console.log(this.game.players[0].name)
        document.getElementById('player-name').textContent = this.game.players[0].name;
        document.getElementById('current-round').textContent = this.game.rounds.length;
    }

    drawBall(player) {
        // Clear only the previous position
        this.ballCtx.clearRect(
            player.previousPosition.x - this.game.ballRadius - 2,
            player.previousPosition.y - this.game.ballRadius - 2,
            this.game.ballRadius * 2 + 4,
            this.game.ballRadius * 2 + 4
        );

        // Draw end point
        this.ballCtx.beginPath();
        this.ballCtx.arc(this.game.endpoint.x, this.game.endpoint.y, this.game.endRadius, 0, Math.PI * 2);
        this.ballCtx.fillStyle = this.player.colour;
        this.ballCtx.fill();
        this.ballCtx.closePath();

        // Draw the ball at the updated position
        this.ballCtx.beginPath();
        this.ballCtx.arc(player.position.x, player.position.y, this.game.ballRadius, 0, Math.PI * 2);
        this.ballCtx.fillStyle = player.color;
        this.ballCtx.fill();
        this.ballCtx.closePath();
    }

    restartGame() {
        console.log("Restarting game...");
        console.log("Current game state:", this.game);

        // Clear the canvas
        this.mazeCtx.clearRect(0, 0,  this.mazeCtx.canvas.width,  this.mazeCtx.canvas.height);

        // Cancel the ongoing animation frame if it exists
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Ensure game.players exists and has at least one player before accessing
        if (this.game && this.game.players && this.game.players.length > 0) {
            this.startGame(this.player.name, this.game.gameId);
        } else {
            console.error("Players array is undefined or empty.");
            return;
        }

        // Remove the game over container if it exists
        const gameOverContainer = document.getElementById('game-over-container');
        if (gameOverContainer) {
            gameOverContainer.remove();
        }
    }
    startGame(_name, gameId) {
        if (!this.game || this.game.rounds.length === 0) {
            this.game = new Game(gameId);  
        }
    
        this.game.Startgame();
    
        const { maze, cols, rows } = GenerateMaze(780, 600, this.game.rounds.length);
        this.maze = maze;          
        this.game.maze = maze;       
        this.game.cols = cols;     
        this.game.rows = rows;  
    
       
        if (!this.player || this.player.name !== _name) {
            this.player = new Player(gameId, _name, this.game); 
            this.game.Addplayer(this.player);  
        }
    

        this.LoadGame();
    
        this.game.status = "in-progress";
    
        return { game: this.game, player: this.player };
    }
    

    GameOver() {
        const gameContainer = document.getElementById('game-container');

        if (!gameContainer) {
            console.error("gameContainer element not found!");
            return;
        }

        const container = document.createElement('div');
        container.id = 'game-over-container';

        gameContainer.appendChild(container);

        const GameOverHeading = document.createElement('h1');
        GameOverHeading.textContent = "Game Over";
        container.appendChild(GameOverHeading);

        const playAgainButton = document.createElement('button');
        playAgainButton.textContent = "Play Again";
        playAgainButton.onclick = () => {
            this.restartGame();
        };
        container.appendChild(playAgainButton);

        const quitButton = document.createElement('button');
        quitButton.textContent = "Quit";
        quitButton.onclick = () => {
            this.quitGame(this.game);
        };
        container.appendChild(quitButton);
    }

    GameWon() {
        const gameContainer = document.getElementById('game-container');

        if (!gameContainer) {
            console.error("gameContainer element not found!");
            return;
        }

        this.game.players[0].points += this.game.Calculatepoints(this.game.players[0]);

        const container = document.createElement('div');
        container.id = 'game-won-container';

        gameContainer.appendChild(container);

        const winHeading = document.createElement('h1');
        winHeading.textContent = `Congratulations You Win!`;
        container.appendChild(winHeading);

        const playAgainButton = document.createElement('button');
        if (this.game.rounds.length < 3) {
            playAgainButton.id = "next-round-button";
            playAgainButton.textContent = "Next round";
        } else {
            playAgainButton.id = "play-again-button";
            playAgainButton.textContent = "Play Again";
        }
        container.appendChild(playAgainButton);

        const quitButton = document.createElement('button');
        quitButton.textContent = "Quit";
        quitButton.onclick = () => {
            this.quitGame(this.game);
        };
        container.appendChild(quitButton);
    }

    NextRound() {
        console.log("Restarting game...");

        // Clear the canvas
        this.mazeCtx.clearRect(0, 0, this.mazeCtx.canvas.width, this.mazeCtx.canvas.height);

        // Cancel the ongoing animation frame if it exists
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        const gameOverContainer = document.getElementById('game-won-container');
        if (gameOverContainer) {
            gameOverContainer.remove();
        }

        this.startGame(this.player.name,this.game.gameId);
        this.LoadGame();
        return {game: this.game, player: this.player,ui:this};
    }
     quitGame() {
        console.log("Quitting game...");
        this.game.StopGame();
        window.location.href = 'index.html';
    }

    updategameinfo() {
        const currentRound = this.game.currentRound;
        document.getElementById('player-points').textContent = this.game.players[0].score;
        document.getElementById('time-left').textContent = currentRound ? currentRound.remainingTime : 0;
    }
}
