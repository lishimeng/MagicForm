<template>
  <div class="form-lowcode-engine">
    <!-- 顶部导航 -->
    <el-header class="header">
      <div class="logo">Form Designer</div>
      <el-button-group>
        <el-button type="primary" @click="previewVisible = true">
          <i class="el-icon-view"></i> 预览
        </el-button>
        <el-button type="success" @click="handleGenerateCode">
          <i class="el-icon-code"></i> 生成代码
        </el-button>
        <el-button @click="resetForm">
          <i class="el-icon-refresh"></i> 重置
        </el-button>
      </el-button-group>
    </el-header>

    <div class="main-container">
      <!-- 左侧组件面板 -->
      <ComponentPanel 
        @drag-start="handleDragStart"
      />

      <!-- 中间画布区域 -->
      <CanvasArea 
        :formItems="formItems"
        :formData="formData"
        :formRules="formRules"
        @drop="handleDrop"
        @select-item="handleSelectItem"
        @remove-item="handleRemoveItem"
      />

      <!-- 右侧属性配置面板 -->
      <PropertiesPanel 
        :selectedItem="selectedItem"
        :newOptionText="newOptionText"
        @update:newOptionText="val => newOptionText = val"
        @add-option="handleAddOption"
        @remove-option="handleRemoveOption"
      />
    </div>

    <!-- 预览弹窗 -->
    <el-dialog 
      title="表单预览" 
      v-model="previewVisible" 
      width="60%"
    >
      <PreviewForm 
        :formItems="formItems"
        :formData="formData"
        :formRules="formRules"
        @submit="handleSubmit"
      />
    </el-dialog>

    <!-- 代码生成弹窗 -->
    <el-dialog 
      title="生成的表单代码" 
      v-model="codeVisible" 
      width="80%"
    >
      <CodePreview 
        :template="generatedTemplate"
        :script="generatedScript"
        :style="generatedStyle"
        @copy-code="copyCode"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage, ElForm } from 'element-plus';
import ComponentPanel from './components/ComponentPanel.vue';
import CanvasArea from './components/CanvasArea.vue';
import PropertiesPanel from './components/PropertiesPanel.vue';
import PreviewForm from './components/PreviewForm.vue';
import CodePreview from './components/CodePreview.vue';
import type { FormItem, BaseFormItem, OptionFormItem } from './CodeGenerator.ts';
import { CodeGenerator } from './CodeGenerator.ts'

// 初始化代码生成器
const codeGenerator = new CodeGenerator();

// 表单配置
const formConfig = reactive({
  formName: '样例表单'
});

// 表单数据
const formData = reactive<Record<string, any>>({});

// 表单验证规则
const formRules = reactive<Record<string, any[]>>({});

// 表单项目列表
const formItems = ref<FormItem[]>([]);

// 当前选中的项目
const selectedItem = ref<FormItem | null>(null);

// 新选项文本
const newOptionText = ref('');

// 预览弹窗可见性
const previewVisible = ref(false);

// 代码弹窗可见性
const codeVisible = ref(false);

// 生成的代码
const generatedTemplate = ref('');
const generatedScript = ref('');
const generatedStyle = ref('');

// 处理拖拽开始 - 修复拖拽失效问题
const handleDragStart = (event: DragEvent, component: { type: string; label: string }) => {
  if (event.dataTransfer) {
    // 使用JSON.stringify确保数据正确传递
    event.dataTransfer.setData('application/json', JSON.stringify(component));
    // 设置拖拽图像，增强用户体验
    const dragImage = document.createElement('div');
    dragImage.textContent = component.label;
    dragImage.style.position = 'absolute';
    dragImage.style.left = '-1000px';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 0, 0);
  }
};

// 处理放置 - 修复组件放下后消失的问题
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  
  if (event.dataTransfer) {
    try {
      // 获取拖拽的数据
      const componentData = event.dataTransfer.getData('application/json');
      if (componentData) {
        const component = JSON.parse(componentData);
        addComponent(component);
      }
    } catch (error) {
      console.error('处理拖拽数据失败:', error);
      ElMessage.error('添加组件失败');
    }
  }
};

