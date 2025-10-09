<script setup>
import { ElMessage } from "element-plus";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  tags: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const targetTagId = ref(null);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const handleSubmit = () => {
  if (!targetTagId.value) {
    ElMessage.warning("请选择目标标签");
    return;
  }

  const sourceTagIds = props.tags
    .filter((tag) => tag.id !== targetTagId.value)
    .map((tag) => tag.id);

  if (sourceTagIds.length === 0) {
    ElMessage.warning("请至少选择一个源标签");
    return;
  }

  emit("submit", {
    sourceTagIds,
    targetTagId: targetTagId.value,
  });
};

const handleCancel = () => {
  targetTagId.value = null;
  dialogVisible.value = false;
};

watch(dialogVisible, (val) => {
  if (!val) {
    targetTagId.value = null;
  }
});
</script>

<template>
  <el-dialog v-model="dialogVisible" title="合并标签" width="500px" :close-on-click-modal="false">
    <div class="merge-container">
      <div class="tip">
        <el-alert
          title="提示：选择的标签将被合并到目标标签，源标签将被删除"
          type="warning"
          :closable="false"
        />
      </div>

      <div class="tags-list">
        <div class="section-title">已选择的标签：</div>
        <el-tag
          v-for="tag in tags"
          :key="tag.id"
          :color="tag.color"
          size="large"
          style="margin-right: 10px; margin-bottom: 10px"
        >
          {{ tag.name }} ({{ tag.usageCount }}次)
        </el-tag>
      </div>

      <el-form label-width="100px">
        <el-form-item label="目标标签" required>
          <el-select v-model="targetTagId" placeholder="请选择目标标签" style="width: 100%">
            <el-option
              v-for="tag in tags"
              :key="tag.id"
              :label="`${tag.name} (${tag.usageCount}次)`"
              :value="tag.id"
            >
              <div style="display: flex; align-items: center">
                <div
                  :style="{
                    width: '20px',
                    height: '20px',
                    backgroundColor: tag.color,
                    borderRadius: '4px',
                    marginRight: '10px',
                  }"
                />
                <span>{{ tag.name }} ({{ tag.usageCount }}次)</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定合并</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.merge-container {
  .tip {
    margin-bottom: 20px;
  }

  .tags-list {
    margin-bottom: 20px;

    .section-title {
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: bold;
      color: #606266;
    }
  }
}
</style>
