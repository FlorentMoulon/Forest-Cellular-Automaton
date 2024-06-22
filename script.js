

window.addEventListener('resize', function(){
    //game.getCanvas();
});



const COLOR = {
    empty: '#f2e8cf',
    root: '#a7c957',
    tree: '#386641',
    border: '#3c2f2f',
    dark_green: '#386641',
    red: '#bc4749',
}

BORDER_WIDTH_THRESHOLD = [
    {over_cell_size: 0, border_width: 0},
    {over_cell_size: 10, border_width: 0.5},
    {over_cell_size: 20, border_width: 1},
    {over_cell_size: 60, border_width: 2},
];

ROOT_EMERGENCE_PROBABILITY = 0.5; // between 0 and 1, 0 = 0% and 1 = 100%

ROOT_SPONTANEOUS_APPEARANCE_DYING_PROBABILITY = 0; // between 0 and 1, 0 = 0% and 1 = 100%

MINIMUM_ROOTS_NEAR_TO_PERSIST = 0;
MAXIMUM_ROOTS_NEAR_TO_PERSIST = 8;

MINIMUM_ROOTS_NEAR_TO_APPEAR = 1;
MAXIMUM_ROOTS_NEAR_TO_APPEAR = 1;

COULDOWN = 10;



class InputHandler{
    constructor() {
        this.keys = [];
    
        window.addEventListener("keydown", e => {
            if (!this.keys.includes(e.key))
            this.keys.push(e.key);
        });
    
        window.addEventListener("keyup", e => {
            this.keys = this.keys.filter(key => key !== e.key);
        });

        window.addEventListener("mousedown" , e => {
            if (!this.keys.includes(e.button.toString()))
            this.keys.push(e.button.toString());
        });

        window.addEventListener("mouseup" , e => {
            this.keys = this.keys.filter(key => key !== e.button.toString());
        });
    }

    getInput() {
        return this.keys;
    }

    isInputPressed(key) {
        return this.keys.includes(key);
    }

    isInputPressedAny(keys) {
        return keys.some(key => this.keys.includes(key));
    }

    isInputPressedAll(keys) {
        return keys.every(key => this.keys.includes(key));
    }
}


class DragSystem {
    constructor() {
        this.is_dragging = false;
        this.last_mouse_position = {x: 0, y: 0};
    }

    drag(new_x, new_y, min_x, max_x, min_y, max_y, canvas_width, canvas_height) {
        var mouse_x = this.getMouseGridPositionX(new_x, min_x, max_x, canvas_width);
        var mouse_y = this.getMouseGridPositionY(new_y, min_y, max_y, canvas_height);

        var delta_x = this.last_mouse_position.x - mouse_x;
        var delta_y = this.last_mouse_position.y - mouse_y;

        return {x: delta_x, y: delta_y};
    }

    isDragging() {
        return this.is_dragging;
    }

    setDraging(bool) {
        this.is_dragging = bool;
    }

    setLastDragPosition(x, y, min_x, max_x, min_y, max_y, canvas_width, canvas_height) {
        this.last_mouse_position.x = this.getMouseGridPositionX(x, min_x, max_x, canvas_width);
        this.last_mouse_position.y = this.getMouseGridPositionY(y, min_y, max_y, canvas_height);
    }

    resetLastDragPosition() {
        this.last_mouse_position.x = 0;
        this.last_mouse_position.y = 0;
    }

    getMouseGridPositionX(x, min_x, max_x, canvas_width) {
        return Math.floor((max_x - min_x) * (x / canvas_width)) + min_x;
    }

    getMouseGridPositionY(y, min_y, max_y, canvas_height) {
        return Math.floor((max_y - min_y) * (y / canvas_height)) + min_y;
    }
}

class Menu {
    constructor() {
        this.menu = document.querySelector('.menu');
        this.pause_button = document.querySelector('.pause');
        this.play_button = document.querySelector('.play');
    }

    setPause(isPaused) {
        if(isPaused){
            this.menu.classList.add('paused');
        }else{
            this.menu.classList.remove('paused');
        }
    }

    addPauseEventListener(callback) {
        this.pause_button.addEventListener('click', callback);
    }

    addPlayEventListener(callback) {
        this.play_button.addEventListener('click', callback);
    }
}


class Cells {
    constructor() {
        this.cells = new Map();
    }

    get(x, y) {
        var cell =  this.cells.get(`${x}:${y}`);
        if(cell == undefined) return 0;
        return cell;
    }

    set(x, y, value) {
        this.cells.set(`${x}:${y}`, value);
    }
    
    forEach(callback) {
        this.cells.forEach(callback);
    }
}

class Space{

