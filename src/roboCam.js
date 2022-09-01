class RoboCam extends Camera {
    constructor() {
        super();
        this.cameraHeight = 0;
        this.cameraRadius = 2;
        this.eye = vec3(0, 2, 2);
        this.at = vec3(0, 0, 0);
        this.up = vec3(0, 1, 0);
    }

    getPosition() {
        return this.eye;
    }

    getDirection() {
        return subtract(this.at, this.eye);
    }

    getCameraMatrix() {
        return this.camera_matrix;
    }

    getProjectionMatrix() {
        return this.projection_matrix;
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
