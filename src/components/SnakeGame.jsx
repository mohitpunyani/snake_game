import React, { useEffect, useState, useRef } from "react";

const GRID_SIZE = 15; // 15x15 grid

const GAME_GRID = Array.from({ length: GRID_SIZE }, () =>
  new Array(GRID_SIZE).fill("") // Create a 2D array representing the grid
);

const getInitialSnake = () => [[4, 5]]; // Starting position of the snake

const generateFood = (snake) => { // Generate food not on the snake
  let food;
  do {
    food = [
      Math.floor(Math.random() * GRID_SIZE),
      Math.floor(Math.random() * GRID_SIZE),
    ];
  } while (snake.some(([x, y]) => x === food[0] && y === food[1]));
  return food;
};

function SnakeGame() {
  const [snakeBody, setSnakeBody] = useState(getInitialSnake); // Snake body positions
  const [score, setScore] = useState(0); // Player score
  const [isPlaying, setIsPlaying] = useState(false);    // Game state
 
  const directionRef = useRef([1, 0]);  // Initial direction: moving right
  const foodRef = useRef(generateFood(getInitialSnake()));  // Initial food position

  const isSnakeBodyDiv = (xc, yc) => //  Check if a cell is part of the snake body
    snakeBody.some(([x, y]) => x === xc && y === yc);

  const restartGame = () => { // Reset game state
    setSnakeBody(getInitialSnake());
    directionRef.current = [1, 0];
    foodRef.current = generateFood(getInitialSnake());
    setScore(0);
    setIsPlaying(false);
  };

  const togglePlayPause = () => { // Toggle game state
    setIsPlaying((prev) => !prev);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const intervalId = setInterval(() => { // Game loop
      setSnakeBody((prevSnakeBody) => {
        if (!prevSnakeBody?.length) return getInitialSnake(); // Safety check

        const [dx, dy] = directionRef.current;
        const newHead = [
          prevSnakeBody[0][0] + dx,
          prevSnakeBody[0][1] + dy,
        ];

        // collision
        if (
          newHead[0] < 0 ||
          newHead[0] >= GRID_SIZE ||
          newHead[1] < 0 ||
          newHead[1] >= GRID_SIZE ||
          prevSnakeBody.some( // self-collision detection
            ([x, y]) => x === newHead[0] && y === newHead[1]
          )
        ) {
          restartGame();
          return getInitialSnake();
        }

        const newSnake = prevSnakeBody.map((p) => [...p]);

        // eat food
        if(
          newHead[0] === foodRef.current[0] &&
          newHead[1] === foodRef.current[1]
        ) {
          foodRef.current = generateFood(newSnake); // Generate new food
          setScore((prev) => prev + 1); // Increase score
          newSnake.unshift(newHead); // Grow snake
          return newSnake; // Return early to avoid removing tail
        }
        else{
            newSnake.pop(); // Remove tail
            newSnake.unshift(newHead); // Add new head
            return newSnake; // Update snake body
        }
      });
    }, 200);

    return () => clearInterval(intervalId);
  }, [isPlaying]);

  useEffect(() => {
    const handleDirection = (e) => {
      if (!isPlaying) return;

      const [dx, dy] = directionRef.current;

      if (e.key === "ArrowUp" && dy !== 1) directionRef.current = [0, -1];
      if (e.key === "ArrowDown" && dy !== -1) directionRef.current = [0, 1];
      if (e.key === "ArrowLeft" && dx !== 1) directionRef.current = [-1, 0];
      if (e.key === "ArrowRight" && dx !== -1) directionRef.current = [1, 0];
    };

    window.addEventListener("keydown", handleDirection);
    return () => window.removeEventListener("keydown", handleDirection); // Cleanup on unmount 
  }, [isPlaying]);

  return (
    <>
      <h1> Snake Game</h1>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={togglePlayPause}>
          {isPlaying ? " Pause" : " Play"}
        </button>

        <button className="score-btn" style={{ marginLeft: "10px",backgroundColor: "lightgray" }}>
          Score: {score}
        </button>
      </div>

      <div className="container">
        {GAME_GRID.map((row, yc) =>
          row.map((_, xc) => (
            <div
              key={`${xc}-${yc}`}
              className={`cell 
                ${isSnakeBodyDiv(xc, yc) ? "snake" : ""}
                ${
                  foodRef.current[0] === xc &&
                  foodRef.current[1] === yc
                    ? "food"
                    : ""
                }`}
            />
          ))
        )}
      </div>
    </>
  );
}

export default SnakeGame;
