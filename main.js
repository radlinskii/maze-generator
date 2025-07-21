const GRID_WIDTH = 25;
const GRID_HEIGHT = 25;

const START_CELL_X = 0;
const START_CELL_Y = 0;
const END_CELL_X = 24;
const END_CELL_Y = 24;

window.onload = () => {
    console.log("hello world");

    setupContainer();

    const startButton = document.querySelector("#startButton");
    // TODO: handle reset click

    startButton.addEventListener("click", handleStartButtonClick);
};

function setupContainer() {
    const mazeContainer = document.querySelector("#mazeContainer");

    mazeContainer.style.gridTemplateColumns = `repeat(${GRID_WIDTH}, 1fr)`;

    for (let i = 0; i < GRID_HEIGHT; i++) {
        for (let j = 0; j < GRID_WIDTH; j++) {
            const div = document.createElement("div");

            div.classList.add("cell");

            // TODO: mark starting cell
            // TODO: mark end cell

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

    await visitGrid(grid);
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
