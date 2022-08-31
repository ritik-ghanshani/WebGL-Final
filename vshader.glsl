#version 300 es
in vec4 aPosition;
in vec2 aTextureCoord;

out vec2 vTextureCoord;


uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;


void main()
{
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*aPosition;
    vTextureCoord = aTextureCoord;
}