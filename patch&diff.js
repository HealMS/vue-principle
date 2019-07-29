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

 /** 更新子节点 */
 /** 创建子节点
  * 将创建的节点插入真实DOM中，插入的位置是所有 未处理 节点的前面，也就是虚线所指定的位置
  * 不能插入 已处理 的后面
  * 因为比较的是旧的虚拟DOM树，而旧DOM树已处理的后面可能已经存在插入的新节点，所以只能插入未处理的前面
  */
 /** 更新子节点
  * 位置相同，只需执行更新节点操纵即可
  */
 /** 移动子节点
  * 由于循环是以新虚拟DOM表从两边向中间收缩的，所以两边一定是已处理的节点
  * 所以只需把需要移动的旧节点移动到所有未处理节点的最前面
  */
 /** 删除子节点
  * 当newChildren中所有节点都被循环一遍后，也就是循环结束后
  * 如果oldChildren还有剩余没被处理的节点，那么这些节点就需要被删除
  */
 /** 优化策略
  * 新前与旧前
  * 新后与旧后
  * 新后与旧前
  * 新前与旧后
  * 
  * 第一种和第二种情况，位置相同，只需patch比对，然后更新节点即可
  * 第三种情况，如果patch比对相同，将旧前的节点移动到oldChildren所有未处理节点的后面
  * 第四种情况，如果patch比对相同，将旧后的节点移动到oldChildren所有未处理节点的前面
  */