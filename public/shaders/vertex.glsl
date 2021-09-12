#version 300 es
 
in vec4 a_position;

uniform mat4 u_scale;

out float alpha;
 
void main() {
    gl_Position = u_scale * a_position;
}

