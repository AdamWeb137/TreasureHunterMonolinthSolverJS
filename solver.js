const XY = new_struct(["x","number"],["y","number"]);
const ALLDIRECTIONS = new_struct(["up","any"],["down","any"],["left","any"],["right","any"]);

function get_block(arr, xy){
    return arr[xy.y][xy.x];
}

function set_block(arr,xy,val){
    arr[xy.y][xy.x] = val;
}

class Board {

    static width = 1;
    static height = 1;

    static set_dimensions(w,h){
        Board.width = w;
        Board.height = h;
    }

    static get_empty(filler=0,rand_max=null){
        let empty = [];
        for(let y = 0; y < Board.height; y++){
            let row = [];
            for(let x = 0; x < Board.width; x++){
                if(rand_max != null){
                    row.push(Math.floor(Math.random()*rand_max + 1));
                    continue;
                }
                row.push(filler);
            }
            empty.push(row);
        }
        return empty;
    }

    static get_board_txt(board){
        let txt = "";
        for(let y = 0; y < board.length; y++){
            let row = "[";
            for(let x = 0; x < board[y].length; x++){
                row += `${board[y][x]}, `;
            }
            row += "],\n";
            txt += row;
        }
        return txt;
    }

    static print_board(board){
        console.log(Board.get_board_txt(board));
    }

    static coor_to_index(xy){
        return xy.y*Board.width + xy.x;
    }

    static index_to_coor(i){
        return XY(i % Board.width, Math.floor(i / Board.width));
    }

    static in_bounds(xy){
        return (0 <= xy.x && xy.x < Board.width) && (0 <= xy.y && xy.y < Board.height);
    }

    static same_coors(xy1,xy2){
        return (xy1.x == xy2.x) && (xy1.y == xy2.y);
    }

    static get_all_directions(xy){
        return ALLDIRECTIONS(
            XY(xy.x, xy.y - 1),
            XY(xy.x, xy.y + 1),
            XY(xy.x - 1, xy.y),
            XY(xy.x + 1, xy.y),
        );
    }

    static clone_board(board){
        let nboard = [];
        for(let y = 0; y < board.length; y++){
            let row = [];
            for(let x = 0; x < board[y].length; x++){
                row.push(board[y][x]);
            }
            nboard.push(row);
        }
        return nboard;
    }

    static replace_a_with_b(board,a,b){
        for(let y = 0; y < board.length; y++){
            for(let x = 0; x < board[y].length; x++){
                if(board[y][x] == a) board[y][x] = b;
            }
        }
        return board;
    }

    constructor(board, parent, cleared, excavation, depth){
        this.board = board;
        this.parent = parent;
        this.cleared_area = cleared;
        this.excavation_coor = excavation;
        this.clickable_island_area = 0;
        this.depth = depth;
        this.get_clickable();
    }

    get_block(xy){
        return get_block(this.board,xy);
    }

    set_block(xy,val){
        set_block(this.board,xy,val);
    }

    print_board(){
        Board.print_board(this.board);
    }

    get_clickable(){

        /*
        -1 = to be checked
        0 = not checked
        1 = clickable
        2 = checked
        */

        let empty = Board.get_empty();
        let clickable_coors = [];
        let clickable_area = 0;
        let stack = [0];
        set_block(empty, XY(0,0), -1);

        const search = (coor, start_block) => {

            if(get_block(empty, coor) != -1) return;
            if(!start_block) clickable_area++;
            set_block(empty, coor, 2);

            let block_type = this.get_block(coor);
            let dirs = Board.get_all_directions(coor);

            for(let dir in dirs){
                let d = dirs[dir];
                if(!Board.in_bounds(d)) continue;
                if(this.get_block(d) == block_type){
                    if(get_block(empty, d) >= 1) continue;
                    if(this.get_block(d) == 0){
                        set_block(empty,d,-1);
                        search(d,true);
                        continue;
                    }
                    if(start_block){
                        set_block(empty, coor, 1);
                        clickable_coors.push(coor);
                        clickable_area++;
                    }
                    set_block(empty,d,-1);
                    search(d, false);
                
                }else if(get_block(empty, d) == 0){
                    stack.push(Board.coor_to_index(d));
                    set_block(empty, d, -1);
                }
            }

        };

        while(stack.length > 0){
            let next = stack.shift();
            let coor = Board.index_to_coor(next);
            if(get_block(empty,coor) == -1)search(coor, true);
        }

        this.clickable_area = clickable_area;
        this.clickable_coors = clickable_coors;
        this.clickable_nonisland_coors = [];
        this.clickable_island_coors = [];


        for(let c of clickable_coors){
            let ii = this.is_island(c);
            if(!ii)this.clickable_nonisland_coors.push(c);
            if(ii)this.clickable_island_coors.push(c);
        }
    }

