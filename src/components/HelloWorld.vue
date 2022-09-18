<template>
  <div class="test">
    <button class="float-btn" @click="openDialog" >S</button>
    <a-modal ref="dialog" title="导出数据" :visible="dialogDisplay" >
<!--      <a-form :form="formData" ref="form" layout="inline" >-->
<!--        <a-form-item label="日期范围">-->
<!--          <a-range-picker @change="onChangeDate" />-->
<!--        </a-form-item>-->
<!--        <a-form-item>-->
<!--          <a-button  @click="onSubmit">查询</a-button>-->
<!--        </a-form-item>-->
<!--      </a-form>-->
<!--      <div v-if="loading" style="padding-bottom:20px;">-->
<!--        <el-progress :text-inside="true" :stroke-width="26" :percentage="fetchProgress"></el-progress>-->
<!--      </div>-->
<!--      <div class="y-files-wrapper">-->
<!--        <div class="y-files-tip">选择日期,点击上方查询按钮获取数据.</div>-->
<!--        <div v-for="(value, key) in excelCache" :key="key" class="y-file-row">-->
<!--          <div @click="downLoadValue(value)" class="y-file-name"><i class="el-icon-document"></i> {{key}}-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
    </a-modal>

  </div>
</template>

<script>
import moment                         from "moment";
import {
  calendarInfoData,
  calendarListData,
  goodsInfoData,
  goodsListData,
  postInfoData,
  postListData
}                                     from "../Api";
import { $ColumnsHeader, $SheetName } from "../utils/object.js";
import * as ExcelJS                   from "exceljs";

