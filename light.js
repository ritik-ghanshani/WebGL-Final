class Light {
    constructor() {
        this.position = vec4(0.0, 0.0, 0.0, 1.0);
        this.diffuse = vec4(0.6, 0.6, 0.6, 1.0);
        this.specular = vec4(1.0, 1.0, 1.0, 1.0);
        this.ambient = vec4(0.0, 0.0, 0.0, 1.0);
        this.alpha = 100.0;
        this.type = 0; // Distance
        this.direction = vec4(0, 0, 0, 1);
        this.cutoffAngle = (45.0 * Math.PI) / 180.0;
        this.on = false;
    }

    setAmbient(r, g, b) {
        this.ambient = vec4(r, g, b, 1.0);
    }

    setSpecular(r, g, b) {
        this.specular = vec4(r, g, b, 1.0);
    }

    setDiffuse(r, g, b) {
        this.diffuse = vec4(r, g, b, 1.0);
    }

    setLocation(x, y, z) {
        this.position = vec4(x, y, z, 1.0);
    }

    setDirection(x, y, z) {
        this.direction = vec4(x, y, z, 0.0);
    }

    setType(t) {
        this.type = t;
    }

    turnOff() {
        this.on = false;
    }

    turnOn() {
        this.on = true;
    }
}