// 添加组件
const addComponent = (component: { type: string; label: string }) => {
  // 生成唯一ID和字段名
  const id = Date.now();
  const field = `${component.type}_${id}`;
  
  // 基础配置
  const baseItem: BaseFormItem = {
    id,
    type: component.type,
    label: component.label,
    field,
    placeholder: `请输入${component.label}`,
    required: false,
    disabled: false
  };
  
  // 根据组件类型添加特定配置
  let item: FormItem;
  
  if (['select', 'radio', 'checkbox'].includes(component.type)) {
    item = {
      ...baseItem,
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' }
      ]
    };
  } else if (component.type === 'number') {
    item = {
      ...baseItem,
      min: 0,
      max: 1000
    };
  } else {
    item = baseItem;
  }
  
  // 添加到表单项目
  formItems.value.push(item);
  
  // 初始化表单数据
  if (component.type === 'checkbox') {
    formData[field] = [];
  } else if (component.type === 'switch') {
    formData[field] = false;
  } else if (component.type === 'number') {
    formData[field] = 0;
  } else if (component.type === 'date') {
    formData[field] = null;
  } else {
    formData[field] = '';
  }
  
  // 选中新添加的项目
  selectedItem.value = item;
};

// 处理选择项目
const handleSelectItem = (item: FormItem) => {
  selectedItem.value = item;
};

// 处理移除项目
const handleRemoveItem = (index: number) => {
  const field = formItems.value[index].field;
  // 从表单数据中移除
  delete formData[field];
  // 从表单项目中移除
  formItems.value.splice(index, 1);
  // 重置选中项
  if (selectedItem.value && !formItems.value.includes(selectedItem.value)) {
    selectedItem.value = null;
  }
};

// 处理添加选项
const handleAddOption = (item: OptionFormItem) => {
  if (!newOptionText.value) return;
  
  const [label, value] = newOptionText.value.split(':');
  if (label && value) {
    item.options.push({
      label: label.trim(),
      value: value.trim()
    });
    newOptionText.value = '';
  } else {
    ElMessage.warning('请使用"标签:值"的格式添加选项');
  }
};

// 处理移除选项
const handleRemoveOption = (item: OptionFormItem, index: number) => {
  item.options.splice(index, 1);
};

// 处理提交
const handleSubmit = () => {
  // 实际项目中可以在这里处理表单提交逻辑
  ElMessage.success('提交成功');
  console.log('表单数据:', formData);
};

// 生成代码
const handleGenerateCode = () => {
  if (formItems.value.length === 0) {
    ElMessage.warning('请先添加表单组件');
    return;
  }
  
  // 使用代码生成器生成代码
  generatedTemplate.value = codeGenerator.generateTemplate(formItems.value);
  generatedScript.value = codeGenerator.generateScript(formItems.value);
  generatedStyle.value = codeGenerator.generateStyle();
  
  codeVisible.value = true;
};

// 复制代码
const copyCode = () => {
  const code = generatedTemplate.value + '\n\n' + generatedScript.value + '\n\n' + generatedStyle.value;
  navigator.clipboard.writeText(code).then(() => {
    ElMessage.success('代码复制成功');
  }).catch(() => {
    ElMessage.error('代码复制失败，请手动复制');
  });
};

// 重置表单
const resetForm = () => {
  formItems.value = [];
  // 清空表单数据
  Object.keys(formData).forEach(key => {
    delete formData[key];
  });
  // 清空验证规则
  Object.keys(formRules).forEach(key => {
    delete formRules[key];
  });
  selectedItem.value = null;
  formConfig.formName = '我的表单';
  ElMessage.success('表单已重置');
};

// 监听表单项目变化，动态更新验证规则
watch(
  formItems,
  (newItems) => {
    // 清空现有规则
    Object.keys(formRules).forEach(key => {
      delete formRules[key];
    });
    
    // 添加新规则
    newItems.forEach(item => {
      if (item.required) {
        formRules[item.field] = [
          { 
            required: true, 
            message: `请输入${item.label}`, 
            trigger: item.type === 'select' ? 'change' : 'blur'
          }
        ];
      }
    });
  },
  { deep: true }
);
</script>

<style scoped>
.form-lowcode-engine {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #1890ff;
  color: white;
  height: 60px;
}

.logo {
  font-size: 18px;
  font-weight: bold;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
  