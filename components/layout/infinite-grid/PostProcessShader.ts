import * as THREE from "three";
import { gsap } from "gsap";

// Import shaders as raw strings
import { postProcessVertexShader, postProcessFragmentShader } from "./shaders";

/**
 * @interface CustomPostProcessShaderParameters
 * @description Defines the initial parameters for the CustomPostProcessShader.
 * @property {number} [distortionIntensity] - Initial intensity of the distortion effect. Defaults to 0.
 * @property {number} [vignetteOffset] - Initial offset for the vignette effect (0.0 = center, 1.0 = edges). Defaults to 0.8.
 * @property {number} [vignetteDarkness] - Controls vignette transition smoothness (should be > vignetteOffset). Defaults to 1.0.
 */
interface CustomPostProcessShaderParameters {
  distortionIntensity?: number;
  vignetteOffset?: number;
  vignetteDarkness?: number;
}

/**
 * @class CustomPostProcessShader
 * @description A custom Three.js-based post-processing shader for distortion and vignette effects.
 * It provides animatable properties for these effects via GSAP.
 */
export class CustomPostProcessShader {
  private renderer: THREE.WebGLRenderer;
  private material: THREE.ShaderMaterial | null;
  private mesh: THREE.Mesh | null;
  private scene: THREE.Scene | null;
  private camera: THREE.OrthographicCamera | null;

  /**
   * @private
   * @property {number} _distortionIntensity - Internal property for distortion intensity, animated by GSAP.
   */
  private _distortionIntensity: number = 0;

  /**
   * @private
   * @property {number} _vignetteOffset - Internal property for vignette offset (0.0-1.0 range), animated by GSAP.
   */
  private _vignetteOffset: number = 0.8;

  /**
   * @private
   * @property {number} _vignetteDarkness - Internal property for vignette transition end (should be > _vignetteOffset), animated by GSAP.
   */
  private _vignetteDarkness: number = 1.0;

  /**
   * Creates an instance of CustomPostProcessShader.
   * @param {THREE.WebGLRenderer} renderer - The Three.js WebGL renderer
   * @param {CustomPostProcessShaderParameters} [initialParams={}] - Optional initial parameters for the shader effects.
   */
  constructor(renderer: THREE.WebGLRenderer, initialParams: CustomPostProcessShaderParameters = {}) {
    this.renderer = renderer;

    // Initialize internal properties from constructor parameters
    // Use provided values or defaults that match the desired clear state
    // This prevents blur on remount by starting with correct values
    this._distortionIntensity = initialParams.distortionIntensity ?? -0.05;
    this._vignetteOffset = initialParams.vignetteOffset ?? 0.9;
    this._vignetteDarkness = initialParams.vignetteDarkness ?? 1.2;

    // Create geometry for full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Create shader material
    this.material = new THREE.ShaderMaterial({
      vertexShader: postProcessVertexShader,
      fragmentShader: postProcessFragmentShader,
      uniforms: {
        tDiffuse: { value: null }, // The input texture from the previous pass
        distortion: { value: new THREE.Vector2(0, 0) }, // This will be calculated from _distortionIntensity
        vignetteOffset: { value: this._vignetteOffset },
        vignetteDarkness: { value: this._vignetteDarkness },
      },
    });

    // Create mesh
    this.mesh = new THREE.Mesh(geometry, this.material);

    // Create a scene for the post-processing mesh
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);

    // Create an orthographic camera for post-processing
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
    this.camera.position.set(0, 0, 1);

