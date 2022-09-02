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
var shadowFrameBuffer;
var shadowRenderBuffer;

var project_matrix;
var robo_projection_matrix;

var sun;
var sunAngle;
var flash;
var switchObj;
var sphere;
var ironMan;
var sphere_size = 1;
var theta = 0;
var lights = [];
var robotObj;
var switchObj2;
var selected_cam;

var worldCam;

var objects = [];
var obj = [];
const vshader = "./vshader/vshader_plane.glsl";
const fshader = "./fshader/fshader_plane.glsl";

window.onload = async function init() {
	canvas = document.getElementById("gl-canvas");
	window.addEventListener("mousedown", mousedownHandler);

	Array.prototype.sample = function () {
		return this[Math.floor(Math.random() * this.length)];
	}
	project_matrix = perspective(90, canvas.width / canvas.height, 0.1, 100);
	robo_projection_matrix = perspective(90, canvas.width / canvas.height, 0.1, 100);

	worldCam = new Camera(vec3(0, 0, 0), vec3(0, 1, 0), project_matrix);
	roboCam = new RoboCam(vec3(0, 0, 0), vec3(0, 1, 0), robo_projection_matrix);
	gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true });
	if (!gl) { alert("WebGL 2.0 isn't available"); }
	gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.polygonOffset(1, 1);
	gl.enable(gl.POLYGON_OFFSET_FILL);
	gl.clearColor(...BLACK);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	sunAngle = 0;

	sun = new Light();
	sun.setLocation(0, 100, 0);
	sun.setAmbient(1.5, 1.5, 1.5);
	sun.turnOn();
	flash = new Light();
	flash.setLocation(0, 15, 0);
	flash.setDirection(0, -Math.sqrt(2) / 2, -Math.sqrt(2) / 2);
	flash.setAmbient(3, 3, 3);
	// flash.setSpecular(1, 1, 1);
	// flash.setDiffuse(1.5, 0, 1);

	lights.push(sun);
	lights.push(flash);

	plane = new Plane();
	plane.setSize(500, 500, 500);
	objects.push(plane);

	cube = new Cube();
	cube.setLocation(-10, 0, 0);
	cube.setSize(5, 5, 5);
	objects.push(cube);
	obj.push(cube.constructor.name);

	pyramid = new Pyramid();
	pyramid.setSize(5, 5, 5);
	pyramid.setLocation(-10, 5, 0);
	objects.push(pyramid);
	obj.push(pyramid.constructor.name);

	for (let j = -1; j < 2; j++) {
		for (let i = -1; i < 2; i++) {
			let x = j * 5;
			let y = 3;
			let z = i * 5;
			sphere = new Sphere();
			sphere.setLocation(x, y, z)
			objects.push(sphere);
		}
	}
	obj.push(sphere.constructor.name);

	switchObj2 = await loadOBJ("models/switch.obj")
	switchObj = new Switch(switchObj2);
	switchObj.setLocation(15, 0, 0);
	switchObj.setSize(0.008, 0.008, 0.008);
	switchObj.setYRotation(180);
	objects.push(switchObj);

	robotObj = await loadOBJ("models/ironman.obj");
	ironMan = new Robot(robotObj);
	ironMan.setLocation(0.5 + 0.5, 0.05 * 4, 0);
	ironMan.setSize(0.05, 0.05, 0.05);

	var cameraRad = ironMan.yrot * ((2 * Math.PI) / 360);
	roboCam.setPosition(
		...add(
			ironMan.getLocation(),
			vec3(-1 * Math.sin(cameraRad), 1, -1 * Math.cos(cameraRad))
		)
	);
	roboCam.setAt(...add(ironMan.getLocation(), vec3(0, 1, 0)));

	selected_cam = worldCam;
	objects.push(switchObj);
	objects.push(ironMan);

	render();
};