export default {
  name    : "dialog-export",
  data() {
    return {
      dialogDisplay   : true,
      loading         : false,
      loadingInstance : null,
      fetchCount      : 0,
      completeCount   : 0,
      calendarProducts: [],
      excelCache      : {},
      formData        : {
        dates: [
          new Date(),
          new Date(),
        ]
      }
    };
  },
  computed: {
    parserDates() {
      let dates = this.formData.dates;
      return [
        moment(dates[ 0 ]).format('YYYY-MM-DD'),
        moment(dates[ 1 ]).format('YYYY-MM-DD'),
      ];
    },
    fetchProgress() {
      let total   = this.fetchCount;
      let current = this.completeCount;
      if (!total) return 0;
      return (Math.floor(current / total * 100));
    }
  },
  methods : {
    onChangeDate(date, dateString) {
      console.log(date, dateString);
    },
    openDialog() {
      console.log("123",123);
      this.dialogDisplay = true;
    },
    dateRangeEach(call) {
      let dates = this.formData.dates;
      let start = new Date(dates[ 0 ]);
      let end   = new Date(dates[ 1 ]);
      for (let d = start, i = 0 ; d <= end ; d.setDate(d.getDate + 1), i++) {
        call(d, i);
      }
    },
    async getCalendarProductInfo(products) {
      let test = products.map(async (product) => {
        let newProduct = {
          id  : product.gnrl_product_id,
          name: product.gnrl_product_name,
        };
        let dates      = this.parserDates;
        this.fetchCount++;
        let res = await calendarInfoData(newProduct.id, dates[ 0 ], dates[ 1 ]);
        this.completeCount++;
        let result = res.data;
        if (result.res) {
          let time  = result.data.time;
          let data  = result.data.data;
          let index = data.findIndex((item) => item.name === '总消耗');
          if (index > -1) {
            let count = data[ index ].data;
            time.forEach((item, index) => {
              newProduct[ item ] = parseFloat(count[ index ]);
            });
          }
        }
        return newProduct;
      })
      return await Promise.all(test);
    },
    async getCalendarData() {
      this.fetchCount++;
      let res = await calendarListData();
      this.completeCount++;
      let result = res.data;
      if (result.res) {
        let products   = result.data.products;
        let statusList = result.data.status;
        products       = products.filter((item) => item.gnrl_status === '1');
        return await this.getCalendarProductInfo(products);
      }
      return null;
    },
    async getGoodProductInfo(products) {
      let test = products.map(async (product) => {
        let newProduct = {
          id  : product.gnrl_product_id,
          name: product.gnrl_product_name,
        };
        let dates      = this.parserDates;
        this.fetchCount++;
        let res = await goodsInfoData(newProduct.id, dates[ 0 ], dates[ 1 ]);
        this.completeCount++;
        let result = res.data;
        if (result.res) {
          let time  = result.data.time;
          let data  = result.data.data;
          let index = data.findIndex((item) => item.name === '总消耗');
          if (index > -1) {
            let count = data[ index ].data;
            time.forEach((item, index) => {
              newProduct[ item ] = parseFloat(count[ index ]);
            });
          }
        }
        return newProduct;
      })
      let res  = await Promise.all(test);
      return res;
    },
    async getGoodData() {
      this.fetchCount++;
      let res = await goodsListData();
      this.completeCount++;
      let result = res.data;
      if (result.res) {
        let products   = result.data.products;
        let statusList = result.data.status;
        products       = products.filter((item) => item.gnrl_status === '1');
        return await this.getGoodProductInfo(products);
      }
      return null;
    },
    async getPostListInfo(lists) {
      let test = lists.map(async (list) => {
        let newProduct = {
          id  : list.gnrl_product_id,
          name: list.gnrl_product_name,
        };
        let dates      = this.parserDates;
        this.fetchCount++;
        let res = await postInfoData(newProduct.id, dates[ 0 ], dates[ 1 ]);
        this.completeCount++;
        let result = res.data;
        if (result.res) {
          let time  = result.data.time;
          let data  = result.data.data;
          let index = data.findIndex((item) => item.name === '总消耗');
          if (index > -1) {
            let count = data[ index ].data;
            time.forEach((item, index) => {
              newProduct[ item ] = parseFloat(count[ index ]);
            });
          }
        }
        return newProduct;
      })
      let res  = await Promise.all(test);
      return res;
    },
    async getPostData() {
      this.fetchCount++;
      let res = await postListData();
      this.completeCount++;
      let result = res.data;
      if (result.res) {
        let list       = result.data.list;
        let statusList = result.data.status;
        list           = list.filter((item) => item.gnrl_status === '1');
        return await this.getPostListInfo(list);
      }
      return null;
    },
    sumItem(data) {
      let sum = {
        id  : '合计',
        name: 0,
      };
      data.forEach((item) => {
        for (let key in item) {
          if (key !== 'id' && key !== 'name') {
            if (!sum[ key ]) sum[ key ] = 0;
            sum[ key ] += item[ key ];
            sum.name += item[ key ]
          }
        }
      });
      return sum;
    },
    dataGroup(res) {
      let calendar = res[ 0 ];
      let post     = res[ 1 ];
      let good     = res[ 2 ];
      calendar.push(this.sumItem(calendar));
      good.push(this.sumItem(good));
      post.push(this.sumItem(post));
      return {
        calendar,
        post,
        good,
      };
    },
    async onSubmit() {
      this.fetchCount    = 0;
      this.completeCount = 0;
      this.loading       = true;
      try {
        let res  = await Promise.all([ this.getCalendarData(), this.getPostData(), this.getGoodData() ]);
        let data = this.dataGroup(res);
        this.makeExcel(data);
        this.$notify({
          title  : '成功',
          message: '导出成功,请点击日期名称下载文件.',
          type   : 'success'
        });
        console.log(data);
      } catch (e) {
        console.log(e);
        this.$notify.error({
          title  : '错误',
          message: '!!!发送错误,请联系管理员!!!'
        });
      }
      this.loading = false;
    },
    makeExcelColumns(item) {
      let res = [];
      Object.keys(item).forEach((key) => {
        res.push({
          header: $ColumnsHeader[ key ] || key,
          key   : key,
          width : 25,
        });
      });
      return res;
    },
    makeExcel(data) {
      let workbook = new ExcelJS.Workbook();
      Object.keys(data).forEach((key) => {
        let item      = data[ key ];
        let worksheet = workbook.addWorksheet($SheetName[ key ]);
        if (item && item.length) {
          worksheet.columns = this.makeExcelColumns(item[ 0 ]);
          item.forEach((each) => {
            worksheet.addRow(each);
          })
        }
      });
      workbook.eachSheet((worksheet) => {
        console.log('worksheet', worksheet);
      });
      workbook.xlsx.writeBuffer().then((buffer) => {
        let dates = this.parserDates;
        let data  = new Blob([ buffer ], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;" });
        let name  = dates[ 0 ] + '_' + dates[ 1 ] + '.xlsx';
        let cache = {
          blob: data,
          name: name,
        };
        this.$set(this.excelCache, name, cache);
      });
    },
    handleClose(done) {
      if (!this.loading) {
        this.$confirm('确认关闭？')
            .then(_ => {
              done();
            })
            .catch(_ => {
            });
      } else {
        this.$alert('正在导出,不能关闭', '警告', {
          confirmButtonText: '确定',
        });
      }
    },
    downLoadValue(item) {
      saveAs(item.blob, item.name);
    }
  },
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
