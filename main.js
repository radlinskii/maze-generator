const GRID_WIDTH = 25;
const GRID_HEIGHT = 25;

const START_CELL_X = 12;
const START_CELL_Y = 12;
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

            row.push({ y: i, x: j, element: cell, visited: false });

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
    await visitGridBfs();
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
