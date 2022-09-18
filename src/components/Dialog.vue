<template>
  <button class="float-btn" @click="openDialog">S</button>

  <a-modal
      v-model:visible="disableDialog"
      title="导出数据"
      :maskClosable="!confirmLoading"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      cancelText="取消"
      okText="提交"
  >
    <a-range-picker :format="dateFormat" v-model:value="dateValue" :ranges="dateRange"/>
    <div class="y-files-wrapper">
      <div class="y-files-tip">选择日期,点击上方查询按钮获取数据.</div>
      <div v-for="(value, index) in excelCache" :key="index" class="y-file-row">
        <div @click="downLoadValue(value)" class="y-file-name"><i class="el-icon-document"></i> {{ value.name }}
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script setup>
import {ref, computed} from "vue";
import dayjs from 'dayjs';
import {notification} from 'ant-design-vue';
import {
  calendarInfoData,
  calendarListData, getAllCpcStaticListData, getAllCptAdOrderDetail, getAllFlowAnalysis,
  goodsInfoData,
  goodsListData,
  postInfoData,
  postListData
} from "../api/index.js";
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import {$ColumnsHeader, $SheetName} from "../utils/object.js";
import {work} from "../utils/work.js";

let yesterday = dayjs().add(-1, 'day');
const dateFormat = 'YYYY-MM-DD';
const disableDialog = ref(false)
const confirmLoading = ref(false)
const dateValue = ref([yesterday, yesterday])
const excelCache = ref([]);
const dateRange = {};

const parserDates = computed(() => {
  let s = dateValue.value[0]?.format(dateFormat);
  let e = dateValue.value[1]?.format(dateFormat);
  if (!s || !e) return null;

  return [
    s,
    e,
  ]
})
const dateRanges = computed(() => {
  let result = [];
  if (parserDates.value) {
    for (let start = dayjs(parserDates.value[0]), end = dayjs(parserDates.value[1]); start.isSameOrBefore(end); start = start.add(1, 'day')) {
      result.push(start.format('YYYY-MM-DD'))
    }
  }
  return result;
})

const makeExcel = (data) => {
  const workbook = XLSX.utils.book_new();

  for (let key in data) {
    const worksheet = XLSX.utils.json_to_sheet(data[key]);
    XLSX.utils.book_append_sheet(workbook, worksheet, key);
  }

  let res = XLSX.write(workbook, { type: "buffer" });
  let rData = new Blob([res], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;"});
  let name = parserDates.value[0] + '_' + parserDates.value[1] + '.xlsx';
  excelCache.value = excelCache.value.concat([{
    blob: rData,
    name: name,
  }]);
}


const handleCpt = async () => {
  let cptContent = await getAllCptAdOrderDetail();
  return dateRanges.value.map((date) => {
    return cptContent.map(item => ({...item, '时间': date}));
  }).reduce((a, b) => a.concat(b), []);
}
const handleCpc = async () => {
  let fnList = dateRanges.value.map((date) => async () => {
    return await getAllCpcStaticListData(date, date);
  })
  let result = await work(fnList, 3, 'handleCpc');
  return result.reduce((a, b) => a.concat(b), []);
}
const handleFlowAnalysis = async () => {
  let fnList = dateRanges.value.map((date) => async () => {
    return await getAllFlowAnalysis(date, date);
  })
  let result = await work(fnList, 3, 'handleFlowAnalysis');
  return result.reduce((a, b) => a.concat(b), []);
}

const handleDo = async () => {
  let test = await handleCpt();
  let cpc = await handleCpc();
  let flowAnalysis = await handleFlowAnalysis();

  makeExcel({
    'CPT数据': test,
    'CPC数据': cpc,
    '客流分析' : flowAnalysis,
  })
}

const handleOk = async () => {
  if (confirmLoading.value) {
    notification.info({
      message: '正在运行中',
      description: '正在运行中!'
    })
    return
  }

  if (!parserDates) {
    notification.info({
      message: '无法识别时间',
      description: '请选择正确的时间!'
    })
    return
  }

  confirmLoading.value = true;
  try {

    await handleDo();

    notification.success({
      message: '导出成功!!',
      description: '付出终有回报!'
    })

  } catch (e) {
    console.log("e", e);
    notification.error({
      message: '!!!发送错误,请联系管理员!!!',
      description: e?.toString() || '错误',
    });
  }
  confirmLoading.value = false;
}

const hideDialog = () => {
  disableDialog.value = false;
}
const openDialog = () => {
  disableDialog.value = true;
}

const downLoadValue = (item) => {
  saveAs(item.blob, item.name);
}

</script>
<style scoped lang="less">
.float-btn {
  position: fixed;
  right: 50px;
  bottom: 100px;
  z-index: 1000;
}


.y-files-wrapper {
}

.y-files-tip {
  font-size: 12px;
  color: #606266;
  margin-bottom: 10px;
}

.y-file-row {
  transition: all .5s cubic-bezier(.55, 0, .1, 1);
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin-top: 5px;
  position: relative;
  box-sizing: border-box;
  border-radius: 4px;
  width: 100%;
}

.y-file-row:hover {
  background-color: #f5f7fa;
}

.y-file-name {
  color: #606266;
  display: block;
  margin-right: 40px;
  overflow: hidden;
  padding-left: 4px;
  text-overflow: ellipsis;
  transition: color .3s;
  white-space: nowrap;
}

.y-file-name:hover {
  color: #409eff;
  cursor: pointer;
}
</style>
