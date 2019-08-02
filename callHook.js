/** 钩子函数 */
export function callHook(vm, hook) {
    const handlers = vm.$options[hook];  //钩子函数数组
    if (handlers) {
        for (let i=0; i<handlers.length; i++) {
            try {
                handlers[i].call(vm);
            } catch (error) {
                handleError(error, vm, `${hook} hook`);
            }
        }
    }
};
export function handleError(err, vm, info) {
    if (vm) {
        let cur = vm;
        while((cur = vm.$parent)) {  //循环向上回溯触发父组件的错误处理钩子, 这就能解释为什么父组件能捕获子孙组件的错误
            const hooks = cur.$options.errorCaptured;
            if (hooks) {
                for (let i=0; i<hook.length; i++) {
                    try {
                        const capture = hooks[i].call(cur, err, vm, info) === false;
                        if (capture) return;  //如果钩子函数返回false表明停止上报 
                    } catch (error) {
                        globalHandleError(error);  //钩子函数也抛出错误，一起报给全局错误处理函数
                    }
                }
            }
        }
    }
    globalHandleError(err, vm, info);  //全局
}
function globalHandleError(err, vm, info) {
    if (config.errorHandler) {  //就是Vue.config.errorHandler全局错误处理
        try {
            return config.errorHandler.call(null, err, vm, info);
        } catch (error) {
            logError(e); //如果全局错误处理函数也抛出一个错误
        }
    }
    logError(err);  //最终都要把错误输出到控制台
};
function logError(err) {
    console.error(err);
}