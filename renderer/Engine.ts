import { Renderer } from './Renderer';
import { Scene } from './Scene';

export class SimpleEngine {
    private __rfId = -1;
    private __currentScene: Scene | null = null;
    private __renderer: Renderer | null = null;
    private __gl: RenderContext | null = null;
    constructor(gl: RenderContext) {
        gl.getExtension('OES_element_index_uint');
        this.mainLoop = this.mainLoop.bind(this);
        this.__renderer = new Renderer(gl);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        this.__gl = gl;
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

    run(): void {
        this.mainLoop();
    }

    private mainLoop(): void {
        if (this.__currentScene && this.__renderer) {
            this.__renderer.render(this.__currentScene);
        }
        this.__rfId = requestAnimationFrame(this.mainLoop);
    }

    stop(): void {
        cancelAnimationFrame(this.__rfId);
    }
}
