class Plane {
    constructor(subdivs, vShader, fShader) {
        this.numVertices = 2 * 4 ** subdivs * 3;
        var a = vec3(-1, 0, 1);
        var b = vec3(1, 0, 1);
        var c = vec3(1, 0, -1);
        var d = vec3(-1, 0, -1);
        this.vPositions = [];
        this.vTexCoords = [];
        // this.vNormals = [];
        // this.vColors = [];
        this.texture = -1;
        this.uTextureUnitShader = -1;

        this.divideQuad(a, b, c, d, subdivs);


        this.program = initShaders(gl, vShader, fShader);

        var image = new Image();

        image.onload = () => {
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        }
        this.uTextureUnitShader = gl.getUniformLocation(this.program, "uTextureUnit");

        image.src = "./textures/256x grass block.png"

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


        // this.nID = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.nID);
        // gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vNormals), gl.STATIC_DRAW);

        // Get the location of the attribute and uniform variables from the shader program.
        // this.aColor = gl.getAttribLocation(this.program, "aColor");
        this.aPosition = gl.getAttribLocation(this.program, "aPosition");
        // this.aNormal = gl.getAttribLocation(this.program, "aNormal");
        this.aTextureCoord = gl.getAttribLocation(this.program, "aTextureCoord");

        this.modelMatrix = scale(10, 0, 10);
        this.modelMatrixID = gl.getUniformLocation(this.program, "modelMatrix");

        this.projMatrix = perspective(90, canvas.width / canvas.height, 0.1, 100);
        this.projMatrixID = gl.getUniformLocation(this.program, "projectionMatrix");

        this.camMatrixID = gl.getUniformLocation(this.program, "cameraMatrix");

        // this.lightPos1 = gl.getUniformLocation(this.program, "lightPos1");
        // this.lightDiff1 = gl.getUniformLocation(this.program, "lightDiffuse1");
        // this.lightSpec1 = gl.getUniformLocation(this.program, "lightSpecular1");
        // this.lightAmb1 = gl.getUniformLocation(this.program, "lightAmbient1");
        // this.lightDir1 = gl.getUniformLocation(this.program, "lightDir1");
        // this.lightAlpha1 = gl.getUniformLocation(this.program, "lightAlpha1");

        // this.lightPos2 = gl.getUniformLocation(this.program, "lightPos2");
        // this.lightDiff2 = gl.getUniformLocation(this.program, "lightDiffuse2");
        // this.lightSpec2 = gl.getUniformLocation(this.program, "lightSpecular2");
        // this.lightAmb2 = gl.getUniformLocation(this.program, "lightAmbient2");
        // this.lightCutOffAng2 = gl.getUniformLocation(this.program, "lightCutoffAngle2")
        // this.lightDir2 = gl.getUniformLocation(this.program, "lightDir2");
        // this.lightOn2 = gl.getUniformLocation(this.program, "lightOn2");

        // this.specular = vec4(0, 0, 0, 1);
        // this.diffuse = vec4(1, 1, 1, 1);
        // this.ambient = vec4(0, 1, 0, 1);
        // this.shininess = 10;
        // this.matSpec = gl.getUniformLocation(this.program, "matSpecular");
        // this.matDiff = gl.getUniformLocation(this.program, "matDiffuse");
        // this.matAmb = gl.getUniformLocation(this.program, "matAmbient");
        // this.matAlpha = gl.getUniformLocation(this.program, "matAlpha");
    }

