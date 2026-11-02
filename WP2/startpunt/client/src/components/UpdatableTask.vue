<template>
  <div class="task-item">
    <label :for="`completed-${task._id}`" class="task-label">
      {{ task.todo }}
      <input
        :id="`completed-${task._id}`"
        type="checkbox"
        v-model="completed"
        @change="changeCompleted"
        :disabled="isUpdating"
        aria-label="Toggle task completion"
      />
    </label>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Define props with validation
const props = defineProps({
  task: {
    type: Object,
    required: true,
    validator: (task) => {
      return (
        task &&
        typeof task._id === 'string' &&
        typeof task.todo === 'string' &&
        typeof task.completed === 'boolean'
      );
    },
  },
});

// Define emits
const emit = defineEmits(['update-task']);

// Reactive state for checkbox
const completed = ref(props.task.completed);
const isUpdating = ref(false); // Track update in progress

// Handle checkbox change
const changeCompleted = () => {
  isUpdating.value = true;
  emit('update-task', { taskId: props.task._id, completed: completed.value });
  // Note: isUpdating is reset in parent component or via store feedback
};
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.task-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  color: #333;
  width: 100%;
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
