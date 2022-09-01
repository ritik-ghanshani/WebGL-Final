class RoboCam extends Camera {
    constructor(at, up, project_matrix) {
        super(at, up, project_matrix);
        this.eye = vec3(10, 10, 10);
        this.cameraHeight = 0;
        this.cameraRadius = 2;
        this.updateCamMatrix();

    }

    getPosition() {
        return this.eye;
    }

    getDirection() {
        return subtract(this.at, this.eye);
    }

    setPosition(x, y, z) {
        this.eye = vec3(x, y, z);
        this.updateCamMatrix();
    }

    setAt(x, y, z) {
        this.at = vec3(x, y, z);
        this.updateCamMatrix();
    }

    update(forward, right, roll, pitch, yaw) {
        this.cameraHeight += forward * 0.05;
    }

    updateCamMatrix() {
        this.camera_matrix = lookAt(this.eye, this.at, this.up);
        this.n = subtract(this.eye, this.at);
        this.v = this.up;
    }
}
