<template>
  <div class="container">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading">Loading...</div>

    <!-- Error message -->
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

    <!-- niet ingelogd als admin -->
    <div v-if="!isAdmin && !loading">
      <p>Deze pagina is enkel voor de administrator.</p>
      <p>Log in als admin via <RouterLink to="/tasks">Tasks</RouterLink>.</p>
    </div>

    <!-- ingelogd als admin -->
    <div v-if="isAdmin">
      <p>Logged in as {{ user.username }}</p>

      <!-- (b) overzicht van alle gebruikers -->
      <h2>Gebruikers</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Rollen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u._id">
            <td>{{ u.username }}</td>
            <td>{{ u.roles.join(', ') }}</td>
          </tr>
        </tbody>
      </table>

      <!-- (a) overzicht van alle taken + (c) taak toekennen -->
      <h2>Taken</h2>
      <table>
        <thead>
          <tr>
            <th>Taak</th>
            <th>Klaar</th>
            <th>Gebruiker</th>
            <th>Toekennen aan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in allTasks" :key="task._id">
            <td>{{ task.todo }}</td>
            <td>{{ task.completed ? 'ja' : 'nee' }}</td>
            <td>{{ usernameOf(task.userId) }}</td>
            <td>
              <select v-model="selectedUser[task._id]">
                <option value="">-- kies --</option>
                <option v-for="u in users" :key="u._id" :value="u._id">{{ u.username }}</option>
              </select>
              <button @click="assign(task._id)" :disabled="!selectedUser[task._id]">OK</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useStore } from '@/stores/index';

export default {
  components: {
    RouterLink,
  },
  setup() {
    const appStore = useStore();

    const errorMessage = ref('');
    // per taak: welke gebruiker gekozen is in de select  { taskId: userId }
    const selectedUser = ref({});

    const user = computed(function () {
      return appStore.user;
    });
    const allTasks = computed(function () {
      return appStore.allTasks;
    });
    const users = computed(function () {
      return appStore.users;
    });
    const loading = computed(function () {
      return appStore.loading;
    });
    const isAdmin = computed(function () {
      if (!appStore.user.roles) {
        return false;
      }
      return appStore.user.roles.includes('admin');
    });

    // gegevens laden van de server
    async function loadData() {
      try {
        errorMessage.value = '';
        await appStore.retrieveAllUsers();
        await appStore.retrieveAllTasks();
      } catch (error) {
        errorMessage.value = error.message;
      }
    }

    // bij openen van de pagina: eerst kijken of er iemand ingelogd is
    onMounted(async function () {
      try {
        await appStore.checkLogin();
      } catch (error) {
        // niet ingelogd: geen foutmelding nodig
      }
      if (isAdmin.value) {
        await loadData();
      }
    });

    // geeft de username terug van de gebruiker met dit id
    function usernameOf(userId) {
      if (!userId) {
        return '-';
      }
      for (const u of users.value) {
        if (u._id === userId) {
          return u.username;
        }
      }
      return '-';
    }

    // (c) taak toekennen
    async function assign(taskId) {
      try {
        errorMessage.value = '';
        await appStore.assignTask(taskId, selectedUser.value[taskId]);
        selectedUser.value[taskId] = '';
      } catch (error) {
        errorMessage.value = error.message;
      }
    }

    return {
      user,
      allTasks,
      users,
      loading,
      isAdmin,
      errorMessage,
      selectedUser,
      usernameOf,
      assign,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

h2 {
  margin-top: 25px;
  margin-bottom: 10px;
  color: #333;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

th {
  background-color: #f5f5f5;
}

select {
  padding: 4px;
  margin-right: 5px;
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
</style>
