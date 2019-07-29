/**
 * 代码生成器将AST转化为渲染函数_render()中的内容，成为代码字符串
 * 渲染函数执行后可以生成一份VNode, 虚拟DOM会根据VNode生成真正的DOM元素渲染视图
 * 代码字符串中含有三种函数
 * _c   createElement    元素节点
 * _v   createTextVNode  文本节点
 * _e   createEmptyVNode 注释节点
 * 元素节点_c(tagname: 标签名称, data: 属性对象, children: 子节点数组)可传入三个参数
 */

//将AST转化为代码字符串
function genElement(el, state) {
    //获取元素节点的属性对象字符串
    const data = el.plain ? undefined : genData(el, state);  //el.plain是编译时产生的, 为true说明el没有属性
    //获取元素节点中的children子节点数组
    const children = genChildren(el, state);
    code = `_c(${el.tag}, ${data ? data : ''}, ${children ? children : ''})`;
    return code;
}
function genChildren(el, state) {
    const children = el.children;
    if (children.length) {
        return `[${children.map(c => genNode(c, state)).join(',')}]`;  //这里进行递归操作将AST全部转化为代码字符串
    }
}
function genNode(node, state) {
    if (node.type === 1) {  //元素节点
        return genElement(node, state);
    } else if (node.type === 3 && node.isComment) {  //注释节点
        return genComment(node);
    } else {  //文本节点, 分为type=2的含变量文本和type=3的普通文本
        return genText(node);
    }
}
//返回_v
function genText(text) {
    return `_v(${text.type === 2 ?
        text.expression :
        JSON.stringify(text.text)
    })`;
}
//返回_e
function genComment(comment) {
    return `_e(${JSON.stringify(comment)})`;
}
/**
 * 以上步骤将AST转化为代码字符串后, 会将字符串拼在with(this)中返回给调用者
 */