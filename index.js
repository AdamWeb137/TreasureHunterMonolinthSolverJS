Board.set_dimensions(22,11);
// Board.set_dimensions(5,5);

const color_translation = {
    0:"var(--bc)",
    1:"var(--orange)",//orange
    2:"var(--blue)",//blue
    3:"var(--grey)",//grey
    4:"var(--pink)"//pink
};

function set_solution_display(board_list, i){
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

            for(let j = 1; j < board_list.length; j++){
                if(Board.same_coors(board_list[j].excavation_coor,xy)){
                    box.innerHTML = `<b>${j}</b>`;
                    box.classList.add("hoverbox");

                    if(i+1 == j){
                        box.classList.add("bigbox");
                        box.style.backgroundColor = "red";
                        add_small_box = false;
                    }

                    box.addEventListener("mouseup",e=>{
                        set_solution_display(board_list,j);
                    });
                    break;
                }
            }

            if(add_small_box)box.classList.add("smallbox");

            new_row.appendChild(box);
        }
        board_div.appendChild(new_row);
    }
}

let input_board = Board.get_empty(0);
let input_hidden = false;

function get_child_num(el){
    for(let i = 0; i < el.parentElement.children.length; i++){
        if(el.parentElement.children[i].isSameNode(el)) return i;
    }
    return -1;
}

function set_input_display(){
    const board_div = document.querySelector("#input");
    let focused = null;

    document.addEventListener("mouseup",e=>{
        let box = e.target;

        if(box.classList.contains("easy_input_btn") && focused != null){
            let xy = Board.index_to_coor(Number(focused.getAttribute("data-i")));
            let ci = Number(box.getAttribute("data-c") ?? "0");
            focused.style.backgroundColor = color_translation[ci];
            set_block(input_board,xy,ci);
            set_new_focused(XY(xy.x+1,xy.y),true);
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
        let xy = Board.index_to_coor(Number(focused.getAttribute("data-i")));
        if(focused == null)return;
        let possible = "01234";
        if(!possible.includes(e.key))return;
        let val = Number(e.key);
        set_block(input_board,xy,val);
        focused.style.backgroundColor = color_translation[val];

        set_new_focused(XY(xy.x+1,xy.y),true);
    };

    const handle_manual_move = e=>{
        let xy = Board.index_to_coor(Number(focused.getAttribute("data-i")));
        if(focused == null)return;
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

    document.addEventListener("keydown",e=>{
        if(input_hidden)return;
        handle_manual_move(e);
        handle_auto_move(e);
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
            box.setAttribute("data-i",Board.coor_to_index(xy));
            new_row.appendChild(box);
        }
        board_div.appendChild(new_row);
    }
    let easy_input_row = document.createElement("DIV");
    easy_input_row.classList.add("row");
    easy_input_row.id = "easy_input_row";
    for(let color_index in color_translation){
        let color_button = document.createElement("DIV");
        color_button.classList.add("easy_input_btn");
        color_button.style.backgroundColor = color_translation[color_index];
        color_button.setAttribute("data-c",color_index);
        easy_input_row.appendChild(color_button);
    }
    board_div.appendChild(easy_input_row);
}

function get_pg(){
    let pos = Number(document.querySelector("#percent_goal_inp").value);
    if(isNaN(pos))return 90;
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

    let input_board_class = new Board(Board.clone_board(input_board), null, 0, null, 0);

    alert("This will take a minute. Please be patient");
    input_board_class.cleared_area = input_board_class.count_zeros();
    let board_list = solve_board(input_board_class,get_pg(),get_s());
    console.log(board_list);
    set_solution_display(board_list,0);
}

function edit_mode(){
    input_hidden = false;
    document.querySelector("#input").style.display = "block";
    document.querySelector("#solution").style.display = "none";
    document.querySelector("#edit_mode_opts").style.display = "flex";
    document.querySelector("#solve_mode_opts").style.display = "none";
}

function clear(e){
    input_board = Board.get_empty(0);
    document.querySelector("#input").innerHTML = "";
    set_input_display();
}

function randomize(e){
    input_board = Board.get_empty(1,4);
    document.querySelector("#input").innerHTML = "";
    set_input_display();
}

window.addEventListener("load",e=>{
    const pgi = document.querySelector("#percent_goal_inp");
    pgi.value = "90";
    pgi.addEventListener("input",e=>{
        pgi.previousElementSibling.innerHTML = `(${pgi.value}% solved)`;
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


    set_input_display();
});

// Board.set_dimensions(5,5);
// let test_board = new Board([
//     [1,1,2,3,1],
//     [2,1,2,1,3],
//     [2,3,3,0,0],
//     [1,2,3,0,2],
//     [3,2,1,0,2],
// ],null,0,null,0);
// console.log(test_board.get_new_board_from_excavated_coor(XY(0,0)));
// console.log(test_board.clickable_nonisland_coors);
// set_solution_display(solve_board(test_board,90),0);