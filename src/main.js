import {createApp} from 'vue';
import './style.css';
import App from './App.vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import dayjs from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore)

createApp(App)
    .use(Antd)
    .mount(
        (() => {
            const app = document.createElement('div');
            document.body.append(app);
            return app;
        })(),
    );
