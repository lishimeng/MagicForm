<template>
  <el-aside class="components-panel">
    <div class="panel-title">表单组件</div>
    <div class="components-list">
      <div 
        class="component-item" 
        v-for="component in components" 
        :key="component.type"
        draggable="true"
        @dragstart="handleDragStart($event, component)"
      >
        <i :class="component.icon"></i>
        <span>{{ component.label }}</span>
      </div>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';

// 定义组件列表
const components = [
  { type: 'input', label: '单行文本', icon: 'el-icon-edit' },
  { type: 'textarea', label: '多行文本', icon: 'el-icon-align-left' },
  { type: 'number', label: '数字', icon: 'el-icon-hashtag' },
  { type: 'select', label: '下拉选择', icon: 'el-icon-arrow-down' },
  { type: 'radio', label: '单选框组', icon: 'el-icon-circle-check' },
  { type: 'checkbox', label: '复选框组', icon: 'el-icon-check' },
  { type: 'date', label: '日期选择', icon: 'el-icon-calendar' },
  { type: 'switch', label: '开关', icon: 'el-icon-switch-button' }
];

// 定义事件
const emit = defineEmits<{
  (e: 'drag-start', event: DragEvent, component: { type: string; label: string }): void
}>();

// 处理拖拽开始
const handleDragStart = (event: DragEvent, component: { type: string; label: string }) => {
  emit('drag-start', event, component);
};
</script>

<style scoped>
.components-panel {
  width: 280px;
  background-color: #f5f7fa;
  border-right: 1px solid #e6e6e6;
  overflow-y: auto;
}

.panel-title {
  padding: 15px;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #e6e6e6;
}

.components-list {
  padding: 10px;
}

.component-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  margin-bottom: 8px;
  background-color: white;
  border-radius: 4px;
  cursor: move;
  transition: all 0.2s;
}

.component-item:hover {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.component-item i {
  margin-right: 10px;
  color: #1890ff;
}
</style>
  