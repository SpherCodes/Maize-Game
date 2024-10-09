import { UI } from "./UI.js";

document.addEventListener("DOMContentLoaded", () => {
    let animationFrameId;
    const acceleration = { x: 0, y: 0 };
    const joinGameButton = document.getElementById("joinGame");
    const usernameInput = document.getElementById("username");
    const gameIdInput = document.getElementById("gameId");
    const errorMessage = document.getElementById("errorMessage");
    let ui;

    // Event listener for joining the game
    joinGameButton.addEventListener("click", () => {
        const name = usernameInput.value.trim();
        const gameId = gameIdInput.value.trim();

        if (name && gameId) {
            ui = new UI(); // Initialize the UI
            const { game, player } = ui.startGame(name, gameId);
            ui.animationFrameId = requestAnimationFrame(() => animate(game, player, ui)); // Start the animation
        } else {
            errorMessage.textContent = "Please enter both Game ID and Username";
        }
    });

    // Event listener for playing again (restart)
    const playAgainButton = document.getElementById('playAgainButton');
    if (playAgainButton) {
        playAgainButton.addEventListener("click", () => {
            if (ui) {
                cancelAnimationFrame(ui.animationFrameId); // Cancel the previous animation frame
                ui.restartGame();
            }
        });
    }

    // Event listener for starting the next round
    // Event listener for starting the next round
    const nextRoundButton = document.getElementById('next-round-button');
    if (nextRoundButton) {
        nextRoundButton.addEventListener("click", () => {
            if (ui) {
                cancelAnimationFrame(ui.animationFrameId); // Cancel the previous animation frame

                // Proceed with the next round
                const { game, player, ui: updatedUI } = ui.NextRound();

                // Ensure the new round is properly initialized
                if (!game || !player || !updatedUI) {
                    console.error("Failed to start the next round due to missing game or player data.");
                    return;
                }

                // Update the UI reference
                ui = updatedUI;

                // Log for debugging
                console.log('Starting the next round and requesting animation frame');

                // Start the next round animation loop
                ui.animationFrameId = requestAnimationFrame(() => animate(game, player, ui));
            } else {
                console.error("UI object is not initialized!");
            }
        });
    }


    // Animation loop
    function animate(game, player, ui) {
        if (!player) {
            console.error("Player is undefined!");
            return;
        }

        player.acceleration = acceleration;

        if (game.currentRound.isOngoing) {
            // Update and draw the ball
            player.updateBallPosition();
            ui.drawBall(player);

            // Check win condition
            if (game.checkWinCondition(player)) {
                console.log(`Player ${player.name} has won!`);
                game.hasWon();
                ui.GameWon(); // Handle the win scenario
                return; // Exit the animation loop
            }
        } else {
            console.log(`Time's up`);
            ui.GameOver(); // Handle the game over scenario
            return; // Exit the animation loop
        }

        // Update game information (like score, time remaining, etc.)
        ui.updategameinfo(game);

        // Continue the animation loop
        ui.animationFrameId = requestAnimationFrame(() => animate(game, player, ui));
    }

    // Device orientation for ball control
    window.addEventListener('deviceorientation', (event) => {
        if (event.gamma !== null && event.beta !== null) {
            acceleration.x = event.gamma/2;
            acceleration.y = event.beta/2;
            console.log(`Acceleration X: ${acceleration.x}, Y: ${acceleration.y}`);
        }
    });
});
