
/**
 * @fileoverview InfiniteGridClass - Three.js Infinite Scrolling Grid System
 *
 * A comprehensive Three.js-based infinite grid system that creates a seamless,
 * scrollable interface for displaying card-based content. The system uses a
 * 3x3 tile group architecture to create the illusion of infinite content while
 * maintaining optimal performance.
 *
 * Key Features:
 * - Infinite scrolling in all directions
 * - Interactive hover effects with background blur
 * - Click events with custom data dispatching
 * - Post-processing visual effects (distortion, vignette)
 * - GSAP-powered smooth animations and inertia
 * - Responsive viewport calculations
 * - Memory-efficient tile repositioning system
 *
 * Architecture Overview:
 * - Uses 9 tile groups arranged in a 3x3 pattern
 * - Each group contains a configurable grid of individual tiles
 * - Groups are repositioned as the user scrolls to maintain infinite effect
 * - Each tile has foreground (content) and background (blur) layers
 * - Textures are generated dynamically from card data using Canvas 2D API
 */

import * as THREE from "three";
import { gsap } from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { CustomPostProcessShader } from "./PostProcessShader";
import { EventHandler, type EventHandlerHost } from "./EventHandler";
import { DisposalManager, type DisposableHost } from "./DisposalManager";
import { GridManager, type GridManagerHost } from "./GridManager";

import type {
  CardData,
  InfiniteGridOptions,
  Position2D,
  ScrollState,
  TileGroupData,
  CardTexturePair,
  Viewport,
} from "./types.ts";

gsap.registerPlugin(InertiaPlugin);

/**
 * InfiniteGridClass - A Three.js-based infinite scrolling grid system
 *
 * This class creates an infinite, scrollable grid of tiles that displays card data.
 * It uses a 3x3 grid system where tiles are repositioned as the user scrolls to
 * create an infinite scrolling effect. Each tile can display custom content
 * with foreground and background textures.
 *
 * Key Features:
 * - Infinite scrolling in all directions using tile repositioning
 * - Interactive hover effects with background blur transitions
 * - Click events with custom event dispatching
 * - Optional post-processing effects (distortion, vignette)
 * - GSAP-powered smooth animations and inertia scrolling
 * - Responsive design with automatic viewport calculations
 *
 * @example
 * ```typescript
 * const grid = new InfiniteGridClass(
 *   containerElement,
 *   cardDataArray,
 *   {
 *     gridCols: 3,
 *     gridRows: 3,
 *     enablePostProcessing: true
 *   }
 * );
 * await grid.init();
 * ```
 */
export class InfiniteGridClass implements EventHandlerHost, DisposableHost, GridManagerHost {
  /**
   * Core Container and Data Properties
   */

  /** The HTML element that contains the Three.js canvas */
  public container: HTMLElement;
  /** Array of card data to be displayed in the grid */
  public cardData: CardData[];
  /** Merged configuration options with defaults applied */
  public options: Required<InfiniteGridOptions>;

  /**
   * Grid Layout Properties (calculated once, read-only)
   */

  /** Gap between tiles in Three.js world units */
  public readonly GRID_GAP: number;
  /** Width of each individual tile in Three.js world units */
  public readonly TILE_WIDTH: number;
  /** Height of each individual tile in Three.js world units */
  public readonly TILE_HEIGHT: number;
  /** Size of each individual tile in Three.js world units (DEPRECATED: kept for backward compatibility) */
  public readonly TILE_SIZE: number;
  /** Total horizontal space occupied by one tile including gap */
  public readonly TILE_SPACE_X: number;
  /** Total vertical space occupied by one tile including gap */
  public readonly TILE_SPACE_Y: number;
  /** Number of columns in each grid section */
  public readonly GRID_COLS: number;
  /** Number of rows in each grid section */
  public readonly GRID_ROWS: number;
  /** Total width of one grid section */
  public readonly GRID_WIDTH: number;
  /** Total height of one grid section */
  public readonly GRID_HEIGHT: number;
  /** Total width of all 3 grid sections (for infinite wrapping) */
  private readonly TOTAL_GRID_WIDTH: number;
  /** Total height of all 3 grid sections (for infinite wrapping) */
  private readonly TOTAL_GRID_HEIGHT: number;

