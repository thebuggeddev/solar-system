import * as THREE from 'three';

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  ${THREE.ShaderChunk.fog_pars_vertex}
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vPositionNormal = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
    ${THREE.ShaderChunk.fog_vertex}
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform float c;
  uniform float p;
  uniform vec3 glowColor;
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  ${THREE.ShaderChunk.fog_pars_fragment}
  void main() {
    float intensity = pow(max(0.0, c - dot(vNormal, vPositionNormal)), p);
    vec3 glow = glowColor * intensity * 2.0;
    gl_FragColor = vec4(glow, intensity * 1.5);
    ${THREE.ShaderChunk.fog_fragment}
  }
`;

export function createAtmosphereMaterial(color: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib['fog'],
      {
        c: { value: 0.3 },
        p: { value: 4.0 },
        glowColor: { value: new THREE.Color(color) },
      },
    ]),
    vertexShader: ATMOSPHERE_VERTEX,
    fragmentShader: ATMOSPHERE_FRAGMENT,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    fog: true,
  });
}