    inside_index(){
        let ii = 0;
        for(let y = 0; y < Board.height; y++){
            for(let x = 0; x < Board.width; x++){
                ii += y*x*(this.board[y][x] > 0);
            }
        }
        return ii;
    }

    objective_cost(){
        return this.cleared_area + this.clickable_island_area;
    }

    tie_breaker_cost(){
        return this.depth;
    }

    g_cost(){
        return this.clickable_area - this.clickable_island_area;
    }

    h_cost(){
        return this.cleared_area + this.clickable_area;
    }

    f_cost(){
        return this.cleared_area+this.clickable_area+this.depth;
    }

    is_island(coor){
        let block_type = this.get_block(coor);
        let been_to = new Set();
        let continue_search = true;
        let area = 0;
        const search = (c)=>{
            let i = Board.coor_to_index(c);
            if(!continue_search)return;
            if(!Board.in_bounds(c))return;
            if(been_to.has(i))return;
            been_to.add(i);
            if(this.get_block(c) == 0)return;
            if(this.get_block(c) != block_type){
                area = 0;
                continue_search = false;
                return;
            }
            area++;
            let dirs = Board.get_all_directions(c);
            for(let dir in dirs){
                let d = dirs[dir];
                search(d);
            }
        };
        search(coor);
        if(continue_search)this.clickable_island_area += area;
        return (continue_search);
    }

    get_new_board_from_excavated_coor(c){
        let block_type = this.get_block(c);
        let additional_cleared_area = 1;
        let nb = Board.clone_board(this.board);
        let changed_set = new Set();
        set_block(nb,c,-1);
        const search = (coor)=>{
            if(get_block(nb,coor) != -1) return;
            let dirs = Board.get_all_directions(coor);
            for(let dir in dirs){
                let d = dirs[dir];
                if(!Board.in_bounds(d)) continue;
                if(get_block(nb, d) == block_type && !(changed_set.has(Board.coor_to_index(d)))){
                    set_block(nb,d,-1);
                    additional_cleared_area++;
                    search(d);
                }else if(get_block(nb,d) != 0){
                    let i = Board.coor_to_index(d);
                    if(changed_set.has(i)) continue;
                    changed_set.add(i);
                    let new_state = get_block(nb,d)+1;
                    if(new_state == 5) new_state = 1;
                    set_block(nb,d,new_state);
                }
            }
        };
        search(c);
        nb = Board.replace_a_with_b(nb,-1,0);
        return new Board(nb, this, this.cleared_area+additional_cleared_area, c, this.depth+1);
    }

    count_zeros(){
        let z = 0;
        for(let y = 0; y < Board.height; y++){
            for(let x = 0; x < Board.width; x++){
                if(this.board[y][x] == 0) z++;
            }
        }
        return z;
    }

}

function get_solved_board(starting_board, percent_goal, max_searches=5000){

    let blocks_needed_for_goal = Math.ceil((percent_goal/100)*Board.width*Board.height);
    let cb_board = starting_board;
    let stack = [starting_board];
    let current_searches = 0;

    const get_best_index = ()=>{
        let cb_f = -1;
        let cb_g = Infinity;
        let cb_i = -1;
        for(let i = 0; i < stack.length; i++){
            if((stack[i].f_cost() > cb_f) || (stack[i].f_cost() == cb_f && stack[i].tie_breaker_cost() < cb_g)){
                cb_i = i;
                cb_f = stack[i].f_cost();
                cb_g = stack[i].tie_breaker_cost();
            }
        }
        return cb_i;
    };

    while(stack.length > 0 && max_searches > current_searches){
        let bi = get_best_index();
        let nb_board = stack.splice(bi,1)[0];
        if(nb_board.objective_cost() > cb_board.objective_cost()) cb_board = nb_board;
        if(nb_board.objective_cost() >= blocks_needed_for_goal){
            console.log("solution found");
            return nb_board;
        }
        for(let coor of nb_board.clickable_nonisland_coors){
            stack.push(nb_board.get_new_board_from_excavated_coor(coor));
        }
        current_searches++;
    }

    console.log("best possible found");
    return cb_board;
}

function get_traced_boards(child_board){
    let boards= [child_board];
    let parent = child_board.parent;
    while(parent != null){
        boards.unshift(parent);
        parent = parent.parent;
    }
    return boards;
}

function solve_board(starting_board,percent_goal,max_searches=5000){
    let solved_board = get_solved_board(starting_board,percent_goal,max_searches);
    let boards = get_traced_boards(solved_board);
    return boards;
}