import { Texture } from './Texture';

export class TextureCache {
    private static __caches: Map<string, Texture> = new Map();
    private static __textureSrcMap: Map<Texture, string> = new Map();
    private static __allTextures: Texture[] = [];

    public static setTexture(url: string, tex: Texture): void {
        this.__allTextures.push(tex);
        this.__textureSrcMap.set(tex, url);
        this.__caches.set(url, tex);
    }

    public static async getTexture(url: string): Promise<Texture> {
        let tex = this.__caches.get(url);
        if (tex) {
            return tex;
        }
        tex = new Texture();

        await tex.loadTexture(url);
        return tex;
    }

    public static getUrlByTexture(tex: Texture): string | undefined {
        return this.__textureSrcMap.get(tex);
    }

    public static updateTextureUrl(
        tex: Texture,
        oldUrl: string,
        newUrl: string
    ): void {
        this.__caches.delete(oldUrl);
        this.__caches.set(newUrl, tex);
        this.__textureSrcMap.set(tex, newUrl);
    }

    public static getAllTextures(): Texture[] {
        return this.__allTextures;
    }

    public static removeTexture(tex: Texture) {
        const url = this.__textureSrcMap.get(tex);
        if (url) {
            this.__textureSrcMap.delete(tex);
            this.__caches.delete(url);
            const index = this.__allTextures.indexOf(tex);
            this.__allTextures.splice(index, 1);
        }
    }
}
