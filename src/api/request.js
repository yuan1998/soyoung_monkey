import axios from 'axios';
import * as Qs from "qs";
import {sortByKeyStr} from "../utils/object.js";
import md5 from 'js-md5'
import * as Base64 from 'js-base64'
import CryptoJS from 'crypto-js';


function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }
        return arr2;
    } else {
        return Array.from(arr);
    }
}


axios.interceptors.request.use((config) => {
    var hasUrlParam = config.url.split("?")[1];
    var urlParams = hasUrlParam && hasUrlParam.split("&");
    var args = {
        saas_token: window.soyoung.saas_token,
        saas_timestamp: Math.round(Date.now() / 1000),
        sign: function sign(data) {
            return md5(Base64.encode(data));
        }
    };
    if (config.data instanceof FormData) {
        config.data.append("saas_token", args.saas_token);
        config.data.append("saas_timestamp", args.saas_timestamp);
        var ary = [];
        config.data.forEach(function (v, k) {
            ary.push(k + "=" + v);
        });
        if (hasUrlParam) {
            ary = [].concat(_toConsumableArray(ary), _toConsumableArray(urlParams));
        }
        config.data.append("saas_sign", args.sign(sortByKeyStr(ary)));
        return config;
    }
    if (config.method === "get") {
        config.params = config.params === undefined ? {} : config.params;
        config.params["saas_token"] = args.saas_token;
        config.params["saas_timestamp"] = args.saas_timestamp;
        var argsGetAry = Qs.stringify(config.params).split("&");
        if (hasUrlParam) {
            argsGetAry = [].concat(_toConsumableArray(argsGetAry), _toConsumableArray(urlParams));
        }
        config.params["saas_sign"] = args.sign(sortByKeyStr(argsGetAry));
    } else {
        if (config.data === undefined || config.data === "") {
            config.data = "saas_token=" + args.saas_token + "&saas_timestamp=" + args.saas_timestamp;
        } else {
            config.data = config.data + "&saas_token=" + args.saas_token + "&saas_timestamp=" + args.saas_timestamp;
        }
        var argsPostAry = config.data.split("&");
        if (hasUrlParam) {
            argsPostAry = [].concat(_toConsumableArray(argsPostAry), _toConsumableArray(urlParams));
        }
        config.data = config.data + "&saas_sign=" + args.sign(sortByKeyStr(argsPostAry));
    }
    return config;
})

axios.interceptors.response.use(function (response) {
    // ??????????????????PHP alert ???????????? start
    if (response && response.data) {
        var res = response.data.toString();
        if (res.indexOf("script") > -1 && res.indexOf("alert") > -1) {
            // ??????alert?????????
            var msg = res.match(/\(\"(.+?)\"\)/)[1];
            // ????????????????????????
            var url = res.match(/href\=\"(.+?)\"\;/)[1];
            var ps = new PS();
            ps.on("done", function () {
                window.location.href = url;
            });
            $phps.emit("alert", {
                show: true,
                msg: msg,
                btnText: "?????????",
                ps: ps
            });
        }

        // ??????????????????PHP alert ???????????? start
        var _response$data = response.data,
            status = _response$data.status,
            message = _response$data.message;

        $phps.emit("axios:response", {
            status: status,
            message: message
        });

        if (response.data.sign && 1 === response.data.sign) {
            response.data.data = function (t) {

                let key = window.__key__decode__ || '8d1f2f81c2f275ac';

                let step1 = Base64.atob(t);
                let step2 = step1.slice(0, 16);
                let step3 = step1.slice(16);
                let step4 = CryptoJS.enc.Utf8.parse(key);
                let step5 = CryptoJS.enc.Utf8.parse(step2)
                let step6 = Base64.btoa(step3);
                let step7 = CryptoJS.AES.decrypt(step6, step4, {
                    iv: step5
                }).toString(CryptoJS.enc.Utf8)

                return JSON.parse(step7);
            }(response.data.data)

        }


    }
    return response;
}, function (error) {
    // ??????????????????
    if (+error.request.status === 0) {
        if (window.$saasvue) {
            window.$saasvue.$notify.error({
                title: "??????",
                message: "???????????????"
            });
        }
    }

    // ????????????
    if (error.code === "ECONNABORTED" && error.message.indexOf("timeout") !== -1) {
        if (window.$saasvue) {
            var _errMsg = "?????? " + error.config.url + " ????????????";
            if (error.config.params._route) {
                _errMsg = "?????? " + error.config.url + "?_route=" + error.config.params._route + " ????????????";
            }
            window.$saasvue.$notify.error({
                title: "??????",
                message: _errMsg
            });
        }
    }

    // 404
    if (+error.response.status === 404) {
        window.$saasvue.$notify.error({
            title: "??????",
            message: errMsg
        });
        if (window.$saasvue) {
            var _errMsg2 = "?????? " + error.config.url + " ????????????????????????????????? 404";
            if (error.config.params._route) {
                _errMsg2 = "?????? " + error.config.url + "?_route=" + error.config.params._route + " ????????????????????????????????? 404";
            }
            window.$saasvue.$notify.error({
                title: "??????",
                message: _errMsg2
            });
        }
    }

    // 500
    if (error.response.status === 500) {
        window.$saasvue.$notify.error({
            title: "??????",
            message: errMsg
        });
        if (window.$saasvue) {
            var _errMsg3 = "?????? " + error.config.url + " ???????????????????????? 500";
            if (error.config.params._route) {
                _errMsg3 = "?????? " + error.config.url + "?_route=" + error.config.params._route + " ???????????????????????? 500";
            }
            window.$saasvue.$notify.error({
                title: "??????",
                message: _errMsg3
            });
        }
    }

    // 504
    if (+error.response.status === 504) {
        if (window.$saasvue) {
            var _errMsg4 = "?????? " + error.config.url + " ???????????????????????? 504";
            window.$saasvue.$notify.error({
                title: "??????",
                message: _errMsg4
            });
        }
    }

    // Do something with response error
    // return Promise.reject(error)
    $phps.emit("axios:response", {
        status: error.request.status,
        message: error.message + "<br>url \uFF1A <strong><i>" + error.config.url + "</i></strong>"
    });

    return Promise.reject(error);
});

const soyoungConfig = window.soyoung;
export const requestGet = async (url, params) => {
    return await axios.get(soyoungConfig.baseApiPath + url, {
        params: {
            ...params,
        },

    });
};
export const requestPost = async (url, data) => {
    return await axios.post(soyoungConfig.baseApiPath + url, Qs.stringify(data));
};
