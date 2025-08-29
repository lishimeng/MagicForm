<template>
  <el-aside class="properties-panel">
    <div class="panel-title">属性配置</div>
    <div v-if="internalSelectedItem" class="properties-form">
      <el-form :model="internalSelectedItem" label-width="80px">
        <el-form-item label="字段标签">
          <el-input v-model="internalSelectedItem.label" @input="handleItemChange"></el-input>
        </el-form-item>
        <el-form-item label="字段名称">
          <el-input v-model="internalSelectedItem.field" @input="handleItemChange"></el-input>
        </el-form-item>
        <el-form-item label="占位提示">
          <el-input v-model="internalSelectedItem.placeholder" @input="handleItemChange"></el-input>
        </el-form-item>
        <el-form-item label="是否必填">
          <el-switch v-model="internalSelectedItem.required" @change="handleItemChange"></el-switch>
        </el-form-item>
        <el-form-item label="是否禁用">
          <el-switch v-model="internalSelectedItem.disabled" @change="handleItemChange"></el-switch>
        </el-form-item>
        
        <!-- 选项配置 -->
        <el-form-item 
          label="选项配置" 
          v-if="['select', 'radio', 'checkbox'].includes(internalSelectedItem.type)"
        >
          <el-tag 
            v-for="(option, optIndex) in internalSelectedItem.options" 
            :key="optIndex"
            closable
            @close="handleRemoveOption(optIndex)"
          >
            {{ option.label }}: {{ option.value }}
          </el-tag>
          <el-input 
            v-model="newOptionText" 
            placeholder="格式: 标签:值" 
            style="margin-top: 10px;"
          ></el-input>
          <el-button 
            type="text" 
            size="small" 
            @click="handleAddOption"
            style="padding: 0;"
          >
            添加选项
          </el-button>
        </el-form-item>
        
        <!-- 数字范围配置 -->
        <template v-if="internalSelectedItem.type === 'number'">
          <el-form-item label="最小值">
            <el-input-number 
              v-model="internalSelectedItem.min" 
              :min="0"
              @change="handleItemChange"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="最大值">
            <el-input-number 
              v-model="internalSelectedItem.max" 
              :min="0"
              @change="handleItemChange"
            ></el-input-number>
          </el-form-item>
        </template>
      </el-form>
    </div>
    <div v-else class="empty-properties">
      <p>请选择一个表单组件进行配置</p>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, shallowRef } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormItem, OptionFormItem } from '../CodeGenerator';

// 定义属性
const props = defineProps<{
  selectedItem: FormItem | null;
}>();

// 定义事件
const emit = defineEmits<{
  (e: 'update:selectedItem', value: FormItem): void;
  (e: 'remove-option', index: number): void;
  (e: 'add-option', option: { label: string; value: string }): void;
}>();

// 内部状态，避免直接修改props
const internalSelectedItem = shallowRef<FormItem | null>(null);
const newOptionText = ref('');

// 监听props变化，同步到内部状态
watch(
  () => props.selectedItem,
  (newVal) => {
    // 使用shallowRef和对象展开创建新对象，避免直接引用
    internalSelectedItem.value = newVal ? { ...newVal } : null;
  },
  { immediate: true, deep: true }
);

// 处理项目属性变化
const handleItemChange = () => {
  if (internalSelectedItem.value) {
    // 触发事件，通知父组件更新
    emit('update:selectedItem', { ...internalSelectedItem.value });
  }
};

// 添加选项
const handleAddOption = () => {
  if (!newOptionText.value) return;
  
  const [label, value] = newOptionText.value.split(':');
  if (label && value && internalSelectedItem.value) {
    const option = {
      label: label.trim(),
      value: value.trim()
    };
    
    // 先更新内部状态
    const item = internalSelectedItem.value as OptionFormItem;
    if (!item.options) {
      item.options = [];
    }
    item.options.push(option);
    
    // 通知父组件
    emit('add-option', option);
    emit('update:selectedItem', { ...item });
    
    newOptionText.value = '';
  } else {
    ElMessage.warning('请使用"标签:值"的格式添加选项');
  }
};

// 移除选项
const handleRemoveOption = (index: number) => {
  if (internalSelectedItem.value) {
    const item = internalSelectedItem.value as OptionFormItem;
    if (item.options && item.options.length > index) {
      // 先更新内部状态
      item.options.splice(index, 1);
      
      // 通知父组件
      emit('remove-option', index);
      emit('update:selectedItem', { ...item });
    }
  }
};
</script>

<style scoped>
.properties-panel {
  width: 280px;
  background-color: #f5f7fa;
  border-left: 1px solid #e6e6e6;
  overflow-y: auto;
  height: 100%;
}

.panel-title {
  padding: 15px;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #e6e6e6;
}

.properties-form {
  padding: 15px;
}

.empty-properties {
  padding: 20px;
  text-align: center;
  color: #999;
  margin-top: 20px;
}
</style>
    