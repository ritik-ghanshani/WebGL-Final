class Camera {
    constructor(at, up) {
        this.camMatrix = mat4();
        this.r = 5;
        this.h = 5;
        this.t = 0;
        this.eye = vec3(this.r * Math.sin(this.t), this.h, this.r * Math.cos(this.t));
        this.n = normalize(subtract(this.eye, at));
        this.u = normalize(cross(up, this.n));
        this.v = cross(this.n, this.u);
        this.updateCamMatrix();
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
        this.camMatrix = lookAt(this.eye, subtract(this.eye, this.n), this.v);
    }
}
