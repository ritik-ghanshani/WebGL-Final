const RED = vec4(1.0, 0.0, 0.0, 1.0);
const GREEN = vec4(0.0, 1.0, 0.0, 1.0);
const BLUE = vec4(0.0, 0.0, 1.0, 1.0);
const MAGENTA = vec4(1.0, 0.0, 1.0, 1.0);
const WHITE = vec4(1, 1, 1, 1);
const BLACK = vec4(0, 0, 0, 1);
const YELLOW = vec4(1, 1, 0, 1);
const YELLOWGREEN = vec4(160 / 255, 236 / 255, 37 / 255, 1);
const CYAN = vec4(37 / 255, 236 / 255, 213 / 255, 1);
const LIGHTGRAY = vec4(0.9, 0.9, 0.9, 1);

var canvas;
var gl;

var sun;
var sunAngle;
var flash;


var cam = new Camera(vec3(0, 0, 0), vec3(0, 1, 0));
// var light1 = new Light(vec3(0, 0, 0), vec3(0, 1, -1), vec4(0.4, 0.4, 0.4, 1.0), vec4(1, 1, 1, 1), vec4(1, 1, 1, 1), 0, 0, 1);

var plane;
var cube;
var skybox;

const vshader = "vshader.glsl";
const vshader_skybox = "vshader_skybox.glsl";
const fshader = "fshader.glsl";
const fshader_skybox = "fshader_skybox.glsl";

window.onload = function init() {
	canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true });
	if (!gl) { alert("WebGL 2.0 isn't available"); }
	gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.polygonOffset(1, 1);
	gl.enable(gl.POLYGON_OFFSET_FILL);
	gl.clearColor(...LIGHTGRAY);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	sunAngle = 0;

	sun = new Light();
	sun.setLocation(10, 0, 0, 1);
	sun.setAmbient(1, 1, 1);
	flash = new Light();
	flash.setLocation(0, 5, 5);
	flash.setDirection(0, -Math.sqrt(2) / 2, -Math.sqrt(2) / 2);
	flash.setAmbient(0.2, 0.2, 0.2);
	flash.setSpecular(1, 1, 1);
	flash.setDiffuse(1, 0, 1);
	flash.turnOn();

	skybox = new SkyBox(vshader_skybox, fshader_skybox);
	plane = new Plane(1, vshader, fshader);
	cube = new Cube(vshader, fshader);
	render();
};

function render() {
	setTimeout(() => {
		requestAnimationFrame(render);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		sunAngle += 0.1;
		sun = new Light();
		sun.setLocation(10 * Math.cos(sunAngle), 0, 10 * Math.sin(sunAngle), 1);

		gl.disable(gl.DEPTH_TEST)
		// skybox.draw();
		gl.enable(gl.DEPTH_TEST);
		plane.draw();
		cube.draw();
	}, 10);  //10fps
}

document.addEventListener('keydown', event => {
	// console.log(event.code)
	switch (event.code) {
		case 'KeyX':
			if (event.shiftKey) {
				cam.pitch(-5);
			} else {
				cam.pitch(5);
			}
			break;
		case 'KeyC':
			if (event.shiftKey) {
				cam.yaw(-5);
			} else {
				cam.yaw(5);
			}
			break;
		case 'KeyZ':
			if (event.shiftKey) {
				cam.roll(-5);
			} else {
				cam.roll(5);
			}
			break;
		case 'KeyA':
			cam.moveU(1);
			break;
		case 'KeyW':
			cam.moveN(1);
			break;
		case 'KeyS':
			cam.moveN(-1);
			break;
		case 'KeyD':
			cam.moveU(-1);
			break;
        case 'Space':
            if (flash.on) {
                flash.turnOff();
            } else {
                flash.turnOn();
            }
            console.log(flash.on);
            break;
	}
})
