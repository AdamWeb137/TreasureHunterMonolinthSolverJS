// const color_translation = {
//     0:"var(--bc)",
//     1:"var(--orange)",//orange
//     2:"var(--blue)",//blue
//     3:"var(--grey)",//grey
//     4:"var(--pink)"//pink
// };

function get_board_from_screenshot(imagedata){

    let pixels = imagedata.data;
    let width = imagedata.width;
    let height = imagedata.height;

    let block_width = width/22;
    let block_height = height/11;

    const get_i = (x,y)=>{
        return y*width + x;
    };

    const get_average = (x, y)=>{
        let pixel_sum = [0,0,0];
        let total = 0;
        let jump = 1;
        let yend = Math.floor(y+block_height);
        let xend = Math.floor(x+block_width);
        for(let yi = Math.floor(y); yi < yend; yi+=jump){
            for(let xi = Math.floor(x); xi < xend; xi+=jump){
                let i = get_i(xi,yi)*4;
                if(i > pixels.length-1){
                    continue;
                }
                pixel_sum[0] += pixels[i];
                pixel_sum[1] += pixels[i+1];
                pixel_sum[2] += pixels[i+2];
                total++;
            }
        }
        total = Math.max(total,1);
        pixel_sum[0] = pixel_sum[0]/total;
        pixel_sum[1] = pixel_sum[1]/total;
        pixel_sum[2] = pixel_sum[2]/total;
        return pixel_sum;
    };

    let ib = Board.get_empty(0);

    //grey: rgb(154,150,152)
    //orange: rgb(172,136,85)
    //blue: rgb(75,133,147)
    //pink: rgb(190,113,151)

    const get_color = (average)=>{
        const dif_threshold = 30;
        const is_about = (c1,c2)=>{
            let r = Math.abs(c1[0]-c2[0]);
            let g = Math.abs(c1[1]-c2[1]);
            let b = Math.abs(c1[2]-c2[2]);
            return (r <= dif_threshold && g <= dif_threshold && b <= dif_threshold);
        };

        if(is_about(average, [172,136,85]))return 1;
        if(is_about(average, [75,133,147]))return 2;
        if(is_about(average, [154,150,152]))return 3;
        if(is_about(average, [190,113,151]))return 4;
        return 0;
    };

    for(let y = 0; y < 11; y++){
        for(let x = 0; x < 22; x++){
            let av = get_average(x*block_width,y*block_height);
            let col = get_color(av);
            ib[y][x] = col;
        }
    }

    return ib;

}

function handle_screenshot(){
    const file_input = document.querySelector("#screenshot_inp");
    const canv = document.createElement("CANVAS");
    canv.style.display = "none";
    document.body.appendChild(canv);
    const ctx = canv.getContext("2d");
    file_input.addEventListener("change",e=>{
        if(file_input.files == undefined) return;
        if(file_input.files.length == 0) return;
        if(file_input.files[0] == undefined) return;
        let urlobj = URL.createObjectURL(file_input.files[0]);
        let img = new Image();
        img.src = urlobj;
        img.addEventListener("load",e=>{
            let w = img.naturalWidth;
            let h = img.naturalHeight;
            canv.width = w;
            canv.height = h;
            ctx.drawImage(img, 0, 0);
            input_board = get_board_from_screenshot(ctx.getImageData(0,0,w,h));
            set_input_display();
        });
    });
}