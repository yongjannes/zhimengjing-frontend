<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useCRUD } from "@/hooks/useCRUD.js";
import * as DreamAPI from "@/api/dream";
import AppSearchForm from "@/components/AppSearchForm/index.vue";
import AppTable from "@/components/AppTable/index.vue";
import DetailDialog from "./components/DetailDialog.vue"; // 导入新组件

// --- 详情弹窗状态 ---
const detailDialogVisible = ref(false);
const currentDreamId = ref(null);
const currentDreamData = ref({}); // 新增：用于存储当前行的数据

// --- 统计数据 ---
const statistics = ref({});
const fetchStatistics = async () => {
  try {
    const response = await DreamAPI.getDreamStatistics();
    statistics.value = response || {};
  } catch (error) {
    statistics.value = {};
    console.error("Failed to fetch statistics:", error);
    ElMessage.error("获取统计信息失败");
  }
};

// --- CRUD Hook ---
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
    list: DreamAPI.getDreamList,
    del: (ids) => DreamAPI.deleteDreams(ids),
  },
  initialQueryParams: {
    userName: "",
    title: "",
    status: null,
    dreamDateStart: null,
    dreamDateEnd: null,
    pageNum: 1,
    pageSize: 10,
  },
  entityName: "梦境",
  afterDelete: () => {
    fetchStatistics();
  },
});

// --- 搜索表单配置 ---
const searchItems = ref([
  { type: "input", label: "用户名", prop: "userName", placeholder: "请输入用户名", width: 220 },
  { type: "input", label: "梦境标题", prop: "title", placeholder: "请输入梦境标题", width: 250 },
  {
    type: "select",
    label: "状态",
    prop: "status",
    placeholder: "请选择状态",
    options: [
      { label: "正常", value: 1 },
      { label: "审核中", value: 2 },
      { label: "已审核", value: 3 },
      { label: "已拒绝", value: 4 },
    ],
    width: 225,
  },
  { type: "date", label: "开始日期", prop: "dreamDateStart", placeholder: "开始日期" },
  { type: "date", label: "结束日期", prop: "dreamDateEnd", placeholder: "结束日期" },
]);

// --- 表格列配置 ---
const tableColumns = ref([
  { type: "selection", width: 55 },
  { type: "index", label: "序号", width: 70 },
  { prop: "userName", label: "用户名", width: 120 },
  { prop: "title", label: "梦境标题", minWidth: 200, showOverflowTooltip: true },
  { prop: "categoryName", label: "分类", width: 100 },
  { prop: "dreamDate", label: "做梦日期", width: 120 },
  { prop: "statusText", label: "状态", width: 100, slot: "status" },
  { prop: "isPublic", label: "是否公开", width: 100, slot: "public" },
  { prop: "viewCount", label: "浏览", width: 80 },
  { prop: "likeCount", label: "点赞", width: 80 },
  { prop: "createTime", label: "创建时间", width: 180 },
]);

// --- 特定业务方法 ---
const multipleSelectionIds = ref([]);
const handleSelectionChange = (selection) => {
  multipleSelectionIds.value = selection.map((item) => item.id);
};

// 查看详情 - 重构
const handleView = (row) => {
  currentDreamId.value = row.id;
  currentDreamData.value = row; // 修改：传递当前行数据
  detailDialogVisible.value = true;
};

// 审核梦境 (单条)
const handleAudit = (row, status) => {
  const statusText = status === 3 ? "通过" : "拒绝";
  ElMessageBox.prompt(
    status === 4 ? "请输入拒绝原因" : "请输入审核备注（可选）",
    `审核 - ${statusText}`,
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPattern: status === 4 ? /.+/ : undefined,
      inputErrorMessage: "拒绝原因不能为空",
    },
  )
    .then(async ({ value }) => {
      try {
        await DreamAPI.auditDreams({
          dreamIds: [row.id],
          status,
          rejectReason: status === 4 ? value : null,
          reviewNotes: value,
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

// 批量审核核心函数
const handleBatchAudit = (status) => {
  if (multipleSelectionIds.value.length === 0) {
    return ElMessage.warning("请至少选择一条数据");
  }
  const statusText = status === 3 ? "通过" : "拒绝";
  ElMessageBox.prompt(
    status === 4 ? "请输入拒绝原因" : `请输入批量审核备注（可选）`,
    `批量审核 - ${statusText}`,
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPattern: status === 4 ? /.+/ : undefined,
      inputErrorMessage: "拒绝原因不能为空",
    },
  )
    .then(async ({ value }) => {
      try {
        await DreamAPI.auditDreams({
          dreamIds: multipleSelectionIds.value,
          status,
          rejectReason: status === 4 ? value : null,
          reviewNotes: value,
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

// 批量通过事件处理
const handleBatchPass = () => {
  handleBatchAudit(3);
};

// 批量拒绝事件处理
const handleBatchReject = () => {
  handleBatchAudit(4);
};

// 删除 (单条)
const handleDelete = (row) => {
  crudDelete(row, `确定要删除梦境【${row.title}】吗？`);
};

// 批量删除
const handleBatchDelete = () => {
  if (multipleSelectionIds.value.length === 0) {
    return ElMessage.warning("请至少选择一条数据");
  }
  crudDelete(
    multipleSelectionIds.value,
    `确定要删除选中的 ${multipleSelectionIds.value.length} 条梦境吗？`,
  );
};

// --- 生命周期 ---
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
            <div>总梦境数</div>
            <div class="value">{{ statistics.totalDreams || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div>审核中</div>
            <div class="value warning">{{ statistics.pendingDreams || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div>已审核</div>
            <div class="value success">{{ statistics.approvedDreams || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div>已拒绝</div>
            <div class="value danger">{{ statistics.rejectedDreams || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div>今日新增</div>
            <div class="value">{{ statistics.todayNewDreams || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div>本周新增</div>
            <div class="value">{{ statistics.weekNewDreams || 0 }}</div>
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
      tableKey="dream-management-table"
      :page-num="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :actions-col-width="220"
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

      <template #status="{ row }">
        <el-tag v-if="row.statusText === '正常'" type="info">正常</el-tag>
        <el-tag v-else-if="row.statusText === '审核中'" type="warning">审核中</el-tag>
        <el-tag v-else-if="row.statusText === '已审核'" type="success">已审核</el-tag>
        <el-tag v-else-if="row.statusText === '已拒绝'" type="danger">已拒绝</el-tag>
      </template>

      <template #public="{ row }">
        <el-tag v-if="row.isPublic" type="success">是</el-tag>
        <el-tag v-else type="info">否</el-tag>
      </template>

      <template #actions="{ row, size }">
        <el-button type="primary" link :size="size" @click="handleView(row)">
          <el-icon><i-ep-View /></el-icon>
          查看
        </el-button>
        <template v-if="row.statusText === '审核中'">
          <el-button type="success" link :size="size" @click="handleAudit(row, 3)">
            <el-icon><i-ep-Check /></el-icon>
            通过
          </el-button>
          <el-button type="warning" link :size="size" @click="handleAudit(row, 4)">
            <el-icon><i-ep-Close /></el-icon>
            拒绝
          </el-button>
        </template>
        <el-button type="danger" link :size="size" @click="handleDelete(row)">
          <el-icon><i-ep-Delete /></el-icon>
          删除
        </el-button>
      </template>
    </AppTable>

    <DetailDialog
      v-model="detailDialogVisible"
      :dream-id="currentDreamId"
      :dream-data-from-list="currentDreamData"
    />
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
