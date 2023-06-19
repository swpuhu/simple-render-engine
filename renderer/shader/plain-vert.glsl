attribute vec4 a_position;
uniform mat4 u_proj;
uniform mat4 u_viewInv;
uniform mat4 u_world;
void main() {
    gl_Position = u_proj * u_viewInv * u_world * a_position;
}
