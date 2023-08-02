import { Renderer } from './Renderer';
import { Scene } from './Scene';
import { Event, TouchEvent } from './Event';
import { postOrderTravelNodes, travelNode } from './util';
import { vec2 } from 'gl-matrix';
import { Node2D } from './Node2D';
import { EventManager } from './EventManager';

export class SimpleEngine {
    private __rfId = -1;
    private __currentScene: Scene | null = null;
    private __renderer: Renderer | null = null;
    private __gl: WebGL2RenderingContext | null = null;
    private __canvasDomWidth = 0;
    private __canvasDomHeight = 0;
    private __eventManager: EventManager;
    private __initialized = false;

    public get canvasDomWidth(): number {
        if (this.__canvasDomWidth === 0) {
            const canvas = this.__gl?.canvas as unknown as HTMLCanvasElement;
            this.__canvasDomWidth = canvas.clientWidth;
        }
        return this.__canvasDomWidth;
    }

    public get canvasDomHeight(): number {
        if (this.__canvasDomHeight === 0) {
            const canvas = this.__gl?.canvas as unknown as HTMLCanvasElement;
            this.__canvasDomHeight = canvas.clientHeight;
        }
        return this.__canvasDomHeight;
    }

    constructor(gl: WebGL2RenderingContext) {
        gl.getExtension('OES_element_index_uint');
        this.mainLoop = this.mainLoop.bind(this);
        this.__renderer = new Renderer(gl);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        this.__gl = gl;

        this.__eventManager = new EventManager(gl.canvas as HTMLCanvasElement);
    }

    private __init(): void {
        if (this.__eventManager) {
            this.__eventManager.init();
        }
        this.__initialized = true;
    }

    setViewSize(width: number, height: number): void {
        const gl = this.__gl;
        if (!gl) {
            return;
        }
        gl.canvas.width = width;
        gl.canvas.height = height;

        gl.viewport(0, 0, width, height);
    }

    createScene(): Scene {
        const scene = new Scene('scene');
        return scene;
    }

    setScene(s: Scene): void {
        this.__currentScene = s;
        if (this.__eventManager) {
            this.__eventManager.setScene(s);
        }
    }

    private __loadScript(): void {
        if (!this.__currentScene) {
            return;
        }

        travelNode(this.__currentScene, node => {
            const scripts = node.$scripts;
            scripts.forEach(script => script.$init());
        });
    }

    run(): void {
        this.__loadScript();
        this.mainLoop(0);
    }

    stop(): void {
        cancelAnimationFrame(this.__rfId);
    }

    private mainLoop(dt: number): void {
        if (!this.__initialized) {
            this.__init();
        }
        if (this.__currentScene && this.__renderer) {
            travelNode(this.__currentScene, node => {
                const scripts = node.$scripts;
                scripts.forEach(script => script.update(dt));
            });
            this.__renderer.render(this.__currentScene);
        }
        this.__rfId = requestAnimationFrame(this.mainLoop);
    }

    public destroy(): void {
        if (!this.__gl) {
            return;
        }
        this.stop();
        if (this.__eventManager) {
            this.__eventManager.destroy();
        }
    }
}
