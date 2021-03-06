Board.set_dimensions(22,11);
// Board.set_dimensions(5,5);


const color_translation = {
    0:"var(--bc)",
    1:"var(--orange)",//orange
    2:"var(--blue)",//blue
    3:"var(--grey)",//grey
    4:"var(--pink)"//pink
};

const prize_translation = {
	0:"Nothing",
	1:"Fish Fossil",
	2:"Monocub"
};

let solution_board_list = null;
let current_solution_i = -1;

const EVENT = new_struct(["event","any"],["el","any"],["func","any"]);
let event_listeners = [];
function clear_event_listeners(){
    for(let e of event_listeners){
        e.el.removeEventListener(e.event, e.func);
    }
    event_listeners = [];
}

function add_event_listener(el, event, func){
    event_listeners.push(EVENT(event,el,func));
    el.addEventListener(event,func);
}

function set_solution_display(board_list, i){

    clear_event_listeners();

    solution_board_list = board_list;
    current_solution_i = i;

    let lb = board_list[board_list.length-1];
    document.querySelector("#clear_info").innerHTML = `${(lb.cleared_area/Board.area*100).toFixed(2)}% clear`;
    document.querySelector("#step_info").innerHTML = `${lb.depth} steps`;
    document.querySelector("#score_info").innerHTML = `${lb.score} score`;

    add_event_listener(document,"keydown",e=>{
        if(!input_hidden)return;
        if(e.key == "0" || e.key == "Enter") set_solution_display(board_list,0);
        if(e.key == "ArrowLeft") set_solution_display(board_list, Math.max(0,i-1));
        if(e.key == "ArrowRight") set_solution_display(board_list, Math.min(i+1,board_list.length-1));
    });

    let board_div = document.querySelector("#solution");
    board_div.innerHTML = "";
    for(let y = 0; y < Board.height; y++){
        let new_row = document.createElement("DIV");
        new_row.classList.add("row");
        for(let x = 0; x < Board.width; x++){
            let box = document.createElement("DIV");
            box.classList.add("box");
            let xy = XY(x,y);
            box.style.backgroundColor = color_translation[get_block(board_list[i].board,xy)];
            if(get_block(board_list[i].board,xy) == 0) box.style.outline = "1px solid var(--tc)";

            let add_small_box = true;

            let new_inner = "";

            for(let j = 1; j < board_list.length; j++){
                if(Board.same_coors(board_list[j].excavation_coor,xy)){
                    new_inner += `<b>${j}</b>`;
                    box.classList.add("hoverbox");

                    if(i+1 == j){
                        box.classList.add("bigbox");
                        box.style.backgroundColor = "red";
                        add_small_box = false;
                    }

                    add_event_listener(box,"mouseup",e=>{
                        set_solution_display(board_list,j);
                    })
                    break;
                }
            }

            if(add_small_box)box.classList.add("smallbox");

            let is_typed = type_board[y][x] > 0;
            if(is_typed && new_inner.length > 0) new_inner += "&nbsp;"
            if(is_typed) new_inner += prize_translation[type_board[y][x]][0];
            box.innerHTML = new_inner;

            new_row.appendChild(box);
        }
        board_div.appendChild(new_row);
    }
}

let input_board = Board.get_empty(0);
let type_board = Board.get_empty(0);
let input_hidden = false;

function get_child_num(el){
    for(let i = 0; i < el.parentElement.children.length; i++){
        if(el.parentElement.children[i].isSameNode(el)) return i;
    }
    return -1;
}

