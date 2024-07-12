



const COLOR = {
    empty: '#f2e8cf',
    root: '#a7c957',
    tree: '#386641',
    border: '#386641',
    black: '#3c2f2f',
    dark_green: '#386641',
    red: '#bc4749',
}

BORDER_WIDTH_THRESHOLD = [
    {over_cell_size: 0, border_width: 0},
    {over_cell_size: 10, border_width: 0.5},
    {over_cell_size: 20, border_width: 1},
    {over_cell_size: 60, border_width: 2},
];

COULDOWN = 10;

DEFAULT_VALUES = {
    root_emergence_probability: 0.5, // between 0 and 1, 0 = 0% and 1 = 100%
    root_spontaneous_apperance_dying_probability: 0, // between 0 and 1, 0 = 0% and 1 = 100%
    minimum_roots_near_to_persist: 0,
    maximum_roots_near_to_persist: 8,
    minimum_roots_near_to_appear: 1,
    maximum_roots_near_to_appear: 1,
    maximum_roots_in_zone_to_appear: 7,  // >= 7 to avoid block
};



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
        this.play_menu = document.querySelector('#play-menu');
        this.pause_button = this.play_menu.querySelector('#pause');
        this.play_button = this.play_menu.querySelector('#play');
        this.step_button = this.play_menu.querySelector('#step');
        this.step10_button = this.play_menu.querySelector('#step10');
        this.clear_button = this.play_menu.querySelector('#clear');

        this.parameter_menu = document.querySelector('#parameter-menu');
        this.expander = this.parameter_menu.querySelector('.expander');
        this.rootEmergenceProbability = this.parameter_menu.querySelector('#rootEmergenceProbability');
        this.rootSpontaneousAppearanceDyingProbability = this.parameter_menu.querySelector('#rootSpontaneousAppearanceDyingProbability');
        this.minimumRootsNearToPersist = this.parameter_menu.querySelector('#minimumRootsNearToPersist');
        this.maximumRootsNearToPersist = this.parameter_menu.querySelector('#maximumRootsNearToPersist');
        this.minimumRootsNearToAppear = this.parameter_menu.querySelector('#minimumRootsNearToAppear');
        this.maximumRootsNearToAppear = this.parameter_menu.querySelector('#maximumRootsNearToAppear');
        this.maximumRootsInZoneToAppear = this.parameter_menu.querySelector('#maximumRootsInZoneToAppear');

        this.reset_button = this.parameter_menu.querySelector('#reset');

        this.addExpanderEventListener();
    }

    setPause(isPaused) {
        if(isPaused){
            this.play_menu.classList.add('paused');
        }else{
            this.play_menu.classList.remove('paused');
        }
    }

    addPauseEventListener(callback) {
        this.pause_button.addEventListener('click', callback);
    }

    addPlayEventListener(callback) {
        this.play_button.addEventListener('click', callback);
    }

    addStepEventListener(callback) {
        this.step_button.addEventListener('click', callback);
    }

    addStep10EventListener(callback) {
        this.step10_button.addEventListener('click', callback);
    }

    addClearEventListener(callback) {
        this.clear_button.addEventListener('click', callback);
    }

    addExpanderEventListener() {
        this.expander.addEventListener('click', () => {
            this.parameter_menu.classList.toggle('expanded');
        });
    }

    getRootEmergenceProbability() {
        return this.rootEmergenceProbability.value;
    }

    getRootSpontaneousAppearanceDyingProbability() {
        return this.rootSpontaneousAppearanceDyingProbability.value;
    }

    getMinimumRootsNearToPersist() {
        return this.minimumRootsNearToPersist.value;
    }

    getMaximumRootsNearToPersist() {
        return this.maximumRootsNearToPersist.value;
    }

    getMinimumRootsNearToAppear() {
        return this.minimumRootsNearToAppear.value;
    }

    getMaximumRootsNearToAppear() {
        return this.maximumRootsNearToAppear.value;
    }

    getMaximumRootsInZoneToAppear() {
        return this.maximumRootsInZoneToAppear.value;
    }

    addParameterChangeEventListener(callback) {
        this.rootEmergenceProbability.addEventListener('change', callback);
        this.rootSpontaneousAppearanceDyingProbability.addEventListener('change', callback);
        this.minimumRootsNearToPersist.addEventListener('change', callback);
        this.maximumRootsNearToPersist.addEventListener('change', callback);
        this.minimumRootsNearToAppear.addEventListener('change', callback);
        this.maximumRootsNearToAppear.addEventListener('change', callback);
        this.maximumRootsInZoneToAppear.addEventListener('change', callback);
    }
    
    addResetEventListener(callback) {
        this.reset_button.addEventListener('click', callback);
    }

    setAllValues(values) {
        this.rootEmergenceProbability.value = values.root_emergence_probability;
        this.rootSpontaneousAppearanceDyingProbability.value = values.root_spontaneous_apperance_dying_probability;
        this.minimumRootsNearToPersist.value = values.minimum_roots_near_to_persist;
        this.maximumRootsNearToPersist.value = values.maximum_roots_near_to_persist;
        this.minimumRootsNearToAppear.value = values.minimum_roots_near_to_appear;
        this.maximumRootsNearToAppear.value = values.maximum_roots_near_to_appear;
        this.maximumRootsInZoneToAppear.value = values.maximum_roots_in_zone_to_appear;
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

        this.root_emergence_probability = DEFAULT_VALUES.root_emergence_probability; 

        this.root_spontaneous_apperance_dying_probability = DEFAULT_VALUES.root_spontaneous_apperance_dying_probability; 

        this.minimum_roots_near_to_persist = DEFAULT_VALUES.minimum_roots_near_to_persist;
        this.maximum_roots_near_to_persist = DEFAULT_VALUES.maximum_roots_near_to_persist;

        this.minimum_roots_near_to_appear = DEFAULT_VALUES.minimum_roots_near_to_appear;
        this.maximum_roots_near_to_appear = DEFAULT_VALUES.maximum_roots_near_to_appear;

        this.maximum_roots_in_zone_to_appear = DEFAULT_VALUES.maximum_roots_in_zone_to_appear;

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
            if(Math.random() < this.root_emergence_probability){
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
            else if(Math.random() < this.root_spontaneous_apperance_dying_probability){
                // if the root can persist, we check if it dies spontaneously
                new_cells.set(x, y, 0);
            }
        });

        return new_cells;
    }

    rootPersist(x, y, cells) {
        var nb_root = this.numberRootsAround(x, y, cells);
        return (this.minimum_roots_near_to_persist <= nb_root && nb_root <= this.maximum_roots_near_to_persist);
    }

    numberRootsAround(x, y, cells, size=1) {
        // check the 8 cells around the root (x,y)

        var nb_root = 0;
        for (var i = -size; i < size+1; i++) {
            for (var j = -size; j < size+1; j++) {
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
                var nb_root_around = this.numberRootsAround(x+i, y+j, cells);
                if(nb_root_around < this.minimum_roots_near_to_appear) continue;
                if(nb_root_around > this.maximum_roots_near_to_appear) continue;

                if(this.numberRootsAround(x+i, y+j, cells, 3) > this.maximum_roots_in_zone_to_appear) continue;
                    
                potential_root.add({x: x+i, y: y+j});
            }
        }

        return potential_root;
    }

    clear() {
        this.cells = new Cells();
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

    changeCellByMousePosition(mouse_x, mouse_y) {
        var x = this.drag_system.getMouseGridPositionX(mouse_x, this.min_x, this.max_x, this.ctx.canvas.width);
        var y = this.drag_system.getMouseGridPositionY(mouse_y, this.min_y, this.min_y+this.nb_cells_height, this.ctx.canvas.height);

        var new_value = this.cells.get(x, y) == 1 ? 0 : 1;

        this.cells.set(x, y, new_value);
    }

    resizeCanvas() {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;

        this.updateMinMax(this.min_y, this.min_x, this.max_x);
    }

    
    addAllEventListener() {
        window.addEventListener('resize', (e) => {
            this.resizeCanvas();
        });


        window.addEventListener("wheel", (e) => {
            var delta = Math.sign(e.deltaY);
            if(this.input_handler.isInputPressed("Shift")){
                delta *= 10;
            }
            this.zoom(delta);
        });

        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            if(this.is_paused) this.changeCellByMousePosition(e.clientX, e.clientY);
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

        this.menu.addStepEventListener(() => {
            this.updateCells();
        });

        this.menu.addStep10EventListener(() => {
            for (var i = 0; i < 10; i++) {
                this.updateCells();
            }
        });

        this.menu.addClearEventListener(() => {
            if(this.is_paused) this.clear();
        });

        this.menu.addParameterChangeEventListener(() => {
            this.root_emergence_probability = this.menu.getRootEmergenceProbability();
            this.root_spontaneous_apperance_dying_probability = this.menu.getRootSpontaneousAppearanceDyingProbability();
            this.minimum_roots_near_to_persist = this.menu.getMinimumRootsNearToPersist();
            this.maximum_roots_near_to_persist = this.menu.getMaximumRootsNearToPersist();
            this.minimum_roots_near_to_appear = this.menu.getMinimumRootsNearToAppear();
            this.maximum_roots_near_to_appear = this.menu.getMaximumRootsNearToAppear();
            this.maximum_roots_in_zone_to_appear = this.menu.getMaximumRootsInZoneToAppear();
        });

        this.menu.addResetEventListener(() => {
            this.menu.setAllValues(DEFAULT_VALUES);
            this.root_emergence_probability = this.menu.getRootEmergenceProbability();
            this.root_spontaneous_apperance_dying_probability = this.menu.getRootSpontaneousAppearanceDyingProbability();
            this.minimum_roots_near_to_persist = this.menu.getMinimumRootsNearToPersist();
            this.maximum_roots_near_to_persist = this.menu.getMaximumRootsNearToPersist();
            this.minimum_roots_near_to_appear = this.menu.getMinimumRootsNearToAppear();
            this.maximum_roots_near_to_appear = this.menu.getMaximumRootsNearToAppear();
            this.maximum_roots_in_zone_to_appear = this.menu.getMaximumRootsInZoneToAppear();
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