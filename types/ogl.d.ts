declare module "ogl" {
  export class Renderer {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    constructor(options?: {
      canvas?: HTMLCanvasElement;
      width?: number;
      height?: number;
      dpr?: number;
      alpha?: boolean;
      antialias?: boolean;
    });
    setSize(width: number, height: number): void;
    render(options: {
      scene: Transform;
      camera: Camera;
      target?: RenderTarget;
    }): void;
  }

  export class Camera {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    fov: number;
    aspect: number;
    near: number;
    far: number;
    position: Vec3;
    constructor(
      gl: WebGLRenderingContext | WebGL2RenderingContext,
      options?: {
        fov?: number;
        aspect?: number;
        near?: number;
        far?: number;
        left?: number;
        right?: number;
        bottom?: number;
        top?: number;
      }
    );
    perspective(options: { aspect: number }): void;
  }

  export class Transform {
    position: Vec3;
    rotation: Vec3;
    scale: Vec3;
    parent: Transform | null;
    children: Transform[];
    constructor();
    setParent(parent: Transform | null): void;
    traverse(callback: (child: Transform) => void): void;
  }

  export class Mesh extends Transform {
    geometry: any;
    program: Program | null;
    constructor(
      gl: WebGLRenderingContext | WebGL2RenderingContext,
      options?: {
        geometry?: any;
        program?: Program;
      }
    );
  }

  export class Plane extends Transform {
    constructor(
      gl: WebGLRenderingContext | WebGL2RenderingContext,
      options?: {
        width?: number;
        height?: number;
      }
    );
  }

  export class Program {
    uniforms: Record<string, { value: any }>;
    constructor(
      gl: WebGLRenderingContext | WebGL2RenderingContext,
      options: {
        vertex: string;
        fragment: string;
        uniforms?: Record<string, { value: any }>;
        transparent?: boolean;
        cullFace?: boolean;
      }
    );
  }

  export class Texture {
    constructor(
      gl: WebGLRenderingContext | WebGL2RenderingContext,
      options?: {
        image?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
        generateMipmaps?: boolean;
        flipY?: boolean;
        anisotropy?: number;
      }
    );
  }

  export class RenderTarget {
    texture: Texture | null;
    constructor(
      gl: WebGLRenderingContext | WebGL2RenderingContext,
      options?: {
        width?: number;
        height?: number;
      }
    );
    setSize(width: number, height: number): void;
  }

  export class Vec2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    set(x: number, y: number): void;
  }

  export class Vec3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): void;
  }

  export class Raycast {
    castMouse(camera: Camera, mouse: Vec2): void;
    intersectBounds(meshes: Mesh[]): Mesh[];
  }
}
