#version 300 es
in vec4 aPosition;

out vec3 vTextureCoord;


uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;


void main()
{
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*aPosition;
    vTextureCoord = normalize(aPosition.xyz);
}