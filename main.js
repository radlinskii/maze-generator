const GRID_WIDTH = 25;
const GRID_HEIGHT = Math.round(GRID_WIDTH * 1.414); // Approximate height for a square grid

let START_CELL_X = getRandomX();
const START_CELL_Y = 0;
let END_CELL_X = getRandomX();
const END_CELL_Y = GRID_HEIGHT - 1;

function getRandomX() {
    return Math.floor(Math.random() * GRID_WIDTH);
}

let isRunning = false;

const grid = [];

window.onload = () => {
    setupGrid();

    const startButton = document.querySelector("#startButton");
    const resetButton = document.querySelector("#resetButton");
    const exportButton = document.querySelector("#exportButton");

    startButton.disabled = false;
    resetButton.disabled = true;
    exportButton.disabled = true;

    startButton.addEventListener("click", handleStartButtonClick);
    resetButton.addEventListener("click", handleResetButtonClick);
    exportButton.addEventListener("click", handleExportButtonClick);
};

function setupGrid() {
    const mazeContainer = document.querySelector("#mazeContainer");

    mazeContainer.style.gridTemplateColumns = `repeat(${GRID_WIDTH}, 1fr)`;
    mazeContainer.style.gridTemplateRows = `repeat(${GRID_HEIGHT}, 1fr)`;

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
    const exportButton = document.querySelector("#exportButton");

    startButton.disabled = true;
    resetButton.disabled = false;

    isRunning = true;

    // await visitGridSequentially();
    // await visitGridBfs();
    await startRandomizedDfs();

    exportButton.disabled = false;
}

async function handleResetButtonClick() {
    const mazeContainer = document.querySelector("#mazeContainer");
    const cells = mazeContainer.childNodes;
    const startButton = document.querySelector("#startButton");
    const resetButton = document.querySelector("#resetButton");
    const exportButton = document.querySelector("#exportButton");

    startButton.disabled = false;
    resetButton.disabled = true;
    exportButton.disabled = true;

    isRunning = false;

    START_CELL_X = getRandomX();
    END_CELL_X = getRandomX();

    cells.forEach((cell) => {
        cell.classList.remove("visited");
        cell.classList.remove("no-left-wall");
        cell.classList.remove("no-right-wall");
        cell.classList.remove("no-top-wall");
        cell.classList.remove("no-bottom-wall");
        cell.classList.remove("start");
        cell.classList.remove("end");
    });

    for (let i = 0; i < GRID_HEIGHT; i++) {
        for (let j = 0; j < GRID_WIDTH; j++) {
            const node = grid[i][j];

            if (i === START_CELL_Y && j === START_CELL_X) {
                node.element.classList.add("start");
            }

            if (i === END_CELL_Y && j === END_CELL_X) {
                node.element.classList.add("end");
            }
        }
    }
}

async function handleExportButtonClick() {
    const { jsPDF } = window.jspdf;

    const element = document.getElementById("exportMe");

    // Render element to canvas
    const canvas = await html2canvas(element, { scale: 2 }); // Higher scale = sharper output
    const imgData = canvas.toDataURL("image/png");

    // Create A4 PDF
    const pdf = new jsPDF({
        orientation: "p", // portrait
        unit: "pt", // points
        format: "a4",
    });

    // Get A4 page dimensions in points
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add the image so it fills the page
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

    pdf.save("export-a4.pdf");
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

            await sleep(5);

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
        await sleep(5);

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
/*
Iterative randomized DFS using a stack:
- Initialize a stack with the starting cell
- While the stack is not empty:
    - Pop the current cell from the stack
    - Mark the current cell as visited
    - While the current cell has any unvisited neighbour cells:
        - Choose one of the unvisited neighbours at random
        - Remove the wall between the current cell and the chosen cell
        - Push the current cell back onto the stack
        - Push the chosen neighbour onto the stack
        - Break to continue with the newly chosen cell
*/
async function visitGridRandomizedDfs(startCell, graph) {
    const stack = [startCell];

    while (stack.length > 0 && isRunning) {
        const currentCell = stack.pop();
        const cellData = graph[currentCell.y][currentCell.x];

        if (!cellData.visited) {
            cellData.visited = true;
            currentCell.element.classList.add("visited");
            await sleep(5);
        }

        const neighbours = getUnvisitedNeighbours(currentCell, graph);

        if (neighbours.length > 0) {
            // Pick a random unvisited neighbour
            const randomIndex = Math.floor(Math.random() * neighbours.length);
            const nextCell = neighbours[randomIndex];

            // Remove the wall between current and next
            removeWall(currentCell, nextCell);

            // Push current cell back to stack to continue after exploring neighbour
            stack.push(currentCell);
            stack.push(nextCell);
        }
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

    // add classes that remove the walls

    if (dx === 1) {
        // next is to the right
        current.walls.right = false;
        next.walls.left = false;
        current.element.classList.add("no-right-wall");
        next.element.classList.add("no-left-wall");
    } else if (dx === -1) {
        // next is to the left
        current.walls.left = false;
        next.walls.right = false;
        current.element.classList.add("no-left-wall");
        next.element.classList.add("no-right-wall");
    } else if (dy === 1) {
        // next is below
        current.walls.bottom = false;
        next.walls.top = false;
        current.element.classList.add("no-bottom-wall");
        next.element.classList.add("no-top-wall");
    } else if (dy === -1) {
        // next is above
        current.walls.top = false;
        next.walls.bottom = false;
        current.element.classList.add("no-top-wall");
        next.element.classList.add("no-bottom-wall");
    }
}

async function startRandomizedDfs() {
    const graph = getGraph();
    const startNode = graph[START_CELL_Y][START_CELL_X];
    await visitGridRandomizedDfs(startNode, graph);
}
