#version 300 es
precision mediump float;
precision mediump int;

in vec2 vTextureCoord;
uniform sampler2D uTextureUnit;

in vec4 color;
out vec4 fColor;

void main()
{
    fColor = color * texture(uTextureUnit, vTextureCoord);
}
