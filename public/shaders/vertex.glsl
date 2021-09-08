#version 300 es
 
in vec4 a_position;

uniform float u_scale;

out float alpha;
 
void main() {
    float scale = 2.0;
    gl_Position = a_position * vec4(u_scale, u_scale, u_scale, 1);
}

