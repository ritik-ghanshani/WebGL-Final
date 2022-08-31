#version 300 es
in vec3 aPosition;
out float camDepth;
uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;
out vec4 pos;

void main() 
{ 
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*vec4(aPosition,1.0);
    camDepth = -(cameraMatrix*modelMatrix*vec4(aPosition,1.0)).z;
}