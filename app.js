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

var sun;
var sunAngle;
var flash;
var switchObj;

var lights = [];
var cam = new Camera(vec3(0, 0, 0), vec3(0, 1, 0));
// var light1 = new Light(vec3(0, 0, 0), vec3(0, 1, -1), vec4(0.4, 0.4, 0.4, 1.0), vec4(1, 1, 1, 1), vec4(1, 1, 1, 1), 0, 0, 1);
// lights.push(light1);
var objects = [];
const vshader = "./vshader/vshader.glsl";
const fshader = "./fshader/fshader.glsl";
const vshader_shadow = "./vshader/vshader_shadow.glsl";
const fshader_shadow = "./fshader/fshader_shadow.glsl";
const vshader_shadow_env = "./vshader/vshader_shadow_env.glsl";
const fshader_shadow_env = "./fshader/fshader_shadow_env.glsl";

window.onload = async function init() {


	window.addEventListener("mousedown", mousedownHandler);

	canvas = document.getElementById("gl-canvas");
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
	sun.setLocation(10, 0, 0, 1);
	sun.setAmbient(1, 1, 1);
	flash = new Light();
	flash.setLocation(0, 5, 5);
	flash.setDirection(0, -Math.sqrt(2) / 2, -Math.sqrt(2) / 2);
	flash.setAmbient(0.2, 0.2, 0.2);
	flash.setSpecular(1, 1, 1);
	flash.setDiffuse(1, 0, 1);
	flash.turnOn();
	flash.type = 1;

	lights.push(sun);
	lights.push(flash);

	project_matrix = perspective(
		45,
		canvas.width / canvas.height,
		0.1,
		100
	);

	////////////////////////////////////////////////////////////////////
	// 						SHADOW MAPPING
	/////////////////////////////////////////////////////////////////// 
	let vpWidth = 512, vpHeight = 512;
	shadowFrameBuffer = gl.createFramebuffer();
	shadowFrameBuffer.width = vpWidth;
	shadowFrameBuffer.height = vpHeight;
	gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFrameBuffer);

	shadowRenderBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, shadowRenderBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, vpWidth, vpHeight);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadowRenderBuffer);

	lights.forEach((light) => {
		light.depthTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, light.depthTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, vpWidth, vpHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.bindFramebuffer(gl.FRAMEBUFFER, null); //restore to window frame/depth buffer
		gl.bindRenderbuffer(gl.RENDERBUFFER, null)
	})

	////////////////////////////////////////////////////////////////////
	// 						END SHADOW MAPPING
	///////////////////////////////////////////////////////////////////


	const response = await fetch('/models/switch.obj');
	const text = await response.text();

	const ironman = await fetch('/models/ironman.obj');
	const ironmanText = await ironman.text();

	sunAngle = 0;

	sun = new Light();
	sun.setLocation(10, 0, 0);
	sun.setAmbient(0.6, 0.6, 0.6);
	sun.turnOn();
	flash = new Light();
	flash.setLocation(0, 5, 5);
	flash.setDirection(0, -Math.sqrt(2) / 2, -Math.sqrt(2) / 2);
	flash.setAmbient(0.4, 0.4, 0.4);
	flash.setSpecular(1, 1, 1);
	flash.setDiffuse(1, 0, 1);
	flash.turnOn();

	objects.push(new Plane());
	objects.push(new Cube());

	switchObj = new OBJ(text, "/textures/brks.jpg")
	switchObj.setLocation(0.5 + 0.5 * 4, 0.05 * 4, 0 + 0.5 * 8.5);
	switchObj.setSize(0.008, 0.008, 0.008);

	ironMan = new OBJ(ironmanText, "/textures/ironman.jpg");
	ironMan.setLocation(0.5 + 0.5, 0.05 * 4, 0);
	ironMan.setSize(0.03, 0.03, 0.03);

	objects.push(switchObj);
	objects.push(ironMan);

	// objects.push(new Plane());
	// objects.push(new Cube(vshader_shadow_env, fshader_shadow_env));
	render();
};

function renderShadowMaps() {
	lights.forEach(light => {
		gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFrameBuffer);
		gl.bindRenderbuffer(gl.RENDERBUFFER, shadowRenderBuffer);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, light.depthTexture);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, light.depthTexture, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		objects.filter((obj) => obj.useShadowMap).forEach((obj) => obj.drawToShadowMap(perspective(90, canvas.width / canvas.height, 0.1, 100)));
		gl.bindFramebuffer(gl.FRAMEBUFFER, null); //return to screens buffers
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	})
}

function render() {
	setTimeout(() => {
		renderShadowMaps();
		requestAnimationFrame(render);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		objects.forEach((obj) => obj.draw());

		// sunAngle += 0.1;
		// sun = new Light();
		// sun.setLocation(10 * Math.cos(sunAngle), 0, 10 * Math.sin(sunAngle), 1);
		// sun.turnOn();


	}, 50);  //10fps
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

function mousedownHandler(event) {
	// Implementing picking
	xclip = 2 * (event.clientX / canvas.width) - 1.0;
	yclip = 1.0 - 2 * (event.clientY / canvas.height);
	var pfront = vec4(xclip, yclip, -1, 1);
	// console.log(pfront);
	// console.log(project_matrix);
	var pcam = mult(inverse(project_matrix), pfront);
	pcam[2] = -1;
	pcam[3] = 0;
	var pworld = mult(inverse(cam.camMatrix), pcam);
	var point = normalize(vec3(pworld[0], pworld[1], pworld[2]));
	var min_t = null;
	var min_object = null;
	objects.forEach((o) => {
		// console.log(o);
		var t = o.testCollision(point);
		if (t !== null && (min_t === null || t < min_t)) {
			min_t = t;
			min_object = o;
		}
	});
	if (min_object !== null) {
		min_object.onPick();
	}
}

