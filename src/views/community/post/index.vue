<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useCRUD } from "@/hooks/useCRUD.js";
import * as CommunityAPI from "@/api/community";

// ==================== 统计数据 ====================
const statistics = ref({
  totalPosts: 0,
  pendingPosts: 0,
  approvedPosts: 0,
  rejectedPosts: 0,
  todayNewPosts: 0,
  weekNewPosts: 0,
});

const fetchStatistics = async () => {
  try {
    const response = await CommunityAPI.getPostStatistics();
    statistics.value = response;
  } catch (error) {
    console.error("Failed to fetch statistics:", error);
  }
};

// ==================== CRUD Hook ====================
const {
  loading,
  tableData,
  total,
  queryParams,
  handleQuery,
  resetQuery,
  handleDelete: crudDelete,
  getList,
} = useCRUD({
  api: {
    list: CommunityAPI.getPostList,
    del: (ids) => CommunityAPI.deletePosts(ids),
  },
  initialQueryParams: {
    userName: "",
    title: "",
    content: "",
    status: null,
    isTop: null,
    isHot: null,
    categoryId: null,
    createTimeStart: null,
    createTimeEnd: null,
    pageNum: 1,
    pageSize: 5,
  },
  entityName: "帖子",
});

// ==================== 搜索表单配置 ====================
const searchItems = ref([
  { type: "input", label: "用户名", prop: "userName", placeholder: "请输入用户名", width: 200 },
  { type: "input", label: "帖子标题", prop: "title", placeholder: "请输入帖子标题", width: 250 },
  { type: "input", label: "帖子内容", prop: "content", placeholder: "请输入帖子内容", width: 250 },
  {
    type: "select",
    label: "状态",
    prop: "status",
    placeholder: "请选择状态",
    options: [
      { label: "待审核", value: 0 },
      { label: "已通过", value: 1 },
      { label: "已拒绝", value: 2 },
      { label: "已删除", value: 3 },
    ],
    width: 225,
  },
  {
    type: "select",
    label: "是否置顶",
    prop: "isTop",
    placeholder: "请选择",
    options: [
      { label: "是", value: 1 },
      { label: "否", value: 0 },
    ],
    width: 200,
  },
  {
    type: "select",
    label: "是否热门",
    prop: "isHot",
    placeholder: "请选择",
    options: [
      { label: "是", value: 1 },
      { label: "否", value: 0 },
    ],
    width: 200,
  },
  { type: "date", label: "开始日期", prop: "createTimeStart", placeholder: "开始日期", width: 225 },
  { type: "date", label: "结束日期", prop: "createTimeEnd", placeholder: "结束日期", width: 225 },
]);

// ==================== 表格列配置 ====================
const tableColumns = ref([
  { type: "selection", width: 55 },
  { type: "index", label: "序号", width: 70 },
  { prop: "userInfo", label: "用户信息", width: 200, slot: "userInfo" },
  { prop: "title", label: "帖子标题", minWidth: 200, showOverflowTooltip: true },
  { prop: "images", label: "图片", width: 120, slot: "images" },
  { prop: "contentText", label: "帖子内容", minWidth: 300, showOverflowTooltip: true },
  { prop: "categoryName", label: "分类", width: 120 },
  { prop: "tags", label: "标签", width: 200, slot: "tags" },
  { prop: "statusText", label: "状态", width: 100, slot: "status" },
  { prop: "viewCount", label: "浏览", width: 80 },
  { prop: "likeCount", label: "点赞", width: 80 },
  { prop: "commentCount", label: "评论", width: 80 },
  { prop: "shareCount", label: "分享", width: 80 },
  { prop: "collectCount", label: "收藏", width: 80 },
  { prop: "isAnonymous", label: "是否匿名", width: 100, slot: "isAnonymous" },
  { prop: "isTop", label: "置顶", width: 80, slot: "isTop" },
  { prop: "isHot", label: "热门", width: 80, slot: "isHot" },
  { prop: "rejectReason", label: "拒绝原因", minWidth: 150, showOverflowTooltip: true },
  { prop: "adminRemark", label: "管理员备注", minWidth: 150, showOverflowTooltip: true },
  { prop: "publishedAt", label: "发布时间", width: 180 },
  { prop: "lastCommentedAt", label: "最后评论", width: 180 },
  { prop: "updateTime", label: "更新时间", width: 180 },
]);

