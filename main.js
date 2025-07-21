const GRID_WIDTH = 25;
const GRID_HEIGHT = 25;

const START_CELL_X = 12;
const START_CELL_Y = 12;
const END_CELL_X = 4;
const END_CELL_Y = 24;

window.onload = () => {
    console.log("hello world");

    setupContainer();

    const startButton = document.querySelector("#startButton");
    
    const resetButton = document.querySelector("#resetButton");

    startButton.addEventListener("click", handleStartButtonClick);
    
    resetButton.addEventListener("click", handleResetButtonClick);
};

function setupContainer() {
    const mazeContainer = document.querySelector("#mazeContainer");

    mazeContainer.style.gridTemplateColumns = `repeat(${GRID_WIDTH}, 1fr)`;

    for (let i = 0; i < GRID_HEIGHT; i++) {
        for (let j = 0; j < GRID_WIDTH; j++) {
            const div = document.createElement("div");

            div.classList.add("cell");

            if(i === START_CELL_Y && j === START_CELL_X){
                div.classList.add("start");
            }

            if(i === END_CELL_Y && j === END_CELL_X){
                div.classList.add("end");
            }

            mazeContainer.appendChild(div);
        }
    }
}

async function handleStartButtonClick() {
    console.log("start click");

    // TODO: disable start button
    // TODO: enable reset button

    const grid = createGrid();
    console.log(grid);

    await visitGridBfs(grid);
}

async function handleResetButtonClick() {
    console.log("reset click");
    const mazeContainer = document.querySelector("#mazeContainer");

    const cells = mazeContainer.childNodes;

    cells.forEach((cell) => {
        cell.classList.remove("visited");
    });
}

function createGrid() {
    const mazeContainer = document.querySelector("#mazeContainer");

    const cells = mazeContainer.childNodes;

    const grid = Array.from({ length: GRID_HEIGHT }, () =>
        Array.from({ length: GRID_WIDTH }),
    );

    cells.forEach((cell, index) => {
        const columnIndex = index % GRID_WIDTH;
        const rowIndex = Math.floor(index / GRID_HEIGHT);

        grid[rowIndex][columnIndex] = cell;
    });

    return grid;
}

async function visitGrid(grid) {
    // TODO: visit cells starting from START and finish when finding END

    for (let i = 0; i < GRID_HEIGHT; i++) {
        for (let j = 0; j < GRID_WIDTH; j++) {
            const cell = grid[i][j];

            await sleep(10);

            cell.classList.add("visited");
        }
    }
}

async function sleep(timeMs) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeMs);
    });
}

async function visitGridBfs(grid) {
    const queue = []
    const graph = []

    for (let i = 0; i < GRID_HEIGHT; i++) {
        const row = []
        for (let j = 0; j < GRID_WIDTH; j++) {
            const cell = grid[i][j];
            row.push({y:i , x:j , cell:cell , visited:false})
        }
        graph.push(row)
    }

    const startNode = graph[START_CELL_Y][START_CELL_X]
    queue.push(startNode)
    startNode.visited = true

    while(queue.length > 0){
        await sleep(5)

        const node = queue.shift()
        
        node.cell.classList.add("visited");

        if(node.x === END_CELL_X && node.y === END_CELL_Y){
            console.log("hura")
            return
        }

        if(node.y < GRID_HEIGHT - 1 && graph[node.y + 1][node.x].visited === false){
            queue.push(graph[node.y + 1][node.x])
            graph[node.y + 1][node.x].visited = true
        }
        
        if(node.x < GRID_WIDTH - 1 && graph[node.y][node.x + 1].visited === false){
            queue.push(graph[node.y][node.x + 1])
            graph[node.y][node.x + 1].visited = true
        }

        if(node.y > 0 && graph[node.y - 1][node.x].visited === false){
            queue.push(graph[node.y - 1][node.x])
            graph[node.y - 1][node.x].visited = true
        }

        if(node.x > 0 && graph[node.y][node.x -1].visited === false){
            queue.push(graph[node.y][node.x - 1])
            graph[node.y][node.x - 1].visited = true
        }
    }
}