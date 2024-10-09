/**
 * Generates a maze based on the given width, height, and round number.
 * @param {number} width - The width of the maze in pixels.
 * @param {number} height - The height of the maze in pixels.
 * @param {number} [round=1] - The current round number, affecting cell size.
 * @returns {Cell[][]} The generated maze as a 2D array of Cell objects.
 */
export function GenerateMaze(width, height, round) {
    const cellSize = getCellSize(round);
    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);
  
    class Cell {
        constructor(x, y) {
            this.cellSize = cellSize;
            this.x = x;
            this.y = y;
            this.visited = false;
            this.walls = {
                top: true,
                right: true,
                bottom: true,
                left: true,
            };
        }
    }
  
    /**
     * Generates the maze using a depth-first search algorithm.
     * @param {number} cols - Number of columns in the maze.
     * @param {number} rows - Number of rows in the maze.
     * @returns {Cell[][]} The generated maze.
     */
    function mazeGenerator(cols, rows) {
        const grid = Array.from({ length: cols }, (_, x) =>
            Array.from({ length: rows }, (_, y) => new Cell(x, y))
        );
  
        const stack = [];
        const start = grid[0][0];
        start.visited = true;
        stack.push(start);
  
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const next = getUnvisitedNeighbor(current, grid, cols, rows);
  
            if (next) {
                next.visited = true;
                stack.push(next);
                removeWalls(current, next);
            } else {
                stack.pop();
            }
        }
  
        return grid;
    }
  
    /**
     * Gets an unvisited neighbor cell randomly.
     * @param {Cell} cell - The current cell.
     * @param {Cell[][]} grid - The maze grid.
     * @param {number} cols - Number of columns in the maze.
     * @param {number} rows - Number of rows in the maze.
     * @returns {Cell|undefined} An unvisited neighbor cell or undefined if none exist.
     */
    function getUnvisitedNeighbor(cell, grid, cols, rows) {
        const { x, y } = cell;
        const neighbors = [
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
        ]
            .filter(({ dx, dy }) => 
                x + dx >= 0 && x + dx < cols && 
                y + dy >= 0 && y + dy < rows && 
                !grid[x + dx][y + dy].visited
            )
            .map(({ dx, dy }) => grid[x + dx][y + dy]);
  
        return neighbors.length > 0 
            ? neighbors[Math.floor(Math.random() * neighbors.length)] 
            : undefined;
    }
  
    /**
     * Removes walls between two adjacent cells.
     * @param {Cell} a - The first cell.
     * @param {Cell} b - The second cell.
     */
    function removeWalls(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
  
        if (dx === 1) { a.walls.left = false; b.walls.right = false; }
        else if (dx === -1) { a.walls.right = false; b.walls.left = false; }
        if (dy === 1) { a.walls.top = false; b.walls.bottom = false; }
        else if (dy === -1) { a.walls.bottom = false; b.walls.top = false; }
    }
  
    /**
     * Adds random extra paths by removing some walls between already visited cells.
     * @param {Cell[][]} maze - The generated maze.
     * @param {number} extraPaths - The number of extra paths to add.
     */
    function addExtraPaths(maze, extraPaths = 10) {
        for (let i = 0; i < extraPaths; i++) {
            const x = Math.floor(Math.random() * cols);
            const y = Math.floor(Math.random() * rows);
  
            const currentCell = maze[x][y];
            const neighbors = getVisitedNeighbors(currentCell, maze, cols, rows);
  
            if (neighbors.length > 0) {
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                removeWalls(currentCell, randomNeighbor);
            }
        }
    }
  
    /**
     * Gets the neighbors that have already been visited.
     * @param {Cell} cell - The current cell.
     * @param {Cell[][]} maze - The maze grid.
     * @param {number} cols - Number of columns in the maze.
     * @param {number} rows - Number of rows in the maze.
     * @returns {Cell[]} A list of visited neighbors.
     */
    function getVisitedNeighbors(cell, maze, cols, rows) {
        const { x, y } = cell;
        return [
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
        ]
            .filter(({ dx, dy }) => 
                x + dx >= 0 && x + dx < cols && 
                y + dy >= 0 && y + dy < rows && 
                maze[x + dx][y + dy].visited
            )
            .map(({ dx, dy }) => maze[x + dx][y + dy]);
    }
  
    /**
     * Adds an outer border to the maze.
     * @param {Cell[][]} maze - The generated maze.
     */
    function addOuterBorder(maze) {
        for (let x = 0; x < cols; x++) {
            maze[x][0].walls.top = true; // Top wall of the first row
            maze[x][rows - 1].walls.bottom = true; // Bottom wall of the last row
        }
        for (let y = 0; y < rows; y++) {
            maze[0][y].walls.left = true; // Left wall of the first column
            maze[cols - 1][y].walls.right = true; // Right wall of the last column
        }
    }
    
  
    /**
     * Determines the cell size based on the round number.
     * @param {number} round - The current round number.
     * @returns {number} The cell size.
     */
    function getCellSize(round) {
        switch(round) {
            case 2: return 40;
            case 3: return 30;
            default: return 60;
        }
    }
  
    const generatedMaze = mazeGenerator(cols, rows);
    addOuterBorder(generatedMaze);
    addExtraPaths(generatedMaze, 15); // Add extra paths to create loops and multiple paths
      // Return an object with the maze, cols, and rows
      return {
          maze: generatedMaze,
          cols: cols,
          rows: rows
      };
  }
  