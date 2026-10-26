import { Billboard, ContactShadows } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import {
  aleatorio,
  easeInOutCubic,
  FILEIRAS,
  FOGO_ACESO,
  FOGO_DESCE,
  IMPACTO,
  janelaDaPedra,
  lugarDaPedra,
  PEDRAS,
  progressoEm,
  suave,
} from './timeline'

type Props = { progresso: RefObject<number> }

const LARGURA = 0.82
const ALTURA = 0.56
const PROFUNDIDADE = 0.95
const PASSO_X = 0.86
const PASSO_Y = 0.585
const TOPO_DO_ALTAR = FILEIRAS.length * PASSO_Y

const OURO = new THREE.Color('#ffd000')
const BRASA = new THREE.Color('#ff9d00')

function geometriaDePedra(semente: number) {
  const g = new THREE.BoxGeometry(1, 1, 1, 6, 4, 5)
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const cores = new Float32Array(pos.count * 3)
  const v = new THREE.Vector3()
  const escura = new THREE.Color('#1f1c18')
  const clara = new THREE.Color('#4a4136')
  const c = new THREE.Color()

  const ruido = (x: number, y: number, z: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + semente * 17.3) * 43758.5453
    return s - Math.floor(s)
  }

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const canto = Math.abs(v.x * v.y) + Math.abs(v.y * v.z) + Math.abs(v.x * v.z)
    v.multiplyScalar(1 - 0.16 * canto)
    const n = ruido(v.x * 3, v.y * 3, v.z * 3)
    v.addScaledVector(v.clone().normalize(), (n - 0.5) * 0.07)
    v.set(v.x * LARGURA, v.y * ALTURA, v.z * PROFUNDIDADE)
    pos.setXYZ(i, v.x, v.y, v.z)

    c.copy(escura).lerp(clara, ruido(v.x * 9, v.y * 9, v.z * 9) * 0.8)
    cores.set([c.r, c.g, c.b], i * 3)
  }
  g.setAttribute('color', new THREE.BufferAttribute(cores, 3))
  g.computeVertexNormals()
  return g
}

type DadosPedra = {
  geometria: THREE.BufferGeometry
  material: THREE.MeshStandardMaterial
  espalhada: THREE.Vector3
  rotacaoEspalhada: THREE.Quaternion
  final: THREE.Vector3
  rotacaoFinal: THREE.Quaternion
  giro: THREE.Vector3
}

function criarPedras(): DadosPedra[] {
  return Array.from({ length: PEDRAS }, (_, i) => {
    const r = aleatorio(i * 9973 + 7)
    const { fileira, indice, total } = lugarDaPedra(i)

    const angulo = (i / PEDRAS) * Math.PI * 2 + r() * 0.4
    const raio = 3.4 + r() * 2.2
    const espalhada = new THREE.Vector3(Math.cos(angulo) * raio, 0.6 + r() * 3.6, Math.sin(angulo) * raio * 0.55 - 1.2)
    const rotacaoEspalhada = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(r() * Math.PI * 2, r() * Math.PI * 2, r() * Math.PI * 2),
    )

    const final = new THREE.Vector3(
      (indice - (total - 1) / 2) * PASSO_X + (r() - 0.5) * 0.04,
      ALTURA / 2 + fileira * PASSO_Y,
      fileira * -0.06 + (r() - 0.5) * 0.04,
    )
    const rotacaoFinal = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (r() - 0.5) * 0.08, (r() - 0.5) * 0.03))

    return {
      geometria: geometriaDePedra(i + 1),
      material: new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.93,
        metalness: 0.04,
        flatShading: true,
        emissive: BRASA,
        emissiveIntensity: 0,
      }),
      espalhada,
      rotacaoEspalhada,
      final,
      rotacaoFinal,
      giro: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.5),
    }
  })
}

