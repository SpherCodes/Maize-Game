export function startBackgroundAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    let squareSize = 50; // Size of the square
    let x = 0; // Starting x position
    let y = canvas.height / 2 - squareSize / 2; // Center vertically
    let speed = 2; // Speed of the square

    function animateSquare() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        // Draw the square
        ctx.fillStyle = 'blue';
        ctx.fillRect(x, y, squareSize, squareSize);

        // Update position
        x += speed;

        // Reset position when it moves off-screen
        if (x > canvas.width) {
            x = -squareSize;
        }

        requestAnimationFrame(animateSquare); // Call the next frame
    }

    animateSquare(); // Start the animation
}
