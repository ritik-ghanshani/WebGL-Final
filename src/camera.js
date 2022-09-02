class Camera {
    constructor(at, up, project_matrix) {
        this.camera_matrix = mat4();
        this.at = at;
        this.up = up;
        this.eye = vec3(0, 5, 30);
        this.u = vec3(1, 0, 0);
        this.v = vec3(0, 1, 0);
        this.n = vec3(0, 0, 1);
        this.updateCamMatrix();
        this.project_matrix = project_matrix;

    }

    getPosition() {
        return this.eye;
    }

    moveN(amt) {
        this.eye = add(this.eye, mult(-amt, this.n));
        this.updateCamMatrix();
    }

    moveU(amt) {
        this.eye = add(this.eye, mult(-amt, this.u));
        this.updateCamMatrix();
    }
    pitch(amt) {
        var angle = radians(amt);
        var vp = subtract(mult(Math.cos(angle), this.v), mult(Math.sin(angle), this.n));
        var np = add(mult(Math.sin(angle), this.v), mult(Math.cos(angle), this.n));
        this.v = normalize(vp);
        this.n = normalize(np);
        this.updateCamMatrix();
    }

    yaw(amt) {
        var angle = radians(amt);
        var up = add(mult(Math.cos(angle), this.u), mult(Math.sin(angle), this.n));
        var np = add(mult(-Math.sin(angle), this.u), mult(Math.cos(angle), this.n));
        this.u = normalize(up);
        this.n = normalize(np);
        this.updateCamMatrix();
    }

    roll(amt) {
        var angle = radians(amt);
        var up = subtract(mult(Math.cos(angle), this.u), mult(Math.sin(angle), this.v));
        var vp = add(mult(Math.sin(angle), this.u), mult(Math.cos(angle), this.v));
        this.u = normalize(up);
        this.v = normalize(vp);
        this.updateCamMatrix();
    }
    updateCamMatrix() {
        this.camera_matrix = lookAt(this.eye, subtract(this.eye, this.n), this.v);
    }
    getCameraMatrix() {
        return this.camera_matrix;
    }

    getProjectionMatrix() {
        return this.project_matrix;
    }
}
