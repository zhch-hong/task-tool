import store from '@/store';
import { Notification } from 'element-ui';
import { RouteConfig } from 'vue-router';

import Layout from '@/components/layout/index.vue';

const routes: RouteConfig[] = [
  {
    path: '/',
    redirect: '/file-manage',
  },
  {
    path: '/edit-file',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/views/edit-file/index.vue'),
      },
    ],
  },
  {
    path: '/edit-task',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/views/edit-task/index.vue'),
      },
    ],
    beforeEnter: (to, from, next) => {
      const path = store.state.taskFilePath;
      if (path === '') {
        Notification({
          title: '未选择配置文件',
          message: '请先选择配置文件，再进行任务相关操作',
          position: 'bottom-right',
          type: 'warning',
        });
        next(false);
      } else {
        next();
      }
    },
  },
  {
    path: '/file-manage',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/views/file-manage/index.vue'),
      },
    ],
  },
  {
    path: '/source-manage',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/views/source-manage/index.vue'),
      },
    ],
  },
  {
    path: '/input-manage',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/views/input-manage/index.vue'),
      },
    ],
  },
];

export default routes;
