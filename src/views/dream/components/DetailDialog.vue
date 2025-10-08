<script setup>
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import * as DreamAPI from "@/api/dream";
import dayjs from "dayjs";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  dreamId: {
    type: [Number, String],
    default: null,
  },
  dreamDataFromList: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);

const loading = ref(false);
const dreamDetail = ref(null);

// 新增：日期格式化函数
const formatDate = (dateValue) => {
  if (!dateValue) return "暂无";
  if (Array.isArray(dateValue) && dateValue.length >= 3) {
    // 后端返回 [year, month, day] 格式
    return `${dateValue[0]}-${String(dateValue[1]).padStart(2, "0")}-${String(
      dateValue[2],
    ).padStart(2, "0")}`;
  }
  // 如果是标准日期字符串，则直接格式化
  if (dayjs(dateValue).isValid()) {
    return dayjs(dateValue).format("YYYY-MM-DD");
  }
  return dateValue; // 返回原始值以防格式未知
};

const getDetail = async (id) => {
  if (!id) return;
  loading.value = true;
  try {
    const data = await DreamAPI.getDreamDetail(id);
    dreamDetail.value = { ...props.dreamDataFromList, ...data };
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    ElMessage.error("获取梦境详情失败");
    dreamDetail.value = null;
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.modelValue,
  (visible) => {
    if (visible && props.dreamId) {
      getDetail(props.dreamId);
    } else if (!visible) {
      dreamDetail.value = null;
    }
  },
);
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="梦境详情"
    width="60%"
    @update:model-value="(val) => emit('update:modelValue', val)"
  >
    <div v-loading="loading">
      <el-descriptions v-if="dreamDetail" :column="2" border>
        <el-descriptions-item label="ID">{{ dreamDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{
          dreamDetail.userName || "未知"
        }}</el-descriptions-item>

        <el-descriptions-item label="标题" :span="2">{{ dreamDetail.title }}</el-descriptions-item>

        <el-descriptions-item label="梦境内容" :span="2">
          <div style=" line-height: 1.6;white-space: pre-wrap">
            {{ dreamDetail.content || "无" }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="AI解析" :span="2">
          <div style=" line-height: 1.6;white-space: pre-wrap">
            {{ dreamDetail.interpretation || "无" }}
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="分类">{{
          dreamDetail.categoryName || "未分类"
        }}</el-descriptions-item>
        <el-descriptions-item label="做梦日期">{{
          formatDate(dreamDetail.dreamDate)
        }}</el-descriptions-item>

        <el-descriptions-item label="梦前心情">{{
          dreamDetail.moodBefore || "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="梦后心情">{{
          dreamDetail.moodAfter || "无"
        }}</el-descriptions-item>

        <el-descriptions-item label="睡眠质量"
          >{{ dreamDetail.sleepQuality }} / 5</el-descriptions-item
        >
        <el-descriptions-item label="清晰度"
          >{{ dreamDetail.lucidityLevel }} / 5</el-descriptions-item
        >

        <el-descriptions-item label="审核备注" :span="2">
          {{ dreamDetail.reviewNotes || "无" }}
        </el-descriptions-item>

        <el-descriptions-item label="状态">
          <el-tag :type="dreamDetail.status === 3 ? 'success' : 'warning'">
            {{ dreamDetail.statusText || "未知" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="是否公开">
          <el-tag :type="dreamDetail.isPublic ? 'success' : 'info'">
            {{ dreamDetail.isPublic ? "是" : "否" }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="浏览数">{{ dreamDetail.viewCount }}</el-descriptions-item>
        <el-descriptions-item label="点赞数">{{ dreamDetail.likeCount }}</el-descriptions-item>

        <el-descriptions-item label="创建时间">{{ dreamDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{
          formatDate(dreamDetail.reviewedAt)
        }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="暂无数据" />
    </div>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.el-descriptions {
  margin-top: 20px;
}
</style>