    constructor() {
        this.cells = new Cells();

        this.cells.set(3, 3, 1);
    }

    updateCells() {
        var new_cells = new Cells();
        
        new_cells = this.propagateRoots(this.cells, new_cells);
        new_cells = this.killRoots(this.cells, new_cells);

        this.cells = new_cells;
    }

    propagateRoots(current_cells, new_cells) {
        var potential_root = new Set();

        current_cells.forEach((value, key) => {
            if (value != 1) return;

            var x = parseInt(key.split(':')[0]);
            var y = parseInt(key.split(':')[1]);

            // we keep old roots for now
            new_cells.set(x, y, 1);

            // we collect cell where root can appear
            potential_root = this.addPotentialRoot(x, y, potential_root, current_cells);
        });

        // we propagate roots
        potential_root.forEach((value) => {
            if(Math.random() < ROOT_EMERGENCE_PROBABILITY){
                new_cells.set(value.x, value.y, 1);
            }
        });

        return new_cells;
    }

    killRoots(current_cells, new_cells) {
        // foreach old root
        current_cells.forEach((value, key) => {
            if (value != 1) return;

            var x = parseInt(key.split(':')[0]);
            var y = parseInt(key.split(':')[1]);

            // we check if the rrot can persist with the new cells
            if(! this.rootPersist(x, y, new_cells)){
                // if not we kill it (because it was put in the new cells before during the propagation step)
                new_cells.set(x, y, 0);
            }
            else if(Math.random() < ROOT_SPONTANEOUS_APPEARANCE_DYING_PROBABILITY){
                // if the root can persist, we check if it dies spontaneously
                new_cells.set(x, y, 0);
            }
        });

        return new_cells;
    }

    rootPersist(x, y, cells) {
        var nb_root = this.numberRootsAround(x, y, cells);
        return (MINIMUM_ROOTS_NEAR_TO_PERSIST<nb_root && nb_root < MAXIMUM_ROOTS_NEAR_TO_PERSIST);
    }

    numberRootsAround(x, y, cells) {
        var nb_root = 0;
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if((i!=0 || j!=0) && cells.get(x+i, y+j) == 1){
                    nb_root++;
                }
            }
        }

        return nb_root;
    }

    addPotentialRoot(x, y, potential_root, cells) {
        // a root can progate on free cells around that only have 1 root around
        // we check the 8 cells around the root (x,y)

        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if(!((i!=0 || j!=0) && cells.get(x+i, y+j) == 0)) continue;
                if(this.numberRootsAround(x+i, y+j, cells) < MINIMUM_ROOTS_NEAR_TO_APPEAR) continue;
                if(this.numberRootsAround(x+i, y+j, cells) > MAXIMUM_ROOTS_NEAR_TO_APPEAR) continue;
                    
                potential_root.add({x: x+i, y: y+j});
            }
        }

        return potential_root;
    }
}

class DrawableSpace extends Space{
    
    constructor(min_y, min_x, max_x, ctx) {
        super();
        this.ctx = ctx;
        this.updateMinMax(min_y, min_x, max_x, ctx);

        this.drag_system = new DragSystem(0.1, true);
        this.input_handler = new InputHandler();
        this.menu = new Menu();

        this.is_paused = true;
        this.menu.setPause(true);
        this.addAllEventListener();
    }

    

    updateMinMax(min_y, min_x, max_x) {
        var nb_cells_width = max_x - min_x;
        var cells_size = Math.floor(this.ctx.canvas.width / nb_cells_width);
        var nb_cells_height = Math.floor(ctx.canvas.height / cells_size);

        if(nb_cells_width < 1 || nb_cells_height < 1) return;

        this.nb_cells_width = nb_cells_width;
        this.cells_size = cells_size;
        this.nb_cells_height = nb_cells_height;

        this.min_y = min_y;
        this.min_x = min_x;
        this.max_x = max_x;

        this.margin_x = Math.floor((this.ctx.canvas.width - this.nb_cells_width * this.cells_size) / 2);
        this.margin_y = Math.floor((this.ctx.canvas.height - this.nb_cells_height * this.cells_size) / 2);

        // console.log('---------------');
        // console.log('min_y :',this.min_y);
        // console.log('min_x :',this.min_x);
        // console.log('max_x :',this.max_x);
        // console.log('nb_cells_width :',this.nb_cells_width);
        // console.log('cells_size :',this.cells_size);
        // console.log('nb_cells_height :',this.nb_cells_height);
    }

