 /**
  * 优化器
  * 作用是找出静态节点和静态根节点并打上标记
  * 静态根节点即子元素全是静态节点的节点
  */
 //AST中的表示形式, 多出了staticRoot和static
const staticNode = {
type: 1,
tag: 'p',
staticRoot: false,
static: true
};
/**
 * 源码实现
 * optimize 优化
 */
export function optimize(root) {
    if (!root) return;
    markStatic(root);
    markStaticRoot(root);
}
//标记静态节点
function markStatic(node) {
    node.static = isStatic(node);
    if (node.type === 1) {
        for (let i=0, l=node.children.length; i<l; i++) {
            const child = node.children[i];
            markStatic(child);
            //递归是自顶向下的，所以判断完子元素还要重新判断父元素, 静态节点需要子元素全是静态节点
            if (!child.static) {
                node.static = false;
            }
        }
    }
}
function isStatic(node) {
    if (node.type === 2) {  //带变量的文本节点
        return false;
    }
    if (node.type === 3) {
        return true;
    }
    return !!(node.pre || (
        !node.hasBindings &&  //没有动态绑定v-bind, v-on
        !node.if && !node.for &&  //没有v-if或v-for或v-else
        !isBuiltInTag(node.tag) &&  //不是内置标签<slot> <component>
        !isPlatformReservedTag(node) &&  //不是组件
        !isDirectChildOfTemplateFor(node) &&  //父元素没有v-for
        Object.keys(node).every(isStaticKey)  //不存在动态节点才有的属性
    ));
}

/**
 * 标记完静态节点后标记静态根节点
 * 静态根节点只需判断当前节点是否为静态节点, 是则不再往下递归
 * 因为已经判断过静态节点, 所以没有判断的必要
 */
function markStaticRoot(node) {
    if (node.type === 1) {
        /**
         * 下面的判断是为了判断父节点是否只含有普通文本节点
         * 如<p>我是静态节点, 我不需要发生变化</p>
         * 这类节点即便是静态根节点也不会被标记
         * 因为其优化成本大于收益
         */
        if (node.static && node.children.length && !(
            node.children.length === 1 &&  //只含有普通文本节点
            node.children[0].type === 3  //普通文本节点
        )) {
            node.staticRoot = true;
            return;  //当前节点判定为静态根节点后不向下判断
        } else {
            node.staticRoot = false;
        }
        if (node.children) {
            for (let i=0, l=node.children.length; i<l; i++) {
                markStaticRoot(node.children[i]);
            }
        }
    }
}