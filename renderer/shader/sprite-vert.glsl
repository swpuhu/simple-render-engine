attribute vec4 a_position;
attribute vec2 a_uv;
uniform mat4 u_proj;
varying vec2 v_uv;
void main() {
    gl_Position = u_proj * a_position;
    v_uv = a_uv;
}
