import { Renderer } from './Renderer';
import { Scene } from './Scene';
import { travelNode } from './util';
import { EventManager } from './EventManager';
import { globalEvent } from './GlobalEvent';
import EventEmitter from 'eventemitter3';

export class SimpleEngine {
    private __rfId = -1;
    private __currentScene: Scene | null = null;
    private __renderer: Renderer | null = null;
    private __gl: WebGL2RenderingContext | null = null;
    private __canvasDomWidth = 0;
    private __canvasDomHeight = 0;
    private __eventManager: EventManager;
    private __initialized = false;

    private __globalEvent = globalEvent;
    private __prevTime = 0;
    private __eventEmitter = new EventEmitter();

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

        this.__eventManager = EventManager.getInstance();
    }

    private __init(): void {
        if (this.__eventManager && this.__gl) {
            this.__eventManager.init(this.__gl.canvas as HTMLCanvasElement);
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

    private mainLoop(time: number): void {
        if (!this.__initialized) {
            this.__init();
        }
        const dt = time - this.__prevTime;
        this.__prevTime = time;
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
        this.__globalEvent.destroy();
    }

    public on(
        event: string,
        fn: (...args: any[]) => void,
        context?: any
    ): void {
        this.__eventEmitter.on(event, fn, context);
    }

    public emit(event: string, ...args: any[]): void {
        this.__eventEmitter.emit(event, args);
    }
}
