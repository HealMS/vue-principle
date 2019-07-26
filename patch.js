/**
 * virtualDom中最核心的是patch()函数, 它将vnode渲染成真正的DOM
 * patch比对新旧vnode, 然后将vnode渲染成dom
 */

/** 
 * 新增节点, 首次渲染页面是全都是新增节点
 * 真正能渲染成DOM的只有三种vnode: 注释节点, 文本节点, 元素节点(标签)
 * if (vnode contains "tag" attribution) {
 *      说明是元素节点
 *      document.createElement(tag);
 *      if (has "children") {
 *          recursion;
 *      }
 *      将子节点先全部appendTo父节点
 *      最后将最上层的父节点appendTo页面     
 * } else {  
 *      说明是文本节点或注释节点
 *      if (vnode contains "isComment" attribution) {  //注释节点
 *          document.createComment();
 *      } else {  //文本节点
 *          document.createTextNode();
 *      }
 * }
 */

/** 删除节点 */
function removeVnodes (vnodes, startIdx, endIdx) {
    for (; startIdx<=endIdx; startIdx++) {
        const ch = vnodes[startIdx];
        if (isDef(ch)) {
            removeVnode(ch);
        }
    }
}
const nodeOps = {
    removeChild (node, child) {  //这里对node.removeChild做了一层封装，据说是为了跨平台渲染，咱也不清楚
        node.removeChild(child);
    }
    //...
}
function removeVnode (el) {
    const parent = nodeOps.parentNode(el);
    if (isDef(parent)) {
        nodeOps.removeChild(parent, el);
    }
}

/**
 * 更新节点
 * if (vnode is same as oldVnode) {  //判断新旧vnode是否相等要使用diff算法进行比对
 *      return;
 * } else if (vnode and oldVnode are both static vnode) {  //静态节点如<p>helloworld</p>这样状态的改变与其没有影响
 *      return;
 * } else if (vnode has "text" attribution) {
 *      if (the content of vnode is different from oldVnode) {
 *          replace oldVnode's content with vnode
 *      }
 * } else if (vnode的子节点和oldVnode的子节点都存在) {
 *      if (子节点不相同) {
 *          update; 
 *      }
 * } else if (只有vnode存在子节点) {
 *      if (oldValue有文本) {
 *          清空oldVnode文本
 *      }
 *      将vnode的子节点添加到DOM中
 * } else if (只有oldValue存在子节点) {
 *      清空oldValue子节点
 * } else if (oldValue有文本) {
 *      清空oldValue文本  
 * }
 */