#version 300 es
 
in vec4 a_position;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out float alpha;
 
void main() {
    gl_Position = u_projection * u_view * u_model * a_position;
}

