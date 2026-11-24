import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { sendAdminPasswordReset, signInAdmin } from '../services/authService';
import { isFirebaseConfigured } from '../../lib/firebase';
import { BRAND_LOGO_MAIN } from '../../lib/brandAssets';

interface MarbleLoginProps {
  onSuccess?: () => void;
  externalError?: string | null;
}

export const MarbleLogin: React.FC<MarbleLoginProps> = ({ onSuccess, externalError }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passInputRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const msgRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [backendNotice, setBackendNotice] = useState<string | null>(externalError || null);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);

  // Expose trigger hooks for demonstration / integration
  const triggerSpillRef = useRef<(() => void) | null>(null);
  const triggerLockRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (externalError) {
      setBackendNotice(externalError);
    }
  }, [externalError]);

  useEffect(() => {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setIsDevMode(searchParams.get('dev') === 'true');
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const cv = canvasRef.current;
    if (!root || !cv) return;

    const emailIn = emailInputRef.current;
    const passIn = passInputRef.current;
    const form = formRef.current;
    const btn = btnRef.current;
    const title = titleRef.current;
    const msg = msgRef.current;
    if (!emailIn || !passIn || !form || !btn || !title || !msg) return;

    const troughs = Array.from(root.querySelectorAll<HTMLSpanElement>('.mc-trough'));
    const inputs = [emailIn, passIn];

    const GRAVITY = 2600;
    const BOUNCE = 0.45;
    const MARBLE_SIZE = 26;
    const MATERIAL: 'clear' | 'vein' = 'clear';
    const SOUND = true;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = cv.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) {
      root.classList.add('mc-plain');
    }

    let w = 0, h = 0, dpr = 1, R = 26, floorY = 0, DIP = 0;
    const balls: Array<any> = [];
    const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@._-+';
    const fields = troughs.map((box) => ({
      wrap: box.querySelector('.mc-cells') as HTMLSpanElement,
      max: 48,
      cells: [] as Array<any>,
      n: 0,
      chars: '',
    }));

    function measure() {
      if (!root) return;
      const r = root.getBoundingClientRect();
      const ow = w, oh = h;
      w = r.width;
      h = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      R = MARBLE_SIZE / 2;
      root.style.setProperty('--cw', MARBLE_SIZE + 10 + 'px');
      root.style.setProperty('--ch', MARBLE_SIZE * 1.5 + 'px');
      floorY = h - 18;
      DIP = 90 / Math.pow(w / 2, 2);

      for (const f of fields) {
        for (const c of f.cells) {
          const b = c.el.getBoundingClientRect();
          const o = c.slot;
          c.slot = {
            l: b.left - r.left,
            r: b.right - r.left,
            t: b.top - r.top,
            b: b.bottom - r.top - 5,
            x: b.left - r.left + b.width / 2,
          };
          c.dx = (o && o.x !== 0) ? c.slot.x - o.x : 0;
          c.dy = (o && o.t !== 0) ? c.slot.t - o.t : 0;
        }
      }
      for (const b of balls) {
        if (b.cell) {
          b.x += b.cell.dx;
          b.y += b.cell.dy;
        } else if (ow) {
          b.x *= w / ow;
          b.y += h - oh;
        }
      }
      if (gl && cv) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        gl.viewport(0, 0, cv.width, cv.height);
      }
    }

    function fit(i: number) {
      const f = fields[i];
      const len = Math.min(inputs[i].value.length, f.max);
      const isFocused = document.activeElement === inputs[i];
      const want = isFocused ? Math.min(len + 1, f.max) : len;
      while (f.cells.length < want) {
        const el = document.createElement('span');
        el.className = 'mc-cell';
        f.wrap.appendChild(el);
        f.cells.push({ el, hit: 0, dx: 0, dy: 0, slot: { l: 0, r: 0, t: 0, b: 0, x: 0 } });
      }
      while (f.cells.length > want) {
        const c = f.cells.pop();
        c.dx = c.dy = 0;
        c.el.remove();
      }
      f.cells.forEach((c, k) => c.el.classList.toggle('mc-next', isFocused && k === len));
      measure();
    }

    function drop(i: number, ch: string, wait = 0) {
      const f = fields[i];
      const c = f.cells[f.n++];
      const s = c.slot;
      if (i === 0) f.chars += ch;
      const b = {
        x: s.x + (Math.random() - 0.5),
        y: -R * 2 - Math.random() * 40,
        vx: 0,
        vy: 0,
        a: (Math.random() - 0.5) * 0.5,
        w: 0,
        d: i === 0 ? CHARS.indexOf(ch) : -1,
        cell: c,
        wait,
        glow: 0,
        fade: 1,
        rest: 0,
        sleep: false,
        ground: false,
      };
      if (still) {
        b.x = s.x;
        b.y = s.b - R;
        b.sleep = true;
        b.wait = 0;
      }
      balls.push(b);
      wake();
    }

    function bounce(v: number) {
      const k = (v - 70) / 520;
      return BOUNCE * Math.min(1, Math.max(0, k));
    }

    function hit(b: any, v: number, x: number) {
      if (v < 40) return;
      b.glow = Math.min(1, b.glow + v / 900);
      if (b.cell) b.cell.hit = Math.max(b.cell.hit, Math.min(1, v / 650));
      tap(v, x);
    }

    function step(dt: number) {
      const n = 6;
      const k = dt / n;
      let moving = false;
      for (let s = 0; s < n; s++) {
        for (const b of balls) {
          if (b.sleep) continue;
          if (b.out) {
            b.y += b.vy * k;
            b.vy *= 1 - 6 * k;
            continue;
          }
          if (b.wait > 0) {
            b.wait -= k;
            continue;
          }
          b.vy += GRAVITY * k;
          b.x += b.vx * k;
          b.y += b.vy * k;
          b.a += b.w * k;
        }
        for (let pass = 0; pass < 2; pass++) {
          for (const b of balls) if (!b.sleep && !b.out && b.wait <= 0) walls(b);
          for (let i = 0; i < balls.length; i++)
            for (let j = i + 1; j < balls.length; j++) pair(balls[i], balls[j]);
        }
      }
      let roll = 0;
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        if (b.gone || b.out) {
          b.fade -= dt * (b.out ? 5 : 2.5);
          moving = true;
          if (b.fade <= 0) {
            balls.splice(i, 1);
            continue;
          }
        }
        b.glow *= Math.exp(-5 * dt);
        if (b.glow > 0.01) moving = true;
        if (b.sleep || b.wait > 0) {
          if (b.wait > 0) moving = true;
          continue;
        }
        moving = true;
        const v = Math.hypot(b.vx, b.vy);
        if (b.ground && !b.cell) roll += Math.abs(b.vx);
        b.rest = v < 12 && b.ground ? b.rest + dt : 0;
        if (b.rest > 0.25) b.sleep = true;
        if (b.sleep) b.vx = b.vy = b.w = 0;
        b.ground = false;
      }
      rolling(roll);
      for (const f of fields) {
        for (const c of f.cells) {
          if (c.hit < 0.003) {
            if (c.hit) {
              c.hit = 0;
              c.el.style.removeProperty('--hit');
            }
            continue;
          }
          c.el.style.setProperty('--hit', c.hit.toFixed(3));
          c.hit *= Math.exp(-6 * dt);
          moving = true;
        }
      }
      return moving;
    }

    function walls(b: any) {
      const s = b.cell ? b.cell.slot : null;
      if (s && b.y > s.t - R) {
        if (b.x < s.l + R + 4) {
          b.x = s.l + R + 4;
          b.vx = Math.abs(b.vx) * 0.3;
        }
        if (b.x > s.r - R - 4) {
          b.x = s.r - R - 4;
          b.vx = -Math.abs(b.vx) * 0.3;
        }
        if (b.y > s.b - R) {
          b.y = s.b - R;
          if (b.vy > 0) {
            hit(b, b.vy, b.x);
            b.vy = -b.vy * bounce(b.vy);
          }
          b.vx *= 0.9;
          b.ground = true;
        }
      }
      const u = b.x - w / 2;
      const f = floorY - DIP * u * u - R;
      if (b.y > f) {
        const nx = 2 * DIP * u;
        const len = Math.hypot(nx, 1);
        const vn = (b.vx * nx + b.vy) / len;
        b.y = f;
        if (vn > 0) {
          const back = vn * (1 + bounce(vn));
          b.vx -= (back * nx) / len;
          b.vy -= back / len;
          hit(b, vn, b.x);
        }
        b.vx *= 0.985;
        b.w = b.vx / R;
        b.ground = true;
      }
      if (b.x < R) {
        b.x = R;
        b.vx = Math.abs(b.vx) * 0.4;
      }
      if (b.x > w - R) {
        b.x = w - R;
        b.vx = -Math.abs(b.vx) * 0.4;
      }
    }

    function pair(a: any, b: any) {
      if (a.wait > 0 || b.wait > 0 || a.out || b.out || a.cell !== b.cell) return;
      if (a.sleep && b.sleep) return;
      const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy, m = 2 * R;
      if (d2 >= m * m || d2 === 0) return;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, over = m - d;
      const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (a.sleep && vn < -260) a.sleep = false;
      if (b.sleep && vn < -260) b.sleep = false;
      const ia = a.sleep ? 0 : 1, ib = b.sleep ? 0 : 1, sum = ia + ib;
      a.x -= (nx * over * ia) / sum;
      a.y -= (ny * over * ia) / sum;
      b.x += (nx * over * ib) / sum;
      b.y += (ny * over * ib) / sum;
      if (vn < 0) {
        const j = (-(1 + bounce(-vn)) * vn) / sum;
        a.vx -= j * nx * ia;
        a.vy -= j * ny * ia;
        b.vx += j * nx * ib;
        b.vy += j * ny * ib;
        const tx = -ny, ty = nx, vt = (b.vx - a.vx) * tx + (b.vy - a.vy) * ty;
        a.vx += tx * vt * 0.1 * ia;
        a.vy += ty * vt * 0.1 * ia;
        b.vx -= tx * vt * 0.1 * ib;
        b.vy -= ty * vt * 0.1 * ib;
        if (-vn > 60) hit(a.sleep ? b : a, -vn * 0.6, (a.x + b.x) / 2);
      }
      if (ny > 0.5) a.ground = true;
      if (ny < -0.5) b.ground = true;
    }

    // Wrong login animation hook: spills password marbles into floor heap
    function spill(i = 1) {
      for (const b of balls) {
        if (b.cell === null || !fields[i].cells.includes(b.cell) || b.out) continue;
        if (still || !gl) {
          b.out = true;
          continue;
        }
        b.cell = null;
        b.sleep = false;
        b.vx = (Math.random() - 0.5) * 160;
        b.vy = -200 - Math.random() * 160;
        b.w = b.vx / R;
      }
      fields[i].n = 0;
      fields[i].chars = '';
      const heap = balls.filter((b) => !b.cell && !b.gone && !b.out);
      heap.slice(0, Math.max(0, heap.length - 20)).forEach((b) => {
        b.gone = true;
      });
      wake();
    }
    triggerSpillRef.current = () => {
      clearBad();
      root.classList.add('mc-bad');
      msg.textContent = 'Admin credential verification failed (Demonstration).';
      inputs[1].value = '';
      spill(1);
      inputs[1].focus();
      fit(1);
    };

    // Right login animation hook: hop marbles, glow trays, open shackle
    function lock() {
      balls
        .filter((b) => b.cell && !b.out)
        .forEach((b, i) => {
          setTimeout(() => {
            b.sleep = false;
            b.vy = still ? 0 : -330;
            b.glow = 1;
            if (i % 4 === 0) chime((i >> 2) % 8);
            wake();
          }, Math.min(i * 18, 700));
        });
      fields.forEach((f) => f.cells.slice(0, f.n).forEach((c) => c.el.classList.add('mc-lit')));
      setTimeout(() => {
        if (root && title && msg) {
          root.classList.add('mc-open');
          title.textContent = 'Terminal Authorized';
          msg.textContent = 'Access granted. Welcome to Aman Computer.';
        }
      }, 560);
    }
    triggerLockRef.current = () => {
      clearBad();
      lock();
    };

    // Developer testing mechanism (only registered in development builds)
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      (window as any).__AMAN_DEV_TEST__ = {
        testWrongSpill: () => triggerSpillRef.current?.(),
        testLockOpen: () => triggerLockRef.current?.(),
      };
      (window as any).__AMAN_TEST_SPILL__ = () => triggerSpillRef.current?.();
      (window as any).__AMAN_TEST_LOCK__ = () => triggerLockRef.current?.();
    }

    // Audio synthesizer
    let ac: AudioContext | null = null;
    let voices = 0;
    let lastTap = 0;
    let hiss: GainNode | null = null;

    function tap(v: number, x: number) {
      if (!ac || ac.state !== 'running' || voices >= 8) return;
      const t = ac.currentTime;
      if (t - lastTap < 0.025) return;
      lastTap = t;
      const pan = Math.max(-1, Math.min(1, (x / w) * 2 - 1)) * 0.6;
      tone(1900 + Math.random() * 500 + v * 0.4, Math.min(0.35, v / 2400), 0.16, pan);
    }

    function chime(i: number) {
      if (!ac || ac.state !== 'running' || voices >= 8) return;
      tone(880 * Math.pow(1.122, i), 0.12, 0.4, i / 5 - 0.5);
    }

    function tone(f: number, amp: number, len: number, pan: number) {
      if (!ac) return;
      voices++;
      const t = ac.currentTime;
      const g = ac.createGain();
      const p = ac.createStereoPanner();
      p.pan.value = pan;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(amp, t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      for (const [mul, lvl] of [[1, 1], [2.76, 0.4]]) {
        const o = ac.createOscillator();
        const og = ac.createGain();
        o.frequency.value = f * mul;
        og.gain.value = lvl;
        o.connect(og).connect(g);
        o.start(t);
        o.stop(t + len + 0.01);
      }
      g.connect(p).connect(ac.destination);
      setTimeout(() => voices--, len * 1000 + 20);
    }

    function rolling(speed: number) {
      if (!hiss || !ac) return;
      hiss.gain.setTargetAtTime(Math.min(0.05, speed / 9000), ac.currentTime, 0.05);
    }

    function sound() {
      if (!SOUND || !window.AudioContext) return;
      if (!ac) {
        ac = new (window.AudioContext || (window as any).webkitAudioContext)();
        const noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const ch = noise.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
        const src = ac.createBufferSource();
        const lp = ac.createBiquadFilter();
        src.buffer = noise;
        src.loop = true;
        lp.type = 'lowpass';
        lp.frequency.value = 700;
        hiss = ac.createGain();
        hiss.gain.value = 0;
        src.connect(lp).connect(hiss).connect(ac.destination);
        src.start();
      }
      if (ac.state === 'suspended') ac.resume();
    }

    root.addEventListener('pointerdown', sound);
    root.addEventListener('keydown', sound);

    // WebGL2 shaders
    const VERT = `#version 300 es
in vec4 a0;
in vec4 a1;
uniform vec2 uView;
uniform int uPass;
out vec2 vP;
out vec4 vI;
const vec2 Q[6] = vec2[6](vec2(-1, -1), vec2(1, -1), vec2(-1, 1), vec2(-1, 1), vec2(1, -1), vec2(1, 1));
void main() {
  vec2 c = Q[gl_VertexID];
  vec2 pos;
  if (uPass == 0) {
    pos = vec2(a0.x, a1.z) + c * vec2(a0.z * 1.35, a0.z * .32);
    vP = c;
  } else {
    float pad = 1. + 2. / a0.z;
    pos = a0.xy + c * a0.z * pad;
    vP = vec2(c.x, -c.y) * pad;
  }
  vI = vec4(a0.w, a1.x, a1.y, a1.w);
  gl_Position = vec4(pos / uView * vec2(2, -2) + vec2(-1, 1), 0, 1);
}`;

    const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uDigits;
uniform vec2 uLight;
uniform highp int uPass;
uniform float uVein;
in vec2 vP;
in vec4 vI;
out vec4 o;
const vec3 ICE = vec3(.66, .84, 1.);
float box(vec3 d, vec2 c, vec2 size, float soft) {
  vec2 a = vec2(atan(d.x, d.z), asin(clamp(d.y, -1., 1.)));
  vec2 q = abs(a - c) - size;
  float dist = length(max(q, 0.)) + min(max(q.x, q.y), 0.);
  return 1. - smoothstep(-soft, soft, dist);
}
vec3 env(vec3 d) {
  vec3 c = mix(vec3(.01, .012, .022), vec3(.05, .07, .115), smoothstep(-.4, .8, d.y));
  vec2 follow = uLight * vec2(.35, .2);
  c += box(d, vec2(-.75, .55) + follow, vec2(.3, .15), .07) * vec3(14.);
  c += box(d, vec2(1.15, .05), vec2(.035, .42), .03) * vec3(5., 5.5, 6.);
  c += box(d, vec2(3.1416, .3), vec2(.9, .28), .3) * ICE * .55;
  c += box(d, vec2(-3.1416, .3), vec2(.9, .28), .3) * ICE * .55;
  return c;
}
float digitAt(vec2 h, float a, float id) {
  if (id < 0.) return 0.;
  float c = cos(a), s = sin(a);
  vec2 u = mat2(c, -s, s, c) * h * 1.1 + .5;
  if (any(lessThan(u, vec2(0))) || any(greaterThan(u, vec2(1)))) return 0.;
  float k = floor(id + .5);
  return texture(uDigits, vec2((mod(k, 16.) + u.x) / 16., (floor(k / 16.) + 1. - u.y) / 5.)).a;
}
float haloAt(vec2 h, float id) {
  if (id < 0.) return 0.;
  vec2 u = clamp(h * .8 + .5, 0., 1.);
  float k = floor(id + .5);
  return texture(uDigits, vec2((mod(k, 16.) + u.x) / 16., (floor(k / 16.) + 1. - u.y) / 5.), 3.5).a;
}
vec3 vein(vec3 p, vec3 d, float len, float seed) {
  vec3 acc = vec3(0);
  for (int i = 0; i < 8; i++) {
    vec3 x = p + d * len * (float(i) + .5) / 8.;
    float th = x.y * 2.6 + seed;
    float dist = abs(dot(x.xz, vec2(cos(th), sin(th))));
    float k = smoothstep(.07, .0, dist) * (1. - smoothstep(.55, .85, length(x)));
    acc += k * mix(vec3(.35, .75, 1.), vec3(.55, .45, 1.), .5 + .5 * sin(th)) * .22;
  }
  return acc;
}
void main() {
  if (uPass == 0) {
    float r = length(vP);
    float shade = (1. - smoothstep(.0, 1., r)) * vI.z;
    float spot = (1. - smoothstep(.0, .4, length(vP * vec2(1.7, 1.)))) * vI.z;
    o = vec4(ICE * spot * (.7 + vI.w), shade * .85);
    return;
  }
  float r2 = dot(vP, vP);
  float aa = fwidth(r2) * 1.5;
  float cover = 1. - smoothstep(1. - aa, 1., r2);
  if (cover <= 0.) discard;
  vec3 n = vec3(vP, sqrt(max(0., 1. - r2)));
  vec3 v = vec3(0, 0, 1);
  float fres = .04 + .96 * pow(1. - n.z, 5.);
  vec3 refl = env(reflect(-v, n));
  vec3 col;
  for (int ch = 0; ch < 3; ch++) {
    float ior = 1.5 + (float(ch) - 1.) * .022;
    vec3 d = refract(-v, n, 1. / ior);
    float len = -2. * dot(n, d);
    vec3 q = n + d * len;
    vec3 e = refract(d, -q, ior);
    if (dot(e, e) < .01) e = reflect(d, -q);
    vec3 core = n + d * (-n.z / d.z);
    vec3 through = env(e) * exp(-len * vec3(.22, .12, .06));
    through += ICE * haloAt(core.xy, vI.y) * .55;
    float dig = digitAt(core.xy, vI.x, vI.y);
    vec3 c = mix(through, vec3(.95, .97, 1.) * (2.6 + vI.w * 1.5), dig * .96);
    if (uVein > .5) c += vein(n, d, len, vI.x * 1.7 + vI.y);
    col[ch] = c[ch];
  }
  col = mix(col, refl, fres) + ICE * vI.w * (.15 + .5 * pow(1. - n.z, 2.));
  col = 1. - exp(-col * 1.15);
  o = vec4(col, 1.) * cover * vI.z;
}`;

    let prog: WebGLProgram | null = null;
    let buf: WebGLBuffer | null = null;
    let data: Float32Array;
    const U: Record<string, WebGLUniformLocation | null> = {};

    function setupGL() {
      if (!gl) return;
      const sh = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog));
      }
      gl.useProgram(prog);
      for (const u of ['uView', 'uPass', 'uLight', 'uVein', 'uDigits']) {
        U[u] = gl.getUniformLocation(prog, u);
      }
      data = new Float32Array(128 * 8);
      buf = gl.createBuffer();
      gl.bindVertexArray(gl.createVertexArray());
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
      for (const [name, at] of [['a0', 0], ['a1', 16]] as const) {
        const l = gl.getAttribLocation(prog, name);
        gl.enableVertexAttribArray(l);
        gl.vertexAttribPointer(l, 4, gl.FLOAT, false, 32, at);
        gl.vertexAttribDivisor(l, 1);
      }

      const t = document.createElement('canvas');
      t.width = 2048;
      t.height = 640;
      const x = t.getContext('2d')!;
      x.fillStyle = '#fff';
      x.font = '800 92px system-ui, sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      for (let i = 0; i < CHARS.length; i++) {
        x.fillText(CHARS[i], (i % 16) * 128 + 64, (i >> 4) * 128 + 70);
      }
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }

    const light = { x: 0, y: 0, tx: 0, ty: 0 };
    const fades = new Float32Array(128);

    function draw() {
      if (!gl || !prog) return;
      let n = 0;
      for (const b of balls) {
        if (b.wait > 0 || b.fade <= 0 || n === 128) continue;
        const s = b.cell && b.y > b.cell.slot.t - R ? b.cell.slot.b : floorY - DIP * Math.pow(b.x - w / 2, 2);
        const air = Math.max(0, s - (b.y + R));
        const o = n * 8;
        data[o] = b.x;
        data[o + 1] = b.y;
        data[o + 2] = R;
        data[o + 3] = b.a;
        data[o + 4] = b.d;
        data[o + 5] = b.fade * Math.max(0, 1 - air / 260);
        data[o + 6] = s - 2;
        data[o + 7] = b.glow;
        fades[n++] = b.fade;
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.uView!, w, h);
      gl.uniform2f(U.uLight!, light.x, light.y);
      gl.uniform1f(U.uVein!, MATERIAL === 'vein' ? 1 : 0);
      gl.uniform1i(U.uDigits!, 0);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, n * 8);
      gl.uniform1i(U.uPass!, 0);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, n);
      for (let i = 0; i < n; i++) data[i * 8 + 5] = fades[i];
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, n * 8);
      gl.uniform1i(U.uPass!, 1);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, n);
    }

    let raf = 0;
    let last = 0;
    let quiet = 0;

    function tick(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      light.x += (light.tx - light.x) * Math.min(1, dt * 6);
      light.y += (light.ty - light.y) * Math.min(1, dt * 6);
      const turn = Math.abs(light.tx - light.x) + Math.abs(light.ty - light.y) > 0.002;
      const moving = step(dt) || turn;
      draw();
      quiet = moving ? 0 : quiet + dt;
      if (quiet < 0.4) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        last = 0;
      }
    }

    function wake() {
      if (gl && !raf) raf = requestAnimationFrame(tick);
    }

    const onPointerMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      light.tx = Math.max(-1, Math.min(1, (e.clientX - r.left - w / 2) / (w / 2)));
      light.ty = Math.max(-1, Math.min(1, -(e.clientY - r.top - h * 0.45) / (h / 2)));
      wake();
    };
    root.addEventListener('pointermove', onPointerMove);

    let busy = false;
    function clearBad() {
      if (root?.classList.contains('mc-bad')) {
        root.classList.remove('mc-bad');
        if (msg) msg.textContent = '';
      }
    }

    function sync(i: number) {
      clearBad();
      if (!gl) return;
      const f = fields[i];
      const v = inputs[i].value.slice(0, f.max);
      let j = 0;
      if (i === 0) {
        while (j < f.n && j < v.length && f.chars[j] === v[j]) j++;
      } else {
        j = Math.min(f.n, v.length);
      }
      while (f.n > j) lift(i);
      fit(i);
      let k = 0;
      while (f.n < v.length) drop(i, v[f.n], k++ * 0.03);
    }

    function lift(i: number) {
      const f = fields[i];
      const c = f.cells[--f.n];
      f.chars = f.chars.slice(0, f.n);
      for (const o of balls) {
        if (o.cell === c) {
          o.sleep = false;
          if (!o.out) {
            o.out = true;
            o.vy = -700;
          }
        }
      }
      wake();
    }

    const inputHandlers: Array<() => void> = [];
    const focusBlurHandlers: Array<() => void> = [];
    inputs.forEach((el, i) => {
      const handler = () => {
        if (!busy) sync(i);
      };
      const fbHandler = () => {
        if (!busy) fit(i);
      };
      inputHandlers.push(handler);
      focusBlurHandlers.push(fbHandler);
      el.addEventListener('input', handler);
      el.addEventListener('change', handler);
      el.addEventListener('focus', fbHandler);
      el.addEventListener('blur', fbHandler);
    });

    const onSubmit = async (e: Event) => {
      e.preventDefault();
      if (busy) return;

      const email = emailIn.value.trim();
      const pass = passIn.value;

      // Basic client-side validation
      if (!/^\S+@\S+\.\S+$/.test(email) || !pass) {
        root.classList.add('mc-bad');
        msg.textContent = 'Please enter a valid admin email address and password.';
        return;
      }

      busy = true;
      btn.disabled = true;
      inputs.forEach((el) => {
        el.readOnly = true;
      });
      setBackendNotice(null);
      msg.textContent = 'Authenticating with Firebase…';

      try {
        if (!isFirebaseConfigured()) {
          setBackendNotice(
            'Firebase Authentication credentials are not configured yet. Please configure VITE_FIREBASE_* variables in your environment (see .env.example).'
          );
          root.classList.add('mc-bad');
          msg.textContent = 'Firebase configuration required. Please set up .env credentials.';
          spill(1);
          return;
        }

        const res = await signInAdmin(email, pass);
        if (res.success && res.isAuthorizedAdmin) {
          clearBad();
          setBackendNotice(null);
          lock();
          msg.textContent = 'Authorization verified. Opening terminal…';
          setTimeout(() => {
            onSuccess?.();
          }, 850);
        } else {
          root.classList.add('mc-bad');
          msg.textContent = res.error || 'Authentication failed. Please verify credentials.';
          setBackendNotice(res.error || null);
          spill(1);
          inputs[1].value = '';
          fit(1);
          inputs[1].focus();
        }
      } catch (err: any) {
        root.classList.add('mc-bad');
        msg.textContent = err?.message || 'Authentication error. Please check network connection.';
        spill(1);
      } finally {
        busy = false;
        btn.disabled = false;
        inputs.forEach((el) => {
          el.readOnly = false;
        });
      }
    };

    form.addEventListener('submit', onSubmit);

    if (gl) {
      if (inputs[0].value) sync(0); else fit(0);
      if (inputs[1].value) sync(1); else fit(1);
    }

    const boxEl = root.querySelector('.mc-box');
    const ro = new ResizeObserver(() => {
      measure();
      if (prog) draw();
    });
    ro.observe(root);
    if (boxEl) ro.observe(boxEl);

    measure();
    if (gl) {
      setupGL();
      draw();
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__AMAN_DEV_TEST__;
        delete (window as any).__AMAN_TEST_SPILL__;
        delete (window as any).__AMAN_TEST_LOCK__;
      }
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerdown', sound);
      root.removeEventListener('keydown', sound);
      inputs.forEach((el, i) => {
        el.removeEventListener('input', inputHandlers[i]);
        el.removeEventListener('change', inputHandlers[i]);
        el.removeEventListener('focus', focusBlurHandlers[i]);
        el.removeEventListener('blur', focusBlurHandlers[i]);
      });
      form.removeEventListener('submit', onSubmit);
      if (ac && ac.state !== 'closed') {
        ac.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="mc-wrapper relative w-full min-h-screen bg-[#0A0E16]">
      {/* Marble Login Container */}
      <div ref={rootRef} className="mc">
        <div className="mc-box">
          {/* Official Brand Emblem */}
          <div className="mb-3 flex flex-col items-center gap-2">
            <img
              src={BRAND_LOGO_MAIN}
              alt="Aman Computer"
              width={88}
              height={88}
              className="w-20 h-20 sm:w-[88px] sm:h-[88px] object-contain rounded-full drop-shadow-[0_6px_22px_rgba(56,189,248,0.28)] select-none"
            />
            <div className="text-[11px] font-mono tracking-widest text-[#A9D6FF] font-bold uppercase px-3 py-1 rounded-full bg-[rgba(169,214,255,0.1)] border border-[rgba(169,214,255,0.2)]">
              AMAN COMPUTER
            </div>
          </div>

          {/* SVG Animated Padlock */}
          <svg className="mc-lock" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <path
              className="mc-shackle"
              d="M11 15V11a6 6 0 0 1 12 0v4"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <rect x="7" y="15" width="20" height="15" rx="4" fill="currentColor" />
          </svg>

          {/* Title and Subtitle */}
          <h1 ref={titleRef} className="mc-title">
            Welcome Back
          </h1>
          <p className="mc-sub">Secure Admin Access</p>

          {/* Form */}
          <form ref={formRef} className="mc-form" noValidate>
            <label className="mc-field">
              <span className="mc-lab">Admin Email Address</span>
              <span className="mc-trough">
                <span className="mc-cells"></span>
                <input
                  ref={emailInputRef}
                  className="mc-in"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  maxLength={128}
                  placeholder=""
                />
              </span>
            </label>

            <label className="mc-field">
              <span className="mc-lab">Admin Password</span>
              <span className="mc-trough">
                <span className="mc-cells"></span>
                <input
                  ref={passInputRef}
                  className="mc-in"
                  type="password"
                  autoComplete="current-password"
                  maxLength={128}
                  placeholder=""
                />
              </span>
            </label>

            <button ref={btnRef} className="mc-btn" type="submit">
              Access Dashboard
            </button>
          </form>

          {/* Dynamic Status / Feedback Message */}
          <p ref={msgRef} className="mc-msg" role="status" aria-live="polite"></p>

          <button
            type="button"
            onClick={async () => {
              const email = emailInputRef.current?.value.trim() || '';
              const res = await sendAdminPasswordReset(email);
              if (msgRef.current) {
                msgRef.current.textContent = res.message;
              }
              if (rootRef.current) {
                rootRef.current.classList.toggle('mc-bad', !res.success);
              }
            }}
            className="mt-1 text-xs text-[#8D98AA] hover:text-[#A9D6FF] underline underline-offset-4 transition-colors"
          >
            Forgot or need to set password? Send reset link
          </button>

          {/* Phase 2 Backend Notice Banner */}
          {backendNotice && (
            <div className="mt-3 p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-[#A9D6FF] max-w-sm text-center leading-relaxed animate-in fade-in">
              <div className="font-semibold flex items-center justify-center gap-1.5 mb-1 text-white">
                <ShieldCheck className="w-4 h-4 text-[#A9D6FF]" />
                <span>Backend Integration Notice</span>
              </div>
              {backendNotice}
            </div>
          )}

          {/* Development-Only Testing Mechanism (Only compiled in DEV mode when explicitly visiting with ?dev=true) */}
          {import.meta.env.DEV && isDevMode && (
            <div className="mt-6 pt-4 border-t border-[rgba(169,214,255,0.15)] w-full max-w-xs space-y-2">
              <div className="text-[10px] font-mono tracking-widest text-[#8D98AA] uppercase text-center font-bold">
                Dev Testing Mode (?dev=true)
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => triggerSpillRef.current?.()}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-[#FF9B93] border border-rose-500/25 transition-colors"
                  title="Test password marbles spilling to floor heap"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Test Wrong Spill</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerLockRef.current?.()}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[#A9D6FF] border border-emerald-500/25 transition-colors"
                  title="Test marble hop, glow trays & shackle unlock"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Lock Open</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer branding */}
          <div className="text-xs text-[#8D98AA] font-mono mt-6">
            Protected Admin Portal · Aman Computer
          </div>
        </div>

        {/* WebGL2 Glass Marble Canvas */}
        <canvas ref={canvasRef} className="mc-glass" aria-hidden="true"></canvas>
      </div>

      {/* Embedded Component CSS */}
      <style>{`
        .mc {
          --bg: #0A0E16;
          --ink: #EAF0F7;
          --mute: #8D98AA;
          --ice: #A9D6FF;
          --err: #FF9B93;
          --ease: cubic-bezier(.23, 1, .32, 1);
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: radial-gradient(70% 55% at 50% 42%, #18233A 0%, #0E1424 55%, var(--bg) 100%);
          color: var(--ink);
          font: 16px/1.5 system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -webkit-text-size-adjust: 100%;
        }
        .mc-glass { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 3; pointer-events: none; }
        .mc-box { position: relative; z-index: 1; box-sizing: border-box; width: min(520px, 100%); padding: 24px; display: grid; justify-items: center; text-align: center; }
        .mc-lock { width: 34px; height: 34px; margin-bottom: 14px; color: var(--mute); transition: color .3s ease; }
        .mc-shackle { transition: transform .5s var(--ease); transform-origin: 23px 15px; }
        .mc-open .mc-lock { color: var(--ice); }
        .mc-open .mc-shackle { transform: translateY(-3px) rotate(24deg); }
        .mc-box h1 { margin: 0; font: 700 32px/1.1 system-ui, sans-serif; letter-spacing: -.025em; }
        .mc-sub { margin: 8px 0 0; max-width: 34ch; color: var(--mute); font-size: 14px; text-wrap: balance; }
        .mc-form { width: min(380px, 100%); display: grid; gap: 18px; margin-top: 24px; text-align: left; }
        .mc-field { display: grid; gap: 8px; }
        .mc-lab { color: var(--mute); font-size: 13px; font-weight: 500; }
        .mc-trough { display: block; position: relative; }
        .mc-trough:focus-within { outline: 2px solid rgba(169, 214, 255, .6); outline-offset: 6px; border-radius: 14px; }
        .mc-cells { display: flex; flex-wrap: wrap; gap: 8px 4px; min-height: var(--ch, 39px); }
        .mc-cell {
          --hit: 0;
          position: relative; flex: none; width: var(--cw, 36px); height: var(--ch, 39px);
          border-radius: calc(var(--cw, 36px) * .5) calc(var(--cw, 36px) * .5) 10px 10px;
          background: linear-gradient(#04060B, #070A12 70%, #0B1020);
          box-shadow: inset 0 8px 14px rgba(0, 0, 0, .75), inset 0 -1px 0 rgba(169, 214, 255, .16), 0 1px 0 rgba(255, 255, 255, .05);
          transform: translateY(calc(var(--hit) * 1.5px));
          animation: mc-in .25s ease-out;
        }
        @keyframes mc-in { from { opacity: 0; } }
        .mc-cell::before {
          content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          box-shadow: inset 0 -10px 18px -6px var(--ice), inset 0 0 0 1px rgba(169, 214, 255, .5);
          opacity: calc(var(--hit) * .9);
        }
        .mc-cell::after {
          content: ""; position: absolute; left: 22%; right: 22%; bottom: 6px; height: 2px; border-radius: 2px;
          background: var(--ice); opacity: 0; transition: opacity .2s ease;
        }
        .mc-trough:focus-within .mc-cell.mc-next::after { opacity: .8; }
        .mc-cell.mc-lit { background: linear-gradient(#0D1A2E, #132840 70%, #1E3A5C); }
        .mc-cell.mc-lit::before { opacity: .55; animation: mc-breathe 3.6s ease-in-out infinite; }
        @keyframes mc-breathe { 50% { opacity: .3; } }
        .mc-in {
          position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; opacity: 0;
          font-size: 16px; color: transparent; background: none; caret-color: transparent; cursor: text;
        }
        .mc-plain .mc-trough { height: 52px; }
        .mc-plain .mc-cells { display: none; }
        .mc-plain .mc-in { opacity: 1; padding: 0 16px; box-sizing: border-box; color: var(--ink); caret-color: var(--ice); }
        .mc-btn {
          min-height: 48px; border: 0; border-radius: 999px; background: var(--ice); color: #0A0E16;
          font: 600 15px system-ui, sans-serif; cursor: pointer; transition: transform .16s ease-out, opacity .2s ease;
        }
        .mc-btn:active { transform: scale(.97); }
        .mc-btn:disabled { opacity: .5; cursor: default; }
        .mc-btn:focus-visible { outline: 2px solid var(--ice); outline-offset: 3px; }
        .mc-msg { min-height: 24px; margin: 16px 0 0; color: var(--mute); font-size: 14px; }
        .mc-bad .mc-msg { color: var(--err); }
        .mc-open .mc-msg { color: var(--ice); }
        @media (max-width: 480px) {
          .mc-box h1 { font-size: 26px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .mc-cell.mc-lit::before { animation: none; }
        }
      `}</style>
    </div>
  );
};