  /**
   * Three.js Core Rendering Objects
   */

  /** Main Three.js scene containing all 3D objects */
  public scene: THREE.Scene;
  /** Perspective camera for viewing the scene */
  public camera: THREE.PerspectiveCamera | null;
  /** WebGL renderer for drawing to the canvas */
  public renderer: THREE.WebGLRenderer | null;
  /** 2D pointer coordinates for interaction */
  public pointer: THREE.Vector2;
  /** Raycast utility for mouse/touch interaction */
  public raycast: THREE.Raycaster;

  /**
   * Post-Processing Objects
   */

  /** Post-processing shader for visual effects (distortion, vignette) */
  public postProcessShader: CustomPostProcessShader | null;
  /** Render target for capturing the scene before post-processing */
  public sceneRenderTarget: THREE.WebGLRenderTarget | null;

  /**
   * Scene Objects and Data Structures
   */

  /** Array of Three.js groups, each containing one 3x3 section of tiles */
  public groupObjects: THREE.Group[];
  /** Map of tile keys to foreground mesh objects (clickable content) */
  public foregroundMeshMap: Map<string, THREE.Mesh>;
  /** Map of tile keys to background mesh objects (blur effect on hover) */
  public backgroundMeshMap: Map<string, THREE.Mesh>;
  /** Generated textures for all cards (foreground + background pairs) */
  public cardTextures: CardTexturePair[];
  /** Static shader uniforms for background materials */
  public staticUniforms: Map<string, any>;

  /**
   * User Interaction State
   */

  /** Key of the currently hovered tile (empty string if none) */
  public currentHoveredTileKey: string;
  /** Whether the user is currently dragging/scrolling */
  public isDown: boolean;
  public isHoveringCanvas: boolean;
  /** Whether the scene has moved significantly during this interaction */
  public hasMovedSignificantly: boolean;
  /** Position where the current drag started */
  public startPosition: Position2D;
  /** Scroll position when the current drag started */
  public scrollPosition: Position2D;
  /** Current scroll state and behavior settings */
  public scroll: ScrollState;
  /** Direction of scroll movement for infinite wrapping logic */
  private direction: Position2D;
  /** GSAP InertiaPlugin tracker for smooth scroll transitions */
  public scrollTracker: any;

  /**
   * Animation Configuration Constants
   */

  /** Duration of hover transition animations in seconds */
  public readonly hoverTransitionDuration: number;
  /** GSAP easing function for hover animations */
  public readonly hoverEase: string;
  /** Initial opacity of background blur effect (0 = transparent) */
  public readonly initialBackgroundOpacity: number;
  /** Target opacity when background is hovered (1 = fully visible) */
  public readonly hoveredBackgroundOpacity: number;
  /** Maximum movement distance in pixels before click is disabled */
  public readonly maxClickMovement: number;

  /**
   * Animation Frame Management
   */

  /** RequestAnimationFrame ID for the main render loop */
  public animationFrameId: number | null;

  /**
   * Tile Group Data Structure
   */

  /** Array containing position data for all 9 tile groups (3x3 infinite grid) */
  public tileGroupsData: TileGroupData[];

  /**
   * Modular System Components
   */

  /** Event handler for managing user interactions */
  public eventHandler?: EventHandler;
  /** Grid manager for handling grid creation and management */
  public gridManager: GridManager;
  /** Disposal manager for resource cleanup */
  private disposalManager: DisposalManager;

