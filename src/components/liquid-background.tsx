"use client";

import { useEffect, useRef } from "react";

type LiquidBackgroundProps = {
  intensity?: number;
  className?: string;
};

const vertexShader = `
  attribute vec2 position;

  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;


const fragmentShader = `
  precision highp float;

  uniform vec2 resolution;
  uniform float time;
  uniform float intensity;

  float waveHeight(vec2 p, float t) {
    float h = 0.0;

    h += 0.42 * sin(p.x * 2.8 + p.y * 0.8 + t * 0.38);
    h += 0.28 * sin(p.y * 3.6 - p.x * 1.2 - t * 0.31);
    h += 0.20 * sin((p.x + p.y) * 3.4 + t * 0.26);
    h += 0.14 * sin(length(p * vec2(0.8, 1.2)) * 5.0 - t * 0.42);
    h += 0.10 * sin(p.x * 6.0 - p.y * 3.0 + t * 0.22);

    return h;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 p = (uv - 0.5) *
      vec2(resolution.x / resolution.y, 1.0);

    float t = time;

    // Distort the surface to create organic liquid movement.
    vec2 warp = p;
    warp.x += 0.16 * sin(p.y * 3.2 + t * 0.24);
    warp.y += 0.11 * sin(p.x * 2.7 - t * 0.19);

    warp += 0.045 * vec2(
      sin(p.y * 7.0 + t * 0.2),
      cos(p.x * 6.0 - t * 0.18)
    );

    float h = waveHeight(warp, t);
    float eps = 0.004;

    // Reconstruct the surface normal from height differences.
    float hx1 = waveHeight(warp + vec2(eps, 0.0), t);
    float hx0 = waveHeight(warp - vec2(eps, 0.0), t);
    float hy1 = waveHeight(warp + vec2(0.0, eps), t);
    float hy0 = waveHeight(warp - vec2(0.0, eps), t);

    vec3 normal = normalize(vec3(
      -(hx1 - hx0) / (2.0 * eps) * 0.72,
      -(hy1 - hy0) / (2.0 * eps) * 0.72,
      0.85
    ));

    vec3 viewDir = vec3(0.0, 0.0, 1.0);

    // Moving studio light.
    vec3 lightDir = normalize(vec3(
      sin(t * 0.19) * 0.75 - 0.20,
      0.55 + cos(t * 0.14) * 0.22,
      0.72
    ));

    vec3 halfDir = normalize(lightDir + viewDir);

    float ndl = max(dot(normal, lightDir), 0.0);
    float ndh = max(dot(normal, halfDir), 0.0);

    // Strong, narrow metallic highlights.
    float broadSpecular = pow(ndh, 22.0);
    float sharpSpecular = pow(ndh, 95.0);

    // Long silver ribbons follow the liquid contours.
    float ribbonField =
      warp.x * 3.2
      + h * 5.5
      + sin(warp.y * 3.4 + t * 0.31) * 1.5
      + sin(warp.x * 1.8 - t * 0.17) * 0.7;

    float ribbons = smoothstep(
      0.58,
      0.96,
      sin(ribbonField)
    );

    float fineRibbons = pow(
      max(0.0, sin(ribbonField * 1.65 + h * 2.0)),
      12.0
    );

    // Fresnel gives grazing angles a reflective metallic edge.
    float fresnel = pow(
      1.0 - max(dot(normal, viewDir), 0.0),
      2.2
    );

    float silver = clamp(
      broadSpecular * 0.48
      + sharpSpecular * 0.75
      + ribbons * 0.48
      + fineRibbons * 0.16
      + fresnel * 0.24
      + ndl * 0.045,
      0.0,
      1.0
    );

    // Deep black chrome with cool silver reflections.
    vec3 blackMetal = vec3(0.008, 0.010, 0.014);
    vec3 darkChrome = vec3(0.12, 0.15, 0.20);
    vec3 silverMetal = vec3(0.78, 0.84, 0.94);

    vec3 color = mix(
      blackMetal,
      darkChrome,
      clamp(ribbons * 0.50 + fresnel * 0.22, 0.0, 0.65)
    );

    color = mix(
      color,
      silverMetal,
      clamp(
        broadSpecular * 0.48
        + sharpSpecular * 0.70
        + ribbons * 0.24
        + fineRibbons * 0.10,
        0.0,
        0.92
      )
    );

    // Preserve the underlying interface in low-reflection areas.
    float alpha = intensity * clamp(
      0.025
      + broadSpecular * 0.40
      + sharpSpecular * 0.48
      + ribbons * 0.25
      + fineRibbons * 0.08
      + fresnel * 0.10,
      0.0,
      0.88
    );

    gl_FragColor = vec4(
      color,
      clamp(alpha, 0.0, 0.88)
    );
  }
`;


function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);

  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Liquid shader compilation failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function LiquidBackground({
  intensity = 0.5,
  className = "",
}: LiquidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });

    if (!gl) {
      console.warn("WebGL is unavailable. Using the CSS background instead.");
      return;
    }

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

    if (!vertex || !fragment) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Liquid shader linking failed:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);

    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "resolution");
    const timeLocation = gl.getUniformLocation(program, "time");
    const intensityLocation = gl.getUniformLocation(program, "intensity");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let frameId = 0;
    let startTime = 0;
    let disposed = false;

    function resize() {
      if (!canvas || !gl) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolutionLocation, width, height);
    }

    function draw(now: number) {
        const context = gl;
        if (disposed || !context) return;
  
        if (!startTime) startTime = now;
  
        resize();
  
        const elapsed = reducedMotion.matches
          ? 0
          : (now - startTime) / 1000;
  
        context.clearColor(0, 0, 0, 0);
        context.clear(context.COLOR_BUFFER_BIT);
        context.useProgram(program);
  
        context.uniform1f(timeLocation, elapsed);
        context.uniform1f(
          intensityLocation,
          Math.max(0, Math.min(intensity, 1)),
        );
  
        context.enable(context.BLEND);
        context.blendFunc(
          context.SRC_ALPHA,
          context.ONE_MINUS_SRC_ALPHA,
        );
        context.drawArrays(context.TRIANGLES, 0, 6);
  
        if (!reducedMotion.matches && !document.hidden) {
          frameId = window.requestAnimationFrame(draw);
        }
      }
  
      function handleVisibility() {
        window.cancelAnimationFrame(frameId);
  
        if (!document.hidden && !disposed) {
          frameId = window.requestAnimationFrame(draw);
        }
      }
  
      function handleMotionPreference() {
        window.cancelAnimationFrame(frameId);
  
        if (!disposed) {
          frameId = window.requestAnimationFrame(draw);
        }
      }
  
   
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotion.addEventListener("change", handleMotionPreference);

    frameId = window.requestAnimationFrame(draw);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", handleMotionPreference);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [intensity]);

  return (
    <div
      aria-hidden="true"
      className={`liquid-background pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
      />
    </div>
  );
}
