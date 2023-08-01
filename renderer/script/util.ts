import { create } from 'lodash';
import { Node } from '../Node';
import { Node2D } from '../Node2D';

export type NodeOptions = {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
};

export type Node2DOptions = {
    anchorX?: number;
    anchorY?: number;
} & NodeOptions;

export type HierarchyTree = {
    name: string;
    options?: Node2DOptions & { ref?: string };
    children?: HierarchyTree[];
};

export function createHierarchyTree(tree: HierarchyTree[]) {
    const result: Record<string, Node2D> = {};
    const help = (tree: HierarchyTree, record: Record<string, Node>) => {
        const root = tree;
        const node = new Node2D(root.name, root.options);
        if (root.options && root.options.ref) {
            record[root.options.ref] = node;
        }
        if (root.children && root.children.length) {
            for (let i = 0; i < root.children.length; i++) {
                const subNode = help(root.children[i], record);
                node.children.push(subNode);
            }
        }
        return node;
    };
    for (let i = 0; i < tree.length; i++) {
        help(tree[i], result);
    }

    return result;
}