  /**
   * Creates a new InfiniteGridClass instance
   *
   * @param containerElement - HTML element that will contain the Three.js canvas
   * @param cardData - Array of card data to display in the grid (defaults to empty array)
   * @param options - Configuration options (merged with defaults)
   *
   * @throws {Error} Throws if containerElement is null or undefined
   *
   * @example
   * ```typescript
   * const container = document.getElementById('grid-container');
   * const cards = [
   *   { title: 'Card 1', badge: 'NEW', description: '...', tags: ['tag1'], date: '2024' },
   *   // ... more cards
   * ];
   * const grid = new InfiniteGridClass(container, cards, {
   *   gridCols: 4,
   *   tileSize: 2.5,
   *   enablePostProcessing: true
   * });
   * ```
   */
  constructor(
    containerElement: HTMLElement,
    cardData: CardData[] = [],
    options: Partial<InfiniteGridOptions> = {},
  ) {
    if (!containerElement) {
      console.error("InfiniteGridClass: Container element is required.");
      throw new Error("Container element is required");
    }

    this.container = containerElement;
    this.cardData = cardData;

    // Merge options with defaults to ensure all properties are defined
    // Calculate square dimensions: 1:1 aspect ratio (width:height)
    const defaultTileWidth = options.tileWidth ?? options.tileSize ?? 4.5;
    const defaultTileHeight = options.tileHeight ?? defaultTileWidth; // 1:1 ratio (square)

    this.options = {
      gridCols: 3,
      gridRows: 3,
      gridGap: 0,
      tileSize: defaultTileWidth, // Keep for backward compatibility
      tileWidth: defaultTileWidth,
      tileHeight: defaultTileHeight,
      baseCameraZ: 10,
      enablePostProcessing: true,
      postProcessParams: {
        distortionIntensity: 0.0,
        vignetteOffset: 1.2, // Set outside screen bounds to disable vignette initially
        vignetteDarkness: 1.5,
        ...options.postProcessParams,
      },
      ...options,
    };

    // Initialize grid properties
    this.GRID_GAP = this.options.gridGap ?? 0;
    this.TILE_WIDTH = this.options.tileWidth ?? this.options.tileSize ?? 4.5;
    this.TILE_HEIGHT = this.options.tileHeight ?? this.TILE_WIDTH; // 1:1 ratio (square)
    this.TILE_SIZE = this.TILE_WIDTH; // Backward compatibility
    this.TILE_SPACE_X = this.TILE_WIDTH + this.GRID_GAP;
    this.TILE_SPACE_Y = this.TILE_HEIGHT + this.GRID_GAP;
    this.GRID_COLS = this.options.gridCols ?? 3;
    this.GRID_ROWS = this.options.gridRows ?? 3;
    this.GRID_WIDTH = this.TILE_SPACE_X * this.GRID_COLS;
    this.GRID_HEIGHT = this.TILE_SPACE_Y * this.GRID_ROWS;
    this.TOTAL_GRID_WIDTH = this.GRID_WIDTH * 3;
    this.TOTAL_GRID_HEIGHT = this.GRID_HEIGHT * 3;

    // Initialize Three.js objects
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.pointer = new THREE.Vector2();
    this.raycast = new THREE.Raycaster();

    // Initialize post-processing
    this.postProcessShader = null;
    this.sceneRenderTarget = null;

    // Initialize maps and arrays
    this.groupObjects = [];
    this.foregroundMeshMap = new Map();
    this.backgroundMeshMap = new Map();
    this.cardTextures = [];
    this.staticUniforms = new Map();

    // Initialize interaction state
    this.currentHoveredTileKey = "";
    this.isDown = false;
    this.isHoveringCanvas = false;
    this.hasMovedSignificantly = false;
    this.startPosition = { x: 0, y: 0 };
    this.scrollPosition = { x: 0, y: 0 };
    this.scroll = {
      scale: 0.012,
      current: { x: 0, y: 0 },
      last: { x: 0, y: 0 },
    };
    this.direction = { x: 0, y: 0 };
    this.scrollTracker = InertiaPlugin.track(this.scroll.current, "x,y")[0];

    // Initialize animation properties
    this.hoverTransitionDuration = 0.6;
    this.hoverEase = "power2.out";
    this.initialBackgroundOpacity = 0.0;
    this.hoveredBackgroundOpacity = 1.0;
    this.maxClickMovement = 5; // pixels

    this.animationFrameId = null;
    this.tileGroupsData = [];

    // Initialize modular components
    this.eventHandler = new EventHandler(this);
    this.gridManager = new GridManager(this);
    this.disposalManager = new DisposalManager(this);

    // Bind remaining methods to maintain proper 'this' context
    this.render = this.render.bind(this);
  }

