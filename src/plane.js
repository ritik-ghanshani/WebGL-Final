class Plane extends BaseClass {
    constructor() {
        super("/textures/wood.png");

        this.vPositions = [];
        this.vTexCoords = [];
        this.vNormals = [];

        let subdivs = 5;
        this.numVertices = 2 * 4 ** subdivs * 3;
        var a = vec3(-1, 0, 1);
        var b = vec3(1, 0, 1);
        var c = vec3(1, 0, -1);
        var d = vec3(-1, 0, -1);

        this.divideQuad(a, b, c, d, subdivs);
        this.initBuffers();

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

            this.triangle(a, b, c);
            this.vTexCoords.push(vec2(0.0, 0.0));
            this.vTexCoords.push(vec2(1.0, 0.0));
            this.vTexCoords.push(vec2(1.0, 1.0));

            this.triangle(c, d, a);
            this.vTexCoords.push(vec2(0.0, 0.0));
            this.vTexCoords.push(vec2(1.0, 0.0));
            this.vTexCoords.push(vec2(1.0, 1.0));
        }
    }

    triangle(a, b, c) {
        var N = normalize(cross(subtract(b, a), subtract(c, a)));
        this.vPositions.push(vec4(...a, 1.0));
        this.vNormals.push(N);

        this.vPositions.push(vec4(...b, 1.0));
        this.vNormals.push(N);

        this.vPositions.push(vec4(...c, 1.0));
        this.vNormals.push(N);

    }
}
