export type Quality = "high" | "medium" | "low";

export interface QualitySettings {
  reflections: boolean;
  bloom: boolean;
  multisampling: number;
  maxDpr: number;
}

export const QUALITY: Record<Quality, QualitySettings> = {
  high: { reflections: true, bloom: true, multisampling: 4, maxDpr: 1.5 },
  medium: { reflections: false, bloom: true, multisampling: 2, maxDpr: 1.25 },
  low: { reflections: false, bloom: false, multisampling: 0, maxDpr: 1 },
};

export function lowerQuality(quality: Quality): Quality {
  return quality === "high" ? "medium" : "low";
}

// Browsers without GPU acceleration fall back to a CPU renderer that can't keep up with the full scene.
export function initialQuality(): Quality {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl!.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|software|basic render/i.test(renderer) ? "low" : "high";
  } catch {
    return "medium";
  }
}
