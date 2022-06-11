let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let current;

class Maze {
    constructor(size, rows, cols) {
        this.size = size;
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.stack = [];

        this.path = [];
    }

    setup() {
        for (let r = 0; r < this.rows; r++) {
            let row = [];
            
            for (let c = 0; c < this.cols; c++) {
                let cell = new Cell(r, c, this.grid, this.size);
                row.push(cell);
            }

            this.grid.push(row);
        }

        this.end = this.grid[this.rows - 1][this.cols - 1]

        current = this.grid[0][0];
    }

    draw() {
        canvas.width = this.size;
        canvas.height = this.size;
        
        current.visited = true;


        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c].show(this.size, this.rows, this.cols, this.stack, this.path)
            }
        }

        let next = current.check();

        if (next) {
            this.stack.push(current);

            current.highlight(this.rows, this.cols, 'purple');

            current.removewalls(current, next);

            current = next;
        } else if (this.stack.length > 0 || current == this.end) {
            let cell = this.stack.pop();
            current = cell;
            current.highlight(this.rows, this.cols, 'blue');
        }

        if (current == this.end) this.path = [... this.stack];
        this.end.highlight(this.rows, this.cols, 'red');
        this.grid[0][0].highlight(this.rows, this.cols, 'green');

        if (this.stack.length == 0) {
            return
        }

        window.requestAnimationFrame(() => {this.draw()})
    }
}

class Cell {
    constructor(rows, cols, parentgrid, parentsize) {
        this.row = rows;
        this.col = cols;
        this.parentgrid = parentgrid;
        this.parentsize = parentsize;

        this.visited = false;
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true,
        }
    }

    check() {
        let grid = this.parentgrid;
        let col = this.col;
        let row = this.row;

        let neighbors = [];

        let top = row !== 0 ? grid[row - 1][col]: undefined;
        let right = col !== grid[grid.length - 1].length - 1 ? grid[row][col + 1]: undefined;
        let bottom = row !== grid.length - 1 ? grid[row + 1][col]: undefined;
        let left = col !== 0 ? grid[row][col - 1]: undefined;

        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);

        if (neighbors.length !== 0) {
            return neighbors[Math.floor(Math.random() * neighbors.length)];
        } else {
            return undefined
        }
    }

    drawtopwall(x, y, size, cols, rows) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size / cols, y);
        ctx.stroke();
    }
    drawrightwall(x, y, size, cols, rows) {
        ctx.beginPath();
        ctx.moveTo(x + size / cols, y);
        ctx.lineTo(x + size / cols, y + size / rows);
        ctx.stroke();
    }
    drawbottomwall(x, y, size, cols, rows) {
        ctx.beginPath();
        ctx.moveTo(x, y + size / rows);
        ctx.lineTo(x + size / cols, y + size / rows);
        ctx.stroke();
    }
    drawleftwall(x, y, size, cols, rows) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + size / rows);
        ctx.stroke();
    }

    highlight(rows, cols, color) {
        let x = this.col * this.parentsize / cols + 1;
        let y = this.row * this.parentsize / rows + 1;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.parentsize / cols - 3, this.parentsize / rows - 3)
    }

    removewalls(cell1, cell2) {
        let x = cell1.col - cell2.col;

        if (x == 1) {
            cell1.walls.left = false;
            cell2.walls.right = false;
        } else if (x == -1) {
            cell1.walls.right = false;
            cell2.walls.left = false;
        }

        let y = cell1.row - cell2.row;

        if (y == 1) {
            cell1.walls.top = false;
            cell2.walls.bottom = false;
        } else if (y == -1) {
            cell1.walls.bottom = false;
            cell2.walls.top = false;
        }
    }

    show(size, rows, cols, stack, path) {
        let x = this.col * size / cols;
        let y = this.row * size / rows;

        ctx.lineWidth = 2;

        if (this.walls.top) this.drawtopwall(x, y, size, cols, rows);
        if (this.walls.right) this.drawrightwall(x, y, size, cols, rows);
        if (this.walls.bottom) this.drawbottomwall(x, y, size, cols, rows);
        if (this.walls.left) this.drawleftwall(x, y, size, cols, rows);
    
        if (stack.includes(this)) {
            ctx.fillStyle = 'cyan';
            ctx.fillRect(x + 1, y + 1, size / cols - 2, size / rows - 2);
        }
        if (path.includes(this)) {
            ctx.fillStyle = 'orange';
            ctx.fillRect(x + 1, y + 1, size / cols - 2, size / rows - 2);
        }
    }
}

const len = 20;

let maze = new Maze(500, len, len);

maze.setup();
maze.draw();