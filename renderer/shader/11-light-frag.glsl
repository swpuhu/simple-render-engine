precision mediump float;
varying vec3 v_color;
varying vec3 v_normal;
varying vec3 v_worldPos;
uniform vec3 u_lightDir;
uniform vec3 u_viewWorldPos;
uniform float u_gloss;
uniform vec3 u_diffuse;
uniform vec3 u_specular;
void main() {
    vec3 n = normalize(v_normal);
    vec3 lightDir = -normalize(u_lightDir);
    vec3 viewDir = normalize(u_viewWorldPos - v_worldPos);
    vec3 r = 2.0 * dot(n, lightDir) * n - lightDir;
    float LdotN = dot(lightDir, n);
    float RdotV = dot(viewDir, r);
    vec3 dColor = u_diffuse;
    vec3 sColor = u_specular;
    vec3 ambient = vec3(0.2);
    vec3 diffuse = dColor * max(0.0, LdotN);
    vec3 specular = sColor * pow(max(0.0, RdotV), u_gloss);

    vec3 color = ambient + diffuse + specular;

    color = pow(color, vec3(1.0 / 1.5));
    gl_FragColor = vec4(color, 1.0);
}
