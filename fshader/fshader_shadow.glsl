#version 300 es
precision mediump float;
in vec4 shadowCoord;
in float camDepth;
uniform sampler2D depthTexture;
uniform float maxDepth;
out vec4 fColor;
void main() 
{ 
vec4 temp = vec4(1.0,0.0,0.0,1.0);
vec3 shadowMapTexCoord = shadowCoord.xyz/shadowCoord.w;//put in range [-1,1]
shadowMapTexCoord = 0.5*shadowMapTexCoord+0.5; //shift to range [0,1]
//distance between light and nearest occluder
float nearestDistance = texture(depthTexture, shadowMapTexCoord.xy).r;
float fragDistance = camDepth/maxDepth;
if(nearestDistance < fragDistance - 0.1) //precision allowance
temp.rgb*=0.5;
temp.a = 1.0;
fColor = temp;
}
