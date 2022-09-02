class Cube extends BaseClass {
    constructor() {
        super("/textures/pyramid_bricks.jpg");

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
        this.texture = -1;
        this.findNormals(vertices, indices);

        this.numVertices = this.vPositions.length;

        this.pickable = true;
        this.picked = false;

        this.initBuffers();

        this.specular = vec4(0, 0, 0, 1);
        this.diffuse = vec4(1, 1, 1, 1);
        this.ambient = vec4(0.3, 0.3, 0.3, 1);
        this.shininess = 10;
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
            this.vTexCoords.push(vec2(0, 0));
            this.vTexCoords.push(vec2(1, 0));
            this.vTexCoords.push(vec2(1, 1));
        }
    }
}
