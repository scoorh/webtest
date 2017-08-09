"use strict"


let _gl_context = null;
let _gl = null;
let _gl_programs = {};
let _gl_matrices = {};
let _gl_models = {};
let _gl_textures = {};


function _gl_draw() {


    _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);



    _m_m44_look_at(_gl_matrices.view, [0,0,10], [0,0,0], [0,1,0]);
    _m_m44_projection(_gl_matrices.projection, 45, _gl_context.width/_gl_context.height, 0.1, 100.0);



    if(_gl_programs.planet) {

        _gl_draw_planets(_scene_planets);
    }
}


function _gl_clear_state() {
    _gl.useProgram(null);
    _gl.bindBuffer(_gl.ARRAY_BUFFER, null);
    _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
    _gl.disableVertexAttribArray(0);
    _gl.disableVertexAttribArray(1);
    _gl.disableVertexAttribArray(2);
    _gl.disableVertexAttribArray(3);
    _gl.disableVertexAttribArray(4);
    _gl.bindTexture(_gl.TEXTURE_2D, null);
}


function _gl_initialize(context) {

    _gl_context = context;
    _gl = context.getContext('webgl') || context.getContext('experimental-webgl');
    if(!_gl) {
        //TODO: error code
        return;
    }

    _gl.clearColor(0.0, 0.0, 0.0, 1.0);
    _gl.clearDepth(1.0);
    _gl.enable(_gl.DEPTH_TEST);
    _gl.depthFunc(_gl.LEQUAL);

    _gl.viewport(0, 0, context.width, context.height);

    _gl_initialize_gpu_programs();
    _gl_initialize_matrices();
    _gl_initialize_objects();

    _gl_initialize_textures();
}


function _gl_initialize_matrices() {
    _gl_matrices.model = _m_m44_identity();
    _gl_matrices.view = _m_m44_identity();
    _gl_matrices.projection = _m_m44_identity();
    _gl_matrices.modelView = _m_m44_identity();
    _gl_matrices.normal = _m_m44_identity();

    _gl_matrices.rotate = _m_m44_identity();
    _gl_matrices.translate = _m_m44_identity();
    _gl_matrices.scale = _m_m44_identity();

    _gl_matrices.tmp = _m_m44_identity();
}


function _gl_initialize_objects() {

    _loadResource('http://localhost:8000/resource/mesh.json', null, null, 2)
    .then(function(modelsData) {

        _gl_create_mesh('quad_2d', modelsData);
        _gl_create_mesh('planet_lod0', modelsData);

    });
    //TODO: catch network read error

}


function _gl_initialize_gpu_programs() {

    _loadResource('http://localhost:8000/resource/shader.json', null, null, 2)
    .then(function(shadersData) {

        _gl_create_program('planet', shadersData);

    });
    //TODO: catch network read error
}


function _gl_initialize_textures() {

    _loadResource('http://localhost:8000/resource/texture/test.tga', null, null, 0)
    .then(function(textureData) {

        _gl_create_texture('test', textureData);

    });
    //TODO: catch network read error

}


