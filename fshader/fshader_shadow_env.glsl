#version 300 es
precision mediump float;
precision mediump int;

in vec4 color;
in vec3 fN;
in vec3 fL1;
in vec3 fL2;
in vec3 fLS1;
in vec3 fLS2;
in vec3 fE;
in vec3 pos;
in vec3 lightPosInCam1;
in vec3 lightPosInCam2;
in vec2 texCoord;
in vec3 R;
in vec4 shadow_coord;

uniform bool useVertex;
uniform bool useReflection;
uniform bool useDistort;
uniform vec4 lightAmbient1, lightDiffuse1, lightSpecular1;
uniform float lightAlpha1, lightCutoffAngle1;
uniform int lightType1;
uniform bool lightOff1;
uniform vec4 lightAmbient2, lightDiffuse2, lightSpecular2;
uniform float lightAlpha2, lightCutoffAngle2;
uniform int lightType2;
uniform bool lightOff2;
uniform vec4 matAmbient, matDiffuse, matSpecular;
uniform float matAlpha;
uniform sampler2D textureID;
uniform samplerCube textureUnit;
uniform sampler2D depthTexture;
uniform float maxDepth;
uniform float time;

out vec4 fColor;

vec4 scanLine(float uv, float res, float opacity) {
   float intensity = sin(uv * res * 3.1415 * 2.0);
   intensity = ((0.5 * intensity) + 0.5) * 0.9 + 0.1;
   return vec4(vec3(pow(intensity, opacity)), 1.0);
}

void main() {
   if(!useVertex) {
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

      float Kd1 = max(dot(L1, N), 0.0);
      float Kd2 = max(dot(L2, N), 0.0);
      vec4 diffuse1 = Kd1 * lightDiffuse1 * matDiffuse;
      vec4 diffuse2 = Kd2 * lightDiffuse2 * matDiffuse;

      float Ks1 = pow(max(dot(N, H1), 0.0), matAlpha);
      float Ks2 = pow(max(dot(N, H2), 0.0), matAlpha);
      vec4 spec1 = Ks1 * lightSpecular1 * matSpecular;
      vec4 spec2 = Ks2 * lightSpecular2 * matSpecular;

      if(dot(L1, N) < 0.0)
         spec1 = vec4(0, 0, 0, 1);

      if(dot(L2, N) < 0.0)
         spec2 = vec4(0, 0, 0, 1);

      float adjust1;
      if(lightOff1) {
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
      if(lightOff2) {
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

      vec3 shadowMapTexCoord = shadow_coord.xyz / shadow_coord.w; //put in range [-1,1]
      shadowMapTexCoord = 0.5 * shadowMapTexCoord.xyz + 0.5; //shift to range [0,1]
      //distance between light an nearest occluder
      float fragDistance = shadow_coord.z / maxDepth;
      //float bias = max(0.01 * (1.0 - dot(N, L1)), 0.0001);
      float bias = 0.003;
      float shadow = 0.0;
      vec2 texelSize = vec2(1.0 / 1024.0, 1.0 / 1024.0);
      for(int x = -1; x <= 1; ++x) {
         for(int y = -1; y <= 1; ++y) {
            float nearestDistance = texture(depthTexture, shadowMapTexCoord.xy + vec2(x, y) * texelSize).r;
            shadow += fragDistance - bias > nearestDistance ? 1.0 : 0.0;
         }
      }
      shadow /= 9.0;
      //fColor = texture(depthTexture, shadowMapTexCoord.xy);
      fColor = adjust1 * (ambient1 + (1.0 - shadow) * (diffuse1 + spec1)) + adjust2 * (ambient2 + diffuse2 + spec2);
      fColor.a = 1.0;
   } else {
      fColor = color;
   }
   if(useReflection) {
      fColor = mix(fColor, texture(textureUnit, R), 0.70);
   } else {
      fColor = fColor * texture(textureID, texCoord);
   }

   if(useDistort) {
      fColor *= scanLine(gl_FragCoord.x, 4200.0, 0.1);
      fColor *= scanLine(gl_FragCoord.y, 4200.0, 0.1);
      vec2 p = (3.0 * gl_FragCoord.xy - 800.0) / 800.0;
      for(int i = 1; i < 22; i++) {
         vec2 newp = p;
         newp.x += 0.65 / float(i) * sin(float(i) * p.y + time / 20.0 + 0.3 * float(i));
         newp.y += 0.65 / float(i) * sin(float(i) * p.x + time / 10.0 + 0.3 * float(i + 10)) + 15.0;
         p = newp;
      }
      vec3 col = vec3(0.5 * sin(4.0 * p.x) + 0.5, 0.5 * sin(3.0 * p.y) + 0.5, sin(p.x + p.y));
      fColor = mix(fColor, vec4(col, 1.0), 0.1);
      fColor.a = 1.0;
   }
}
