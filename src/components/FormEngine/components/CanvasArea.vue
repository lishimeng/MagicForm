<template>
  <el-main class="canvas-area">
    <div class="canvas-header">
      <h2>表单设计区</h2>
      <el-input 
        v-model="formName" 
        placeholder="请输入表单名称" 
        class="form-name-input"
      ></el-input>
    </div>
    
    <div 
      class="canvas" 
      @dragover.prevent
      @drop="handleDrop"
    >
      <el-form 
        ref="dynamicForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="dynamic-form"
      >
        <template v-for="(item, index) in formItems" :key="item.id">
          <el-form-item
            :label="item.label"
            :prop="item.field"
            :required="item.required"
            class="form-item"
            :class="{ 'form-item-active': isSelected(item) }"
          >
            <!-- 根据组件类型渲染不同的表单控件 -->
            <component 
              :is="getComponent(item.type)" 
              v-model="formData[item.field]"
              :placeholder="item.placeholder || `请输入${item.label}`"
              :options="('options' in item) ? item.options : undefined"
              :disabled="item.disabled"
              :min="('min' in item) ? item.min : undefined"
              :max="('max' in item) ? item.max : undefined"
              v-if="item.type !== 'textarea'"
            ></component>
            
            <el-input
              v-if="item.type === 'textarea'"
              type="textarea"
              v-model="formData[item.field]"
              :placeholder="item.placeholder || `请输入${item.label}`"
              :disabled="item.disabled"
            ></el-input>
            
            <!-- 操作按钮 -->
            <div class="item-actions">
              <el-button 
                icon="el-icon-delete" 
                size="mini" 
                type="danger" 
                @click="handleRemoveItem(index)"
              ></el-button>
              <el-button 
                icon="el-icon-edit" 
                size="mini" 
                @click="handleSelectItem(item)"
              ></el-button>
            </div>
          </el-form-item>
        </template>
        
        <!-- 空状态提示 -->
        <div v-if="formItems.length === 0" class="empty-state">
          <i class="el-icon-upload"></i>
          <p>从左侧拖拽组件到此处开始设计表单</p>
        </div>
      </el-form>
    </div>
  </el-main>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, nextTick } from 'vue';
import { ElForm } from 'element-plus';
import type { FormItem } from '../CodeGenerator';

// 定义属性
const props = defineProps<{
  formItems: FormItem[];
  formData: Record<string, any>;
  formRules: Record<string, any[]>;
}>();

// 定义事件
const emit = defineEmits<{
  (e: 'drop', event: DragEvent): void;
  (e: 'select-item', item: FormItem): void;
  (e: 'remove-item', index: number): void;
}>();

// 表单名称
const formName = ref('我的表单');

// 动态表单引用
const dynamicForm = ref<InstanceType<typeof ElForm> | null>(null);

// 当前选中的项目ID
const selectedItemId = ref<number | null>(null);

// 处理放置事件
const handleDrop = (event: DragEvent) => {
  emit('drop', event);
};

// 处理选择项目
const handleSelectItem = (item: FormItem) => {
  selectedItemId.value = item.id;
  emit('select-item', item);
  
  // 滚动到视图
  nextTick(() => {
    const index = props.formItems.findIndex(i => i.id === item.id);
    if (index !== -1) {
      const element = document.querySelector(`.form-item:nth-child(${index + 1})`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
};

// 处理移除项目
const handleRemoveItem = (index: number) => {
  emit('remove-item', index);
  selectedItemId.value = null;
};

// 判断项目是否被选中
const isSelected = (item: FormItem) => {
  return selectedItemId.value === item.id;
};

// 获取组件
const getComponent = (type: string) => {
  switch(type) {
    case 'input': return 'el-input';
    case 'number': return 'el-input-number';
    case 'select': return 'el-select';
    case 'radio': return 'el-radio-group';
    case 'checkbox': return 'el-checkbox-group';
    case 'date': return 'el-date-picker';
    case 'switch': return 'el-switch';
    default: return 'el-input';
  }
};
</script>

<style scoped>
.canvas-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fafafa;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-name-input {
  width: 300px;
}

.canvas {
  background-color: white;
  border-radius: 4px;
  padding: 30px;
  min-height: 400px;
  border: 1px dashed #e6e6e6;
}

.dynamic-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-item {
  transition: all 0.3s;
  position: relative;
}

.form-item-active {
  box-shadow: 0 0 0 2px #1890ff;
  border-radius: 4px;
}

.item-actions {
  position: absolute;
  right: -80px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 5px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #999;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #ccc;
}
</style>
  