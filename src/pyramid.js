class Pyramid extends BaseClass {
    constructor() {
        super("./textures/white.jpg");

        this.numVertices = 24;

        this.vPositions = [];
        this.vNormals = [];
        this.vTexCoords = [];

        this.build();
        this.initBuffers();

    }
    build() {

        var vertices = [
            vec3(-1, 0, 1), // Front left 0
            vec3(1, 0, 1), // Front right 1
            vec3(-1, 0, -1), // Back left 2
            vec3(1, 0, -1), // Back right 3
            vec3(0, 1, 1), // Front top 4
            vec3(0, 1, -1) // Back top 5
        ];

        // 2 + 2 + 2 + 1 + 1 = 8 triangles
        var indices = [
            0,
            1,
            3, // FL -> FR -> BR (Base 1)
            0,
            3,
            2, // FL -> BR -> BL (Base 2)
            3,
            1,
            4, // BR -> FR -> FT (Right 1)
            3,
            4,
            5, // BR -> FT -> BT (Right 2)
            0,
            2,
            4, // FL -> BL -> FT (Left 1)
            2,
            5,
            4, // BL -> BT -> FT (Left 2)
            4,
            0,
            1, // FT -> FL -> FR (Front)
            5,
            3,
            2 // BT -> BR -> BL (Back)
        ];

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