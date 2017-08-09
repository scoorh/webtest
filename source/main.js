"use strict"



function on_load() {
    let canvas = document.getElementById('glCanvas');

    _gl_initialize(canvas);
    setInterval(_gl_draw, 15);


}
