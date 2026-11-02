<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Home from './components/Home.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>       
        <RouterLink to="/tasks">Tasks</RouterLink>
      </nav>    
    </div>
  </header>

  <RouterView />
</template>

<style scoped>

</style>