function Pedras({ progresso }: Props) {
  const pedras = useMemo(criarPedras, [])
  const malhas = useRef<(THREE.Mesh | null)[]>([])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const qGiro = useMemo(() => new THREE.Quaternion(), [])
  const e = useMemo(() => new THREE.Euler(), [])

  useEffect(
    () => () =>
      pedras.forEach((p) => {
        p.geometria.dispose()
        p.material.dispose()
      }),
    [pedras],
  )

  useFrame(({ clock }) => {
    const p = progresso.current ?? 0
    const t = clock.elapsedTime
    const fogo = suave(FOGO_DESCE, FOGO_ACESO, p)

    pedras.forEach((pedra, i) => {
      const malha = malhas.current[i]
      if (!malha) return
      const janela = janelaDaPedra(i)
      const k = easeInOutCubic(progressoEm(janela, p))
      const solta = 1 - k

      malha.position.lerpVectors(pedra.espalhada, pedra.final, k)
      malha.position.y += Math.sin(t * 0.7 + i * 1.3) * 0.18 * solta + Math.sin(k * Math.PI) * 1.1

      e.set(pedra.giro.x * t * solta, pedra.giro.y * t * solta, pedra.giro.z * t * solta)
      qGiro.setFromEuler(e)
      q.copy(pedra.rotacaoEspalhada).multiply(qGiro).slerp(pedra.rotacaoFinal, k)
      malha.quaternion.copy(q)

      const depois = p - janela[1]
      const lampejo = depois >= 0 ? Math.max(0, 1 - depois / 0.022) : 0
      pedra.material.emissiveIntensity = lampejo * 0.9 + fogo * (0.04 + 0.02 * Math.sin(t * 9 + i))
    })
  })

  return (
    <group>
      {pedras.map((p, i) => (
        <mesh
          key={i}
          ref={(m) => {
            malhas.current[i] = m
          }}
          geometry={p.geometria}
          material={p.material}
          castShadow
        />
      ))}
    </group>
  )
}

function texturaRadial(opaca: boolean) {
  const tela = document.createElement('canvas')
  tela.width = tela.height = 256
  const ctx = tela.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  if (opaca) {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 256, 256)
    g.addColorStop(0, '#fff')
    g.addColorStop(0.35, '#fff')
    g.addColorStop(1, '#000')
  } else {
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.25, 'rgba(255,255,255,0.45)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(tela)
}

const fogoVertex = `
  uniform float uTempo;
  uniform float uIntensidade;
  uniform float uEscala;
  attribute float aSemente;
  varying float vVida;
  void main() {
    float vida = fract(uTempo * (0.55 + aSemente * 0.5) + aSemente * 7.0);
    vVida = vida;
    float raio = (1.0 - vida) * 0.7 * (0.4 + uIntensidade * 0.6);
    float ang = aSemente * 40.0 + uTempo * 2.0;
    vec3 p = vec3(cos(ang) * raio * position.x, vida * 1.9 * uIntensidade, sin(ang) * raio * position.z * 0.6);
    p.x += sin(uTempo * 6.0 + aSemente * 30.0) * 0.06 * vida;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uEscala * (1.0 - vida * 0.7) * uIntensidade * (820.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const fogoFragment = `
  varying float vVida;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float suave = smoothstep(0.5, 0.0, d);
    vec3 branco = vec3(1.0, 0.97, 0.8);
    vec3 ouro = vec3(1.0, 0.82, 0.0);
    vec3 brasa = vec3(1.0, 0.35, 0.02);
    vec3 cor = mix(branco, ouro, smoothstep(0.0, 0.3, vVida));
    cor = mix(cor, brasa, smoothstep(0.35, 0.9, vVida));
    gl_FragColor = vec4(cor, suave * (1.0 - vVida) * 0.16);
  }
