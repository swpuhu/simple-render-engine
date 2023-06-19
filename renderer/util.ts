import { Node } from './Node';

export function travelNode(node: Node, callback?: (node: Node) => void): void {
    callback && callback(node);
    node.children.forEach(item => travelNode(item, callback));
}
