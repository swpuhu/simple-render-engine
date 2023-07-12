attribute vec4 a_position;
attribute vec2 a_uv;
uniform mat4 u_world;
uniform mat4 u_viewInv;
uniform mat4 u_proj;
varying vec2 v_uv;
void main() {
    vec4 worldPos = u_world * a_position;
    v_uv = a_uv;
    gl_Position = u_proj * u_viewInv * worldPos;
}
