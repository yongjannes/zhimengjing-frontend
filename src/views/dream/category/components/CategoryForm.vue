<script setup>
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
  categoryTree: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["submit", "cancel"]);

const formRef = ref(null);

// 本地双向绑定 formData
const localFormData = computed({
  get: () => props.formData,
  set: (val) => Object.assign(props.formData, val),
});

// 表单校验规则
const rules = {
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    emit("submit", { ...props.formData });
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    ElMessage.warning("请完善表单信息");
  }
};

// 取消表单
const handleCancel = () => {
  emit("cancel");
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="localFormData"
    :rules="rules"
    label-position="top"
    class="category-form"
  >
    <!-- 基础信息 -->
    <div class="form-section">
      <h3 class="section-title">基础信息</h3>
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="localFormData.name"
          placeholder="请输入分类名称"
          clearable
          maxlength="50"
        />
      </el-form-item>

      <el-form-item label="上级分类" prop="parentId">
        <el-tree-select
          v-model="localFormData.parentId"
          :data="categoryTree"
          :props="{ label: 'name', value: 'id', children: 'children', disabled: 'disabled' }"
          placeholder="请选择上级分类（不选则为顶级分类）"
          clearable
          check-strictly
          :render-after-expand="false"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="localFormData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入分类描述（最多200字）"
          maxlength="200"
          show-word-limit
          clearable
        />
      </el-form-item>
    </div>

    <!-- 样式配置 -->
    <div class="form-section">
      <h3 class="section-title">样式配置</h3>
      <el-form-item label="图标" prop="icon">
        <el-input
          v-model="localFormData.icon"
          placeholder="请输入图标名称（如：Document、Setting 等）"
          clearable
          maxlength="30"
        />
        <div class="hint">
          提示：使用 Element Plus 图标名称，如 <code>Document</code>、<code>Star</code>
        </div>
      </el-form-item>

      <el-form-item label="颜色" prop="color">
        <el-color-picker
          v-model="localFormData.color"
          color-format="hex"
          :show-alpha="false"
          size="medium"
        />
        <span class="color-preview" :style="{ backgroundColor: localFormData.color }" />
      </el-form-item>

      <el-form-item label="排序" prop="sortOrder">
        <el-input-number
          v-model="localFormData.sortOrder"
          :min="0"
          :max="9999"
          controls-position="right"
          style="width: 100%"
        />
        <div class="hint">数字越小排序越靠前</div>
      </el-form-item>
    </div>

    <!-- 状态 -->
    <div class="form-section">
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="localFormData.status">
          <el-radio :value="1" border>启用</el-radio>
          <el-radio :value="0" border>禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </div>

    <!-- 操作按钮 -->
    <div class="form-actions">
      <el-button type="primary" size="large" @click="handleSubmit">确定</el-button>
      <el-button size="large" @click="handleCancel">取消</el-button>
    </div>
  </el-form>
</template>

<style scoped lang="scss">
.category-form {
  max-width: 600px;
  padding: 20px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);

  .form-section {
    padding-bottom: 16px;
    margin-bottom: 24px;
    border-bottom: 1px solid #eee;

    &:last-child {
      margin-bottom: 0;
      border-bottom: none;
    }

    .section-title {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  .el-form-item {
    margin-bottom: 18px;
  }

  .hint {
    margin-top: 6px;
    font-size: 12px;
    color: #909399;
  }

  code {
    padding: 2px 4px;
    font-family: monospace;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .color-preview {
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-left: 12px;
    vertical-align: middle;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 8px;
  }
}
</style>
