/**
 * Vue中通过模板来描述状态和视图之间的关系
 * 虚拟DOM所做的就是将模板编译成渲染函数
 * 然后执行渲染函数生成虚拟Node
 * 然后比对新旧两个Node结果来进行DOM操作更新视图
 */
/**
 * VNode类
 * vnode可以理解成节点描述对象，所有DOM节点的属性都会在vnode上有对应的描述属性
 * 所有的真实节点都是通过对应的vnode创建渲染到页面上的
 */
export default class VNode {
    constructor(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
        this.tag = tag;  //节点名称 element.tagName
        this.data = data;  //节点属性 attr, class, style等
        this.children = children;  //子节点数组
        this.text = text;  //文本节点或注释节点的内容
        this.elm = elm;
        this.ns = undefined;
        this.context = context;  //当前组件的Vue实例
        this.functionalContext = undefined;
        this.functionalOptions = undefined;
        this.functionalScopeId = undefined;
        this.key = data && data.key;
        this.componentOptions = componentOptions;  //组件节点的选项参数, propsData, tag, children等
        this.componentInstance = undefined;  //当前组件的Vue实例, 实际上每个组件就是一个Vue实例
        this.parent = undefined;
        this.raw = false;
        this.isStatic = false;
        this.isRootInsert = false;
        this.isCloned = false;
        this.inOnce = false;
        this.asyncFactory = asyncFactory;
        this.asyncMeta = undefined;
        this.isAsyncPlaceholder = false;
    }
    get child () {
        return this.componentInstance;
    }
}
/** 注释节点 */
export const createEmptyVNode = text => {
    const node = new VNode();
    node.text = text;
    node.isComment = true;
}
/** 文本节点 */
export function createTextVNode(val) {
    return new VNode(undefined, undefined, undefined, String(val));
}
/**
 * 克隆节点
 * 作用是优化静态节点和插槽节点
 * 因为静态节点在首次渲染获取vnode之外后续更新不需要执行渲染函数重新生成vnode
 * 所以直接使用克隆节点的方法将vnode克隆一份，使用克隆节点进行渲染
 */
export function cloneVNode(vnode, deep) {
    const cloned = new VNode(
        vnode.tag,
        vnode.data,
        vnode.children,
        vnode.text,
        vnode.elm,
        vnode.context,
        vnode.componentOptions,
        vnode.asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isCloned = true;  //这里是唯一和被克隆节点不一样的地方，指明是克隆节点
    if (deep && vnode.children) {
        cloned.children = cloneVNodes(vnode.children);  //children数组
    }
    return cloned;
}
/** 元素节点 */
`<p><span>Hello</span><span>Berwin</span></p>`
format = {
    tag: "p",
    data: {},
    context: {},
    children: [VNode, VNode], 
    //...
};
/** 
 * 组件节点
 * 组件模板定义的节点, 不是真实的DOM节点
 * 和元素节点类似, 有两个独有属性componentOptions, componentInstance
*/
`<vueComponentChild></vueComponentChild>`
format = {
    tag: "vue-component-child",
    data: {},
    content: {},
    componentOptions: {},
    componentInstance: {},
    //...
};
/**
 * 函数式组件 
 * 独有属性functionalOptions, functionalContext
*/
