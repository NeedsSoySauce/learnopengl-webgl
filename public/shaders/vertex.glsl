#version 300 es
 
in vec3 a_position;

uniform mat4 u_model;

out float alpha;
 
void main() {
    gl_Position = u_model * vec4(a_position, 1.0);;
    // gl_Position = u_translation * u_scale * vec4(a_position, 1.0);
    // gl_Position = u_y_rotation * vec4(a_position, 1.0);
}