  /**
   * Initializes the infinite grid system asynchronously
   *
   * This method sets up all necessary components in the correct order:
   * 1. WebGL renderer and camera
   * 2. Tile group positioning structure
   * 3. Texture generation for all card data
   * 4. 3D mesh creation and scene setup
   * 5. Event listeners for interaction
   * 6. Animation systems and render loop
   *
   * @returns Promise that resolves when initialization is complete
   *
   * @example
   * ```typescript
   * const grid = new InfiniteGridClass(container, cardData);
   * await grid.init(); // Wait for all textures to load and scene to be ready
   * // Grid is now interactive and rendering
   * ```
   */
  public async init(): Promise<void> {
    try {
      console.log("InfiniteGridClass: Starting initialization...");
      this.setupRenderer();
      console.log("InfiniteGridClass: Renderer setup complete");
      
      this.setupCamera();
      console.log("InfiniteGridClass: Camera setup complete");
      
      this.setupPostProcessing();
      console.log("InfiniteGridClass: Post-processing setup complete");

      // Set post-process state IMMEDIATELY after creation to prevent blur on remount
      // This ensures the shader is in the correct clear state from the start
      if (this.postProcessShader) {
        this.postProcessShader.distortionIntensity = -0.05; // Subtle curve
        this.postProcessShader.vignetteOffset = 0.9; // Vignette offset
        this.postProcessShader.vignetteDarkness = 1.2; // Vignette darkness
        // Force update uniforms immediately to ensure correct state
        this.postProcessShader.updateUniforms();
      }

      // Initialize grid using the modular system
      console.log("InfiniteGridClass: Initializing grid manager...");
      console.log("InfiniteGridClass: Card data length:", this.cardData.length);
      await this.gridManager.initialize();
      console.log("InfiniteGridClass: Grid manager initialized, foreground meshes:", this.foregroundMeshMap.size, "background meshes:", this.backgroundMeshMap.size);

      // Initialize event handling using the modular system
      if (this.eventHandler) {
        this.eventHandler.initialize();
        console.log("InfiniteGridClass: Event handler initialized");
      }

      this.animateInertiaScroll();

      // Removed intro animation to prevent blurriness issues and keep globe effect static
      /*
      this.animatePostProcessing(
        0.0, // Target distortionIntensity (clear)
        0.8, // Target vignetteOffset (where vignette starts)
        1.2, // Target vignetteDarkness (where vignette reaches max)
        1.5, // Duration
        0.0, // Delay (Removed delay to start immediately)
        "power3.out", // Ease
      );
      */

      this.updatePositions();
      this.render();
      console.log("InfiniteGridClass: Initialization complete, render loop started");
    } catch (error) {
      console.error("InfiniteGridClass: Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Sets up the WebGL renderer with optimal settings
   *
   * Creates a Three.js renderer with antialiasing and transparency,
   * configures it for the container size, and appends the canvas
   * to the DOM.
   */
  private setupRenderer(): void {
    const canvas = this.container.ownerDocument.createElement("canvas");
    
    // Check container size
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    
    console.log("InfiniteGridClass: Setting up renderer with size:", width, height);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });

    // Set size and pixel ratio
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance

    // Set canvas styles
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.position = "fixed"; // Match phantom.land's positioning
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "auto";
    this.container.appendChild(canvas);
    
    // Add enhanced WebGL error handling with better debugging context
    const gl = this.renderer.getContext();
    if (gl) {
      const originalGetError = gl.getError;
      let errorCount = 0;
      const maxDetailedErrors = 50; // Increased limit for better debugging
      const errorTypes = new Map<number, number>(); // Track error frequency by type
      const renderer = this.renderer; // Capture renderer reference for error logging

      gl.getError = function() {
        const error = originalGetError.call(this);
        if (error !== gl.NO_ERROR) {
          // Track error frequency
          errorTypes.set(error, (errorTypes.get(error) || 0) + 1);

          const errorName =
            error === gl.INVALID_ENUM ? "INVALID_ENUM" :
            error === gl.INVALID_VALUE ? "INVALID_VALUE" :
            error === gl.INVALID_OPERATION ? "INVALID_OPERATION" :
            error === gl.INVALID_FRAMEBUFFER_OPERATION ? "INVALID_FRAMEBUFFER_OPERATION" :
            error === gl.OUT_OF_MEMORY ? "OUT_OF_MEMORY" :
            error === gl.CONTEXT_LOST_WEBGL ? "CONTEXT_LOST_WEBGL" :
            `UNKNOWN(${error})`;

          if (errorCount < maxDetailedErrors) {
            errorCount++;
            // Enhanced logging with stack trace and context
            console.error(`WebGL Error [${errorCount}]: ${errorName} (code: ${error})`);
            console.error("Error frequency:", Object.fromEntries(errorTypes));
            console.trace("Stack trace:");

            // Log renderer state for context (renderer.info is available in Three.js)
            if (renderer?.info) {
              console.error("Renderer state:", {
                drawCalls: renderer.info.render.calls,
                triangles: renderer.info.render.triangles,
                textures: renderer.info.memory.textures,
                geometries: renderer.info.memory.geometries
              });
            }
          } else if (errorCount === maxDetailedErrors) {
            errorCount++;
            console.warn(
              `WebGL Error limit reached (${maxDetailedErrors}). Suppressing further detailed logs.`,
              `Total errors by type:`, Object.fromEntries(errorTypes)
            );
          }
        }
        return error;
      };
    }
    
    console.log("InfiniteGridClass: Canvas appended, size:", canvas.width, canvas.height);
  }

  /**
   * Sets up the perspective camera with proper positioning
   *
   * Creates a perspective camera with a 45-degree field of view,
   * positions it at the configured Z distance.
   */
  private setupCamera(): void {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspectRatio = width / height;
    
    console.log("InfiniteGridClass: Setting up camera with aspect:", aspectRatio, "size:", width, height);
    
    this.camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 1000);
    this.camera.position.set(0, 0, this.options.baseCameraZ);
    this.camera.updateProjectionMatrix();
    
    console.log("InfiniteGridClass: Camera setup complete, position:", this.camera.position);
  }