// 解析图片JSON字符串
const getImages = (jsonString) => {
  if (!jsonString) return [];
  try {
    // 如果已经是对象，则直接返回
    if (typeof jsonString === "object") {
      if (Array.isArray(jsonString.images)) return jsonString.images;
      if (Array.isArray(jsonString)) return jsonString;
      return [];
    }
    const data = JSON.parse(jsonString);
    if (data && Array.isArray(data.images)) {
      return data.images;
    }
    if (Array.isArray(data)) {
      return data;
    }
  } catch (e) {
    console.error("解析图片JSON失败:", e, jsonString);
    return [];
  }
  return [];
};

// ==================== 选中的ID列表 ====================
const multipleSelectionIds = ref([]);
const handleSelectionChange = (selection) => {
  multipleSelectionIds.value = selection.map((item) => item.id);
};

// ==================== 审核帖子 ====================
const handleAudit = (row, status) => {
  const statusText = status === 1 ? "通过" : "拒绝";
  ElMessageBox.prompt(
    status === 2 ? "请输入拒绝原因" : "请输入审核备注（可选）",
    `审核 - ${statusText}`,
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPattern: status === 2 ? /.+/ : undefined,
      inputErrorMessage: "拒绝原因不能为空",
    },
  )
    .then(async ({ value }) => {
      try {
        await CommunityAPI.auditPosts({
          postIds: [row.id],
          status,
          rejectReason: status === 2 ? value : null,
          adminRemark: value,
        });
        ElMessage.success(`审核${statusText}成功`);
        getList();
        fetchStatistics();
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        ElMessage.error(`审核${statusText}失败`);
      }
    })
    .catch(() => {});
};

// ==================== 批量审核 ====================
const handleBatchAudit = (status) => {
  if (multipleSelectionIds.value.length === 0) {
    return ElMessage.warning("请至少选择一条数据");
  }
  const statusText = status === 1 ? "通过" : "拒绝";
  ElMessageBox.prompt(
    status === 2 ? "请输入拒绝原因" : `请输入批量审核备注（可选）`,
    `批量审核 - ${statusText}`,
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPattern: status === 2 ? /.+/ : undefined,
      inputErrorMessage: "拒绝原因不能为空",
    },
  )
    .then(async ({ value }) => {
      try {
        await CommunityAPI.auditPosts({
          postIds: multipleSelectionIds.value,
          status,
          rejectReason: status === 2 ? value : null,
          adminRemark: value,
        });
        ElMessage.success(`批量审核${statusText}成功`);
        getList();
        fetchStatistics();
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        ElMessage.error(`批量审核${statusText}失败`);
      }
    })
    .catch(() => {});
};

// ==================== 批量通过 ====================
const handleBatchPass = () => {
  handleBatchAudit(1);
};

// ==================== 批量拒绝 ====================
const handleBatchReject = () => {
  handleBatchAudit(2);
};

// ==================== 切换置顶 ====================
const handleToggleTop = async (row) => {
  try {
    await CommunityAPI.togglePostTop(row.id);
    ElMessage.success("操作成功");
    getList();
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    ElMessage.error("操作失败");
  }
};

// ==================== 切换热门 ====================
const handleToggleHot = async (row) => {
  try {
    await CommunityAPI.togglePostHot(row.id);
    ElMessage.success("操作成功");
    getList();
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    ElMessage.error("操作失败");
  }
};

// ==================== 删除 ====================
const handleDelete = (row) => {
  crudDelete(row, `确定要删除该帖子吗？`);
};

// ==================== 批量删除 ====================
const handleBatchDelete = () => {
  if (multipleSelectionIds.value.length === 0) {
    return ElMessage.warning("请至少选择一条数据");
  }
  crudDelete(
    multipleSelectionIds.value,
    `确定要删除选中的 ${multipleSelectionIds.value.length} 条帖子吗？`,
  );
};