    // Immediately update uniforms based on initial values
    this.updateUniforms();
  }

  /**
   * @property {number} distortionIntensity - Getter/Setter for the distortion intensity.
   * When set, it updates the shader uniforms.
   */
  get distortionIntensity(): number {
    return this._distortionIntensity;
  }

  set distortionIntensity(value: number) {
    this._distortionIntensity = value;
    this.updateUniforms();
  }

  /**
   * @property {number} vignetteOffset - Getter/Setter for the vignette offset.
   * Controls where the vignette effect starts (0.0 = center, 1.0 = screen edges).
   * When set, it updates the shader uniforms.
   */
  get vignetteOffset(): number {
    return this._vignetteOffset;
  }

  set vignetteOffset(value: number) {
    this._vignetteOffset = value;
    this.updateUniforms();
  }

  /**
   * @property {number} vignetteDarkness - Getter/Setter for the vignette transition end.
   * Controls where the vignette reaches maximum darkness (should be > vignetteOffset for smooth transition).
   * When set, it updates the shader uniforms.
   */
  get vignetteDarkness(): number {
    return this._vignetteDarkness;
  }

  set vignetteDarkness(value: number) {
    this._vignetteDarkness = value;
    this.updateUniforms();
  }

  /**
   * @method updateUniforms
   * @description Updates all relevant uniforms of the shader material based on the current
   * internal `_distortionIntensity`, `_vignetteOffset`, and `_vignetteDarkness` properties.
   * This method should be called whenever the internal properties change to reflect
   * the changes in the shader.
   */
  updateUniforms(): void {
    if (!this.material) return;

    // Calculate distortion uniform based on current distortionIntensity and aspect ratio.
    // We'll use the current window aspect ratio, which is common for full-screen effects.
    const aspectRatio = window.innerWidth / window.innerHeight;
    // The distortion uniform is a vec2. We'll apply the intensity scaled by aspect ratio
    // to the x component and directly to the y component, allowing for non-uniform scaling
    // if the shader utilizes both.
    // Assuming the shader's `distortion.x` is the primary scalar for the effect,
    // and `distortion.y` can be used for secondary axis scaling or ignored.
    if (this.material.uniforms.distortion) {
      (this.material.uniforms.distortion.value as THREE.Vector2).set(
        this._distortionIntensity * aspectRatio,
        this._distortionIntensity,
      );
    }

    if (this.material.uniforms.vignetteOffset) {
      this.material.uniforms.vignetteOffset.value = this._vignetteOffset;
    }
    if (this.material.uniforms.vignetteDarkness) {
      this.material.uniforms.vignetteDarkness.value = this._vignetteDarkness;
    }
  }

  /**
   * @method animate
   * @description Animates the distortion and vignette parameters using GSAP.
   * @param {number} targetDistortion - The target distortion intensity value.
   * @param {number} targetVignetteOffset - The target vignette offset value.
   * @param {number} targetVignetteDarkness - The target vignette darkness value.
   * @param {number} [duration=1] - The duration of the animation in seconds.
   * @param {number} [delay=0] - The delay before the animation starts in seconds.
   * @param {string} [ease='power2.out'] - The GSAP ease function to use for the animation.
   */
  animate(
    targetDistortion: number,
    targetVignetteOffset: number,
    targetVignetteDarkness: number,
    duration: number = 1,
    delay: number = 0,
    ease: string = "power2.out",
  ): void {
    gsap.to(this, {
      distortionIntensity: targetDistortion,
      vignetteOffset: targetVignetteOffset,
      vignetteDarkness: targetVignetteDarkness,
      duration: duration,
      delay: delay,
      ease: ease,
      onUpdate: () => this.updateUniforms(), // Ensure uniforms are updated during animation
    });
  }

  /**
   * @method setInputTexture
   * @description Sets the input texture for post-processing
   * @param {THREE.Texture} texture - The input texture (usually from a RenderTarget)
   */
  setInputTexture(texture: THREE.Texture): void {
    if (!this.material || !this.material.uniforms.tDiffuse) return;
    this.material.uniforms.tDiffuse.value = texture;
  }

  /**
   * @method render
   * @description Renders the post-processing effect to the specified target or screen
   * @param {THREE.WebGLRenderTarget | null} target - The render target (null for screen)
   */
  render(target: THREE.WebGLRenderTarget | null = null): void {
    if (!this.scene || !this.camera) return;

    // Use Three.js renderer to render the post-processing scene
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * @method resize
   * @description Updates uniforms when the canvas size changes (render target is managed externally)
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width: number, height: number): void {
    // Render target is managed by InfiniteGridClass, just update uniforms if needed
    this.updateUniforms();
  }

  /**
   * @method dispose
   * @description Cleans up WebGL resources
   */
  dispose(): void {
    // Dispose Three.js resources
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material && this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose();
      }
    }
    this.material = null;
    this.mesh = null;
    this.scene = null;
    this.camera = null;
  }
}


