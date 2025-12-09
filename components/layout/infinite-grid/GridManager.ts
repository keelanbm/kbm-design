
/**
 * @fileoverview GridManager - Grid Creation and Management System for InfiniteGrid
 *
 * This module handles all aspects of grid creation, tile management, and texture
 * generation for the infinite grid system. It's responsible for:
 *
 * Key Features:
 * - 3x3 tile group initialization for infinite scrolling
 * - Dynamic tile creation with foreground and background meshes
 * - Texture generation and management for card data
 * - Shader program creation for tile rendering
 * - Tile positioning and indexing systems
 * - Card data to texture mapping
 *
 * Architecture:
 * - Creates 9 tile groups arranged in a 3x3 pattern
 * - Each group contains a configurable grid of individual tiles
 * - Each tile has both foreground (content) and background (blur) layers
 * - Textures are generated dynamically from card data using Canvas 2D API
 * - Programs are created with appropriate shaders for each tile type
 */

import * as THREE from "three";
import { generateForegroundTexture, generateBackgroundTexture } from "./createTexture";
import { gaussianBlurVertexShader, gaussianBlurFragmentShader } from "./shaders";

import type { CardData, TileGroupData, TileUserData, CardTexturePair } from "./types.ts";

/**
 * Interface defining the required properties and methods that the GridManager
 * needs to access from the main InfiniteGrid class
 */
export interface GridManagerHost {
  // Core properties
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene;
  cardData: CardData[];

  // Grid configuration
  GRID_COLS: number;
  GRID_ROWS: number;
  GRID_WIDTH: number;
  GRID_HEIGHT: number;
  TILE_WIDTH: number;
  TILE_HEIGHT: number;
  TILE_SIZE: number; // Backward compatibility
  TILE_SPACE_X: number;
  TILE_SPACE_Y: number;

  // Animation constants
  initialBackgroundOpacity: number;

  // Data structures that will be populated
  tileGroupsData: TileGroupData[];
  groupObjects: THREE.Group[];
  foregroundMeshMap: Map<string, THREE.Mesh>;
  backgroundMeshMap: Map<string, THREE.Mesh>;
  cardTextures: CardTexturePair[];
  staticUniforms: Map<string, any>;
}

/**
 * GridManager handles all grid creation and management functionality
 *
 * This class encapsulates the complex logic of creating and managing
 * the 3x3 infinite grid system including:
 * - Tile group initialization and positioning
 * - Dynamic tile creation with proper materials
 * - Texture generation from card data
 * - Shader program creation and management
 * - Tile indexing and key management
 *
 * The grid system uses a 3x3 pattern of tile groups where each group
 * contains a configurable number of individual tiles. This creates
 * the illusion of infinite content while maintaining performance.
 */
export class GridManager {
  private host: GridManagerHost;
  private isInitialized: boolean = false;

  /**
   * Creates a new GridManager instance
   * @param host - The main grid class that provides required properties and methods
   */
  constructor(host: GridManagerHost) {
    this.host = host;
  }