function _gl_create_texture(name, textureData) {

    let texture = _gl.createTexture();
    _gl_textures[name] = texture;

    let imageType = textureData[2];
    let pixelSize = textureData[16] / 8;
    let width = textureData[13] * 256 + textureData[12];
    let height = textureData[15] * 256 + textureData[14];


    let internalType = _gl.RGB;
    if(pixelSize == 4) { internalType = _gl.RGBA; }
    let format = internalType;

    let pixelCount = width*height;
    let dstPixelSize = (pixelSize==1) ? pixelSize*3 : pixelSize;
    let pixelArray = new Uint8Array(pixelCount*dstPixelSize);


    let src=0;
    let dst=0;
    if(imageType == 2 || imageType == 3) {
        //uncompressed

        src = 18;
        dst = 0;
        __load_pixels(textureData.length);

    }
    else if(imageType == 10 || imageType == 11) {
        //compressed

        for(src = 18, dst = 0; src < textureData.length; ) {
            let chunkSize = textureData[src++];

            if(chunkSize < 128) {
                //raw pixels
                chunkSize = (chunkSize+1)*pixelSize;

                __load_pixels(chunkSize);

            } else {
                //remove id
                chunkSize-=127;

                let r=0,g=0,b=0,a=0;
                if(pixelSize == 1) {
                    r = g = b = textureData[src];
                    ++src;
                } else {
                    r = textureData[src+2];
                    g = textureData[src+1];
                    r = textureData[src];
                    src += 3;
                    if(pixelSize == 4) {
                        a = textureData[src];
                        ++src;
                    }
                }

                for(let i = 0; i < chunkSize; ++i) {
                    pixelArray[dst] = r;
                    pixelArray[dst+1] = g;
                    pixelArray[dst+2] = b;
                    dst+=3;
                    if(pixelSize == 4) {
                        pixelArray[dst] = 4;
                        ++dst;
                    }
                }
            }
        }

    }
    else {

        //TODO: error unsupported tga file
    }



    _gl.bindTexture(_gl.TEXTURE_2D, texture);

    _gl.texImage2D(_gl.TEXTURE_2D, 0, internalType, width, height, 0, format, _gl.UNSIGNED_BYTE, pixelArray, 0);
    _gl.generateMipmap(_gl.TEXTURE_2D);


    _gl.bindTexture(_gl.TEXTURE_2D, null);


    function __load_pixels(length) {
        let srcEnd = src+length;
        if(pixelSize == 1) {
            for(; src < srcEnd; ++src, dst+=3) {
                // R - > RGB
                pixelArray[dst] = textureData[src];
                pixelArray[dst+1] = textureData[src];
                pixelArray[dst+2] = textureData[src];
            }
        }
        else if(pixelSize == 3) {
            for(; src < srcEnd; src+=pixelSize, dst+=3) {
                // BGR -> RGB
                pixelArray[dst] = textureData[src+2];
                pixelArray[dst+1] = textureData[src+1];
                pixelArray[dst+2] = textureData[src];
            }
        }
        else {
            for(; src < srcEnd; src+=pixelSize, dst+=4) {
                // BGRA -> RGBA
                pixelArray[dst] = textureData[src+2];
                pixelArray[dst+1] = textureData[src+1];
                pixelArray[dst+2] = textureData[src];
                pixelArray[dst+3] = textureData[src+3];
            }
        }
    }
}



function _gl_create_program(name, shadersData) {

    let vertexShader = _gl_create_shader(name + '_vertexShader', shadersData, _gl.VERTEX_SHADER);
    let fragmentShader = _gl_create_shader(name + '_fragmentShader', shadersData, _gl.FRAGMENT_SHADER);

    let program = _gl_create_program__(vertexShader, fragmentShader);

    if(program) {
        _gl_programs[name] = {};
        let gl_program = _gl_programs[name];
        gl_program.attributes = {};
        gl_program.uniforms = {};
        gl_program.program = program;


        let currentNode = "";
        let attributesNode = shadersData[name + '_attributes'];
        for(let attribute in attributesNode) {
            currentNode = attributesNode[attribute];
            gl_program.attributes[currentNode.name] = _gl.getAttribLocation(program, currentNode.value);
        }

        let uniformsNode = shadersData[name + '_uniforms'];
        for(let uniform in uniformsNode) {
            currentNode = uniformsNode[uniform];
            gl_program.uniforms[currentNode.name] = _gl.getUniformLocation(program, currentNode.value);
        }
    }

    _gl.deleteShader(vertexShader);
    _gl.deleteShader(fragmentShader);
}


function _gl_create_shader(name, shadersData, type) {
    let shader = _gl.createShader(type);

    if(shader) {
        if(!!shadersData.minified) {
            _gl.shaderSource(shader, shadersData[name].join(''));
        } else {
            _gl.shaderSource(shader, shadersData[name]);
        }
        _gl.compileShader(shader);

        let compileStatus = _gl.getShaderParameter(shader, _gl.COMPILE_STATUS);
        if(!compileStatus) {
            //TODO: remove log?
            console.log(name + ': ' + _gl.getShaderInfoLog(shader));

            _gl.deleteShader(shader);
            shader = null;

            //TODO: error code
        }
    } else {
        //TODO: error code
    }

    return shader;
}


function _gl_create_program__(vertexShader, fragmentShaders) {
    if(!vertexShader || !fragmentShaders) {
        //TODO: error code
        return null;
    }

    let program = _gl.createProgram();

    if(program) {
        _gl.attachShader(program, vertexShader);
        _gl.attachShader(program, fragmentShaders);
        _gl.linkProgram(program);

        let linkStatus = _gl.getProgramParameter(program, _gl.LINK_STATUS);
        if(!linkStatus) {
            _gl.deleteProgram(program);
            program = null;

            //TODO: error code

        }
    } else {
        //TODO: error code
    }

    return program;
}
