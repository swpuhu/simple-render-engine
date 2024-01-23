import { Renderer } from './Renderer';
import { Scene } from './Scene';
import { TouchEvent } from './Event';
import { postOrderTravelNodes, travelNode } from './util';
import { vec2 } from 'gl-matrix';
import { Node2D } from './Node2D';

export class SimpleEngine {
    private __rfId = -1;
    private __currentScene: Scene | null = null;
    private __renderer: Renderer | null = null;
    private __gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
    private __canvasDomWidth = 0;
    private __canvasDomHeight = 0;

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

    constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
        gl.getExtension('OES_element_index_uint');
        this.mainLoop = this.mainLoop.bind(this);
        this.__renderer = new Renderer(gl);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        this.__gl = gl;

        this.__handleClick = this.__handleClick.bind(this);
        this.__handleEvents();
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
        this.mainLoop();
    }

    stop(): void {
        cancelAnimationFrame(this.__rfId);
    }

    private mainLoop(): void {
        if (this.__currentScene && this.__renderer) {
            this.__renderer.render(this.__currentScene);
        }
        this.__rfId = requestAnimationFrame(this.mainLoop);
    }

    private __handleEvents(): void {
        if (!this.__gl) {
            return;
        }
        const canvas = this.__gl.canvas;
        canvas.addEventListener('click', this.__handleClick as any);
    }

    private __handleClick(e: MouseEvent): void {
        const gl = this.__gl;
        if (!gl) {
            return;
        }
        const canvas = gl.canvas;
        const syntheticEvent = new TouchEvent();
        const x = (e.offsetX / this.canvasDomWidth) * canvas.width;
        const y =
            ((this.canvasDomHeight - e.offsetY) / this.canvasDomHeight) *
            canvas.height;
        syntheticEvent.$setPosition(x, y);
        if (this.__currentScene) {
            let tempVec2 = vec2.create();
            postOrderTravelNodes(this.__currentScene, node => {
                if (node instanceof Node2D) {
                    vec2.set(tempVec2, x, y);
                    const hitted = node.$hitTest(tempVec2);
                    if (hitted) {
                        node.propagateEvent(syntheticEvent);
                    }
                    return hitted && syntheticEvent.allowPropagation;
                }
                return true;
            });
        }
    }

    public destroy(): void {
        if (!this.__gl) {
            return;
        }
        this.stop();
        const canvas = this.__gl.canvas;
        canvas.removeEventListener('click', this.__handleClick as any);
    }
}
