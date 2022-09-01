#version 300 es
precision mediump float;
precision mediump int;

// in vec2 vTextureCoord;
// uniform sampler2D uTextureUnit;

out vec4 fColor;

uniform vec4 lightAmbient1, lightDiffuse1, lightSpecular1;
uniform float lightAlpha1, lightCutoffAngle1;
uniform int lightType1;
uniform bool lightOn1;
uniform vec4 lightAmbient2, lightDiffuse2, lightSpecular2;
uniform float lightAlpha2, lightCutoffAngle2;
uniform int lightType2;
uniform bool lightOn2;
uniform vec4 matAmbient, matDiffuse, matSpecular;
uniform float matAlpha;
in vec3 pos;
in vec3 lightPosInCam1;
in vec3 lightPosInCam2;
in vec3 fL1;
in vec3 fL2;
in vec3 fLS1;
in vec3 fLS2;
in vec3 fN;
in vec3 fE;
in vec3 R;


void main()
{
    vec3 N = normalize(fN);
    vec3 E = normalize(fE);
    vec3 L1 = normalize(fL1);
    vec3 L2 = normalize(fL2);
    vec3 LS1 = normalize(fLS1);
    vec3 LS2 = normalize(fLS2);
    vec3 H1 = normalize(L1 + E);
    vec3 H2 = normalize(L2 + E);

    vec4 ambient1 = lightAmbient1 * matAmbient;
    vec4 ambient2 = lightAmbient2 * matAmbient;

    float Ks1 = pow(max(dot(N, H1), 0.0), matAlpha);
    float Ks2 = pow(max(dot(N, H2), 0.0), matAlpha);
    vec4 spec1 = Ks1 * lightSpecular1 * matSpecular;
    vec4 spec2 = Ks2 * lightSpecular2 * matSpecular;

    
    float Kd1 = max(dot(fL1, fN), 0.0);
    float Kd2 = max(dot(fL2, fN), 0.0);
    vec4 diffuse1 = Kd1 * lightDiffuse1 * matDiffuse;
    vec4 diffuse2 = Kd2 * lightDiffuse2 * matDiffuse;


    if(dot(L1, N) < 0.0)
        spec1 = vec4(0, 0, 0, 1);

    if(dot(L2, N) < 0.0)
        spec2 = vec4(0, 0, 0, 1);

    float adjust1;
      if(!lightOn1) {
         adjust1 = 0.0;
      } else if(lightType1 == 0) {
         // Distance light
         adjust1 = 1.0;
      } else if(lightType1 == 1) {
         // Spotlight
         if(acos(dot(-L1, LS1)) > lightCutoffAngle1) {
            adjust1 = 0.0;
         } else {
            float cspot1 = pow(max(dot(-L1, LS1), 0.0), lightAlpha1);
            float dropoff1 = 1.0 / max(dot(pos - lightPosInCam1, pos - lightPosInCam1), 0.00001);
            adjust1 = cspot1 * 1.0;
         }
      }
      float adjust2;
      if(!lightOn2) {
         adjust2 = 0.0;
      } else if(lightType2 == 0) {
         // Distance light
         adjust2 = 1.0;
      } else if(lightType2 == 1) {
         // Spotlight
         if(acos(dot(-L2, LS2)) > lightCutoffAngle2) {
            adjust2 = 0.0;
         } else {
            float cspot2 = pow(max(dot(-L2, LS2), 0.0), lightAlpha2);
            float dropoff2 = 1.0 / max(dot(pos - lightPosInCam2, pos - lightPosInCam2), 0.00001);
            adjust2 = cspot2 * 1.0;
         }
      }

    fColor = adjust1 * (ambient1 + (diffuse1 + spec1)) + adjust2 * (ambient2 + diffuse2 + spec2);



   //  fColor = texture(uTextureUnit, vTextureCoord);
}
