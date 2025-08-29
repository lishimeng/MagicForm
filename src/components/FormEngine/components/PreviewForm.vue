<template>
  <el-form 
    :model="formData"
    :rules="formRules"
    label-width="100px"
    class="preview-form"
  >
    <template v-for="(item, index) in formItems" :key="item.id">
      <el-form-item
        :label="item.label"
        :prop="item.field"
        :required="item.required"
      >
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
      </el-form-item>
    </template>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { FormItem } from '../CodeGenerator';

// 定义属性
const props = defineProps<{
  formItems: FormItem[];
  formData: Record<string, any>;
  formRules: Record<string, any[]>;
}>();

// 定义事件
const emit = defineEmits<{
  (e: 'submit'): void;
}>();

// 处理提交
const handleSubmit = () => {
  emit('submit');
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
.preview-form {
  max-width: 600px;
  margin: 0 auto;
}
</style>
  