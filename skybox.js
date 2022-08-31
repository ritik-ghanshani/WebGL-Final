class SkyBox {
    constructor(vshader, fshader) {
        this.vPositions = [];
        this.imageLoadCounter = 0;
        this.build();
        this.uTextureUnitShader = -1;
        this.texture = -1;

        // Load shaders and initialize attribute buffers
        this.program = initShaders(gl, vshader, fshader);
        this.uTextureUnitShader = gl.getUniformLocation(this.program, "uTextureUnit");
        this.aPosition = gl.getAttribLocation(this.program, "aPosition");
        this.modelMatrixID = gl.getUniformLocation(this.program, "modelMatrix");
        this.modelMatrix = mat4();
        this.projMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100);
        this.projMatrixID = gl.getUniformLocation(this.program, "projectionMatrix");
        this.camMatrixID = gl.getUniformLocation(this.program, "cameraMatrix");
        this.vID = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vPositions), gl.STATIC_DRAW);



        //Set up textures
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        var image1 = new Image();
        var image2 = new Image();
        var image3 = new Image();
        var image4 = new Image();
        var image5 = new Image();
        var image6 = new Image();

        image1.onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
            this.imageLoadCounter++;
        }
        image1.src = "./textures/sky-top.jpg";

        image2.onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, image2.width, image2.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image2);
            this.imageLoadCounter++;
        }
        image2.src = "./textures/sky-bottom.jpg";

        image3.onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, image3.width, image3.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image3);
            this.imageLoadCounter++;
        }
        image3.src = "./textures/sky-back.jpg";

        image4.onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, image4.width, image4.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image4);
            this.imageLoadCounter++;
        }
        image4.src = "./textures/sky-left.jpg";

        image5.onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, image5.width, image5.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image5);
            this.imageLoadCounter++;
        }
        image5.src = "./textures/sky-front.jpg";

        image6.onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, image6.width, image6.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image6);
            this.imageLoadCounter++;
        }
        image6.src = "./textures/sky-right.jpg";
    }
    build() {
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

        for (var i = 0; i < indices.length; i += 3) {
            this.vPositions.push(vec4(...vertices[indices[i]], 1));
            this.vPositions.push(vec4(...vertices[indices[i + 1]], 1));
            this.vPositions.push(vec4(...vertices[indices[i + 2]], 1));
        }

    }
    draw() {
        if (this.imageLoadCounter != 6) return
        let origin = vec3(0, 0, 0);
        var c = lookAt(origin, subtract(origin, cam.n), cam.v);
        // console.log(c);
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vID);
        gl.vertexAttribPointer(this.aPosition, 4, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        gl.uniform1i(this.uTextureUnitShader, 0);

        // set the uniform variables
        gl.uniformMatrix4fv(this.modelMatrixID, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(this.projMatrixID, false, flatten(this.projMatrix));
        gl.uniformMatrix4fv(this.camMatrixID, false, flatten(c));


        // enable and draw!
        gl.enableVertexAttribArray(this.aPosition);
        gl.drawArrays(gl.TRIANGLES, 0, this.vPositions.length);
        gl.disableVertexAttribArray(this.aPosition);
    }
}