<template>
  <el-dialog 
    title="生成的表单代码" 
    v-model="dialogVisible" 
    width="80%"
    @close="handleClose"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="模板代码" name="template">
        <el-input 
          type="textarea" 
          :rows="15" 
          v-model="internalTemplate"
          readonly
        ></el-input>
      </el-tab-pane>
      <el-tab-pane label="脚本代码" name="script">
        <el-input 
          type="textarea" 
          :rows="15" 
          v-model="internalScript"
          readonly
        ></el-input>
      </el-tab-pane>
      <el-tab-pane label="样式代码" name="style">
        <el-input 
          type="textarea" 
          :rows="15" 
          v-model="internalStyle"
          readonly
        ></el-input>
      </el-tab-pane>
    </el-tabs>
    <div slot="footer">
      <el-button @click="handleCopyCode">复制代码</el-button>
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';

// 定义属性
const props = defineProps<{
  visible: boolean;
  template: string;
  script: string;
  style: string;
}>();

// 定义事件
const emit = defineEmits<{
  (e: 'copy-code'): void;
  (e: 'close'): void;
}>();

// 内部状态，用于v-model绑定
const internalTemplate = ref('');
const internalScript = ref('');
const internalStyle = ref('');
const activeTab = ref('template');
const dialogVisible = ref(false);

// 监听props变化，同步到内部状态
watch(
  () => props.template,
  (newVal) => {
    internalTemplate.value = newVal;
  },
  { immediate: true }
);

watch(
  () => props.script,
  (newVal) => {
    internalScript.value = newVal;
  },
  { immediate: true }
);

watch(
  () => props.style,
  (newVal) => {
    internalStyle.value = newVal;
  },
  { immediate: true }
);

// 监听visible变化，控制对话框显示
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
  },
  { immediate: true }
);

// 处理复制代码
const handleCopyCode = () => {
  emit('copy-code');
};

// 处理关闭
const handleClose = () => {
  emit('close');
};
</script>
    