function set_input_display(){

    clear_event_listeners();

    const board_div = document.querySelector("#input");
    board_div.innerHTML = "";
    let focused = null;

    add_event_listener(document,"mouseup",e=>{
        if(input_hidden)return;
        let box = e.target;
        if(box.classList.contains("easy_input_btn") && focused != null){
        	if(box.parentElement.id == "block_row"){
		        let xy = Board.index_to_coor(Number(focused.getAttribute("data-i")));
		        let ci = Number(box.getAttribute("data-c") ?? "0");
		        focused.style.backgroundColor = color_translation[ci];
		        set_block(input_board,xy,ci);
		        set_new_focused(XY(xy.x+1,xy.y),true);
            }else if(box.parentElement.id == "type_row"){
            	let xy = Board.index_to_coor(Number(focused.getAttribute("data-i")));
		        let pi = Number(box.getAttribute("data-c") ?? "0");
		        if(pi > 0)focused.innerHTML = prize_translation[pi][0];
		        if(pi == 0)focused.innerHTML = "";
		        set_block(type_board,xy,pi);
            }else if(box.parentElement.id == "clear_row"){
            	let xy = Board.index_to_coor(Number(focused.getAttribute("data-i")));
                input_board = Board.clear(xy,input_board).board;
                set_input_display();
            }
            return;
        }
        for(let b of document.querySelectorAll(".bigbox")){
            b.classList.remove("bigbox");
            b.classList.add("smallbox");
        }
        if(!box.classList.contains("ibox")){
            focused = null;
            return;
        };
        focused = box;
        box.classList.add("bigbox");
        box.classList.remove("smallbox");
    });

    const set_new_focused = (xy, move_to_next_row=true)=>{

        for(let b of document.querySelectorAll(".bigbox")){
            b.classList.remove("bigbox");
            b.classList.add("smallbox");
        }

        if(xy.x < 0){
            xy.x = Board.width - 1;
            if(move_to_next_row)xy.y -= 1;
        }
        if(xy.x >= Board.width){
            xy.x = 0;
            if(move_to_next_row)xy.y += 1;
            
        }
        if(xy.y < 0) xy.y = Board.height - 1;
        if(xy.y >= Board.height) xy.y = 0;

        focused = board_div.children[xy.y].children[xy.x];
        focused.classList.add("bigbox");
        focused.classList.remove("smallbox");

    };

    const handle_auto_move = e=>{
        if(focused == null)return;
        let xy = Board.index_to_coor(Number(focused.getAttribute("data-i")));
        let possible = "01234";
        if(!possible.includes(e.key))return;
        let val = Number(e.key);
        set_block(input_board,xy,val);
        focused.style.backgroundColor = color_translation[val];

        set_new_focused(XY(xy.x+1,xy.y),true);
    };

    const handle_type_selection = e=>{
        if(focused == null) return;
        let xy = Board.index_to_coor(Number(focused.getAttribute("data-i")));
        let possible = "nfm";
        let ind = possible.indexOf(e.key.toLowerCase());
        if(ind == -1)return;
        if(ind > 0)focused.innerHTML = e.key.toUpperCase();
        if(ind == 0)focused.innerHTML = "";
        set_block(type_board, xy, ind);
    };

    const handle_manual_move = e=>{
        if(focused == null)return;
        let xy = Board.index_to_coor(Number(focused.getAttribute("data-i")));
        let possible = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        if(!possible.includes(e.key))return;
        
        for(let b of document.querySelectorAll(".bigbox")){
            b.classList.remove("bigbox");
            b.classList.add("smallbox");
        }

        switch(e.key){
            case "ArrowUp":
                set_new_focused(XY(xy.x,xy.y-1));
                break;
            case "ArrowDown":
                set_new_focused(XY(xy.x,xy.y+1));
                break;
            case "ArrowLeft":
                set_new_focused(XY(xy.x-1,xy.y));
                break;
            case "ArrowRight":
                set_new_focused(XY(xy.x+1,xy.y));
                break;
            default:
                break;
        }   

    };

    add_event_listener(document,"keydown",e=>{
        console.log("input keydown");
        if(input_hidden)return;
        handle_manual_move(e);
        handle_auto_move(e);
        handle_type_selection(e);
    });

    for(let y = 0; y < Board.height; y++){
        let new_row = document.createElement("DIV");
        new_row.classList.add("row");
        new_row.setAttribute("data-row",String(y));
        for(let x = 0; x < Board.width; x++){
            let box = document.createElement("DIV");
            box.classList.add("box");
            box.classList.add("ibox");
            box.classList.add("smallbox");
            box.classList.add("hoverbox");
            let xy = XY(x,y);
            box.style.backgroundColor = color_translation[get_block(input_board,xy)];
            if(get_block(type_board,xy) > 0) box.innerHTML = prize_translation[get_block(type_board,xy)][0];
            box.setAttribute("data-i",Board.coor_to_index(xy));
            new_row.appendChild(box);
        }
        board_div.appendChild(new_row);
    }
    let easy_input_row = document.createElement("DIV");
    easy_input_row.classList.add("row");
    easy_input_row.classList.add("easy_input_row");
    easy_input_row.id = "block_row";
    for(let color_index in color_translation){
        let color_button = document.createElement("DIV");
        color_button.classList.add("easy_input_btn");
        color_button.style.backgroundColor = color_translation[color_index];
        color_button.setAttribute("data-c",color_index);
        easy_input_row.appendChild(color_button);
    }
    board_div.appendChild(easy_input_row);
    let type_input_row = document.createElement("DIV");
    type_input_row.classList.add("row");
    type_input_row.classList.add("easy_input_row");
    type_input_row.id = "type_row";
    for(let prize_index in prize_translation){
        let prize_button = document.createElement("DIV");
        prize_button.classList.add("prize_btn");
        prize_button.classList.add("easy_input_btn");
        prize_button.innerHTML = prize_translation[prize_index];
        prize_button.setAttribute("data-c",prize_index);
        type_input_row.appendChild(prize_button);
    }
    board_div.appendChild(type_input_row);

    let clear_row = document.createElement("DIV");
    clear_row.classList.add("row");
    clear_row.classList.add("easy_input_row");
    clear_row.id = "clear_row";
    let clear_button = document.createElement("DIV");
    clear_button.classList.add("easy_input_btn");
    clear_button.classList.add("prize_btn");
    clear_button.innerHTML = "Clear Chunk";
    clear_row.appendChild(clear_button);
    board_div.appendChild(clear_row);
}

