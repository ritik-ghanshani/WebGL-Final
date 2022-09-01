class Plane {
    constructor() {
        let subdivs = 2;
        this.numVertices = 2 * 4 ** subdivs * 3;
        var a = vec3(-1, 0, 1);
        var b = vec3(1, 0, 1);
        var c = vec3(1, 0, -1);
        var d = vec3(-1, 0, -1);
        this.vPositions = [];
        this.vTexCoords = [];
        this.vNormals = [];
        // this.vColors = [];
        this.texture = -1;
        this.useShadowMap = true;
        this.uTextureUnitShader = -1;
        this.pickable = true;
        this.picked = false;
        console.log('before')
        this.divideQuad(a, b, c, d, subdivs);
        console.log('after')
        console.log(this.vTexCoords);

        this.program = initShaders(gl, vshader_shadow_env, fshader_shadow_env);
        this.shadowProgram = initShaders(gl, vshader_shadow, fshader_shadow);
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


        this.nID = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vNormals), gl.STATIC_DRAW);

        // Get the location of the attribute and uniform variables from the shader program.
        // this.aColor = gl.getAttribLocation(this.program, "aColor");
        this.aPosition = gl.getAttribLocation(this.program, "aPosition");
        this.aNormal = gl.getAttribLocation(this.program, "aNormal");
        this.aTextureCoord = gl.getAttribLocation(this.program, "aTextureCoord");

        this.modelMatrix = scale(10, 0, 10);
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

    divideQuad(a, b, c, d, depth) {
        console.log(a, b, c, d);
        console.log("i am inside: " + depth);
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
        var N = normalize(cross(subtract(b, a), subtract(c, a)));
        this.vPositions.push(vec4(...a, 1.0));
        this.vNormals.push(N);
        // this.vColors.push(BLACK);
        this.vPositions.push(vec4(...b, 1.0));
        this.vNormals.push(N);
        // this.vColors.push(RED);
        this.vPositions.push(vec4(...c, 1.0));
        this.vNormals.push(N);
        // this.vColors.push(BLACK);
    }

    draw() {
        if (this.texture === -1) return

        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vID);
        gl.vertexAttribPointer(this.aPosition, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tCoordID);
        gl.vertexAttribPointer(this.aTexs, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uTextureUnitShader, 0);

        // gl.bindBuffer(gl.ARRAY_BUFFER, this.cID);
        // gl.vertexAttribPointer(this.aColor, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nID);
        gl.vertexAttribPointer(this.aNormal, 3, gl.FLOAT, false, 0, 0);

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
        // gl.enableVertexAttribArray(this.aColor);
        gl.enableVertexAttribArray(this.aTextureCoord);
        gl.enableVertexAttribArray(this.aNormal);
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
        gl.disableVertexAttribArray(this.aPosition);
        gl.disableVertexAttribArray(this.aTextureCoord);
        // gl.disableVertexAttribArray(this.aColor);
        gl.disableVertexAttribArray(this.aNormal);
    }

    testCollision(ray) {
        this.minT = null;
        if (this.pickable) {
            for (var i = 0; i < this.numVertices; i += 3) {
                var e = mult(this.modelMatrix, this.vPositions[i]);
                var f = mult(this.modelMatrix, this.vPositions[i + 1]);
                var g = mult(this.modelMatrix, this.vPositions[i + 2]);
                this.testCollisionTriangle(ray, e, f, g);
            }
        }
        return this.minT;
    }
    onPick() {
        this.picked = true;
    }
    testCollisionTriangle(v, e, f, g) {
        var ve = vec3(e[0], e[1], e[2]);
        var vf = vec3(f[0], f[1], f[2]);
        var vg = vec3(g[0], g[1], g[2]);
        var ray = vec3(v[0], v[1], v[2]);
        var N = cross(subtract(vf, ve), subtract(vg, ve));
        if (dot(ray, N) === 0) {
            return false;
        }
        var Q = cam.getPosition();
        var alpha = -((dot(Q, N) + dot(mult(-1, ve), N)) / dot(ray, N));
        if (alpha < 0) {
            return false;
        }
        var P = add(Q, mult(alpha, ray));
        var d1 = dot(N, cross(subtract(vf, ve), subtract(P, ve)));
        var d2 = dot(N, cross(subtract(vg, vf), subtract(P, vf)));
        var d3 = dot(N, cross(subtract(ve, vg), subtract(P, vg)));
        if (d1 >= 0 && d2 >= 0 && d3 >= 0) {
            if (this.minT === null || alpha < this.minT) {
                this.minT = alpha;
            }
            return true;
        } else {
            return false;
        }
    }

    drawToShadowMap(projMatrix) {
        let maxDepth = 100.0;
        let aPosition_shadow = gl.getAttribLocation(this.shadowProgram, "aPosition");
        let modelMatrix_shadow = gl.getUniformLocation(this.shadowProgram, "modelMatrix");
        let projectionMatrix_shadow = gl.getUniformLocation(this.shadowProgram, "projectionMatrix");
        let cameraMatrix_shadow = gl.getUniformLocation(this.shadowProgram, "cameraMatrix");
        let maxDepth_shadow = gl.getUniformLocation(this.shadowProgram, "maxDepth");

        gl.useProgram(this.shadowProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vID);
        gl.vertexAttribPointer(aPosition_shadow, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(modelMatrix_shadow, false, flatten(this.modelMatrix));
        let cameraMatrix = lookAt(vec3(...sun.position.slice(0, 3)), add(vec3(...sun.position.slice(0, 3)), vec3(...sun.direction.slice(0, 3))), vec3(0, 0, 0), vec3(0, 1, 0));
        gl.uniformMatrix4fv(cameraMatrix_shadow, false, flatten(cameraMatrix));
        gl.uniformMatrix4fv(projectionMatrix_shadow, false, flatten(projMatrix));

        gl.uniform1f(maxDepth_shadow, maxDepth);
        gl.enableVertexAttribArray(aPosition_shadow);
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
        gl.disableVertexAttribArray(aPosition_shadow);
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


}
