#version 300 es

precision mediump float;

in vec2 v_uv;
uniform sampler2D u_tex;
out vec4 outputColor;
void main() {
    vec4 col = texture(u_tex, v_uv);
    outputColor = col;
}