`

function Fogo({ progresso }: Props) {
  const QTD = 700
  const material = useRef<THREE.ShaderMaterial>(null)
  const luz = useRef<THREE.PointLight>(null)
  const halo = useRef<THREE.Sprite>(null)
  const texturaHalo = useMemo(() => texturaRadial(false), [])
  const { geometria, uniforms } = useMemo(() => {
    const r = aleatorio(42)
    const pos = new Float32Array(QTD * 3)
    const sementes = new Float32Array(QTD)
    for (let i = 0; i < QTD; i++) {
      pos.set([r() * 2 - 1, 0, r() * 2 - 1], i * 3)
      sementes[i] = r()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSemente', new THREE.BufferAttribute(sementes, 1))
    return {
      geometria: g,
      uniforms: { uTempo: { value: 0 }, uIntensidade: { value: 0 }, uEscala: { value: 1 } },
    }
  }, [])

  useEffect(
    () => () => {
      geometria.dispose()
      texturaHalo.dispose()
    },
    [geometria, texturaHalo],
  )

  useFrame(({ clock, gl }) => {
    const p = progresso.current ?? 0
    const t = clock.elapsedTime
    const fogo = suave(IMPACTO, FOGO_ACESO, p)
    if (halo.current) {
      const m = halo.current.material
      m.opacity = fogo * (0.55 + Math.sin(t * 11) * 0.05)
      halo.current.scale.setScalar(3 + Math.sin(t * 5.3) * 0.15)
    }
    const u = material.current?.uniforms
    if (u) {
      u.uTempo.value = t
      u.uIntensidade.value = fogo
      u.uEscala.value = gl.getPixelRatio()
    }
    if (luz.current) luz.current.intensity = fogo * (22 + Math.sin(t * 13) * 2.5 + Math.sin(t * 7.3) * 2)
  })

  return (
    <group position={[0, TOPO_DO_ALTAR, -0.12]}>
      <points geometry={geometria} frustumCulled={false}>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={fogoVertex}
          fragmentShader={fogoFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <sprite ref={halo} position={[0, 0.9, 0]}>
        <spriteMaterial
          map={texturaHalo}
          color="#ffb000"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <pointLight
        ref={luz}
        color="#ffae00"
        position={[0, 0.7, 0.4]}
        distance={14}
        decay={1.6}
        intensity={0}
        castShadow
      />
    </group>
  )
}

function FogoDoCeu({ progresso }: Props) {
  const malha = useRef<THREE.Group>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uOpacidade: { value: 0 } }), [])

  useFrame(() => {
    const p = progresso.current ?? 0
    const desce = suave(FOGO_DESCE, IMPACTO, p)
    const some = 1 - suave(IMPACTO + 0.01, FOGO_ACESO, p)
    const opacidade = desce * some
    if (material.current) material.current.uniforms.uOpacidade.value = opacidade
    if (malha.current) {
      const base = THREE.MathUtils.lerp(7, TOPO_DO_ALTAR, desce)
      malha.current.position.y = base + 7
      malha.current.visible = opacidade > 0.001
    }
  })

  return (
    <Billboard ref={malha} visible={false} lockX lockZ>
      <mesh>
        <planeGeometry args={[2.4, 14]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={`
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `}
          fragmentShader={`
          uniform float uOpacidade;
          varying vec2 vUv;
          void main() {
            float x = (vUv.x - 0.5) * 2.0;
            float largura = mix(0.18, 0.5, 1.0 - vUv.y);
            float horizontal = exp(-pow(x / largura, 2.0) * 2.5);
            float vertical = smoothstep(0.0, 0.06, vUv.y) * pow(1.0 - vUv.y, 1.2);
            float a = horizontal * vertical * uOpacidade;
            vec3 cor = mix(vec3(1.0, 0.75, 0.1), vec3(1.0, 0.98, 0.85), horizontal * (1.0 - vUv.y));
            gl_FragColor = vec4(cor, a);
          }
        `}
        />
      </mesh>
    </Billboard>
  )
}

function Brasas({ progresso }: Props) {
  const QTD = 260
  const material = useRef<THREE.ShaderMaterial>(null)
  const { geometria, uniforms } = useMemo(() => {
    const r = aleatorio(7)
    const pos = new Float32Array(QTD * 3)
    const sementes = new Float32Array(QTD)
    for (let i = 0; i < QTD; i++) {
      pos.set([(r() - 0.5) * 14, r() * 8, (r() - 0.5) * 9 - 1], i * 3)
      sementes[i] = r()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSemente', new THREE.BufferAttribute(sementes, 1))
    return { geometria: g, uniforms: { uTempo: { value: 0 }, uFogo: { value: 0 }, uEscala: { value: 1 } } }
  }, [])

  useEffect(() => () => geometria.dispose(), [geometria])

  useFrame(({ clock, gl }) => {
    const u = material.current?.uniforms
    if (!u) return
    u.uTempo.value = clock.elapsedTime
    u.uFogo.value = suave(FOGO_DESCE, FOGO_ACESO, progresso.current ?? 0)
    u.uEscala.value = gl.getPixelRatio()
  })

  return (
    <points geometry={geometria} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          uniform float uTempo;
          uniform float uFogo;
          uniform float uEscala;
          attribute float aSemente;
          varying float vBrilho;
          void main() {
            vec3 p = position;
            float velocidade = 0.15 + aSemente * 0.35 + uFogo * 0.4;
            p.y = mod(p.y + uTempo * velocidade, 8.0);
            p.x += sin(uTempo * 0.6 + aSemente * 20.0) * 0.4;
            vBrilho = (0.25 + uFogo * 0.75) * (0.6 + 0.4 * sin(uTempo * 3.0 + aSemente * 50.0)) * smoothstep(8.0, 5.0, p.y);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = uEscala * (1.5 + aSemente * 2.5) * (12.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          varying float vBrilho;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            gl_FragColor = vec4(1.0, 0.8, 0.15, smoothstep(0.5, 0.0, d) * vBrilho);
          }
        `}
      />
    </points>
  )
}

