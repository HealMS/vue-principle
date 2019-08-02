Vue.options = Object.create(null);
const ASSET_TYPE = ['redirective', 'filter', 'component'];
ASSET_TYPE.forEach(type => {
    Vue.options[type+'s'] = Object.create(null);
});
ASSET_TYPE.forEach(type => {
    Vue[type] = function (id, definition) {
        /** definition不存在为get, 存在为set */
        if (!definition) {
            return this.options[type+'s'][id];
        } else {
            if (type === 'component' && isPlainObject(definition)) {
                definition.name = definition.name || id;
                definition = this.extend(definition);
            }
            if (type === 'directive' && typeof definition === 'function') {
                definition = {bind: definition, update: definition};
            }
            this.options[type+'s'][id] = definition;
            return definition;
        }
    };
});