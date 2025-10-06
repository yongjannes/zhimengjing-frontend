<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: "" },
  formData: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:visible", "submit"]);

const formRef = ref(null);
const localFormData = ref({});

watch(
  () => props.formData,
  (newVal) => {
    localFormData.value = { ...newVal };
  },
  { immediate: true, deep: true },
);

const rules = {
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  userLevel: [{ required: true, message: "请选择用户等级", trigger: "change" }],
  status: [{ required: true, message: "请选择用户状态", trigger: "change" }],
};

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      emit("submit", localFormData.value);
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
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户名">
            <el-input v-model="localFormData.username" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="localFormData.nickname" placeholder="请输入昵称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邮箱">
            <el-input v-model="localFormData.email" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号">
            <el-input v-model="localFormData.phone" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别">
            <el-radio-group v-model="localFormData.gender">
              <el-radio :label="0">未知</el-radio>
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生日">
            <el-date-picker
              v-model="localFormData.birthday"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户等级" prop="userLevel">
            <el-select v-model="localFormData.userLevel" placeholder="请选择" style="width: 100%">
              <el-option label="普通用户" :value="1" />
              <el-option label="VIP用户" :value="2" />
              <el-option label="高级VIP用户" :value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户状态" prop="status">
            <el-select v-model="localFormData.status" placeholder="请选择" style="width: 100%">
              <el-option label="正常" :value="1" />
              <el-option label="禁用" :value="0" />
              <el-option label="待审核" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="可用积分">
            <el-input-number v-model="localFormData.availablePoints" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="账户余额">
            <el-input-number
              v-model="localFormData.balance"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="个性签名">
        <el-input
          v-model="localFormData.signature"
          type="textarea"
          :rows="3"
          placeholder="请输入个性签名"
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
