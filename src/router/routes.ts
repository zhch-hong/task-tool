import { RouteConfig } from 'vue-router';

import Layout from '@/components/layout/index.vue';

import EditFile from '@/views/edit-file/edit-file.vue';
import SyncFile from '@/views/sync-file/sync-file.vue';

const routes: RouteConfig[] = [
  {
    path: '/',
    redirect: '/edit-file',
  },
  {
    path: '/edit-file',
    component: Layout,
    children: [{ path: '', component: EditFile }],
  },
  {
    path: '/sync-file',
    component: Layout,
    children: [{ path: '', component: SyncFile }],
  },
];

export default routes;
