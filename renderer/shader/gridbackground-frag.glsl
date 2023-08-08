precision mediump float;
varying vec2 v_uv;
uniform vec2 u_resolution;
void main() {
    vec4 white = vec4(vec3(0.95), 1.0);
    vec4 black = vec4(vec3(0.7), 1.0);
    vec2 uv = (v_uv - 0.5) * 30.0;
    uv.x *= u_resolution.x / u_resolution.y;
    // vec2 st = fract(uv);
    vec2 id = floor(uv);
    int odd = int(mod(id.x + id.y, 2.0));
    if(odd == 1) {
        gl_FragColor = white;
    } else {
        gl_FragColor = black;
    }
}
