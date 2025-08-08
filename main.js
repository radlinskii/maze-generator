const GRID_WIDTH = 25;
const GRID_HEIGHT = Math.round(GRID_WIDTH * 1.414); // Approximate height for a square grid

const START_CELL_X = 2;
const START_CELL_Y = 2;
const END_CELL_X = 4;
const END_CELL_Y = 24;

let isRunning = false;

const grid = [];

window.onload = () => {
    setupGrid();

    const startButton = document.querySelector("#startButton");
    const resetButton = document.querySelector("#resetButton");

    startButton.disabled = false;
    resetButton.disabled = true;

    startButton.addEventListener("click", handleStartButtonClick);
    resetButton.addEventListener("click", handleResetButtonClick);
};

function setupGrid() {
    const mazeContainer = document.querySelector("#mazeContainer");

    mazeContainer.style.gridTemplateColumns = `repeat(${GRID_WIDTH}, 1fr)`;

    for (let i = 0; i < GRID_HEIGHT; i++) {
        const row = [];

        for (let j = 0; j < GRID_WIDTH; j++) {
            const cell = document.createElement("div");

            cell.addEventListener("click", handleCellClick(i, j));

            cell.classList.add("cell");

            if (i === START_CELL_Y && j === START_CELL_X) {
                cell.classList.add("start");
            }

            if (i === END_CELL_Y && j === END_CELL_X) {
                cell.classList.add("end");
            }

            row.push({
                y: i,
                x: j,
                element: cell,
                visited: false,
                walls: { top: true, bottom: true, left: true, right: true },
            });

            mazeContainer.appendChild(cell);
        }

        grid.push(row);
    }
}

async function handleStartButtonClick() {
    const startButton = document.querySelector("#startButton");
    const resetButton = document.querySelector("#resetButton");

    startButton.disabled = true;
    resetButton.disabled = false;

    isRunning = true;

    // await visitGridSequentially();
    // await visitGridBfs();
    await startRandomizedDfs();
}

async function handleResetButtonClick() {
    const mazeContainer = document.querySelector("#mazeContainer");
    const cells = mazeContainer.childNodes;
    const startButton = document.querySelector("#startButton");
    const resetButton = document.querySelector("#resetButton");

    startButton.disabled = false;
    resetButton.disabled = true;

    isRunning = false;

    cells.forEach((cell) => {
        cell.classList.remove("visited");
    });
}

function handleCellClick(i, j) {
    return function (event) {
        // TODO: mark cells as blocked or unblocked
        console.log(`Cell clicked: (${i}, ${j})`, event.target);
    };
}

async function visitGridSequentially() {
    const graph = getGraph();

    for (let i = 0; i < GRID_HEIGHT; i++) {
        for (let j = 0; j < GRID_WIDTH; j++) {
            if (i < START_CELL_Y || (i === START_CELL_Y && j < START_CELL_X)) {
                continue;
            }

            const node = graph[i][j];

            await sleep(10);

            if (!isRunning) {
                console.log("stopping");
                return;
            }

            if (node.x === END_CELL_X && node.y === END_CELL_Y) {
                console.log("hurra");
                return;
            }

            node.element.classList.add("visited");
        }
    }
}

async function visitGridBfs() {
    const queue = [];
    const graph = getGraph();

    const startNode = graph[START_CELL_Y][START_CELL_X];
    queue.push(startNode);
    startNode.visited = true;

    while (queue.length > 0) {
        await sleep(2);

        const node = queue.shift();

        if (!isRunning) {
            console.log("stopping");
            return;
        }

        node.element.classList.add("visited");

        if (node.x === END_CELL_X && node.y === END_CELL_Y) {
            console.log("hurra");
            return;
        }

        if (
            node.y < GRID_HEIGHT - 1 &&
            graph[node.y + 1][node.x].visited === false
        ) {
            queue.push(graph[node.y + 1][node.x]);
            graph[node.y + 1][node.x].visited = true;
        }

        if (
            node.x < GRID_WIDTH - 1 &&
            graph[node.y][node.x + 1].visited === false
        ) {
            queue.push(graph[node.y][node.x + 1]);
            graph[node.y][node.x + 1].visited = true;
        }

        if (node.y > 0 && graph[node.y - 1][node.x].visited === false) {
            queue.push(graph[node.y - 1][node.x]);
            graph[node.y - 1][node.x].visited = true;
        }

        if (node.x > 0 && graph[node.y][node.x - 1].visited === false) {
            queue.push(graph[node.y][node.x - 1]);
            graph[node.y][node.x - 1].visited = true;
        }
    }
}

