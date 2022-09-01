class Cube {
    constructor() {
        var vertices = [
            vec3(-1, -1, 1),
            vec3(-1, 1, 1),
            vec3(1, 1, 1),
            vec3(1, -1, 1),
            vec3(-1, -1, -1),
            vec3(-1, 1, -1),
            vec3(1, 1, -1),
            vec3(1, -1, -1),
        ];

        var indices = [
            0, 3, 2,
            0, 2, 1,
            2, 3, 7,
            2, 7, 6,
            0, 4, 7,
            0, 7, 3,
            1, 2, 6,
            1, 6, 5,
            4, 5, 6,
            4, 6, 7,
            0, 1, 5,
            0, 5, 4
        ];

        this.vPositions = [];
        this.vTexCoords = [];
        this.vNormals = [];
        // this.vColors = [];
        this.texture = -1;
        this.uTextureUnitShader = -1;
        this.findNormals(vertices, indices);

        // Load shaders and initialize attribute buffers
        this.program = initShaders(gl, "/vshader/vshader_plane.glsl", "/fshader/fshader_plane.glsl");


        var image = new Image();
        image.onload = () => {
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        }
        this.uTextureUnitShader = gl.getUniformLocation(this.program, "uTextureUnit");

        image.src = "./textures/crate_texture.jpg";
        // Load the data into the GPU
        this.vID = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vPositions), gl.STATIC_DRAW);

        // this.cID = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.cID);
        // gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vColors), gl.STATIC_DRAW);

        this.tCoordID = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tCoordID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vTexCoords), gl.STATIC_DRAW);


        this.nID = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vNormals), gl.STATIC_DRAW);

        this.eID = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.eID);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

        // Get the location of the attribute and uniform variables from the shader program.
        // this.aColor = gl.getAttribLocation(this.program, "aColor");
        this.aPosition = gl.getAttribLocation(this.program, "aPosition");
        this.aNormal = gl.getAttribLocation(this.program, "aNormal");
        this.aTextureCoord = gl.getAttribLocation(this.program, "aTextureCoord");

        this.modelMatrix = translate(0, 1, 0);
        this.modelMatrixID = gl.getUniformLocation(this.program, "modelMatrix");

        this.projMatrix = perspective(90, canvas.width / canvas.height, 0.1, 100);
        this.projMatrixID = gl.getUniformLocation(this.program, "projectionMatrix");

        this.camMatrixID = gl.getUniformLocation(this.program, "cameraMatrix");

        this.lightPosition1 = gl.getUniformLocation(this.program, "lightPosition1");
        this.lightDiffuse1 = gl.getUniformLocation(this.program, "lightDiffuse1");
        this.lightSpecular1 = gl.getUniformLocation(this.program, "lightSpecular1");
        this.lightAmbient1 = gl.getUniformLocation(this.program, "lightAmbient1");
        this.lightCutOffAngle1 = gl.getUniformLocation(this.program, "lightCutoffAngle1");
        this.lightDirection1 = gl.getUniformLocation(this.program, "lightDirection1");
        this.lightAlpha1 = gl.getUniformLocation(this.program, "lightAlpha1");
        this.lightOn1 = gl.getUniformLocation(this.program, "lightOn1");

        this.lightPosition2 = gl.getUniformLocation(this.program, "lightPosition2");
        this.lightDiffuse2 = gl.getUniformLocation(this.program, "lightDiffuse2");
        this.lightSpecular2 = gl.getUniformLocation(this.program, "lightSpecular2");
        this.lightAmbient2 = gl.getUniformLocation(this.program, "lightAmbient2");
        this.lightCutOffAngle2 = gl.getUniformLocation(this.program, "lightCutoffAngle2");
        this.lightDirection2 = gl.getUniformLocation(this.program, "lightDirection2");
        this.lightAlpha2 = gl.getUniformLocation(this.program, "lightAlpha2");
        this.lightOn2 = gl.getUniformLocation(this.program, "lightOn2");


        this.lightType1 = gl.getUniformLocation(this.program, "lightType1");
        this.lightType2 = gl.getUniformLocation(this.program, "lightType2");

        this.specular = vec4(0, 0, 0, 1);
        this.diffuse = vec4(1, 1, 1, 1);
        this.ambient = vec4(0, 1, 0, 1);
        this.shininess = 10;
        this.matSpec = gl.getUniformLocation(this.program, "matSpecular");
        this.matDiff = gl.getUniformLocation(this.program, "matDiffuse");
        this.matAmb = gl.getUniformLocation(this.program, "matAmbient");
        this.matAlpha = gl.getUniformLocation(this.program, "matAlpha");
    }

    findNormals(vertices, indices) {
        for (let i = 0; i < indices.length; i += 3) {
            var a = vertices[indices[i]];
            var b = vertices[indices[i + 1]];
            var c = vertices[indices[i + 2]];
            var N = normalize(cross(subtract(b, a), subtract(c, a)));
            this.vPositions.push(vec4(...a, 1));
            this.vPositions.push(vec4(...b, 1));
            this.vPositions.push(vec4(...c, 1));
            this.vNormals.push(N);
            this.vNormals.push(N);
            this.vNormals.push(N);
            // this.vColors.push(RED);
            // this.vColors.push(BLACK);
            // this.vColors.push(YELLOWGREEN);
            this.vTexCoords.push(vec2(0, 0));
            this.vTexCoords.push(vec2(1, 0));
            this.vTexCoords.push(vec2(1, 1));
        }
    }

    draw() {
        if (this.texture === -1) return

        gl.useProgram(this.program);

        // point the attributes to the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vID);
        gl.vertexAttribPointer(this.aPosition, 4, gl.FLOAT, false, 0, 0);

        // gl.bindBuffer(gl.ARRAY_BUFFER, this.cID);
        // gl.vertexAttribPointer(this.aColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nID);
        gl.vertexAttribPointer(this.aNormal, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.eID);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tCoordID);
        gl.vertexAttribPointer(this.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uTextureUnitShader, 0);

        // set the uniform variables
        gl.uniformMatrix4fv(this.modelMatrixID, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(this.projMatrixID, false, flatten(this.projMatrix));
        gl.uniformMatrix4fv(this.camMatrixID, false, flatten(cam.camMatrix));

        gl.uniform4fv(this.lightPosition1, sun.position);
        gl.uniform4fv(this.lightDiffuse1, sun.diffuse);
        gl.uniform4fv(this.lightSpecular1, sun.specular);
        gl.uniform4fv(this.lightAmbient1, sun.ambient);
        gl.uniform4fv(this.lightDirection1, sun.direction);
        gl.uniform1f(this.lightAlpha1, sun.alpha);
        gl.uniform1f(this.lightCutOffAngle1, sun.cutoffAngle);
        gl.uniform1i(this.lightType1, sun.type);
        gl.uniform1i(this.lightOn1, !sun.on);

        gl.uniform4fv(this.lightPosition2, flash.position);
        gl.uniform4fv(this.lightDiffuse2, flash.diffuse);
        gl.uniform4fv(this.lightSpecular2, flash.specular);
        gl.uniform4fv(this.lightAmbient2, flash.ambient);
        gl.uniform1f(this.lightAlpha2, flash.alpha);
        gl.uniform1f(this.lightCutOffAngle2, flash.cutoffAngle);
        gl.uniform4fv(this.lightDirection2, flash.direction);
        gl.uniform1i(this.lightType2, flash.type);
        gl.uniform1i(this.lightOn2, !flash.on);

        gl.uniform4fv(this.matSpec, this.specular);
        gl.uniform4fv(this.matDiff, this.diffuse);
        gl.uniform4fv(this.matAmb, this.ambient);
        gl.uniform1f(this.matAlpha, this.shininess);

        // enable and draw!
        gl.enableVertexAttribArray(this.aPosition);
        gl.enableVertexAttribArray(this.aTextureCoord);
        // gl.enableVertexAttribArray(this.aColor);
        gl.enableVertexAttribArray(this.aNormal);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        gl.disableVertexAttribArray(this.aPosition);
        gl.disableVertexAttribArray(this.aTextureCoord);
        // gl.disableVertexAttribArray(this.aColor);
        gl.disableVertexAttribArray(this.aNormal);
    }
}
