# 🎮 Sink Hero - Multiplayer Maze Game

<div align="center">
  <img src="Maze-Game/Client/images/b4.jpg" alt="Sink Hero Banner" width="600" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</div>

## 📋 Overview

Sink Hero is an engaging online maze game where players navigate through procedurally generated mazes, racing against time and competing with other players. Each round presents a new, increasingly challenging maze, testing players' agility and problem-solving skills.

## ✨ Features

- 🧩 **Procedural Maze Generation**: Every round features a unique maze created using a depth-first search algorithm
- ⏱️ **Time-based Challenges**: Race against the clock to reach the exit
- 🎨 **Colorful Experience**: Each player gets assigned a random color for easy identification
- 📱 **Responsive Design**: Playable on various devices with adaptive layouts
- 🏆 **Scoring System**: Track your performance across multiple rounds
- 📊 **Real-time Updates**: See your position and score in real-time

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://SpherCodes/sink-hero.git
   cd sink-hero
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the game server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🎮 How to Play

1. Enter a Game ID and your Username on the welcome screen
2. Click "Start" to begin the game
3. Use Gyroscope to Navugate the maize
4. Reach the exit point to complete the round
5. Complete as many rounds as you can to increase your score
6. The game becomes progressively more challenging with each round

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express
- **Realtime Communication**: Socket.IO
- **Build Tools**: Babel, Nodemon

## 📐 Project Structure

```
Sink-Hero/
├── index.js              # Server entry point
├── package.json          # Project metadata and dependencies
├── Client/               # Client-side code
│   ├── images/           # Game assets and images
│   └── public/           # Publicly served files
│       ├── index.html    # Game HTML structure
│       ├── css/          # Styling
│       │   ├── main.css  # Main styling
│       │   └── Round.css # Round-specific styling
│       └── js/           # Game logic
│           ├── Client.js         # Main client code
│           ├── gameobjects.js    # Game object definitions
│           └── maze_generation.js # Maze generation algorithm
```

## 🧠 Technical Implementation

- **Maze Generation**: Uses a depth-first search algorithm with backtracking to create perfect mazes
- **Physics Engine**: Custom-built physics system with collision detection, acceleration, and friction
- **State Management**: Game state tracked across rounds with player progression
- **Real-time Updates**: Socket.IO for real-time communication between players

## 📱 Responsive Design

Sink Hero is designed to work across various screen sizes:
- Tablet: Adapted layout with touch controls
- Mobile: Streamlined interface with mobile-friendly navigation

## 👨‍💻 Author

**Siphesihle Mvelase**

## 📄 License

This project is licensed under the ISC License

---

<div align="center">
  <p>🎮 Enjoy playing Sink Hero! 🎮</p>
  <p>Feel free to contribute or report issues!</p>
</div>