function get_sg(){
    let pos = Number(document.querySelector("#score_goal_inp").value);
    if(isNaN(pos))return 4900;
    return pos;
}

function get_s(){
    let pos = Number(document.querySelector("#searches_inp").value);
    if(isNaN(pos))return 5000;
    return pos;
}

function solve_mode(){
    input_hidden = true;
    document.querySelector("#input").style.display = "none";
    document.querySelector("#solution").style.display = "block";

    document.querySelector("#edit_mode_opts").style.display = "none";
    document.querySelector("#solve_mode_opts").style.display = "flex";

    // let input_board_class = new Board(Board.clone_board(input_board), null, 0, null, 0);
    let input_board_class = Board.get_board_from_arrays(Board.clone_board(input_board),Board.clone_board(type_board));

    const sol_div = document.querySelector("#solution");
    sol_div.innerHTML = "";
    //sorry coding gods for writing this nasty code
    while(sol_div.childElementCount != 0){
        let i = 0;
    }
    alert("This will take a minute. Please be patient");
    let board_list = solve_board(input_board_class,get_sg(),get_s());
    console.log(board_list);
    set_solution_display(board_list,0);
}

function edit_mode(){
    input_hidden = false;
    document.querySelector("#input").style.display = "block";
    document.querySelector("#solution").style.display = "none";
    document.querySelector("#edit_mode_opts").style.display = "flex";
    document.querySelector("#solve_mode_opts").style.display = "none";
    if(solution_board_list == null) return;
    input_board = Board.clone_board(solution_board_list[current_solution_i].board);
    solution_board_list = null;
    set_input_display();
}

function clear(e){
    input_board = Board.get_empty(0);
    type_board = Board.get_empty(0);
    set_input_display();
}

function randomize(e){
    input_board = Board.get_empty(1,4);
    type_board = Board.get_empty(0);
    set_input_display();
}

window.addEventListener("load",e=>{
    const pgi = document.querySelector("#score_goal_inp");
    pgi.value = "4900";
    pgi.addEventListener("input",e=>{
        pgi.previousElementSibling.innerHTML = `(${pgi.value} score)`;
    });
    const si = document.querySelector("#searches_inp");
    si.value = "5000";
    si.addEventListener("input",e=>{
        si.previousElementSibling.innerHTML = `(${si.value} searches)`;
    });
    document.querySelector("#solve_mode_btn").addEventListener("mouseup",e=>{solve_mode();});
    document.querySelector("#edit_mode_btn").addEventListener("mouseup",e=>{edit_mode();});
    document.querySelector("#clear_mode_btn").addEventListener("mouseup",clear);
    document.querySelector("#rand_mode_btn").addEventListener("mouseup",randomize);
    handle_screenshot();
    set_input_display();
});

// Board.set_dimensions(5,5);
// let test_board = new Board([
//     [1,1,2,3,1],
//     [2,1,2,1,3],
//     [2,3,3,0,0],
//     [1,2,3,0,2],
//     [3,2,1,0,2],
// ],null,4,null,0, 20,null,[
//     [1,1,1,0,0],
//     [0,0,0,0,0],
//     [0,0,0,2,2],
//     [0,1,0,2,2],
//     [0,1,0,2,2],
// ]);
// console.log(test_board.prizes);
// test_board.print_board();
// console.log(test_board.score);
// console.log(test_board.get_new_board_from_excavated_coor(XY(0,0)));
// console.log(test_board.clickable_nonisland_coors);
// set_solution_display(solve_board(test_board,90),0);
