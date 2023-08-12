import * as _ from 'lodash';
import { Effect } from './Effect';
import { MaterialPropertyType, PipeLineStateType } from './type';
import { BlendFactor } from './Macro';

export class Material {
    constructor(
        public effect: Effect,
        protected properties: MaterialPropertyType[] = []
    ) {}

    public setProperty(name: string, value: any): void {
        const prop = this.properties.find(item => item.name === name);
        if (prop) {
            prop.value = value;
        }
    }

    public setProperties(passIndex = 0): void {
        for (let i = 0; i < this.properties.length; i++) {
            const prop = this.properties[i];
            this.effect.setProperty(prop.name, prop.value, passIndex);
        }
    }

    public setPipelineState(gl: RenderContext, passIndex: number): void {
        this.effect.setPipelineState(gl, passIndex);
    }

    public use(passIndex: number): void {
        this.effect.use(passIndex);
    }

    public destroy(): void {
        this.effect.destroy();
    }
}