function getGraph() {
    const graph = [];

    for (let i = 0; i < GRID_HEIGHT; i++) {
        const row = [];

        for (let j = 0; j < GRID_WIDTH; j++) {
            const node = grid[i][j];

            row.push({
                y: i,
                x: j,
                element: node.element,
                visited: false,
                walls: { top: true, bottom: true, left: true, right: true },
            });
        }
        graph.push(row);
    }

    return graph;
}

async function sleep(timeMs) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeMs);
    });
}

/*
- Given a current cell as a parameter
- Mark the current cell as visited
- While the current cell has any unvisited neighbour cells
    - Choose one of the unvisited neighbours
    - Remove the wall between the current cell and the chosen cell
    - Invoke the routine recursively for the chosen cell
 */
async function visitGridRandomizedDfs(currentCell, graph) {
    graph[currentCell.y][currentCell.x].visited = true;
    currentCell.element.classList.add("visited");

    const neighbours = getUnvisitedNeighbours(currentCell, graph);

    if (neighbours.length === 0) {
        return;
    }

    await sleep(10);

    while (neighbours.length > 0 && isRunning) {
        const randomIndex = Math.floor(Math.random() * neighbours.length);
        const nextCell = neighbours[randomIndex];

        if (!graph[nextCell.y][nextCell.x].visited) {
            removeWall(currentCell, nextCell);
            await visitGridRandomizedDfs(nextCell, graph);
        }

        // Remove the visited neighbour from the list
        neighbours.splice(randomIndex, 1);
    }
}

function getUnvisitedNeighbours(cell, graph) {
    const neighbours = [];

    // Check down
    if (cell.y < GRID_HEIGHT - 1 && !graph[cell.y + 1][cell.x].visited) {
        neighbours.push(graph[cell.y + 1][cell.x]);
    }
    // Check right
    if (cell.x < GRID_WIDTH - 1 && !graph[cell.y][cell.x + 1].visited) {
        neighbours.push(graph[cell.y][cell.x + 1]);
    }
    // Check up
    if (cell.y > 0 && !graph[cell.y - 1][cell.x].visited) {
        neighbours.push(graph[cell.y - 1][cell.x]);
    }
    // Check left
    if (cell.x > 0 && !graph[cell.y][cell.x - 1].visited) {
        neighbours.push(graph[cell.y][cell.x - 1]);
    }

    return neighbours;
}

function removeWall(current, next) {
    const dx = next.x - current.x;
    const dy = next.y - current.y;

    console.log(current, next);

    if (dx === 1) {
        // next is to the right
        current.walls.right = false;
        next.walls.left = false;
        current.element.style.borderRight = "none";
        next.element.style.borderLeft = "none";
    } else if (dx === -1) {
        // next is to the left
        current.walls.left = false;
        next.walls.right = false;
        current.element.style.borderLeft = "none";
        next.element.style.borderRight = "none";
    } else if (dy === 1) {
        // next is below
        current.walls.bottom = false;
        next.walls.top = false;
        current.element.style.borderBottom = "none";
        next.element.style.borderTop = "none";
    } else if (dy === -1) {
        // next is above
        current.walls.top = false;
        next.walls.bottom = false;
        current.element.style.borderTop = "none";
        next.element.style.borderBottom = "none";
    }
}

async function startRandomizedDfs() {
    const graph = getGraph();
    const startNode = graph[START_CELL_Y][START_CELL_X];
    await visitGridRandomizedDfs(startNode, graph);
}