  /**
   * Initializes the complete grid system
   *
   * This method sets up the entire grid in the correct order:
   * 1. Initialize tile group positions
   * 2. Generate textures for all card data
   * 3. Create all tile meshes with proper materials
   *
   * @returns Promise that resolves when all grid setup is complete
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn("GridManager already initialized");
      return;
    }

    this.initializeTileGroups();
    await this.generateTexturesForCardData();
    this.createTiles();

    this.isInitialized = true;
  }

  /**
   * Initializes the 3x3 grid of tile groups for infinite scrolling
   *
   * Creates 9 tile groups arranged in a 3x3 pattern. Each group contains
   * a grid of tiles. As the user scrolls, groups are repositioned to
   * create the illusion of infinite content.
   */
  private initializeTileGroups(): void {
    this.host.tileGroupsData = [];
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        this.host.tileGroupsData.push({
          basePos: new THREE.Vector3(this.host.GRID_WIDTH * c, this.host.GRID_HEIGHT * r, 0),
          offset: { x: 0, y: 0 },
        });
      }
    }
  }

  /**
   * Creates all tiles for the grid system
   *
   * For each tile group, creates individual tiles with:
   * - Background mesh (for blur effects)
   * - Foreground mesh (for content display)
   * - Proper positioning and parenting
   * - User data for interaction
   */
  private createTiles(): void {
    if (!this.host.renderer) {
      throw new Error("Renderer not available for tile creation");
    }

    this.host.tileGroupsData.forEach((groupData, groupIndex) => {
      const groupObject = new THREE.Group();
      groupObject.position.set(groupData.basePos.x, groupData.basePos.y, groupData.basePos.z);
      this.host.scene.add(groupObject);
      this.host.groupObjects[groupIndex] = groupObject;

      const startX = -((this.host.GRID_COLS - 1) / 2) * this.host.TILE_SPACE_X;
      const startY = ((this.host.GRID_ROWS - 1) / 2) * this.host.TILE_SPACE_Y;

      for (let row = 0; row < this.host.GRID_ROWS; row++) {
        for (let col = 0; col < this.host.GRID_COLS; col++) {
        const x = startX + col * this.host.TILE_SPACE_X;
        const y = startY - row * this.host.TILE_SPACE_Y;

          const tileIndex = row * this.host.GRID_COLS + col;
          const tileKey = this.getTileKey(groupIndex, tileIndex);

          // Create background mesh (for blur effects)
          this.createBackgroundMesh(groupObject, groupIndex, tileIndex, tileKey, x, y);

          // Create foreground mesh (for content display)
          this.createForegroundMesh(groupObject, groupIndex, tileIndex, tileKey, x, y);
        }
      }
    });
  }

  /**
   * Creates a background mesh for blur effects
   */
  private createBackgroundMesh(
    groupObject: THREE.Group,
    groupIndex: number,
    tileIndex: number,
    tileKey: string,
    x: number,
    y: number,
  ): void {
    const backgroundMaterial = this.createBackgroundMaterial(groupIndex, tileIndex);
    const backgroundGeometry = new THREE.PlaneGeometry(
      this.host.TILE_WIDTH,
      this.host.TILE_HEIGHT,
    );
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    backgroundMesh.position.set(x, y, -0.01);
    groupObject.add(backgroundMesh);
    this.host.backgroundMeshMap.set(tileKey, backgroundMesh);
  }

  /**
   * Creates a foreground mesh for content display
   */
  private createForegroundMesh(
    groupObject: THREE.Group,
    groupIndex: number,
    tileIndex: number,
    tileKey: string,
    x: number,
    y: number,
  ): void {
    const foregroundMaterial = this.createForegroundMaterial(groupIndex, tileIndex);
    const foregroundGeometry = new THREE.PlaneGeometry(
      this.host.TILE_WIDTH,
      this.host.TILE_HEIGHT,
    );
    const foregroundMesh = new THREE.Mesh(foregroundGeometry, foregroundMaterial);
    foregroundMesh.position.set(x, y, 0);
    groupObject.add(foregroundMesh);

    // Store user data for interaction
    foregroundMesh.userData = {
      groupIndex,
      tileIndex,
      tileKey,
    } as TileUserData;

    this.host.foregroundMeshMap.set(tileKey, foregroundMesh);
  }

  /**
   * Generates a unique tile key for indexing
   * @param groupIndex - The index of the tile group (0-8)
   * @param tileIndex - The index of the tile within the group
   * @returns A unique string key for the tile
   */
  public getTileKey(groupIndex: number, tileIndex: number): string {
    return `${groupIndex}-${tileIndex}`;
  }

  /**
   * Calculates the card texture index for a given tile
   * @param groupIndex - The index of the tile group
   * @param tileIndex - The index of the tile within the group
   * @returns The index of the card data to use for this tile
   */
  public getCardTextureIndex(groupIndex: number, tileIndex: number): number {
    const tilesPerGroup = this.host.GRID_COLS * this.host.GRID_ROWS;
    return (groupIndex * tilesPerGroup + tileIndex) % this.host.cardData.length;
  }

  /**
   * Gets the foreground texture for a specific tile
   * @param groupIndex - The index of the tile group
   * @param tileIndex - The index of the tile within the group
   * @returns The foreground texture or null if not available
   */
  public getCardForegroundTexture(groupIndex: number, tileIndex: number): THREE.Texture | null {
    if (this.host.cardTextures.length === 0) return null;
    const textureIndex = this.getCardTextureIndex(groupIndex, tileIndex);
    return this.host.cardTextures[textureIndex]?.foreground || null;
  }

  /**
   * Gets the background texture for a specific tile
   * @param groupIndex - The index of the tile group
   * @param tileIndex - The index of the tile within the group
   * @returns The background texture or null if not available
   */
  public getCardBackgroundTexture(groupIndex: number, tileIndex: number): THREE.Texture | null {
    if (this.host.cardTextures.length === 0) return null;
    const textureIndex = this.getCardTextureIndex(groupIndex, tileIndex);
    return this.host.cardTextures[textureIndex]?.background || null;
  }

  /**
   * Creates a shader material for background tiles (with blur effects)
   * @param groupIndex - The index of the tile group
   * @param tileIndex - The index of the tile within the group
   * @returns A configured ShaderMaterial for background rendering
   */
  private createBackgroundMaterial(groupIndex: number, tileIndex: number): THREE.ShaderMaterial {
    if (!this.host.renderer) throw new Error("Renderer not initialized");

    let texture = this.getCardBackgroundTexture(groupIndex, tileIndex);
    
    // Create a fallback texture if none exists
    if (!texture) {
      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 2048;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
    }
    
    const texWidth = 2048; // Updated to match new texture resolution
    const texHeight = 2048; // 1:1 aspect ratio (square)

    const uniforms = {
      map: { value: texture },
      resolution: { value: new THREE.Vector2(texWidth, texHeight) },
      uOpacity: { value: this.host.initialBackgroundOpacity },
    };

    this.host.staticUniforms.set(this.getTileKey(groupIndex, tileIndex), uniforms);

    return new THREE.ShaderMaterial({
      vertexShader: gaussianBlurVertexShader,
      fragmentShader: gaussianBlurFragmentShader,
      uniforms: uniforms,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }

  /**
   * Creates a shader material for foreground tiles (content display)
   * @param groupIndex - The index of the tile group
   * @param tileIndex - The index of the tile within the group
   * @returns A configured ShaderMaterial for foreground rendering
   */
  private createForegroundMaterial(groupIndex: number, tileIndex: number): THREE.ShaderMaterial {
    if (!this.host.renderer) throw new Error("Renderer not initialized");

    let texture = this.getCardForegroundTexture(groupIndex, tileIndex);

    // Create a fallback texture if none exists
    if (!texture) {
      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 2048;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
    }

    // Use the gaussian blur vertex shader (it has the same UV flip we need)
    // and a simple fragment shader for foreground rendering
    const foregroundVertexShader = gaussianBlurVertexShader;
    const foregroundFragmentShader = /* glsl */ `
      precision highp float;
      
      uniform sampler2D map;
      
      varying vec2 vUv;
      
      void main() {
        gl_FragColor = texture2D(map, vUv);
      }
    `;

    return new THREE.ShaderMaterial({
      vertexShader: foregroundVertexShader,
      fragmentShader: foregroundFragmentShader,
      uniforms: {
        map: { value: texture },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
  }

  /**
   * Generates textures for all card data
   *
   * Creates both foreground and background textures for each card
   * using the Canvas 2D API. Textures are cached for efficient reuse.
   *
   * @returns Promise that resolves when all textures are generated
   */
  private async generateTexturesForCardData(): Promise<void> {
    if (!this.host.renderer) throw new Error("Renderer not initialized");

    if (this.host.cardData.length === 0) {
      this.host.cardTextures = [];
      return;
    }

    const texturePromises = this.host.cardData.map(async (card): Promise<CardTexturePair> => {
      const foreground = await generateForegroundTexture(card, this.host.renderer!);
      const background = await generateBackgroundTexture(card, this.host.renderer!);
      return { foreground, background };
    });

    this.host.cardTextures = await Promise.all(texturePromises);
  }

  /**
   * Extracts tile key from a mesh using its userData
   * @param mesh - The mesh to get the tile key from
   * @returns The tile key or empty string if not found
   */
  public getTileKeyFromMesh(mesh: THREE.Mesh): string {
    const userData = mesh.userData as TileUserData;
    return userData?.tileKey || "";
  }

  /**
   * Gets the card data for a specific tile
   * @param groupIndex - The group index of the tile
   * @param tileIndex - The tile index within the group
   * @returns The card data for the tile
   */
  public getCardDataForTile(groupIndex: number, tileIndex: number): CardData {
    const cardIndex = this.getCardTextureIndex(groupIndex, tileIndex);
    return (
      this.host.cardData[cardIndex] || {
        title: "Default Card",
        badge: "",
        description: "No data available",
        tags: [],
        date: new Date().getFullYear().toString(),
      }
    );
  }

  /**
   * Updates card data and regenerates textures
   *
   * This method allows for dynamic content updates by:
   * 1. Updating the card data
   * 2. Regenerating all textures
   * 3. Updating existing tile programs with new textures
   *
   * @param newCardData - The new card data to use
   * @returns Promise that resolves when update is complete
   */
  public async updateCardData(newCardData: CardData[]): Promise<void> {
    this.host.cardData = newCardData;
    await this.generateTexturesForCardData();
    this.updateTileTextures();
  }

  /**
   * Updates all tile textures with newly generated textures
   * This is called after card data changes to refresh the display
   */
  private updateTileTextures(): void {
    this.host.tileGroupsData.forEach((_, groupIndex) => {
      for (let row = 0; row < this.host.GRID_ROWS; row++) {
        for (let col = 0; col < this.host.GRID_COLS; col++) {
          const tileIndex = row * this.host.GRID_COLS + col;
          const tileKey = this.getTileKey(groupIndex, tileIndex);

          // Update foreground mesh texture
          const foregroundMesh = this.host.foregroundMeshMap.get(tileKey);
          if (foregroundMesh) {
            const material = foregroundMesh.material as THREE.ShaderMaterial;
            const newForegroundTexture = this.getCardForegroundTexture(groupIndex, tileIndex);
            if (newForegroundTexture && material.uniforms) {
              material.uniforms.map.value = newForegroundTexture;
            }
          }

          // Update background mesh texture
          const backgroundMesh = this.host.backgroundMeshMap.get(tileKey);
          if (backgroundMesh) {
            const material = backgroundMesh.material as THREE.ShaderMaterial;
            const newBackgroundTexture = this.getCardBackgroundTexture(groupIndex, tileIndex);
            if (newBackgroundTexture && material.uniforms) {
              material.uniforms.map.value = newBackgroundTexture;
            }
          }
        }
      }
    });
  }

  /**
   * Gets all interactive meshes (foreground meshes that can be clicked)
   * @returns Array of foreground meshes
   */
  public getInteractiveMeshes(): THREE.Mesh[] {
    return Array.from(this.host.foregroundMeshMap.values());
  }

  /**
   * Clears all grid data and meshes
   * This is useful for cleanup or reinitialization
   */
  public clear(): void {
    // Clear tile group data
    this.host.tileGroupsData = [];

    // Clear group objects
    this.host.groupObjects.forEach((group) => {
      if (group) {
        this.host.scene.remove(group);
      }
    });
    this.host.groupObjects = [];

    // Clear mesh maps
    this.host.foregroundMeshMap.clear();
    this.host.backgroundMeshMap.clear();

    // Clear uniforms and textures
    this.host.staticUniforms.clear();
    this.host.cardTextures = [];

    this.isInitialized = false;
  }

  /**
   * Gets the initialization status
   */
  public get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Gets statistics about the current grid
   * @returns Object containing grid statistics
   */
  public getGridStats(): {
    totalGroups: number;
    tilesPerGroup: number;
    totalTiles: number;
    totalTextures: number;
    memoryEstimate: string;
  } {
    const tilesPerGroup = this.host.GRID_COLS * this.host.GRID_ROWS;
    const totalTiles = this.host.tileGroupsData.length * tilesPerGroup;
    const totalTextures = this.host.cardTextures.length * 2; // foreground + background

    // Rough memory estimate (2048x2048 RGBA textures - 1:1 square)
    const bytesPerTexture = 2048 * 2048 * 4; // RGBA (square textures)
    const totalMemoryBytes = totalTextures * bytesPerTexture;
    const memoryMB = (totalMemoryBytes / (1024 * 1024)).toFixed(2);

    return {
      totalGroups: this.host.tileGroupsData.length,
      tilesPerGroup,
      totalTiles,
      totalTextures,
      memoryEstimate: `${memoryMB} MB`,
    };
  }
}