    divideQuad(a, b, c, d, depth) {
        if (depth > 0) {
            var v1 = mult(0.5, add(a, b));
            var v2 = mult(0.5, add(b, c));
            var v3 = mult(0.5, add(c, d));
            var v4 = mult(0.5, add(d, a));
            var v5 = mult(0.5, add(a, c));
            this.divideQuad(a, v1, v5, v4, depth - 1);
            this.divideQuad(v1, b, v2, v5, depth - 1);
            this.divideQuad(v2, c, v3, v5, depth - 1);
            this.divideQuad(v3, d, v4, v5, depth - 1);
        } else {
            //Triangle #1
            this.triangle(a, b, c);
            this.vTexCoords.push(vec2(0.0, 0.0)); //first vertex
            this.vTexCoords.push(vec2(1.0, 0.0)); //second vertex
            this.vTexCoords.push(vec2(1.0, 1.0)); //third vertex
            //Triangle #2
            this.triangle(c, d, a);
            this.vTexCoords.push(vec2(0.0, 0.0)); //first vertex
            this.vTexCoords.push(vec2(1.0, 0.0)); //second vertex
            this.vTexCoords.push(vec2(1.0, 1.0)); //third vertex
        }
    }

    triangle(a, b, c) {
        // var N = normalize(cross(subtract(b, a), subtract(c, a)));
        this.vPositions.push(vec4(...a, 1.0));
        // this.vNormals.push(N);
        // this.vColors.push(BLACK);
        this.vPositions.push(vec4(...b, 1.0));
        // this.vNormals.push(N);
        // this.vColors.push(RED);
        this.vPositions.push(vec4(...c, 1.0));
        // this.vNormals.push(N);
        // this.vColors.push(BLACK);
    }

    draw() {
        if (this.texture === -1) return

        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vID);
        gl.vertexAttribPointer(this.aPosition, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tCoordID);
        gl.vertexAttribPointer(this.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uTextureUnitShader, 0);

        // gl.bindBuffer(gl.ARRAY_BUFFER, this.cID);
        // gl.vertexAttribPointer(this.aColor, 4, gl.FLOAT, false, 0, 0);

        // gl.bindBuffer(gl.ARRAY_BUFFER, this.nID);
        // gl.vertexAttribPointer(this.aNormal, 3, gl.FLOAT, false, 0, 0);

        // set the uniform variables
        gl.uniformMatrix4fv(this.modelMatrixID, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(this.projMatrixID, false, flatten(this.projMatrix));
        gl.uniformMatrix4fv(this.camMatrixID, false, flatten(cam.camMatrix));

        // gl.uniform4fv(this.lightPos1, sun.position);
        // gl.uniform4fv(this.lightDiff1, sun.diffuse);
        // gl.uniform4fv(this.lightSpec1, sun.specular);
        // gl.uniform4fv(this.lightAmb1, sun.ambient);
        // gl.uniform4fv(this.lightDir1, sun.direction);
        // gl.uniform1f(this.lightAlpha1, sun.alpha);

        // gl.uniform4fv(this.lightPos2, flash.position);
        // gl.uniform4fv(this.lightDiff2, flash.diffuse);
        // gl.uniform4fv(this.lightSpec2, flash.specular);
        // gl.uniform4fv(this.lightAmb2, flash.ambient);
        // gl.uniform1f(this.lightCutOffAng2, flash.cutoffAngle);
        // gl.uniform4fv(this.lightDir2, flash.direction);
        // gl.uniform1i(this.lightOn2, flash.on);

        // gl.uniform4fv(this.matSpec, this.specular);
        // gl.uniform4fv(this.matDiff, this.diffuse);
        // gl.uniform4fv(this.matAmb, this.ambient);
        // gl.uniform1f(this.matAlpha, this.shininess);

        // enable and draw!
        gl.enableVertexAttribArray(this.aPosition);
        // gl.enableVertexAttribArray(this.aColor);
        gl.enableVertexAttribArray(this.aTextureCoord);
        // gl.enableVertexAttribArray(this.aNormal);
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
        gl.disableVertexAttribArray(this.aPosition);
        gl.disableVertexAttribArray(this.aTextureCoord);
        // gl.disableVertexAttribArray(this.aColor);
        // gl.disableVertexAttribArray(this.aNormal);
    }
}
