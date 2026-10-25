
"use client";

import { useEffect, useRef } from "react";

type LiquidProductImageProps = {
  src: string;
  alt: string;
  className?: string;
};

const vertexShader = `
  attribute vec2 position;
  varying vec2 vUv;

  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D imageTexture;
  uniform vec2 resolution;
  uniform vec2 imageResolution;
  uniform float time;
  uniform float hover;

  void main() {
    vec2 uv = vUv;

    float screenAspect = resolution.x / resolution.y;
    float imageAspect = imageResolution.x / imageResolution.y;

    // Cover crop, equivalent to object-fit: cover.
    if (imageAspect > screenAspect) {
      uv.x = (uv.x - 0.5) * screenAspect / imageAspect + 0.5;
    } else {
      uv.y = (uv.y - 0.5) * imageAspect / screenAspect + 0.5;
    }

    float t = time;
    float strength = 0.004 + hover * 0.014;

    float wave1 = sin(uv.y * 12.0 + t * 0.65);
    float wave2 = sin(uv.x * 9.0 - t * 0.45);
    float wave3 = sin((uv.x + uv.y) * 16.0 + t * 0.35);

    vec2 distortion = vec2(
      wave1 * 0.65 + wave3 * 0.35,
      wave2 * 0.65 + wave3 * 0.35
    );

    vec2 warpedUv = uv + distortion * strength;

    vec4 tex = texture2D(imageTexture, warpedUv);

    // Estimate the local surface slope for metallic lighting.
    float eps = 0.003;

    float h = sin(
      uv.x * 7.0 + sin(uv.y * 8.0 + t * 0.4) * 1.5
    );

    float hx = sin(
      (uv.x + eps) * 7.0 +
      sin(uv.y * 8.0 + t * 0.4) * 1.5
    );

    float hy = sin(
      uv.x * 7.0 +
      sin((uv.y + eps) * 8.0 + t * 0.4) * 1.5
    );

    vec3 normal = normalize(vec3(
      -(hx - h) / eps * 0.04,
      -(hy - h) / eps * 0.04,
      1.0
    ));

    vec3 lightDir = normalize(vec3(
      sin(t * 0.25) * 0.55,
      0.55,
      0.85
    ));

    float diffuse = max(dot(normal, lightDir), 0.0);

    float specular = pow(
      max(
        dot(
          normal,
          normalize(lightDir + vec3(0.0, 0.0, 1.0))
        ),
        0.0
      ),
      42.0
    );

    // Flowing silver ribbon, stronger on hover.
    float ribbonWave =
      uv.y * 1.9 +
      sin(uv.x * 5.0 + t * 0.45) * 0.12 +
      t * 0.08;

    float ribbon = exp(
      -pow((ribbonWave - 0.52) * 18.0, 2.0)
    );

    float gloss =
      specular * 0.12 +
      ribbon * (0.035 + hover * 0.16);

    vec3 color = tex.rgb * (0.94 + diffuse * 0.06);
    color += vec3(0.72, 0.78, 0.88) * gloss;

    gl_FragColor = vec4(color, tex.a);
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
    console.error(
      "Liquid product shader compilation failed:",
      gl.getShaderInfoLog(shader),
    );

    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function LiquidProductImage({
  src,
  alt,
  className = "",
}: LiquidProductImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef(0);

  useEffect(() => {
    const canvasElement = canvasRef.current;
  
    if (canvasElement === null || !src) {
      return;
    }
  
    const canvas: HTMLCanvasElement = canvasElement;
  
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
  
    if (gl === null) return;
  
    // Lanjutkan seluruh kode WebGL yang sudah ada di sini.

    if (!gl) {
      console.warn("WebGL is unavailable for this product image.");
      return;
    }

    // Stable, non-null WebGL context for nested callbacks.
    const context: WebGLRenderingContext = gl;

    const vertex = compileShader(
      context,
      context.VERTEX_SHADER,
      vertexShader,
    );

    const fragment = compileShader(
      context,
      context.FRAGMENT_SHADER,
      fragmentShader,
    );

    if (!vertex || !fragment) {
      if (vertex) context.deleteShader(vertex);
      if (fragment) context.deleteShader(fragment);
      return;
    }

    const program = context.createProgram();

    if (!program) {
      context.deleteShader(vertex);
      context.deleteShader(fragment);
      return;
    }

    context.attachShader(program, vertex);
    context.attachShader(program, fragment);
    context.linkProgram(program);

    if (!context.getProgramParameter(program, context.LINK_STATUS)) {
      console.error(
        "Liquid product shader linking failed:",
        context.getProgramInfoLog(program),
      );

      context.deleteProgram(program);
      context.deleteShader(vertex);
      context.deleteShader(fragment);
      return;
    }

    const buffer = context.createBuffer();
    const texture = context.createTexture();

    if (!buffer || !texture) {
      if (buffer) context.deleteBuffer(buffer);
      if (texture) context.deleteTexture(texture);

      context.deleteProgram(program);
      context.deleteShader(vertex);
      context.deleteShader(fragment);
      return;
    }

    context.bindBuffer(context.ARRAY_BUFFER, buffer);

    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      context.STATIC_DRAW,
    );

    context.useProgram(program);

    const position = context.getAttribLocation(program, "position");

    context.enableVertexAttribArray(position);
    context.vertexAttribPointer(
      position,
      2,
      context.FLOAT,
      false,
      0,
      0,
    );

    const resolutionLoc = context.getUniformLocation(
      program,
      "resolution",
    );

    const imageResolutionLoc = context.getUniformLocation(
      program,
      "imageResolution",
    );

    const timeLoc = context.getUniformLocation(program, "time");
    const hoverLoc = context.getUniformLocation(program, "hover");
    const textureLoc = context.getUniformLocation(
      program,
      "imageTexture",
    );

    if (
      !resolutionLoc ||
      !imageResolutionLoc ||
      !timeLoc ||
      !hoverLoc ||
      !textureLoc
    ) {
      context.deleteTexture(texture);
      context.deleteBuffer(buffer);
      context.deleteProgram(program);
      context.deleteShader(vertex);
      context.deleteShader(fragment);
      return;
    }

    context.activeTexture(context.TEXTURE0);
    context.bindTexture(context.TEXTURE_2D, texture);

    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_MIN_FILTER,
      context.LINEAR,
    );

    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_MAG_FILTER,
      context.LINEAR,
    );

    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_WRAP_S,
      context.CLAMP_TO_EDGE,
    );

    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_WRAP_T,
      context.CLAMP_TO_EDGE,
    );

    context.uniform1i(textureLoc, 0);

    let disposed = false;
    let ready = false;
    let frameId = 0;
    let startTime = 0;
    let lastFrame = 0;
    let imageWidth = 1;
    let imageHeight = 1;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  
        const width = Math.max(1, Math.floor(rect.width * dpr));
        const height = Math.max(1, Math.floor(rect.height * dpr));
  
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
  
        context.viewport(0, 0, width, height);
        context.useProgram(program);
        context.uniform2f(resolutionLoc, width, height);
        context.uniform2f(
          imageResolutionLoc,
          imageWidth,
          imageHeight,
        );
      }

    function draw(now: number) {
      if (disposed || !ready || document.hidden) {
        frameId = 0;
        return;
      }

      frameId = 0;

      // Limit rendering to approximately 30 FPS.
      if (now - lastFrame < 30) {
        frameId = window.requestAnimationFrame(draw);
        return;
      }

      lastFrame = now;

      if (!startTime) startTime = now;

      resize();

      const elapsed = reducedMotion.matches
        ? 0
        : (now - startTime) / 1000;

      context.clearColor(0, 0, 0, 0);
      context.clear(context.COLOR_BUFFER_BIT);
      context.useProgram(program);

      context.uniform1f(timeLoc, elapsed);
      context.uniform1f(hoverLoc, hoverRef.current);

      context.drawArrays(context.TRIANGLES, 0, 6);

      frameId = window.requestAnimationFrame(draw);
    }

    function startAnimation() {
      if (!disposed && ready && !document.hidden && !frameId) {
        frameId = window.requestAnimationFrame(draw);
      }
    }

    function onVisibilityChange() {
      if (document.hidden) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else {
        startAnimation();
      }
    }

    image.onload = () => {
      if (disposed) return;

      try {
        context.bindTexture(context.TEXTURE_2D, texture);
        context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 1);

        context.texImage2D(
          context.TEXTURE_2D,
          0,
          context.RGBA,
          context.RGBA,
          context.UNSIGNED_BYTE,
          image,
        );

        imageWidth = image.naturalWidth;
        imageHeight = image.naturalHeight;

        ready = true;
        resize();

        canvas.style.opacity = "1";

        startAnimation();
      } catch (error) {
        console.warn(
          "Liquid image texture unavailable. Keeping the original image.",
          error,
        );
      }
    };

    image.onerror = () => {
      console.warn("Liquid image could not be loaded:", src);
    };

    image.src = src;

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    document.addEventListener(
      "visibilitychange",
      onVisibilityChange,
    );

    return () => {
      disposed = true;

      image.onload = null;
      image.onerror = null;
      image.src = "";

      window.cancelAnimationFrame(frameId);

      resizeObserver.disconnect();

      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange,
      );

      context.deleteTexture(texture);
      context.deleteBuffer(buffer);
      context.deleteProgram(program);
      context.deleteShader(vertex);
      context.deleteShader(fragment);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt}
      className={`liquid-product-canvas pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity: 0 }}
    />
  );
}