  /**
   * Sets up post-processing effects if enabled
   *
   * Creates a render target for capturing the scene before post-processing
   * and initializes the post-processing shader with configured parameters.
   */
  private setupPostProcessing(): void {
    if (!this.options.enablePostProcessing || !this.renderer) {
      return;
    }

    // Create render target for capturing the scene
    const dpr = window.devicePixelRatio || 1;
    this.sceneRenderTarget = new THREE.WebGLRenderTarget(
      this.container.clientWidth * dpr,
      this.container.clientHeight * dpr,
    );

    // Create post-processing shader with correct initial values to prevent blur on remount
    // Ensure values match what we want (clear state with subtle curve)
    const initialPostProcessParams = {
      distortionIntensity: -0.05, // Subtle curve
      vignetteOffset: 0.9, // Vignette offset
      vignetteDarkness: 1.2, // Vignette darkness
      ...this.options.postProcessParams, // Allow overrides
    };
    this.postProcessShader = new CustomPostProcessShader(
      this.renderer,
      initialPostProcessParams,
    );
  }

  /**
   * Calculates the viewport dimensions in world space
   *
   * Uses the camera's field of view and position to determine how much
   * world space is visible. This is essential for infinite scrolling
   * calculations to know when tile groups need to be repositioned.
   *
   * @returns Viewport object with width and height in world units
   */
  private get viewport(): Viewport {
    if (!this.camera) {
      return { width: 0, height: 0 };
    }
    const fov = this.camera.fov * (Math.PI / 180); // Convert FOV to radians
    const viewHeight = 2 * Math.tan(fov / 2) * this.camera.position.z;
    return { width: viewHeight * this.camera.aspect, height: viewHeight };
  }

