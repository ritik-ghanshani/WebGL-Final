#version 300 es
precision mediump float;
precision mediump int;

in vec4 aPosition;
in vec3 aNormal;
in vec2 aTexs;

out vec4 color;
out vec3 fN;
out vec3 fE;
out vec3 fL1;
out vec3 fL2;
out vec3 fLS1;
out vec3 fLS2;
out vec3 pos;
out vec3 lightPosInCam1;
out vec3 lightPosInCam2;
out vec2 texCoord;
out vec3 R;
out vec4 shadow_coord;

uniform bool useVertex;

uniform mat4 modelMatrix;
uniform mat4 cameraMatrix;
uniform mat4 projMatrix;
uniform mat4 lightCameraMatrix;
uniform mat4 lightProjMatrix;

uniform vec4 matAmbient, matDiffuse, matSpecular;
uniform float matAlpha;

uniform vec4 lightAmbient1, lightDiffuse1, lightSpecular1;
uniform vec4 lightPos1, lightDir1;
uniform float lightAlpha1, lightCutoffAngle1;
uniform int lightType1;
uniform bool lightOff1;

uniform vec4 lightAmbient2, lightDiffuse2, lightSpecular2;
uniform vec4 lightPos2, lightDir2;
uniform float lightAlpha2, lightCutoffAngle2;
uniform int lightType2;
uniform bool lightOff2;

void main() {
   texCoord = aTexs;
   // vertex in camera coordinates
   pos = (cameraMatrix * modelMatrix * aPosition).xyz;

   // light in camera coordinates
   lightPosInCam1 = (cameraMatrix * lightPos1).xyz;
   lightPosInCam2 = (cameraMatrix * lightPos2).xyz;

   // ray from vertex towards light
   fL1 = normalize(lightPosInCam1.xyz - pos);
   fL2 = normalize(lightPosInCam2.xyz - pos);
   // ray from vertex towards camera
   fE = normalize(vec3(0, 0, 0) - pos);
   // normal in camera coordinates
   fN = normalize(cameraMatrix * modelMatrix * vec4(aNormal, 0)).xyz;
   // direction of light relative to camera
   fLS1 = normalize((cameraMatrix * lightDir1).xyz);
   fLS2 = normalize((cameraMatrix * lightDir2).xyz);
   vec4 V = normalize(modelMatrix * aPosition - inverse(cameraMatrix) * vec4(0, 0, 0, 1));
   vec4 N = normalize(modelMatrix * vec4(aNormal, 0));
   R = reflect(V, N).xyz;

   if(useVertex) {
      // per-vertex shader
      // half-way vector
      vec3 H1 = normalize(fL1 + fE);
      vec3 H2 = normalize(fL2 + fE);

      // compute colors
      vec4 ambient1 = lightAmbient1 * matAmbient;
      vec4 ambient2 = lightAmbient2 * matAmbient;

      float Kd1 = max(dot(fL1, fN), 0.0);
      float Kd2 = max(dot(fL2, fN), 0.0);
      vec4 diffuse1 = Kd1 * lightDiffuse1 * matDiffuse;
      vec4 diffuse2 = Kd2 * lightDiffuse2 * matDiffuse;

      float Ks1 = pow(max(dot(fN, H1), 0.0), matAlpha);
      float Ks2 = pow(max(dot(fN, H2), 0.0), matAlpha);
      vec4 specular1 = Ks1 * lightSpecular1 * matSpecular;
      vec4 specular2 = Ks2 * lightSpecular2 * matSpecular;
      if(dot(fL1, fN) < 0.0)
         specular1 = vec4(0, 0, 0, 1);
      if(dot(fL2, fN) < 0.0)
         specular2 = vec4(0, 0, 0, 1);
      float adjust1;
      if(lightOff1) {
         adjust1 = 0.0;
      }
      if(lightType1 == 0) {
         // Distance light
         adjust1 = 1.0;
      } else if(lightType1 == 1) {
         // Spotlight
         if(acos(dot(-fL1, fLS1)) > lightCutoffAngle1) {
            adjust1 = 0.0;
         } else {
            float cspot1 = pow(max(dot(-fL1, fLS1), 0.0), lightAlpha1);
            float dropoff1 = 1.0 / max(dot(pos - lightPosInCam1, pos - lightPosInCam1), 0.00001);
            adjust1 = cspot1 * dropoff1;
         }
      }
      float adjust2;
      if(lightOff2) {
         adjust2 = 0.0;
      } else if(lightType2 == 0) {
         // Distance light
         adjust2 = 1.0;
      } else if(lightType2 == 1) {
         // Spotlight
         if(acos(dot(-fL2, fLS2)) > lightCutoffAngle2) {
            adjust2 = 0.0;
         } else {
            float cspot2 = pow(max(dot(-fL2, fLS2), 0.0), lightAlpha2);
            float dropoff2 = 1.0 / max(dot(pos - lightPosInCam2, pos - lightPosInCam2), 0.00001);
            adjust2 = cspot2 * dropoff2;
         }
      }
      color = adjust1 * (diffuse1 + specular1 + ambient1) + adjust2 * (diffuse2 + specular2 + ambient2);
      color.a = 1.0;
   }

   gl_Position = projMatrix * cameraMatrix * modelMatrix * aPosition;
   shadow_coord = lightProjMatrix * lightCameraMatrix * modelMatrix * aPosition;
}