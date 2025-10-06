<script setup>
import { ref, watch, onMounted } from "vue";
import { getPermissionOptions } from "@/api/option";
import { ElMessage } from "element-plus";

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: "" },
  formData: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:visible", "submit"]);

const formRef = ref(null);
const localFormData = ref({});

// --- 下拉选项 ---
const permissionOptions = ref([]);

// --- API: 获取权限选项 ---
const fetchOptions = async () => {
  try {
    permissionOptions.value = await getPermissionOptions();
  } catch (error) {
    console.error("获取权限选项失败:", error);
    ElMessage.error("获取权限选项失败");
  }
};

// --- 生命周期 ---
onMounted(() => {
  fetchOptions();
});

// --- 监听器 ---
watch(
  () => props.formData,
  (newVal) => {
    // 深拷贝数据
    const data = JSON.parse(JSON.stringify(newVal || {}));

    // 兼容处理后端返回的 permissions 字符串
    if (data.permissions && typeof data.permissions === "string") {
      try {
        data.permissions = JSON.parse(data.permissions);
      } catch (e) {
        console.error("解析权限数据失败:", e);
        data.permissions = [];
      }
    } else if (!Array.isArray(data.permissions)) {
      data.permissions = [];
    }

    localFormData.value = data;
  },
  { immediate: true, deep: true },
);

// --- 表单校验 ---
const rules = {
  roleName: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  roleCode: [
    { required: true, message: "请输入角色编码", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "角色编码只能包含字母、数字和下划线",
      trigger: "blur",
    },
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

// --- 事件处理 ---
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      const submitData = {
        ...localFormData.value,
        permissions: localFormData.value.permissions || [],
      };
      emit("submit", submitData);
    }
  });
};

const handleClose = () => {
  formRef.value.resetFields();
  emit("update:visible", false);
};
</script>

<template>
  <el-dialog :model-value="visible" :title="title" width="700px" @close="handleClose">
    <el-form ref="formRef" :model="localFormData" :rules="rules" label-width="100px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="localFormData.roleName" placeholder="请输入角色名称" />
      </el-form-item>

      <el-form-item label="角色编码" prop="roleCode">
        <el-input
          v-model="localFormData.roleCode"
          placeholder="请输入角色编码 (如: editor)"
          :disabled="!!localFormData.id"
        />
      </el-form-item>

      <el-form-item label="角色描述">
        <el-input
          v-model="localFormData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入角色描述"
        />
      </el-form-item>

      <el-form-item label="权限配置">
        <el-select
          v-model="localFormData.permissions"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择权限"
          style="width: 100%"
        >
          <el-option
            v-for="item in permissionOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="localFormData.status"
          :active-value="1"
          :inactive-value="0"
          active-text="启用"
          inactive-text="禁用"
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