  public updatePositions(): void {
    const scrollX = this.scroll.current.x;
    const scrollY = this.scroll.current.y;

    // Update direction based on scroll movement
    if (this.scroll.current.y > this.scroll.last.y) {
      this.direction.y = -1;
    } else if (this.scroll.current.y < this.scroll.last.y) {
      this.direction.y = 1;
    } else {
      this.direction.y = 0;
    }

    if (this.scroll.current.x > this.scroll.last.x) {
      this.direction.x = -1;
    } else if (this.scroll.current.x < this.scroll.last.x) {
      this.direction.x = 1;
    } else {
      this.direction.x = 0;
    }

    this.tileGroupsData.forEach((groupData, i) => {
      const groupObject = this.groupObjects[i];

      if (groupObject) {
        const posX = groupData.basePos.x + scrollX + groupData.offset.x;
        const posY = groupData.basePos.y + scrollY + groupData.offset.y;

        const groupOffX = this.GRID_WIDTH / 2;
        const groupOffY = this.GRID_HEIGHT / 2;
        const viewportOff = {
          x: this.viewport.width / 2,
          y: this.viewport.height / 2,
        };

        // Handle infinite scrolling wrapping
        if (this.direction.x < 0 && posX - groupOffX > viewportOff.x) {
          groupData.offset.x -= this.TOTAL_GRID_WIDTH;
        } else if (this.direction.x > 0 && posX + groupOffX < -viewportOff.x) {
          groupData.offset.x += this.TOTAL_GRID_WIDTH;
        }

        if (this.direction.y < 0 && posY - groupOffY > viewportOff.y) {
          groupData.offset.y -= this.TOTAL_GRID_HEIGHT;
        } else if (this.direction.y > 0 && posY + groupOffY < -viewportOff.y) {
          groupData.offset.y += this.TOTAL_GRID_HEIGHT;
        }

        groupObject.position.x = groupData.basePos.x + scrollX + groupData.offset.x;
        groupObject.position.y = groupData.basePos.y + scrollY + groupData.offset.y;
        groupObject.position.z = groupData.basePos.z;
      }
    });
  }

  public animateInertiaScroll(vx: number | string = "auto", vy: number | string = "auto"): void {
    gsap.to(this.scroll.current, {
      inertia: {
        x: vx,
        y: vy,
        min: 60,
        resistance: 100,
      },
      ease: "power2.out",
      onUpdate: () => this.updatePositions(),
      onComplete: () => {
        this.direction.x = 0;
        this.direction.y = 0;
      },
    });
  }

  /**
   * Gets all interactive meshes for raycasting
   * @returns Array of foreground meshes that can be interacted with
   */
  public getInteractiveMeshes(): THREE.Mesh[] {
    return this.gridManager.getInteractiveMeshes();
  }

  /**
   * Updates mouse/touch coordinates for raycasting
   * @param clientX - X coordinate in client space
   * @param clientY - Y coordinate in client space
   */
  public updatePointerCoordinates(clientX: number, clientY: number): void {
    if (!this.renderer) return;

    // Convert to normalized device coordinates (-1 to 1)
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((clientY - rect.top) / rect.height) * 2 - 1); // Flip Y coordinate

