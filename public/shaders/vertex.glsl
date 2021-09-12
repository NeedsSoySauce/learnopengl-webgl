#version 300 es
 
in vec3 a_position;

uniform mat4 u_position;
uniform mat4 u_scale;
uniform mat4 u_rotation;

out float alpha;
 
void main() {
    gl_Position = u_position * u_scale * vec4(a_position, 1.0);;
}

