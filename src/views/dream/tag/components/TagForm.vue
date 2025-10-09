<script setup>
import { ElMessage } from "element-plus";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["submit", "cancel"]);

const formRef = ref(null);

const rules = {
  name: [
    { required: true, message: "请输入标签名称", trigger: "blur" },
    { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" },
  ],
  color: [
    {
      pattern: /^#[0-9A-Fa-f]{6}$/,
      message: "颜色格式不正确，应为 #RRGGBB",
      trigger: "blur",
    },
  ],
  description: [{ max: 500, message: "长度不能超过 500 个字符", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    emit("submit", props.formData);
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    ElMessage.warning("请检查表单输入");
  }
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="100px"
    label-position="right"
  >
    <el-form-item label="标签名称" prop="name">
      <el-input
        v-model="formData.name"
        placeholder="请输入标签名称"
        maxlength="50"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="标签颜色" prop="color">
      <el-color-picker v-model="formData.color" :show-alpha="false" />
      <span v-if="formData.color" class="color-text">{{ formData.color }}</span>
    </el-form-item>

    <el-form-item label="标签描述" prop="description">
      <el-input
        v-model="formData.description"
        type="textarea"
        :rows="4"
        placeholder="请输入标签描述"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="formData.status">
        <el-radio :label="1">启用</el-radio>
        <el-radio :label="0">禁用</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
.color-text {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
}
</style>
