export const $SheetName = {
    'post': '文章',
    'calendar': '日历',
    'good': '商品'
};

export const $ColumnsHeader = {
    'name': '名称',
    'id': 'ID编号'
};

export const cloneOf = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

export var sortByKeyStr = function sortByKeyStr(ary) {
    return ary.sort(function (a, b) {
        var aKey = a.split("=")[0];
        var bKey = b.split("=")[0];
        return aKey < bKey ? -1 : 1;
    }).join("&");
};

let __cache__material_code = null;
const parseMaterialCode = () => {
    let result = {};
    if (window.ID_TRANSFER) {
        for (const [key, value] of Object.entries(window.ID_TRANSFER)) {
            if (value.length) {
                for (const valueElement of value) {
                    result[valueElement] = key;
                }
            }
        }
    }

    return result;
}
export const getMaterialCode = (id) => {
    if (!__cache__material_code) {
        __cache__material_code = parseMaterialCode();
    }

    return __cache__material_code[id] || id;

}
