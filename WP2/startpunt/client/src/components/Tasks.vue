<template>
  <div class="container">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading">Loading...</div>

    <!-- Error message -->
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

    <!-- Authenticated user interface -->
    <div v-if="user.username && !loading">
      <p>Logged in as {{ user.username }} <button @click="logout" :disabled="loading">Log Out</button></p>
      <div v-if="user.roles?.includes('user')">
        <button @click="retrieveTasks" :disabled="loading">Retrieve My Tasks</button>
        <div v-if="tasks.length" class="task-list">
          <div v-for="task in tasks" :key="task._id">
            <UpdatableTask :task="task" @update-task="handleTaskUpdate" />
          </div>
        </div>
        <p v-else-if="!loading">No tasks available. Click "Retrieve My Tasks" to load your tasks.</p>
      </div>
    </div>

    <!-- Login form for unauthenticated users -->
    <div v-else-if="!loading">
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="username">Username:</label>
          <input v-model="username" id="username" type="text" required />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input v-model="password" id="password" type="password" required />
        </div>
        <div class="form-group">
          <button type="submit" :disabled="loading">Login</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from '@/stores/index';
import UpdatableTask from './UpdatableTask.vue';

export default {
  components: {
    UpdatableTask,
  },
  setup() {
    const appStore = useStore();

    // Reactive properties for form input and error handling
    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');

    // Computed properties for store state
    const user = computed(() => appStore.user);
    const tasks = computed(() => appStore.tasks);
    const loading = computed(() => appStore.loading);

    // Check login status on mount
    onMounted(async () => {
      try {
        await appStore.checkLogin();
      } catch (error) {
        errorMessage.value = error.message || 'Failed to verify login status';
      }
    });

    // Login function
    const login = async () => {
      try {
        errorMessage.value = ''; // Clear previous errors
        await appStore.login({ username: username.value, password: password.value });
        username.value = '';
        password.value = '';
      } catch (error) {
        errorMessage.value = error.message || 'Login failed';
      }
    };

    // Logout function
    const logout = async () => {
      try {
        errorMessage.value = ''; // Clear previous errors
        await appStore.logout();
        username.value = '';
        password.value = '';
      } catch (error) {
        errorMessage.value = error.message || 'Logout failed';
      }
    };

    // Retrieve tasks function
    const retrieveTasks = async () => {
      try {
        errorMessage.value = ''; // Clear previous errors
        await appStore.retrieveOwnTasks();
      } catch (error) {
        errorMessage.value = error.message || 'Failed to retrieve tasks';
      }
    };

    // Handle task update from UpdatableTask component
    const handleTaskUpdate = async ({ taskId, completed }) => {
      try {
        errorMessage.value = ''; // Clear previous errors
        await appStore.changeCompleted(taskId, completed);
      } catch (error) {
        errorMessage.value = error.message || 'Failed to update task';
      }
    };

    return {
      username,
      password,
      errorMessage,
      login,
      logout,
      retrieveTasks,
      handleTaskUpdate,
      user,
      tasks,
      loading,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 300px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 5px 10px;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading {
  font-size: 1rem;
  color: #666;
  margin-bottom: 15px;
}

.error {
  font-size: 1rem;
  color: #d32f2f;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}

.task-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
