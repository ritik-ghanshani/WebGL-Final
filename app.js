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
var cam = new Camera(vec3(0, 0, 0), vec3(0, 1, 0));
var light1 = new Light(vec3(0, 0, 0), vec3(0, 1, -1), vec4(0.4, 0.4, 0.4, 1.0), vec4(1, 1, 1, 1), vec4(1, 1, 1, 1), 0, 0, 1);

// var plane;
// var cube;
var objects = [];
const vshader = "./vshader/vshader.glsl";
const fshader = "./fshader/fshader.glsl";

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

	////////////////////////////////////////////////////////////////////
	// 						SHADOW MAPPING
	/////////////////////////////////////////////////////////////////// 
	{
		let vpWidth = 512, vpHeight = 512;
		shadowFrameBuffer = gl.createFramebuffer();
		shadowFrameBuffer.width = vpWidth;
		shadowFrameBuffer.height = vpHeight;
		gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFrameBuffer);

		shadowRenderBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, shadowRenderBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, vpWidth, vpHeight);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadowRenderBuffer);

		light1.depthTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, light1.depthTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, vpWidth, vpHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.bindFramebuffer(gl.FRAMEBUFFER, null); //restore to window frame/depth buffer
		gl.bindRenderbuffer(gl.RENDERBUFFER, null)
	}
	////////////////////////////////////////////////////////////////////
	// 						END SHADOW MAPPING
	/////////////////////////////////////////////////////////////////// 

	objects.push(new Plane(1, vshader, fshader));
	objects.push(new Cube(vshader, fshader));
	render();
};

function renderShadowMaps() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFrameBuffer);
	gl.bindRenderbuffer(gl.RENDERBUFFER, shadowRenderBuffer);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, light.depthTexture);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, light.depthTexture, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	for (var i = 1; i < objects.length; i++)
		objects[i].drawToShadowMap();
	gl.bindFramebuffer(gl.FRAMEBUFFER, null); //return to screens buffers
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
}

function render() {
	setTimeout(() => {
		requestAnimationFrame(render);
		// renderShadowMaps();
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		objects.forEach((obj) => obj.draw());
	}, 50);  //10fps
}

document.addEventListener('keydown', event => {
	console.log(event.code)
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
	}
})
