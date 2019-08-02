/**
 * 模板编译分为三部分
 * 解析器
 * 优化器
 * 代码生成器
 */

 /**
  * 解析器也分为文本解析器，HTML解析器，过滤器
  * 解析器实现的功能是将模板解析成AST(Abstract Syntax Tree)抽象解析树
  */

/**
 * 解析开始标签
 * 循环解析
 */
const ncname = '[a-zA-Z_][\\w\\-\\.]*';
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
const startTagClose = /^\s*(\/?)>/;
//html 变量是HTML模板模板字符串
function advance(n) {
    html = html.substring()
}

function parseStartTag() {
    const start = html.match(startTagOpen);  //判断标签开头 <
    if (start) {
        const match = {
            tagName: start[1],
            attrs: []
        };
    }
    advance(start[0].length);  //将解析完的字符串截取
    //解析标签属性
    let end, attr;
    while (!(end = html.match(startClose)) && (attr = html.match(attribute))) {  //end判断结束标签, 可以是>和自闭合/>, attr提取标签属性, attribute是对应的正则表达式, 好长好长
        advance(attr[0].length);
        match.attrs.push(attr);
    }
    //判断是否是自闭合标签
    if (end) {
        // ["/>", "/", index: 0, input: "/><div></div>", groups: undefined] 自闭合标签
        // [">", "", index: 0, input: "></div>", groups: undefined] 普通开始标签
        match.unarySlash = end[1];
        advance(end[0].length);
        return match;
    }
}
/**
 * 解析出的结果是扁平化的, 没有明确的父子关系
 * 将解析结果取出调用钩子函数 start
 */
const startTagMatch = parseStartTag();
if (startTagMatch) {
    handleStartTag(startTagMatch);  //将tagName, attrs, unary等数据取出并调用start钩子将数据放进参数中, 其中会执行options.start钩子
    continue;  //触发完钩子函数建立部分AST之后，都要继续执行循环，所以存在continue
}
/**
 * 截取结束标签
 * 结束标签没有开始标签那么花里胡哨，只需匹配</tagname>即可
 */
const endTag = new RegExp(`^\\/${qnameCapture}[^>]*>`);
const endTagMatch = html.match(endTag);
if (endTagMatch) {
    advance(endTagMatch[0].length);  //截取结束标签
    options.end(endTagMatch[1]);  //触发end钩子函数
    continue;  //继续执行循环
}
/**
 * 截取注释
 */
const comment = /^<!--/;
if (comment.test(html)) {
    const commentEnd = html.indexOf("-->");
    if (commentEnd > -1) {
        if (options.shouldKeepComment) {
            options.comment(html.substring(4, commentEnd));  //触发comment钩子
        }
        advance(commentEnd + 3);
        continue;
    }
}
/**
 * 截取条件注释<![if !IE]><![endif]>, DOCTYPE
 * 由于这两种情况不触发钩子函数, 所以只从html中调用advance()截取即可
 */

 /**
  * 截取文本
  * 不以 < 开头的就是文本
  */
 while (html) {
     let text, rest, next;
     let textEnd = html.indexOf('<');
     if (textEnd > -1) {
         rest = html.slice(textEnd);
         while (  // 文本中可能存在 1<2这样的字段
             !endTag.test(rest) &&
             !startTagOpen.test(rest) &&
             !comment.test(rest) &&
             !conditionalComment.test(rest)
         ) {
            next = rest.indexOf('<', 1);  //indexOf(searchValue, fromIndex)
            if (next < 0) break;
            textEnd += text;
            rest = html.slice(textEnd);
         }
         text = html.slice(0, textEnd);
         html = html.substring(textEnd);
     }
     //模板中找不到 < 说明整个模板都是文本
     if (textEnd < 0) {
         text = html;
         html = '';
     }
     //触发文本钩子函数
     if (options.chars && text) {
         options.chars(text);
     }
 }
/**
 * 纯文本内容元素处理
 * script, style, textarea三种元素叫做纯文本内容元素
 * 标签包含的所有内容都会当作文本处理
 * 处理逻辑与上述不同
 */
while (html) {
    if (!lastTag || !isPlainTextElement(lastTag)) {
        //父元素为正常元素的处理逻辑
    } else {
        //纯文本元素处理逻辑
        const stackedTag = lastTag.toLowerCase();
        const reStackedTag = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i');  //第一个括号匹配文本, 第二个括号匹配结束父标签
        const rest = html.replace(reStackedTag, function (all, text) {  //param1是匹配的字符串, param2,param3...是括号中匹配的子串
            if (options.chars) {
                options.chars(text);  //将文本内容触发文本钩子函数
            }
            return '';  //将除开始标签外的剩余所有纯文本元素内容清空
        })
        html = rest;
        options.end(stackedTag);
    }
}
/**
 * HTML解析器中维护一个栈结构
 * 每当开始解析开始标签时入栈
 * 每当解析结束标签时出栈
 * 出栈后栈顶的元素即当前元素的父元素
 */

/**
 * HTML解析器是一个函数
 * 接收两个参数
 * html 模板字符串
 * option 钩子函数对象
 */
export function parseHTML(html, options) {
    while (html) {
        //..
    }
}

/**
 * 文本解析器
 * 模板的文本分两种: 带变量的文本和不带变量的文本
 * 文本解析器主要就是处理带变量的文本, 对HTML解析器解析完的文本进行二次加工
 */
parseHTML(html, {
    chars (text) {
        text = text.trim();
        if (text) {
            const children = currentParent.children;  //获取栈顶父元素
            let expression;
            if (expression = parseText(text)) {  //判断是否为带变量文本
                children.push({
                    type: 2,
                    expression,
                    text
                });
            } else {
                children.push({
                    type: 3,
                    text
                });
            }
        }
    }
});

function parseText(text) {
    const tagRE = /\{\{((?:.|\n)+?)\}\}/g;  //匹配变量{{name}}的正则表达式, 带上global标识符会不断更新lastIndex, 不带则永远为0
    if (!tagRE.test(text)) {  //普通文本
        return;
    }
    const tokens = [];
    let lastIndex = tagRE.lastIndex = 0;
    let match, index;
    while ((match = tagRE.exec(text))) {
        index = match.index;  //startIndex;
        if (index > lastIndex) {  //先将变量前的普通文本加入数组
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));  
        }
        tokens.push(JSON.stringify(`_s(${match[1].trim()})`));  //_s()是toString()的别名, 用于之后代码生成器阶段参数数据的双向绑定
        lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {  //全部变量提取完后面还有普通文本直接push到数组
        tokens.push(JSON.stringify(text.slice(lastIndex)));  //这里对含变量文本进行JSON.stringify(), "Hello+_s(name)" => '"Hello+_s(name)"' 
    }
    return tokens.join('+');
}
/**
 * parseText("你好{{name}}")
 * ""你好"+"_s(name)""
 * parseText("你好{{name}}, ni今年已经{{age}}岁啦")
 * ""你好"+"_s(name)"+", ni今年已经"+"_s(age)"+"岁啦""
 */