function Camera({ progresso }: Props) {
  const { camera, size, scene } = useThree()
  const alvo = useMemo(() => new THREE.Vector3(), [])
  const olhar = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ pointer }) => {
    const p = progresso.current ?? 0
    const fogo = suave(FOGO_DESCE, FOGO_ACESO, p)
    const recuo = Math.max(1, 1.05 / (size.width / size.height))
    const distancia = THREE.MathUtils.lerp(11.5, 8.6, suave(0, 0.85, p)) * recuo
    const angulo = THREE.MathUtils.lerp(-0.45, 0.12, suave(0, 1, p)) + pointer.x * 0.12
    const altura = THREE.MathUtils.lerp(3.6, 2.3, suave(0, 0.85, p)) + pointer.y * 0.25

    alvo.set(Math.sin(angulo) * distancia, altura, Math.cos(angulo) * distancia)
    camera.position.lerp(alvo, 0.08)
    olhar.set(0, 1.2 + fogo * 0.65, 0)
    camera.lookAt(olhar)

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = distancia - 2
      scene.fog.far = distancia + 14
    }
  })
  return null
}

function Luzes({ progresso }: Props) {
  const lua = useRef<THREE.DirectionalLight>(null)
  const quente = useRef<THREE.SpotLight>(null)

  useFrame(() => {
    const fogo = suave(FOGO_DESCE, FOGO_ACESO, progresso.current ?? 0)
    if (lua.current) lua.current.intensity = 0.9 - fogo * 0.5
    if (quente.current) quente.current.intensity = 5 + fogo * 10
  })

  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight ref={lua} color="#9fb0c8" position={[-4, 7, 5]} intensity={0.9} />
      <spotLight
        ref={quente}
        color={OURO}
        position={[0, 9, 3]}
        angle={0.45}
        penumbra={0.8}
        distance={22}
        decay={1.5}
        intensity={6}
        castShadow
      />
      <directionalLight color="#ffffff" position={[3, 3, -6]} intensity={0.35} />
    </>
  )
}

function Chao() {
  const mascara = useMemo(() => texturaRadial(true), [])
  useEffect(() => () => mascara.dispose(), [mascara])
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <circleGeometry args={[14, 64]} />
      <meshStandardMaterial color="#0c0b0a" roughness={1} alphaMap={mascara} transparent depthWrite={false} />
    </mesh>
  )
}

export default function AltarCanvas({ progresso }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const [visivel, setVisivel] = useState(true)

  useEffect(() => {
    const el = container.current
    if (!el) return
    const obs = new IntersectionObserver(([entrada]) => setVisivel(entrada.isIntersecting))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={container} className="absolute inset-0">
      <Canvas
        frameloop={visivel ? 'always' : 'never'}
        dpr={[1, 1.75]}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 35, position: [0, 3.6, 11.5], near: 0.1, far: 80 }}
        onCreated={({ scene }) => {
          scene.fog = new THREE.Fog('#0a0a0a', 9, 26)
        }}
      >
        <Camera progresso={progresso} />
        <Luzes progresso={progresso} />
        <Pedras progresso={progresso} />
        <Fogo progresso={progresso} />
        <FogoDoCeu progresso={progresso} />
        <Brasas progresso={progresso} />
        <Chao />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.75} scale={12} blur={2.4} far={4} resolution={512} />
      </Canvas>
    </div>
  )
}