// ==================== 生命周期 ====================
onMounted(() => {
  fetchStatistics();
});
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div>总帖子数</div>
            <div class="value">{{ statistics.totalPosts || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div>待审核</div>
            <div class="value warning">{{ statistics.pendingPosts || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div>已通过</div>
            <div class="value success">{{ statistics.approvedPosts || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div>已拒绝</div>
            <div class="value danger">{{ statistics.rejectedPosts || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div>今日新增</div>
            <div class="value">{{ statistics.todayNewPosts || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div>本周新增</div>
            <div class="value">{{ statistics.weekNewPosts || 0 }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <AppSearchForm
      v-model="queryParams"
      :items="searchItems"
      :default-visible-count="3"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <AppTable
      :columns="tableColumns"
      :data="tableData"
      :loading="loading"
      :total="total"
      table-key="community-post-table"
      :page-num="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :actions-col-width="280"
      @selection-change="handleSelectionChange"
      @refresh="getList"
      @update:page-num="(val) => (queryParams.pageNum = val)"
      @update:page-size="(val) => (queryParams.pageSize = val)"
    >
      <template #toolbar>
        <el-button type="success" plain @click="handleBatchPass">
          <el-icon><i-ep-Select /></el-icon>
          批量通过
        </el-button>
        <el-button type="warning" plain @click="handleBatchReject">
          <el-icon><i-ep-CloseBold /></el-icon>
          批量拒绝
        </el-button>
        <el-button type="danger" plain @click="handleBatchDelete">
          <el-icon><i-ep-Delete /></el-icon>
          批量删除
        </el-button>
      </template>

      <template #userInfo="{ row }">
        <div style="display: flex; align-items: center">
          <el-avatar :size="40" :src="row.userAvatar" style="margin-right: 10px" />
          <div>
            <div>{{ row.userNickname }}</div>
            <div style="font-size: 12px; color: #999">{{ row.userName }}</div>
          </div>
        </div>
      </template>

      <template #images="{ row }">
        <el-image
          v-if="row.images && getImages(row.images).length > 0"
          :src="getImages(row.images)[0].url"
          :preview-src-list="getImages(row.images).map((img) => img.url)"
          style="width: 100px; height: 100px"
          fit="cover"
          :preview-teleported="true"
        />

        <span v-else>无图</span>
      </template>

      <template #tags="{ row }">
        <el-tag
          v-for="tag in row.tags ? JSON.parse(row.tags) : []"
          :key="tag"
          style="margin-right: 5px"
        >
          {{ tag }}
        </el-tag>
      </template>

      <template #status="{ row }">
        <el-tag v-if="row.statusText === '待审核'" type="warning">待审核</el-tag>
        <el-tag v-else-if="row.statusText === '已通过'" type="success">已通过</el-tag>
        <el-tag v-else-if="row.statusText === '已拒绝'" type="danger">已拒绝</el-tag>
        <el-tag v-else-if="row.statusText === '已删除'" type="info">已删除</el-tag>
      </template>

      <template #isAnonymous="{ row }">
        <el-tag :type="row.isAnonymous ? 'success' : 'info'">
          {{ row.isAnonymous ? "是" : "否" }}
        </el-tag>
      </template>

      <template #isTop="{ row }">
        <el-tag v-if="row.isTop === 1" type="success">是</el-tag>
        <el-tag v-else type="info">否</el-tag>
      </template>

      <template #isHot="{ row }">
        <el-tag v-if="row.isHot === 1" type="danger">是</el-tag>
        <el-tag v-else type="info">否</el-tag>
      </template>

      <template #actions="{ row, size }">
        <template v-if="row.statusText === '待审核'">
          <el-button type="success" link :size="size" @click="handleAudit(row, 1)">
            <el-icon><i-ep-Check /></el-icon>
            通过
          </el-button>
          <el-button type="warning" link :size="size" @click="handleAudit(row, 2)">
            <el-icon><i-ep-Close /></el-icon>
            拒绝
          </el-button>
        </template>

        <el-button type="primary" link :size="size" @click="handleToggleTop(row)">
          <el-icon><i-ep-Top /></el-icon>
          {{ row.isTop === 1 ? "取消置顶" : "置顶" }}
        </el-button>
        <el-button type="danger" link :size="size" @click="handleToggleHot(row)">
          <el-icon><i-ep-Star /></el-icon>
          {{ row.isHot === 1 ? "取消热门" : "热门" }}
        </el-button>

        <el-button type="danger" link :size="size" @click="handleDelete(row)">
          <el-icon><i-ep-Delete /></el-icon>
          删除
        </el-button>
      </template>
    </AppTable>
  </div>
</template>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.stat-card {
  padding: 10px 0;
  text-align: center;

  div:first-child {
    margin-bottom: 10px;
    font-size: 14px;
    color: #909399;
  }

  .value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;

    &.success {
      color: #67c23a;
    }

    &.warning {
      color: #e6a23c;
    }

    &.danger {
      color: #f56c6c;
    }
  }
}
</style>
