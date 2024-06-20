

window.addEventListener('resize', function(){
    //game.getCanvas();
});



const COLOR = {
    empty: '#f2e8cf',
    root: '#a7c957',
    tree: '#f2e8cf',
    border: '#3c2f2f',
    dark_green: '#386641',
    red: '#bc4749',
}




class Cells {
    constructor() {
        this.cells = new Map();
    }

    get(x, y) {
        var a = this.cells.get(x);
        if(a == undefined) return 0;

        var b = a.get(y);
        if(b == undefined) return 0;

        return b;
    }

    set(x, y, value) {
        if(this.cells.get(x) == undefined) this.cells.set(x, new Map());
        this.cells.get(x).set(y, value);
    }
}

class Space{

    constructor() {
        this.cells = new Cells();

        this.cells.set(5, 5, 1);
    }

}

class DrawableSpace extends Space{
    
    constructor(min_y, min_x, max_x, ctx) {
        super();
        this.ctx = ctx;
        this.updateMinMax(min_y, min_x, max_x, ctx);
        this.addAllEventListener();

        this.isDragging = false;
        this.last_drag_position = {x: 0, y: 0};
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

        console.log('---------------');
        console.log('min_y :',this.min_y);
        console.log('min_x :',this.min_x);
        console.log('max_x :',this.max_x);
        console.log('nb_cells_width :',this.nb_cells_width);
        console.log('cells_size :',this.cells_size);
        console.log('nb_cells_height :',this.nb_cells_height);
    }

    drawSpace(ctx) {
        //console.log('drawSpace');

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
            }
        }

        //draw border
        this.drawBorder(ctx);
    }

    drawBorder(ctx) {
        var border_width = 2;
    
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
        var mouse_sensitivity = 0.1;
        var miror_drag_mode = true;

        var delta_x = Math.round((new_x - this.last_drag_position.x) * mouse_sensitivity);
        var delta_y = Math.round((new_y - this.last_drag_position.y) * mouse_sensitivity);

        if(miror_drag_mode){
            delta_x = -delta_x;
            delta_y = -delta_y;
        }

        if(delta_x != 0){
            this.last_drag_position.x = new_x;
        }
        if(delta_y != 0){
            this.last_drag_position.y = new_y;
        }

        this.updateMinMax(this.min_y + delta_y, this.min_x + delta_x, this.max_x + delta_x);
    }

    
    addAllEventListener() {
        window.addEventListener("wheel", event => {
            const delta = Math.sign(event.deltaY);
            this.zoom(delta);
        });

        window.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        }, false);

        // Mouse down event to start dragging
        window.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.last_drag_position = {x: e.clientX, y: e.clientY};
        });

        // Mouse move event to handle dragging
        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e.clientX, e.clientY);
            }
        });

        // Mouse up event to stop dragging
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.last_drag_position = {x: 0, y: 0};
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


    function draw() {

        space.drawSpace(ctx);
    
        //space.updateCells();
    
        window.requestAnimationFrame(draw);
    }
    

    draw();

    console.log('---------------');
});