function render() {
	setTimeout(() => {
		requestAnimationFrame(render);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		if (switchObj.picked) {
			let sample = obj.sample();
			let a;
			switch (sample) {
				case "Sphere":
					a = new Sphere();
					break;
				case "Cube":
					a = new Cube();
					break;
				case "Pyramid":
					a = new Pyramid();
					break;
			}
			a.setLocation(10, 6, -10);
			a.setSize(Math.random() * 5, Math.random() * 5, Math.random() * 5);
			objects.push(a);
			console.log("Object Generated: ", a.constructor.name);
			// switchObj.picked = false;
		}
		theta += 0.01;
		objects
			.filter(o => o.constructor.name === "Sphere")
			.filter(s => !s.picked)
			.forEach(s => {
				let a = sphere_size + 3 * Math.sin(theta);
				s.setSize(a, a, a);
				s.setYRotation(theta * 10 * 180 / Math.PI);
				let [x, y, z] = s.location;
				let nx = -Math.sin(theta * 10) + x + getRandomIntInclusive(-1, 1);
				let ny = y;
				let nz = Math.cos(theta * 10) + z + getRandomIntInclusive(-1, 1);
				s.setLocation(nx, ny, nz);

			});
		ironMan.setLocation(Math.sin(theta * 10 * (0.5 + 0.5)), 0.05 * 4, Math.cos(theta * 10));
		ironMan.setYRotation(theta * 10 * 180 / Math.PI);
		if (selected_cam.constructor.name === "RoboCam") {
			var cameraRad = ironMan.yrot * Math.PI / 180;
			let ironman_eye = add(ironMan.getLocation(), vec3(Math.sin(theta * 10 * (0.5 + 0.5)), 8, Math.cos(cameraRad)));
			selected_cam.setPosition(...ironman_eye);
			let n = length(vec3(1, 1, 1000));
			selected_cam.setAt(...add(ironman_eye, vec3(n * Math.sin(cameraRad), 0, 1000 * Math.cos(cameraRad))));
			selected_cam.updateCamMatrix();
		}
		var cMat = selected_cam.getCameraMatrix();
		var pMat = selected_cam.getProjectionMatrix();
		objects.forEach((obj) => obj.draw(cMat, pMat));
	}, 50);
}

document.addEventListener('keydown', event => {
	switch (event.code) {
		case 'KeyQ':
			selected_cam = (selected_cam === worldCam) ? roboCam : worldCam;
			console.log(selected_cam.constructor.name)
			break;
		case 'KeyX':
			if (event.shiftKey) {
				selected_cam.pitch(-5);
			} else {
				selected_cam.pitch(5);
			}
			break;
		case 'KeyC':
			if (event.shiftKey) {
				selected_cam.yaw(-5);
			} else {
				selected_cam.yaw(5);
			}
			break;
		case 'KeyZ':
			if (event.shiftKey) {
				selected_cam.roll(-5);
			} else {
				selected_cam.roll(5);
			}
			break;
		case 'KeyA':
			selected_cam.moveU(1);
			break;
		case 'KeyW':
			selected_cam.moveN(1);
			break;
		case 'KeyS':
			selected_cam.moveN(-1);
			break;
		case 'KeyD':
			selected_cam.moveU(-1);
			break;
		case 'Space':
			if (flash.on) {
				flash.turnOff();
			} else {
				flash.turnOn();
			}
			break;
	}
})

function mousedownHandler(event) {
	xclip = 2 * (event.clientX / canvas.width) - 1.0;
	yclip = 1.0 - 2 * (event.clientY / canvas.height);
	var pfront = vec4(xclip, yclip, -1, 1);
	var pcam = mult(inverse(project_matrix), pfront);
	pcam[2] = -1;
	pcam[3] = 0;
	var pworld = mult(inverse(worldCam.getCameraMatrix()), pcam);
	var point = normalize(vec3(pworld[0], pworld[1], pworld[2]));
	var min_t = null, min_object = null;
	objects.forEach((o) => {
		var t = o.testCollision(point);
		if (t !== null && (min_t === null || t < min_t)) {
			min_t = t;
			min_object = o;
		}
	});
	if (min_object !== null) {
		min_object.onPick();
		console.log(min_object.constructor.name);
	}
}

async function loadOBJ(file) {
	const response = await fetch(file);
	const text = await response.text();
	return text;
}
function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}