    drawSpace(ctx) {
        //clear canvas
        ctx.fillStyle = COLOR.empty;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        //draw cells
        for (var i = 0; i < this.nb_cells_width; i++) {
            for (var j = 0; j < this.nb_cells_height; j++) {
                if(this.cells.get(i+this.min_x, j+this.min_y) == 1){
                    ctx.fillStyle = COLOR.root;
                    ctx.fillRect(i * this.cells_size + this.margin_x, j * this.cells_size + this.margin_y, this.cells_size, this.cells_size);
                }
                else if(this.cells.get(i+this.min_x, j+this.min_y) == 2){
                    ctx.fillStyle = COLOR.tree;
                    ctx.fillRect(i * this.cells_size + this.margin_x, j * this.cells_size + this.margin_y, this.cells_size, this.cells_size);
                }

                // ctx.fillStyle = COLOR.border;
                // ctx.font = "20px Arial";
                // var label = (i+this.min_x) +":"+ (j+this.min_y)
                // ctx.fillText(label, i * this.cells_size + this.margin_x + 10, j * this.cells_size + this.margin_y+ this.cells_size/2);
            }
        }

        //draw border
        this.drawBorder(ctx);
    }

    findBorderWidth() {
        var border_width = BORDER_WIDTH_THRESHOLD[0].border_width;

        for (var i = BORDER_WIDTH_THRESHOLD.length-1; i > 0; i--) {
            if(this.cells_size > BORDER_WIDTH_THRESHOLD[i].over_cell_size){
                return border_width = BORDER_WIDTH_THRESHOLD[i].border_width;
            }
        }

        return border_width;
    }

    drawBorder(ctx) {
        var border_width = this.findBorderWidth();
    
        ctx.fillStyle = COLOR.border;
        
        //vertical lines |
        for (var i = 0; i < this.nb_cells_width+1; i++) {
            ctx.fillRect(i * this.cells_size + this.margin_x, 0, border_width, ctx.canvas.height);
        }
    
        //horizontal lines -
        for (var i = 0; i < this.nb_cells_height+1; i++) {
            ctx.fillRect(0, i * this.cells_size + this.margin_y, ctx.canvas.width, border_width);
        }
    }

    zoom(delta) {
        if(this.nb_cells_width < 2 && delta <= 0) return;

        var y_delta = Math.round(delta * this.nb_cells_height / this.nb_cells_width);
        this.updateMinMax(this.min_y - y_delta, this.min_x - delta, this.max_x + delta);
    }

    drag(new_x, new_y) {
        var delta = this.drag_system.drag(new_x, new_y, this.min_x, this.max_x, this.min_y, this.min_y+this.nb_cells_height, this.ctx.canvas.width-this.margin_x, this.ctx.canvas.height-this.margin_y);
        this.updateMinMax(this.min_y + delta.y, this.min_x + delta.x, this.max_x + delta.x);
    }

    
    addAllEventListener() {
        window.addEventListener("wheel", e => {
            var delta = Math.sign(e.deltaY);
            if(this.input_handler.isInputPressed("Shift")){
                delta *= 10;
            }
            this.zoom(delta);
        });

        window.addEventListener('contextmenu', e =>{
            e.preventDefault();
            this.updateCells();
        });

        // Mouse down event to start dragging
        window.addEventListener('mousedown', (e) => {
            this.drag_system.setDraging(true);
            this.drag_system.setLastDragPosition(e.clientX, e.clientY, this.min_x, this.max_x, this.min_y, this.min_y+this.nb_cells_height, this.ctx.canvas.width-this.margin_x, this.ctx.canvas.height-this.margin_y);
        });

        // Mouse move event to handle dragging
        window.addEventListener('mousemove', (e) => {
            if (this.drag_system.isDragging()) {
                this.drag(e.clientX, e.clientY);
            }
        });

        // Mouse up event to stop dragging
        window.addEventListener('mouseup', () => {
            this.drag_system.setDraging(false);
            this.drag_system.resetLastDragPosition();
        });

        this.menu.addPlayEventListener(() => {
            if(this.is_paused){
                this.is_paused = false;
                this.menu.setPause(false);
            }
        });

        this.menu.addPauseEventListener(() => {
            if(!this.is_paused){
                this.is_paused = true;
                this.menu.setPause(true);
            }
        });
    }
}


function getCanvas() {
    var canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    return ctx = canvas.getContext('2d');
}


window.addEventListener('load', function(){
    var ctx = getCanvas();
    var space = new DrawableSpace(0, 0, 10, ctx);

    var count = 0

    function draw() {

        space.drawSpace(ctx);
        if(count == COULDOWN){
            if(!space.is_paused){
                space.updateCells();
            }
            count = 0;
        }
        count++;
    
        window.requestAnimationFrame(draw);
    }
    

    draw();

    console.log('---------------');
});