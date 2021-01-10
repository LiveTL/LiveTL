import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Main',
    component: () => import(/* webpackChunkName: "Main" */ '@/views/Main')
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import(/* webpackChunkName: "Chat" */ '@/submodules/chat/components/ChatUI')
  }
];

const router = new VueRouter({
  routes
});

export default router;
