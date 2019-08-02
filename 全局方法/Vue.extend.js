/**
 * Vue.extend(options)
 * {Object} options
 * 使用Vue构造函数通过原型链创建一个子类, 参数是一个包含"组建选项"的对象, 和Vue实例的参数选项一样
 */
let cid = 1;
Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};  //可选参数，默认是空对象
    const Super = this;  //Vue构造函数
    const SuperId = Super.cid;
    /** 性能优化, 判断是否有缓存, 有则直接返回 */
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
        return cachedCtors[SuperId];
    }
    /** end */
    /** name是否符合规范 */
    const name = extendOptions.name || Super.options.name;
    if (process.env.NODE_ENV !== "production") {
        if (!/^[a-zA-Z][\w-]*$/.test(name)) {
            warn(
                `Invalid component name: ${name}.Component names can
                only contain alphanumeric characters and the hyphen, and
                must start with a letter`
            );
        }
    }
    /** end */
    /** 构建子类 */
    const Sub = function VueComponent(options) {
        this._init(options);
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    /** end */
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub['super'] = Super;  //绑定父类
    /** 将Sub计算属性和Props映射到实例属性上 */
    if (Sub.options.props) {
        initProps(Sub);
    }
    if (Sub.options.computed) {
        initComputed(Sub);
    }
    /** end */
    /** 父类的全局方法绑定到子类 */
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;
    const ASSET_TYPE = ['component', 'directive', 'filter'];
    ASSET_TYPE.forEach(type => {
        Sub[type] = Super[type];
    });
    if (name) {
        Sub.options.components[name] = Sub;
    }
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);
    /** end */
    //缓存构造函数
    cachedCtors[SuperId] = Sub;

    return Sub;
}
//将vm.name映射到Comp.prototype._props.name;
function initProps(Comp) {
    const props = Comp.options.props;
    for (const key in props) {
        proxy(Comp.prototype, '_props', key);
    }
}
function proxy(target, sourceKey, key) {
    sharePropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key];
    };
    sharePropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val;
    };
    Object.defineProperty(target, key, sharePropertyDefinition);
}
function initComputed(Comp) {
    const computed = Comp.options.computed;
    for (const key in computed) {
        defineComputed(Comp.prototype, key, computed[key]);
    }
}