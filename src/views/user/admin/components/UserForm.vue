<script setup>
import { ref, watch, onMounted } from "vue";
import { getAllRoles } from "@/api/adminRole.js";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  formData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:visible", "submit"]);

const formRef = ref(null);
const localFormData = ref({});
const roleOptions = ref([]);

// 拷贝 props 数据到本地，避免直接修改 props
watch(
  () => props.formData,
  (newVal) => {
    localFormData.value = { ...newVal };
  },
  { immediate: true, deep: true },
);

// 表单校验规则
const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  realName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  roleId: [{ required: true, message: "请选择角色", trigger: "change" }],
};

// 获取所有角色（过滤掉超级管理员）
const fetchRoles = async () => {
  try {
    const data = await getAllRoles();
    roleOptions.value = data.filter((item) => item.roleName !== "超级管理员" && item.id !== 1);
  } catch (error) {
    console.error("获取角色列表失败:", error);
  }
};

onMounted(() => {
  fetchRoles();
});

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      emit("submit", localFormData.value);
    }
  });
};

// 关闭弹窗
const handleClose = () => {
  formRef.value.resetFields();
  emit("update:visible", false);
};
</script>

<template>
  <el-dialog :model-value="visible" :title="title" width="600px" @close="handleClose">
    <el-form ref="formRef" :model="localFormData" :rules="rules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="localFormData.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="昵称" prop="realName">
        <el-input v-model="localFormData.realName" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item v-if="!localFormData.id" label="密码" prop="password">
        <el-input v-model="localFormData.password" type="password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item label="角色" prop="roleId">
        <el-select v-model="localFormData.roleId" placeholder="请选择角色" style="width: 100%">
          <el-option
            v-for="item in roleOptions"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="localFormData.status"
          :active-value="1"
          :inactive-value="0"
          active-text="正常"
          inactive-text="停用"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
