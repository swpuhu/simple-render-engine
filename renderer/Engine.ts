import { Renderer } from './Renderer';
import { Scene } from './Scene';
import { SizeInterface, travelNode } from './util';
import { EventManager } from './EventManager';
import { BEFORE_DRAW_CALL, globalEvent } from './GlobalEvent';
import EventEmitter from 'eventemitter3';
import { View } from './View';

type EngineOptionType = {
    frameRate?: number;
    designedSize?: SizeInterface;
};

const BEFORE_RUN = 'before_run';
const UPDATE_DRAW_CALL = 'update_draw_call';
export class SimpleEngine {
    static BEFORE_RUN: typeof BEFORE_RUN = BEFORE_RUN;
    static UPDATE_DRAW_CALL: typeof UPDATE_DRAW_CALL = UPDATE_DRAW_CALL;
    private __rfId = -1;
    private __currentScene: Scene | null = null;
    private __renderer: Renderer | null = null;
    private __gl: WebGL2RenderingContext | null = null;
    private __canvasDomWidth = 0;
    private __canvasDomHeight = 0;
    private __eventManager: EventManager;
    private __initialized = false;
    private __frameRate: 'auto' | number = 'auto';
    private __view: View = View.getInstance();

    private __globalEvent = globalEvent;
    private __prevTime = 0;
    private __eventEmitter = new EventEmitter();
    private __drawCallCount = 0;
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

    constructor(gl: WebGL2RenderingContext, options?: EngineOptionType) {
        gl.getExtension('OES_element_index_uint');

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        this.__gl = gl;

        this.__view.setDesignedSize({
            width: this.__gl.canvas.width,
            height: this.__gl.canvas.height,
        });
        if (options) {
            this.__frameRate = options.frameRate || 'auto';

            if (options.designedSize) {
                this.__view.setDesignedSize(options.designedSize);
            }
        }
        this.__eventManager = EventManager.getInstance();
        this.mainLoop = this.mainLoop.bind(this);
        this.__renderer = new Renderer(gl, this.__view.getDesignedSize());
    }

    private __init(): void {
        if (this.__eventManager && this.__gl) {
            this.__eventManager.init(this.__gl.canvas as HTMLCanvasElement);
        }
        this.__globalEvent.on(BEFORE_DRAW_CALL, () => {
            this.__drawCallCount++;
            this.emit(UPDATE_DRAW_CALL, this.__drawCallCount);
        });
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
            return true;
        });
    }

    run(): void {
        this.__loadScript();
        this.__prevTime = Date.now();
        this.mainLoop();
    }

    stop(): void {
        cancelAnimationFrame(this.__rfId);
        clearTimeout(this.__rfId);
    }

    private mainLoop(): void {
        if (!this.__initialized) {
            this.__init();
        }
        const time = Date.now();
        const dt = time - this.__prevTime;
        this.__prevTime = time;
        this.__drawCallCount = 0;
        const frameRate = dt === 0 ? dt : Math.round(100000 / dt) / 100;
        this.emit(SimpleEngine.BEFORE_RUN, frameRate);
        if (this.__currentScene && this.__renderer) {
            travelNode(this.__currentScene, node => {
                const scripts = node.$scripts;
                scripts.forEach(script => script.update(dt));
                return true;
            });
            this.__renderer.render(this.__currentScene);
        }
        if (this.__frameRate === 'auto') {
            this.__rfId = requestAnimationFrame(this.mainLoop);
        } else {
            // @ts-ignore
            this.__rfId = setTimeout(this.mainLoop, 1000 / this.__frameRate);
        }
    }

    public destroy(): void {
        if (!this.__gl) {
            return;
        }
        this.stop();
        this.__eventEmitter.removeAllListeners();
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
        this.__eventEmitter.emit(event, ...args);
    }
}
