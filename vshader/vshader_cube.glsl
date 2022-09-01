#version 300 es
precision mediump float;
precision mediump int;

out vec2 vTextureCoord;
out vec3 fN;
out vec3 fE;
out vec3 fL1;
out vec3 fL2;
out vec3 fLS1;
out vec3 fLS2;
out vec3 pos;
out vec3 R;
out vec3 lightPosInCam1;
out vec3 lightPosInCam2;
in vec4 aPosition;
in vec2 aTextureCoord;


in vec3 aNormal;


uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;


uniform vec4 matAmbient, matDiffuse, matSpecular;
uniform float matAlpha;

uniform vec4 lightAmbient1, lightDiffuse1, lightSpecular1 , lightPosition1, lightDirection1;
uniform vec4 lightAmbient2, lightDiffuse2, lightSpecular2 , lightPosition2, lightDirection2;

uniform bool lightOn1, lightOn2;

uniform float lightAlpha1, lightAlpha2, lightCutoffAngle1, lightCutoffAngle2;


void main()
{
        //compute vectors
    //the vertex in camera coordinates
    pos = (cameraMatrix * modelMatrix * aPosition).xyz;
    lightPosInCam1 = (cameraMatrix * lightPosition1).xyz;
    lightPosInCam2 = (cameraMatrix * lightPosition2).xyz;
    //the ray from the vertex towards the light
    fL1 = normalize(lightPosInCam1.xyz - pos);
    fL2 = normalize(lightPosInCam2.xyz - pos);
    //the ray from the vertex towards the camera
    fE = normalize(vec3(0, 0, 0) - pos);
    //normal in camera coordinates
    fN = normalize(cameraMatrix * modelMatrix * vec4(aNormal, 0)).xyz;
    fLS1 = normalize((lightDirection1).xyz);
    fLS2 = normalize((cameraMatrix * lightDirection2).xyz);
    vec4 V = normalize(modelMatrix * aPosition - inverse(cameraMatrix) * vec4(0, 0, 0, 1));
    vec4 N = normalize(modelMatrix * vec4(aNormal, 0));
    R = reflect(V, N).xyz;
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*aPosition;
    vTextureCoord = aTextureCoord;
}