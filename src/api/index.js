import {requestGet, requestPost} from "./request";
import {getMaterialCode} from "../utils/object.js";
import {work} from "../utils/work.js";
import dayjs from "dayjs";


export const $API = {
    goodsInfo: 'dashboard/AdcpcGoodsGetStatisticalData',
    goodsList: 'dashboard/AdcpcGoodsGetGnrlCondition',
    calendarList: 'dashboard/getCalendarGnrlCondition',
    calendarInfo: 'dashboard/addCalendargetStatisticalData',
    postList: 'dashboard/getCpcPostList',
    postInfo: 'dashboard/getPostStatisticalData',
    "cpcStaticList": "adCpc/cpcBidPlanMaterial?action=getCpcPlanStaticList",
    "GetAdOrderList": "adCpt/GetAdOrderList",
    "GetCptAdDetail": "adCpt/MyAdDetailNew",
    "flowAnalysis": "hospitalDashboard/flowAnalysis",
};

// 获取商品详情
export const goodsInfoData = async (productID, startDate, endDate) => {
    let data = Object.assign({}, {
        action: 'getStatisticalData',
        type: 1,
    }, {
        productID,
        startDate,
        endDate
    });
    return await requestPost($API.goodsInfo, data);
}

// 获取商品 列表
export const goodsListData = async () => {
    let data = {
        action: 'getGnrlCondition',
        gnrlType: 1
    };
    return await requestGet($API.goodsList, data);
};

// 获取日历 列表
export const calendarListData = async () => {
    return await requestGet($API.calendarList, {
        action: 'getGnrlCondition',
        gnrlType: 2
    })
};

// 获取日历 详细
export const calendarInfoData = async (productID, startDate, endDate) => {
    let data = Object.assign({}, {
        action: 'getStatisticalData',
        type: 2,
    }, {
        productID,
        startDate,
        endDate
    });
    return await requestPost($API.calendarInfo, data);
};


// 获取文章 详细
export const postInfoData = async (productID, startDate, endDate) => {
    let data = Object.assign({}, {
        action: 'getStatisticalData',
        type: 4,
    }, {
        productID,
        startDate,
        endDate
    })
    return await requestPost($API.postInfo, data);
}

// 获取文章 列表
export const postListData = async () => {
    return await requestGet($API.postList, {
        action: 'getCpcPostList',
        page: 1,
        page_size: 10000,
    })
}


export const cpcStaticListData = async (page, start_date, end_date) => {
    return await requestPost($API.cpcStaticList, {
        start_date,
        end_date,
        page,
        page_size: "50",
        group: "C",
    })
}


/**
 * bid_click_cnt: "0"
 * click_cnt: "6"
 * cost_avg: "36.1"
 * day: "2022-09-16"
 * end_date: "2022-09-16"
 * hospital_id: "22313"
 * impr_cnt: 0
 * is_open_ocpc: 0
 * letter_num: 0
 * material_cnt: "1"
 * material_id: "1201476"
 * material_label: "商品"
 * material_name: "【M唇手术】人中凹成形术 唇部整形修..."
 * material_type: "1"
 * plan_cnt: "1"
 * plan_id: "284755"
 * plan_name: "唇部"
 * point_bid_cnt: "0.00"
 * point_cnt: "216.33"
 * point_deputy_cnt: "27.46"
 * point_main_cnt: "188.87"
 * s_click_cnt: 0
 * start_date: "2022-09-16"
 * t_click_cnt: 0
 * @param start_date
 * @param end_date
 * @returns {Promise<*[]|*>}
 */
export const getAllCpcStaticListData = async (start_date, end_date) => {
    let current = 1;
    let pageSize = 50;
    let result = await cpcStaticListData(current, start_date, end_date);
    let total = result.data?.data?.pager?.total;
    if (!total) return [];

    let data = result.data?.data?.list || [];
    let lastPage = Math.ceil(total / pageSize);
    if (lastPage === 1) return data;

    if (lastPage > 1) {
        let fnList = [...Array(lastPage).keys()].map((page) => async () => {
            if (page <= 0 || page > lastPage - 1) return [];

            let result = await cpcStaticListData(page + 1, start_date, end_date)
            return result.data?.data?.list || [];
        });
        let pageResult = await work(fnList, 3, "getAllCpcStaticListData")


        data = pageResult.reduce((a, b) => {
            return a.concat(b)
        }, []).concat(data);
    }


    return data.map((item) => {
        let materialID = item["material_id"];
        return {
            "时间": item['day'],
            "第一主诉": getMaterialCode(materialID),
            "内容ID": materialID,
            "投放内容": item['material_name'],
            "计划ID": item["plan_id"],
            "所属计划": item["plan_name"],
            "总消耗": item['point_cnt'],
            "点击": item['click_cnt'],
            "平均点击成本": item['cost_avg'],
        }
    })
}


