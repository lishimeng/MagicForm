/**
 * 基础表单项目类型
 */
export interface BaseFormItem {
  id: number;
  type: string;
  label: string;
  field: string;
  placeholder?: string;
  required: boolean;
  disabled: boolean;
}

/**
 * 带选项的表单项目类型（下拉选择、单选框组、复选框组）
 */
export interface OptionFormItem extends BaseFormItem {
  options: Array<{
    label: string;
    value: string | number;
  }>;
}

/**
 * 数字类型表单项目
 */
export interface NumberFormItem extends BaseFormItem {
  min?: number;
  max?: number;
}

/**
 * 所有表单项目类型的联合类型
 */
export type FormItem = BaseFormItem | OptionFormItem | NumberFormItem;

/**
 * 代码生成器类，负责生成表单的模板、脚本和样式代码
 */
export class CodeGenerator {
  /**
   * 转义字符串中的特殊字符，避免生成代码时出现语法错误
   * @param str - 需要转义的字符串
   * @returns 转义后的字符串
   */
  private escapeString(str: string): string {
    return str.replace(/'/g, '\\\'').replace(/"/g, '\\"');
  }

  /**
   * 生成模板代码
   * @param formItems - 表单项目列表
   * @returns 生成的模板代码
   */
  generateTemplate(formItems: FormItem[]): string {
    const lines: string[] = [
      '<template>',
      '  <el-form',
      '    ref="form"',
      '    :model="formData"',
      '    :rules="rules"',
      '    label-width="100px">',
    ];
    
    formItems.forEach(item => {
      lines.push(
        '    <el-form-item',
        `      label="${this.escapeString(item.label)}"`,
        `      prop="${item.field}"`,
        `      :required="${item.required}">`
      );
      
      switch(item.type) {
        case 'input':
          lines.push(
            `      <el-input v-model="formData.${item.field}" ` +
            `placeholder="${this.escapeString(item.placeholder || `请输入${item.label}`)}" ` +
            `:disabled="${item.disabled}"></el-input>`
          );
          break;
          
        case 'textarea':
          lines.push(
            `      <el-input type="textarea" v-model="formData.${item.field}" ` +
            `placeholder="${this.escapeString(item.placeholder || `请输入${item.label}`)}" ` +
            `:disabled="${item.disabled}"></el-input>`
          );
          break;
          
        case 'number': {
          const numberItem = item as NumberFormItem;
          lines.push(
            `      <el-input-number v-model="formData.${item.field}" ` +
            `:min="${numberItem.min || 0}" :max="${numberItem.max || 1000}" ` +
            `:disabled="${item.disabled}"></el-input-number>`
          );
          break;
        }
          
        case 'select': {
          const optionItem = item as OptionFormItem;
          lines.push(
            `      <el-select v-model="formData.${item.field}" ` +
            `placeholder="${this.escapeString(item.placeholder || `请选择${item.label}`)}" ` +
            `:disabled="${item.disabled}">`
          );
          optionItem.options.forEach(option => {
            lines.push(
              `        <el-option label="${this.escapeString(option.label)}" ` +
              `value="${option.value}"></el-option>`
            );
          });
          lines.push('      </el-select>');
          break;
        }
          
        case 'radio': {
          const optionItem = item as OptionFormItem;
          lines.push(
            `      <el-radio-group v-model="formData.${item.field}" ` +
            `:disabled="${item.disabled}">`
          );
          optionItem.options.forEach(option => {
            lines.push(
              `        <el-radio label="${option.value}">` +
              `${this.escapeString(option.label)}</el-radio>`
            );
          });
          lines.push('      </el-radio-group>');
          break;
        }
          
        case 'checkbox': {
          const optionItem = item as OptionFormItem;
          lines.push(
            `      <el-checkbox-group v-model="formData.${item.field}" ` +
            `:disabled="${item.disabled}">`
          );
          optionItem.options.forEach(option => {
            lines.push(
              `        <el-checkbox label="${option.value}">` +
              `${this.escapeString(option.label)}</el-checkbox>`
            );
          });
          lines.push('      </el-checkbox-group>');
          break;
        }
          
        case 'date':
          lines.push(
            `      <el-date-picker`,
            `        v-model="formData.${item.field}"`,
            `        type="date"`,
            `        placeholder="${this.escapeString(item.placeholder || `请选择${item.label}`)}"`,
            `        :disabled="${item.disabled}">`,
            `      </el-date-picker>`
          );
          break;
          
        case 'switch':
          lines.push(
            `      <el-switch v-model="formData.${item.field}" ` +
            `:disabled="${item.disabled}"></el-switch>`
          );
          break;
      }
      
      lines.push('    </el-form-item>');
    });
    
    lines.push(
      '    <el-form-item>',
      '      <el-button type="primary" @click="handleSubmit">提交</el-button>',
      '    </el-form-item>',
      '  </el-form>',
      '</template>'
    );
    
    return lines.join('\n');
  }
  
  /**
   * 生成脚本代码
   * @param formItems - 表单项目列表
   * @returns 生成的脚本代码
   */
  generateScript(formItems: FormItem[]): string {
    const lines: string[] = [
      '<script setup lang="ts">',
      'import { ref, reactive } from \'vue\';',
      'import { ElMessage, ElForm } from \'element-plus\';',
      '',
      // 生成表单数据类型接口
      'interface FormData {',
    ];
    
    formItems.forEach(item => {
      let type = 'string';
      if (item.type === 'checkbox') {
        type = 'string[]';
      } else if (item.type === 'number') {
        type = 'number';
      } else if (item.type === 'switch') {
        type = 'boolean';
      } else if (item.type === 'date') {
        type = 'Date | null';
      }
      lines.push(`  ${item.field}: ${type};`);
    });
    
    lines.push(
      '}',
      '',
      // 生成表单数据
      '// 表单数据',
      'const formData = reactive<FormData>({',
    );
    
    const dataEntries = formItems.map(item => {
      let value = "''";
      if (item.type === 'checkbox') {
        value = '[]';
      } else if (item.type === 'number') {
        value = '0';
      } else if (item.type === 'switch') {
        value = 'false';
      } else if (item.type === 'date') {
        value = 'null';
      }
      return `  ${item.field}: ${value}`;
    });
    
    lines.push(dataEntries.join(',\n'));
    lines.push('});', '');
    
    // 生成验证规则
    lines.push('// 表单验证规则');
    lines.push('const rules = reactive<Record<string, any[]>>({');
    
    const requiredItems = formItems.filter(item => item.required);
    const ruleEntries = requiredItems.map(item => {
      return `  ${item.field}: [\n    { required: true, message: '请输入${this.escapeString(item.label)}', trigger: '${item.type === 'select' ? 'change' : 'blur'}' }\n  ]`;
    });
    
    lines.push(ruleEntries.join(',\n'));
    lines.push('});', '');
    
    // 表单引用和提交方法
    lines.push('// 表单引用');
    lines.push('const form = ref<InstanceType<typeof ElForm> | null>(null);', '');
    lines.push('// 提交表单');
    lines.push('const handleSubmit = () => {');
    lines.push('  if (!form.value) return;');
    lines.push('  form.value.validate((valid) => {');
    lines.push('    if (valid) {');
    lines.push('      ElMessage.success(\'提交成功\');');
    lines.push('      console.log(\'表单数据:\', formData);');
    lines.push('    } else {');
    lines.push('      ElMessage.error(\'请完善表单信息\');');
    lines.push('      return false;');
    lines.push('    }');
    lines.push('  });');
    lines.push('};');
    lines.push('</script>');
    
    return lines.join('\n');
  }
  
  /**
   * 生成样式代码
   * @returns 生成的样式代码
   */
  generateStyle(): string {
    const lines: string[] = [
      '<style scoped>',
      '.el-form {',
      '  max-width: 600px;',
      '  margin: 20px auto;',
      '  padding: 20px;',
      '  border: 1px solid #e6e6e6;',
      '  border-radius: 4px;',
      '}',
      '.el-form-item {',
      '  margin-bottom: 15px;',
      '}',
      '</style>'
    ];
    
    return lines.join('\n');
  }
}
  