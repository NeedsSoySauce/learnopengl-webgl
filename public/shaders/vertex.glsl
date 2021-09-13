#version 300 es
 
in vec3 a_position;

uniform mat4 u_translation;
uniform mat4 u_scale;
uniform mat4 u_x_rotation;
uniform mat4 u_y_rotation;
uniform mat4 u_z_rotation;

out float alpha;
 
void main() {
    gl_Position = u_translation * u_scale * u_z_rotation* u_y_rotation * u_x_rotation * vec4(a_position, 1.0);;
}

