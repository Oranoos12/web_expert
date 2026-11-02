import { createRouter, createWebHistory } from 'vue-router'
import TasksView from '../views/TasksView.vue'
import HomeView from '../views/HomeView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    }, 
    {
      path: '/tasks',
      name: 'tasks',
      component: TasksView
    }
  ]
})

export default router
