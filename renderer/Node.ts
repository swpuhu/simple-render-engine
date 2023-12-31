import { mat4, vec3 } from 'gl-matrix';
import { Mesh } from './Mesh';
import { EventEmitter } from 'eventemitter3';
import { EngineScript } from './script/EngineScript';

export class Node extends EventEmitter {
    protected _children: Node[] = [];
    protected _parent: PossibleNullObject<Node> = null;
    public $scripts: EngineScript[] = [];
    private __destroyed = false;
    protected translate: { x: number; y: number; z: number } = {
        x: 0,
        y: 0,
        z: 0,
    };
    protected _localMat: mat4 = mat4.create();
    protected _worldMat: mat4 = mat4.create();
    protected _tempIdentityMat: mat4 = mat4.create();
    protected _tempWorldInvMat: mat4 = mat4.create();
    protected _mesh: Mesh | null = null;
    protected _tempVec3: vec3 = vec3.create();
    constructor(public name: string) {
        super();
    }

    get children(): Node[] {
        return this._children;
    }

    get parent(): PossibleNullObject<Node> {
        return this._parent;
    }

    get x(): number {
        return this.translate.x;
    }

    set x(v: number) {
        this.translate.x = v;
        this._updateLocalMat();
    }

    get y(): number {
        return this.translate.y;
    }
    set y(v: number) {
        this.translate.y = v;
        this._updateLocalMat();
    }

    get z(): number {
        return this.translate.z;
    }

    set z(v: number) {
        this.translate.z = v;
        this._updateLocalMat();
    }

    get mesh(): Mesh | null {
        return this._mesh;
    }

    public setParent(parent: Node): void {
        this._parent = parent;
        parent._children.push(this);
        this._updateWorldMat();
    }

    public addChildren(...nodes: Node[]): void {
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].setParent(this);
        }
    }

    public getWorldMat(): mat4 {
        return this._worldMat;
    }

    protected _updateLocalMat(): void {
        this._localMat = mat4.translate(this._localMat, this._tempIdentityMat, [
            this.translate.x,
            this.translate.y,
            this.translate.z,
        ]);
        this._updateWorldMat();
    }

    protected _updateWorldMat(): void {
        if (!this.parent) {
            mat4.copy(this._worldMat, this._localMat);
            return;
        }
        const parentWorldMat = this.parent.getWorldMat();
        this._worldMat = mat4.mul(
            this._worldMat,
            parentWorldMat,
            this._localMat
        );
        for (let i = 0; i < this._children.length; i++) {
            this._children[i]._updateWorldMat();
        }
    }

    public setMesh(mesh: Mesh): void {
        this._mesh = mesh;
    }

    public convertToWorldSpace(localPos: vec3): vec3 {
        const worldMat = this.getWorldMat();
        const worldVec = vec3.create();
        vec3.transformMat4(worldVec, localPos, worldMat);
        return worldVec;
    }

    public convertToNodeSpace(worldPos: vec3): vec3 {
        const worldMat = this.getWorldMat();
        mat4.invert(this._tempWorldInvMat, worldMat);
        const localPos = vec3.create();
        vec3.transformMat4(localPos, worldPos, this._tempWorldInvMat);
        return localPos;
    }

    public addScript<T extends EngineScript>(
        scriptCtor: new (node: Node) => T
    ): T {
        const s = new scriptCtor(this);
        this.$scripts.push(s);
        s.load();
        return s;
    }

    public removeScript(script: new () => EngineScript) {
        const needRemove: EngineScript[] = [];
        const newScripts: EngineScript[] = [];
        for (let i = 0; i < this.$scripts.length; i++) {
            if (script instanceof EngineScript) {
                needRemove.push(this.$scripts[i]);
            } else {
                newScripts.push(this.$scripts[i]);
            }
        }
        needRemove.forEach(item => item.destroy());
        this.$scripts = newScripts;
    }

    public getScript<T extends EngineScript>(
        scriptCtor: new (node: Node) => T
    ): T | null {
        let script: T | null = null;
        for (let i = 0; i < this.$scripts.length; i++) {
            if (this.$scripts[i] instanceof scriptCtor) {
                script = this.$scripts[i] as T;
                break;
            }
        }
        return script;
    }

    public removeAllScript() {
        this.$scripts.forEach(script => {
            script.destroy();
        });
        this.$scripts.length = 0;
    }

    public destroy(): void {
        if (this.__destroyed) {
            return;
        }
        this._mesh?.destroy();
        this.$scripts.forEach(script => script.destroy());
        this.children.forEach(child => child.destroy());
        this.__destroyed = true;
    }
}