export const getAdOrderListApi = async (page) => {
    return await requestGet($API.GetAdOrderList, {
        sign: "standard",
        page,
        page_size: "50",
        tab: "2",
        type_id: "",
        verify_id: "",
        time_type: "1",
    })
}

export const getAllAdOrderList = async () => {
    let pageSize = 50
    let r = await getAdOrderListApi(1);

    let total = r.data?.data?.list_total;
    if (!total) return [];
    let data = r.data?.data?.list;

    let lastPage = Math.ceil(total / pageSize);
    if (lastPage > 1) {
        let fnList = [...Array(lastPage).keys()].map((page) => async () => {
            if (page <= 0 || page > lastPage - 1) return [];

            let result = await getAdOrderListApi(page + 1)
            return result.data?.data?.list || [];
        });

        let pageResult = await work(fnList, 3, "getAllAdOrderList")

        data = pageResult.reduce((a, b) => {
            return a.concat(b)
        }, []).concat(data)
    }

    return data

}

export const getCptAdDetail = async (id, ad_detail_id) => {
    return await requestPost($API.GetCptAdDetail, {
        id,
        ad_detail_id,
        type: 1,
    })
}

export const getAllCptAdOrderDetail = async () => {
    let dataList = await getAllAdOrderList();
    let fnList = dataList.map((item) => async () => {
        let detailResult = await getCptAdDetail(item['verify_id'], item['ad_detail_id']);

        let detailData = detailResult.data;
        let price = detailData.hospital_point + detailData.hospital_main_point
        let totalDay = dayjs(detailData['end_date']).diff(detailData['start_date'], 'day') + 1;
        let totalProduct = detailData['addressValue_spid']?.reduce((a, b) => {
            let list = [];
            if (b['re_product_id']) {
                list = [
                    {
                        re_product_id: b['re_product_id'],
                        re_value: b['re_value'],
                        queryName: b?.['queryName'] || '',
                    }
                ]
            } else {
                list = (b['product'])?.map((product) => {
                    return {
                        ...product,
                        queryName: b?.['queryName'] || ''
                    }
                }) || [];
            }

            if (!list.length) console.log("b", b, detailData);

            return a.concat(list);
        }, [])
        let iPrice = price / totalProduct.length / totalDay;

        return totalProduct.map((product) => {
            return {
                "时间": '',
                "第一主诉": getMaterialCode(product['re_product_id']),
                "商品ID": product['re_product_id'],
                "执行单号": detailData['type_idValue_id'],
                "资源包": detailData['type_idValue_type'],
                "资源类型": detailData['menu1_name'],
                "资源位": detailData['seatValue'],
                "投放区域": detailData['addressValue'],
                "排期时间-开始": detailData['start_date'],
                "排期时间-结束": detailData['end_date'],
                "金额": iPrice,
                "搜索词": product['queryName'],
                "词包": detailData['pack_name'] || '',
                "商品名称": product['re_value'],
            }
        })
    })

    return (await work(fnList, 3, 'getAllCptAdOrderDetail')).reduce((a, b) => {
        return a.concat(b);
    }, []);

}

export const getFlowAnalysis = async (page, start_day, end_day) => {
    return await requestPost($API.flowAnalysis, {
        method: "getHospitalPageDetails",
        start_day,
        end_day,
        page,
        export: 0,
        limit: 50,
        page_type: 0
    })
}

export const getAllFlowAnalysis = async (start_day, end_day) => {
    const firstResponse = await getFlowAnalysis(1, start_day, end_day);
    let total = firstResponse.data?.data?.total;
    if (!total)
        return [];
    let lastPage = Math.ceil(total / 50);
    let data = firstResponse.data?.data?.list;
    if (lastPage > 1) {

        let fnList = [...Array(lastPage).keys()].map((page) => async () => {
            if (page <= 0 || page > lastPage - 1) return [];
            let result = await getFlowAnalysis(page + 1, start_day, end_day)
            return result.data?.data?.list || [];
        });
        let pageResult = await work(fnList, 3, "getAllFlowAnalysis")

        data = pageResult.reduce((a, b) => {
            return a.concat(b)
        }, []).concat(data)
    }

    return data.map((item) => {
        return {
            "时间": item["st_day"],
            "第一主诉": getMaterialCode(item['skuid']),
            "商品ID": item['skuid'],
            "项目": item?.page_name?.content,
            "浏览量": item["pv_cnt"],
            "链接": item?.page_name?.url,
            "类型": item["page_type"],
        };
    })
}
