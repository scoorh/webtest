"use strict"

//TODO: copy this to gl_utils.js



function _gl_draw_planets(planets) {


    let programAttributes = _gl_programs.planet.attributes;
    let programUniforms = _gl_programs.planet.uniforms;
    _gl.useProgram(_gl_programs.planet.program);


    _gl.uniformMatrix4fv(programUniforms.projectionMatrix, false, _gl_matrices.projection);
    _gl.enableVertexAttribArray(programAttributes.position);
    _gl.enableVertexAttribArray(programAttributes.texcoord);

    _gl.activeTexture(_gl.TEXTURE0);


    let model = _gl_models.planet_lod0;


    for(let i = 0; i < planets.length; ++i) {


        let modelMatrix = planets[i].matrix;
        _m_m44_translate(_gl_matrices.translate, modelMatrix.tx, modelMatrix.ty, modelMatrix.tz);
        _m_m44_rotate(_gl_matrices.rotate, modelMatrix.rx, modelMatrix.ry, modelMatrix.rz);
        _m_m44_scale(_gl_matrices.scale, modelMatrix.sx, modelMatrix.sy, modelMatrix.sz);
        _m_m44_mul(_gl_matrices.tmp, _gl_matrices.rotate, _gl_matrices.scale);
        _m_m44_mul(_gl_matrices.model, _gl_matrices.tmp, _gl_matrices.translate);
        _m_m44_mul(_gl_matrices.modelView, _gl_matrices.model, _gl_matrices.view);

        _gl.uniformMatrix4fv(programUniforms.modelViewMatrix, false, _gl_matrices.modelView);



        //TODO:
        // LOD deduction
        //  let ld -> LOD

        let modelAttributes = model.attributes;



        // TODO : sort by texture
        _gl.bindTexture(_gl.TEXTURE_2D, _gl_textures.test);
        _gl.uniform1i(programUniforms.texture0, 0);



        _gl.bindBuffer(_gl.ARRAY_BUFFER, model.vertexBuffer);
        _gl.vertexAttribPointer(programAttributes.position, modelAttributes.position.size, _gl.FLOAT, false, model.vertexStride, modelAttributes.position.offset);
        _gl.vertexAttribPointer(programAttributes.texcoord, modelAttributes.texcoord.size, _gl.FLOAT, false, model.vertexStride, modelAttributes.texcoord.offset);

        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
        _gl.drawElements(model.drawMode, model.indexCount, _gl.UNSIGNED_SHORT, 0);
    }


    _gl_clear_state();
}



function _gl_create_mesh(name, modelsData) {

    let modelData = modelsData[name];
    let model = {};
    _gl_models[name] = model;

    let vertexBuffer = _gl.createBuffer();
    if(vertexBuffer) {
        model.vertexBuffer = vertexBuffer;
        model.vertexCount = modelData.vertexCount;
        model.vertexStride = modelData.vertexStride;

        let vertexArray = new Float32Array(modelData.vertexArray);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, vertexBuffer);
        _gl.bufferData(_gl.ARRAY_BUFFER, vertexArray, _gl.STATIC_DRAW);
        _gl.bindBuffer(_gl.ARRAY_BUFFER, null);

    } else {
        //TODO: error
    }

    model.attributes = {};
    let currentNode = "";
    let attributesNode = modelData['attributes'];
    for(let attribute in attributesNode) {
        currentNode = attributesNode[attribute];
        model.attributes[attribute] = {};
        model.attributes[attribute].size = currentNode.size;
        model.attributes[attribute].offset = currentNode.offset;
    }

    model.drawMode = modelData.drawMode;
    model.indexBuffer = null;
    model.indexCount = 0;

    if(modelData.indexArray && modelData.indexCount) {
        let indexBuffer = _gl.createBuffer();
        if(indexBuffer) {
            model.indexBuffer = indexBuffer;
            model.indexCount = modelData.indexCount;

            let indexArray = new Uint16Array(modelData.indexArray);

            _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, indexArray, _gl.STATIC_DRAW);
            _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);

        } else {
            //TODO: error
        }
    }

}
