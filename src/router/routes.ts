import { RouteConfig } from 'vue-router';

import Layout from '@/components/layout/index.vue';

import EditFile from '@/views/edit-file/index.vue';
import EditTask from '@/views/edit-task/index.vue';
import ValidateData from '@/views/validate-data/validate-data.vue';
import FileManage from '@/views/file-manage/index.vue';
import SourceManage from '@/views/source-manage/index.vue';
import InputManage from '@/views/input-manage/index.vue';
import TemplateManage from '@/views/template-manage/template-manage.vue';

const routes: RouteConfig[] = [
  {
    path: '/',
    redirect: '/file-manage',
  },
  {
    path: '/edit-file',
    component: Layout,
    children: [{ path: '', component: EditFile }],
  },
  {
    path: '/edit-task',
    component: Layout,
    children: [{ path: '', component: EditTask }],
  },
  {
    path: '/validate-data',
    component: Layout,
    children: [{ path: '', component: ValidateData }],
  },
  {
    path: '/file-manage',
    component: Layout,
    children: [{ path: '', component: FileManage }],
  },
  {
    path: '/source-manage',
    component: Layout,
    children: [{ path: '', component: SourceManage }],
  },
  {
    path: '/input-manage',
    component: Layout,
    children: [{ path: '', component: InputManage }],
  },
  {
    path: '/template-manage',
    component: Layout,
    children: [{ path: '', component: TemplateManage }],
  },
];

export default routes;
