<script src="../dist/soyoung_monkey.user.js"></script>
<template>
  <Dialog/>
</template>
<script setup>
import Dialog from "./components/Dialog.vue";
import {onMounted} from "vue";
import {
  cpcStaticListData,
  getAdOrderListApi,
  getAllAdOrderList,
  getAllCpcStaticListData, getAllCptAdOrderDetail,
  getAllFlowAnalysis
} from "./api/index.js";
import dayjs from "dayjs";

onMounted(async () => {
  // cpc
  // let testDate = await getAllCpcStaticListData('2022-09-16', '2022-09-16');
  // console.log("testDate", testDate);
  // let start = dayjs('2022-09-01');
  // let end = dayjs('2022-09-10');


  //cpt
  // let t = await getAllCptAdOrderDetail();
  // console.log("t",t);

  // flowAng
  // let t = await getAllFlowAnalysis('2022-09-16','2022-09-16');
  // console.log("t",t);


})
</script>
<style scoped lang="less">

</style>
