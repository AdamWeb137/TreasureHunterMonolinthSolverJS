const XY = new_struct(["x","number"],["y","number"]);
const ALLDIRECTIONS = new_struct(["up","any"],["down","any"],["left","any"],["right","any"]);
const PRIZE = new_struct(["type","any"],["coors","any"]);

function get_block(arr, xy){
    return arr[xy.y][xy.x];
}

function set_block(arr,xy,val){
    arr[xy.y][xy.x] = val;
}

class Board {

    static width = 1;
    static height = 1;
    static area = 1;

    static set_dimensions(w,h){
        Board.width = w;
        Board.height = h;
        Board.area = w*h;
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
        let x = xy.x;
        let y = xy.y;
        let left = XY(x-1,y);
        let right = XY(x+1,y);
        let up = XY(x,y-1);
        let down = XY(x,y+1);
        let dirs = [];
        if(Board.in_bounds(left))dirs.push(left);
        if(Board.in_bounds(right))dirs.push(right);
        if(Board.in_bounds(up))dirs.push(up);
        if(Board.in_bounds(down))dirs.push(down);
        return dirs;
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
    
    static clone_prizes(prizes){
    	let nps = [];
    	for(let i = 0; i < prizes.length; i++){
    		let np = PRIZE(prizes[i].type,[]);
    		for(let j = 0; j < prizes[i].coors.length; j++){
    			np.coors.push(prizes[i].coors[j]);
    		}
    		nps.push(np);
    	}
    	return nps;
    }
    
    static create_prizes_from_board(b){
    	let empty = Board.get_empty();
    	let prizes = [];
    	let prizes_set = {};
        let stack = [0];
        set_block(empty, XY(0,0), -1);
        const search = (coor, start_block,index) => {
            if(get_block(empty, coor) != -1) return;
            set_block(empty, coor, 2);
            let block_type = get_block(b,coor);
            let dirs = Board.get_all_directions(coor);
            for(let d of dirs){
                if(get_block(b,d) == block_type){
                    if(get_block(empty, d) >= 1) continue;
                    if(get_block(b,d) == 0){
                        set_block(empty,d,-1);
                        search(d,true, null);
                        continue;
                    }
                    if(start_block){
                        set_block(empty, coor, 1);
                        let ind = Board.coor_to_index(coor);
                        prizes_set[ind] = PRIZE(block_type,[ind]);
                        index = ind;
                    }
                    set_block(empty,d,-1);
                    prizes_set[index].coors.push(Board.coor_to_index(d));
                    search(d, false,index);
                
                }else if(get_block(empty, d) == 0){
                    stack.push(Board.coor_to_index(d));
                    set_block(empty, d, -1);
                }
            }

        };
        while(stack.length > 0){
            let next = stack.shift();
            let coor = Board.index_to_coor(next);
            if(get_block(empty,coor) == -1)search(coor, true, null);
        }
        for(let ind in prizes_set){
        	prizes.push(prizes_set[ind]);
        }
        return prizes;
    }

    static get_board_from_arrays(input, type){
        let cl = Board.count_zeros(input);
        let nb = new Board(input, null, cl, null, 0, cl*5, null, type);
        return nb;
    }

    static count_zeros(b){
        let z = 0;
        for(let y = 0; y < Board.height; y++){
            for(let x = 0; x < Board.width; x++){
                if(b[y][x] == 0) z++;
            }
        }
        return z;
    }

    constructor(board, parent, cleared, excavation, depth, score, prizes, prize_board){
        this.board = board;
        this.parent = parent;
        this.cleared_area = cleared;
        this.excavation_coor = excavation;
        this.depth = depth;
		this.score = score;
		this.prizes = prizes;
		this.prize_board = prize_board;
		if(this.prizes == null) this.prizes = Board.create_prizes_from_board(this.prize_board);
        this.get_clickable();
        this.free_prizes();
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

            for(let d of dirs){
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

		let i = 0;
		while(i < clickable_coors.length){
			let c = clickable_coors[i];
			if(this.is_island(c)){
				clickable_coors.splice(i,1);
				continue;
            }
			i++;
		}

        this.clickable_area = clickable_area;
        this.clickable_coors = clickable_coors;
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
        return this.score;
    }

    tie_breaker_cost(){
        return this.depth;
    }

    f_cost(){
        return this.score+this.clickable_area*5+this.depth;
    }

    is_island(coor){
        let block_type = this.get_block(coor);
        let been_to = Board.get_empty(0);
        let continue_search = true;
        let area = 0;
        const search = (c)=>{
            let i = Board.coor_to_index(c);
            if(!continue_search)return;
            if(!Board.in_bounds(c))return;
            if(get_block(been_to,c) == 1)return;
            if(this.get_block(c) == 0)return;
            if(this.get_block(c) != block_type){
                area = 0;
                continue_search = false;
                return;
            }
            set_block(been_to,c,1);
            area++;
            let dirs = Board.get_all_directions(c);
            for(let d of dirs){
                search(d);
            }
        };
        search(coor);
        if(continue_search){
        	this.cleared_area += area;
        	this.score += area*5;
        	this.clickable_area -= area;
        	for(let y = 0; y < Board.height; y++){
	        	for(let x = 0; x < Board.width; x++){
					if(been_to[y][x] == 1) this.set_block(XY(x,y),0);
				}
			}			
        }
        return (continue_search);
    }
    
    free_prizes(){
    	let i = 0;
    	while(i < this.prizes.length){
    		let p = this.prizes[i];
    		let is_freed = true;
    		for(let ind of p.coors){
    			let c = Board.index_to_coor(ind);
    			if(this.get_block(c) != 0){
    				is_freed = false;
    				break;
    			}
    		}
    		if(is_freed){
    			this.score += p.type*500;
    			this.prizes.splice(i,1);
    			continue;
    		}
    		i++;
    	}
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
            for(let d of dirs){
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
        return new Board(nb, this, this.cleared_area+additional_cleared_area, c, this.depth+1, this.score+additional_cleared_area*5, Board.clone_prizes(this.prizes),this.prize_board);
    }

    count_zeros(){
        return Board.count_zeros(this.board);
    }

}

function get_solved_board(starting_board, score_goal, max_searches=5000){
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
        console.log(current_searches);
        let bi = get_best_index();
        let nb_board = stack.splice(bi,1)[0];
        if(nb_board.objective_cost() > cb_board.objective_cost()) cb_board = nb_board;
        if(nb_board.score >= score_goal){
            console.log("solution found");
            return nb_board;
        }
        for(let coor of nb_board.clickable_coors){
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

function solve_board(starting_board,score_goal,max_searches=5000){
    let solved_board = get_solved_board(starting_board,score_goal,max_searches);
    let boards = get_traced_boards(solved_board);
    return boards;
}
