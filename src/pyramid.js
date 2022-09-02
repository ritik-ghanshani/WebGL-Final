class Pyramid extends BaseClass {
    constructor() {
        super("./textures/pyramid_bricks.jpg");

        this.numVertices = 24;

        this.vPositions = [];
        this.vNormals = [];
        this.vTexCoords = [];

        this.build();
        this.initBuffers();

    }
    build() {

        var vertices = [
            vec3(-1, 0, 1),
            vec3(1, 0, 1),
            vec3(-1, 0, -1),
            vec3(1, 0, -1),
            vec3(0, 1, 1),
            vec3(0, 1, -1)
        ];


        var indices = [
            0, 1, 3, 0, 3, 2,
            3, 1, 4, 3, 4, 5,
            0, 2, 4, 2, 5, 4,
            4, 0, 1, 5, 3, 2
        ];

        var indices = [0, 1, 3, 0, 3, 2, 3, 1, 4, 3, 4, 5, 0, 2, 4, 2, 5, 4, 4, 0, 1, 5, 3, 2];

        for (var i = 0; i < indices.length; i += 3) {
            this.triangle(
                vertices[indices[i]],
                vertices[indices[i + 1]],
                vertices[indices[i + 2]]
            );
        }
    }

    triangle(a, b, c) {
        var t1, t2, t3;
        t1 = vec2(0, 0);
        t2 = vec2(0, 1);
        t3 = vec2(1, 1);
        var N = normalize(cross(subtract(b, a), subtract(c, a)));
        this.vPositions.push(vec4(a[0], a[1], a[2], 1.0));
        this.vNormals.push(N);
        this.vTexCoords.push(t1);
        this.vPositions.push(vec4(b[0], b[1], b[2], 1.0));
        this.vNormals.push(N);
        this.vTexCoords.push(t2);
        this.vPositions.push(vec4(c[0], c[1], c[2], 1.0));
        this.vNormals.push(N);
        this.vTexCoords.push(t3);
    }
}