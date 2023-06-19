attribute vec4 a_position;
attribute vec3 a_color;
attribute vec3 a_normal;
uniform mat4 u_world;
uniform mat4 u_viewInv;
uniform mat4 u_proj;
varying vec3 v_color;
varying vec3 v_worldPos;
varying vec3 v_normal;
void main() {
    vec4 worldPos = u_world * a_position;
    vec4 worldNormal = u_world * vec4(a_normal, 1.0);
    v_worldPos = worldPos.xyz / worldPos.w;
    v_color = a_color;
    v_normal = worldNormal.xyz / worldNormal.w;
    gl_Position = u_proj * u_viewInv * worldPos;
}
