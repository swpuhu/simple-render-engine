precision mediump float;
varying vec2 v_uv;
uniform vec4 u_texTransform;
uniform sampler2D u_tex;
void main() {
    vec2 offset = u_texTransform.xy;
    vec2 scale = u_texTransform.zw;
    vec2 uv = v_uv * scale + offset;
    vec4 t = texture2D(u_tex, uv);

    gl_FragColor = t;
}