    this.pointer.set(x, y);
  }

  /**
   * Performs raycasting and returns hit results
   * @returns Array of hit meshes ordered by distance
   */
  public performRaycast(): THREE.Intersection[] {
    if (!this.camera || !this.renderer) return [];

    // Update raycast with current camera and mouse position
    this.raycast.setFromCamera(this.pointer, this.camera);

    // Get all interactive meshes
    const meshes = this.getInteractiveMeshes();

    // Perform intersection test
    const hits = this.raycast.intersectObjects(meshes, false);

    return hits;
  }

  /**
   * Extracts tile key from a mesh using its userData
   * @param mesh - The mesh to get the tile key from
   * @returns The tile key or empty string if not found
   */
  public getTileKeyFromMesh(mesh: THREE.Mesh): string {
    return this.gridManager.getTileKeyFromMesh(mesh);
  }

  public fadeInBackground(mesh: THREE.Mesh): void {
    const material = mesh.material as THREE.ShaderMaterial;
    if (material && material.uniforms && material.uniforms.uOpacity) {
      gsap.to(material.uniforms.uOpacity, {
        value: this.hoveredBackgroundOpacity,
        duration: this.hoverTransitionDuration,
        ease: this.hoverEase,
        overwrite: true,
      });
    }
  }

  public fadeOutBackground(mesh: THREE.Mesh): void {
    const material = mesh.material as THREE.ShaderMaterial;
    if (material && material.uniforms && material.uniforms.uOpacity) {
      gsap.to(material.uniforms.uOpacity, {
        value: this.initialBackgroundOpacity,
        duration: this.hoverTransitionDuration,
        ease: this.hoverEase,
        overwrite: true,
      });
    }
  }

  /**
   * Gets the card data for a specific tile
   * @param groupIndex - The group index of the tile
   * @param tileIndex - The tile index within the group
   * @returns The card data for the tile
   */
  public getCardDataForTile(groupIndex: number, tileIndex: number): CardData {
    return this.gridManager.getCardDataForTile(groupIndex, tileIndex);
  }

  private render(): void {
    try {
      this.scroll.last.x = this.scroll.current.x;
      this.scroll.last.y = this.scroll.current.y;
      this.updatePositions();

      if (this.renderer && this.camera) {
        if (this.options.enablePostProcessing && this.postProcessShader && this.sceneRenderTarget) {
          // Render scene to render target first
          this.renderer.setRenderTarget(this.sceneRenderTarget);
          this.renderer.render(this.scene, this.camera);

          // Set the rendered scene as input to post-processing shader
          this.postProcessShader.setInputTexture(this.sceneRenderTarget.texture);

          // Render post-processing effect to screen
          this.renderer.setRenderTarget(null); // null = render to screen
          this.postProcessShader.render(null); // null = render to screen
        } else {
          // Direct render without post-processing
          this.renderer.setRenderTarget(null);
          this.renderer.render(this.scene, this.camera);
        }
      }
    } catch (error) {
      console.error("Error in render loop:", error);
    }

    this.animationFrameId = requestAnimationFrame(this.render);
  }

  /**
   * Animates the post-processing effects
   *
   * @param targetDistortion - Target distortion intensity (0 = no distortion)
   * @param targetVignetteOffset - Target vignette offset (0.0-1.0)
   * @param targetVignetteDarkness - Target vignette darkness (should be > offset)
   * @param duration - Animation duration in seconds
   * @param delay - Animation delay in seconds
   * @param ease - GSAP ease function
   *
   * @example
   * ```typescript
   * // Animate to strong distortion and vignette
   * grid.animatePostProcessing(0.5, 0.6, 0.9, 2.0);
   *
   * // Reset to no effects
   * grid.animatePostProcessing(0, 0.8, 1.0, 1.0);
   * ```
   */
  public animatePostProcessing(
    targetDistortion: number,
    targetVignetteOffset: number,
    targetVignetteDarkness: number,
    duration: number = 1,
    delay: number = 0,
    ease: string = "power2.out",
  ): void {
    if (this.postProcessShader) {
      this.postProcessShader.animate(
        targetDistortion,
        targetVignetteOffset,
        targetVignetteDarkness,
        duration,
        delay,
        ease,
      );
    }
  }

  /**
   * Toggles post-processing on/off for debugging
   * @param enabled - Whether to enable post-processing
   */
  public setPostProcessingEnabled(enabled: boolean): void {
    this.options.enablePostProcessing = enabled;
  }

  /**
   * Gets the current distortion intensity
   */
  public get distortionIntensity(): number {
    return this.postProcessShader?.distortionIntensity ?? 0;
  }

  /**
   * Sets the distortion intensity (0 = no distortion)
   */
  public set distortionIntensity(value: number) {
    if (this.postProcessShader) {
      this.postProcessShader.distortionIntensity = value;
    }
  }

  /**
   * Gets the current vignette offset
   */
  public get vignetteOffset(): number {
    return this.postProcessShader?.vignetteOffset ?? 0.8;
  }

  /**
   * Sets the vignette offset (0.0 = center, 1.0 = edges)
   */
  public set vignetteOffset(value: number) {
    if (this.postProcessShader) {
      this.postProcessShader.vignetteOffset = value;
    }
  }

  /**
   * Gets the current vignette darkness
   */
  public get vignetteDarkness(): number {
    return this.postProcessShader?.vignetteDarkness ?? 1.0;
  }

  /**
   * Sets the vignette darkness (should be > vignetteOffset)
   */
  public set vignetteDarkness(value: number) {
    if (this.postProcessShader) {
      this.postProcessShader.vignetteDarkness = value;
    }
  }

  /**
   * Completely disposes of the infinite grid and cleans up all resources
   *
   * This method now uses the DisposalManager for systematic cleanup to prevent memory leaks.
   * The disposal manager handles:
   * - Cancels the animation frame loop
   * - Removes all event listeners
   * - Disposes all Three.js geometries, materials, and textures
   * - Clears all data structures and maps
   * - Removes the canvas from the DOM
   *
   * Call this method when the grid is no longer needed, such as when
   * navigating away from the page or unmounting the component.
   *
   * @example
   * ```typescript
   * // In a Vue component's onBeforeUnmount or React's useEffect cleanup
   * onBeforeUnmount(() => {
   *   if (gridInstance) {
   *     gridInstance.dispose();
   *     gridInstance = null;
   *   }
   * });
   * ```
   */
  public dispose(): void {
    this.disposalManager.dispose();
  }

  /**
   * Gets the event handler instance for advanced event management
   * @returns The EventHandler instance or undefined if not initialized
   */
  public getEventHandler(): EventHandler | undefined {
    return this.eventHandler;
  }

  /**
   * Gets the grid manager instance for advanced grid management
   * @returns The GridManager instance
   */
  public getGridManager(): GridManager {
    return this.gridManager;
  }

  /**
   * Gets the disposal manager instance for advanced cleanup control
   * @returns The DisposalManager instance
   */
  public getDisposalManager(): DisposalManager {
    return this.disposalManager;
  }

  /**
   * Updates card data and regenerates the grid
   * @param newCardData - The new card data to display
   * @returns Promise that resolves when update is complete
   */
  public async updateCardData(newCardData: CardData[]): Promise<void> {
    this.cardData = newCardData;
    await this.gridManager.updateCardData(newCardData);
  }

  /**
   * Gets statistics about the current grid
   * @returns Object containing grid statistics
   */
  public getGridStats() {
    return this.gridManager.getGridStats();
  }

  /**
   * Validates that all resources have been properly disposed
   * Useful for debugging memory leaks
   * @returns True if disposal was successful, false if issues were found
   */
  public validateDisposal(): boolean {
    return this.disposalManager.validateDisposal();
  }

  /**
   * Performs a partial cleanup that preserves the core structure
   * but clears dynamic content. Useful for reinitialization scenarios.
   */
  public partialCleanup(): void {
    this.disposalManager.partialCleanup();
  }
}

