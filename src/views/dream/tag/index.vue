<script setup>
import { ElMessage } from "element-plus";
import { useCRUD } from "@/hooks/useCRUD.js";
import * as TagAPI from "@/api/tag.js";
import TagForm from "./components/TagForm.vue";
import MergeTagDialog from "./components/MergeTagDialog.vue";

// --- 搜索表单配置 ---
const searchItems = ref([
  {
    type: "input",
    label: "标签名称",
    prop: "name",
    placeholder: "请输入标签名称",
  },
  {
    type: "select",
    label: "状态",
    prop: "isActive",
    placeholder: "请选择状态",
    options: [
      { label: "启用", value: 1 },
      { label: "禁用", value: 0 },
    ],
    width: 225,
  },
]);

// --- 工具函数 ---
const transformStatusToIsActive = (data) => {
  const payload = { ...data, isActive: data.status === 1 };
  delete payload.status;
  delete payload.usageCount;
  delete payload.seq;
  return payload;
};

// --- CRUD ---
const {
  loading,
  tableData,
  total,
  queryParams,
  dialogVisible,
  dialogTitle,
  formData,
  handleQuery,
  resetQuery,
  handleSelectionChange: crudHandleSelectionChange,
  handleDelete: crudDelete,
  handleFormSubmit: crudHandleFormSubmit,
  getList,
} = useCRUD({
  api: {
    list: TagAPI.getTagsByPage,
    add: (data) => TagAPI.addTag(transformStatusToIsActive(data)),
    update: (id, data) => TagAPI.updateTag(id, transformStatusToIsActive(data)),
    del: (ids) => TagAPI.deleteTag(ids),
    getById: TagAPI.getTagById,
  },
  initialQueryParams: {
    name: "",
    isActive: null,
    pageNum: 1,
    pageSize: 5,
  },
  formatData: (item, index, params) => {
    return {
      ...item,
      status: item.isActive ? 1 : 0,
      seq: (params.pageNum - 1) * params.pageSize + index + 1,
    };
  },
  entityName: "梦境标签",
});

// --- 修改标签 ---
const handleUpdateEnhanced = async (row) => {
  if (!row || !row.id) {
    ElMessage.error("无法获取标签ID，请检查数据来源");
    return;
  }
  try {
    const data = await TagAPI.getTagById(row.id);
    dialogTitle.value = `修改梦境标签 - ${data.name}`;
    Object.assign(formData.value, {
      ...data,
      status: data.isActive ? 1 : 0,
    });
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error(`获取标签详情失败: ${error.message || "未知错误"}`);
  }
};

// --- 新增标签 ---
const handleAddEnhanced = () => {
  dialogTitle.value = `新增梦境标签`;
  Object.assign(formData.value, {
    id: undefined,
    name: "",
    color: "",
    description: "",
    status: 1,
  });
  dialogVisible.value = true;
};

// --- 表单提交 ---
const handleFormSubmitEnhanced = async (data) => {
  await crudHandleFormSubmit(data);
  getList();
};

// --- 状态修改 ---
const handleStatusChange = async (newStatus, row) => {
  if (!row || typeof row.name === "undefined") return;

  const text = newStatus === 1 ? "启用" : "禁用";
  const oldStatus = row.status;

  try {
    const payload = transformStatusToIsActive({
      ...row,
      status: newStatus,
    });
    await TagAPI.updateTag(row.id, payload);
    ElMessage.success(`${text}成功`);
    getList();
  } catch (error) {
    row.status = oldStatus;
    ElMessage.error(`${text}失败: ${error.message || "未知错误"}`);
  }
};

// --- 删除 ---
const handleDeleteEnhanced = (row) => {
  crudDelete(row);
};

// --- 合并标签 ---
const mergeDialogVisible = ref(false);
const selectedRows = ref([]);

const handleMergeTags = () => {
  if (!selectedRows.value || selectedRows.value.length < 2) {
    ElMessage.warning("请至少选择2个标签进行合并");
    return;
  }
  mergeDialogVisible.value = true;
};

const handleMergeSubmit = async (mergeData) => {
  try {
    await TagAPI.mergeTags(mergeData);
    ElMessage.success("合并成功");
    mergeDialogVisible.value = false;
    selectedRows.value = [];
    getList();
  } catch (error) {
    ElMessage.error(`合并失败: ${error.message || "未知错误"}`);
  }
};

const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
  crudHandleSelectionChange(selection);
};

// --- 更新使用次数 ---
const handleUpdateUsageCount = async (row) => {
  try {
    await TagAPI.updateTagUsageCount(row.id);
    ElMessage.success("更新成功");
    getList();
  } catch (error) {
    ElMessage.error(`更新失败: ${error.message || "未知错误"}`);
  }
};

// --- 表格列 ---
const tableColumns = ref([
  { type: "selection", width: 55 },
  { prop: "seq", label: "序号", width: 70 },
  { prop: "name", label: "标签名称", minWidth: 150 },
  { prop: "color", label: "颜色", slot: "color", width: 100 },
  { prop: "usageCount", label: "使用次数", width: 100 },
  { prop: "description", label: "描述", minWidth: 200, showOverflowTooltip: true },
  { prop: "status", label: "状态", slot: "status", width: 100 },
  { prop: "createTime", label: "创建时间", width: 160 },
  { prop: "updateTime", label: "更新时间", width: 160 },
]);

// --- 初始化 ---
onMounted(() => {
  getList();
});
</script>

<template>
  <div class="app-container">
    <AppSearchForm
      v-model="queryParams"
      :items="searchItems"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <AppTable
      :columns="tableColumns"
      :data="tableData"
      :loading="loading"
      :total="total"
      :actions-col-width="280"
      tableKey="dream-tag-table"
      :page-num="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @selection-change="handleSelectionChange"
      @update:page-num="(val) => (queryParams.pageNum = val)"
      @update:page-size="(val) => (queryParams.pageSize = val)"
      @refresh="getList"
    >
      <template #toolbar>
        <el-button type="primary" plain icon="Plus" @click="handleAddEnhanced()">
          新增标签
        </el-button>
        <el-button type="danger" plain icon="Delete" @click="handleDeleteEnhanced()">
          批量删除
        </el-button>
        <el-button type="warning" plain icon="Setting" @click="handleMergeTags()">
          合并标签
        </el-button>
      </template>

      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
          {{ row.status === 1 ? "启用" : "禁用" }}
        </el-tag>
      </template>

      <template #color="{ row }">
        <div
          v-if="row.color"
          :style="{
            width: '60px',
            height: '24px',
            backgroundColor: row.color,
            borderRadius: '4px',
            border: '1px solid #eee',
            margin: '0 auto',
          }"
          :title="row.color"
        />
        <span v-else>--</span>
      </template>

      <template #actions="{ row }">
        <el-button type="primary" link icon="Edit" @click="handleUpdateEnhanced(row)">
          修改
        </el-button>
        <el-button type="danger" link icon="Delete" @click="handleDeleteEnhanced(row)">
          删除
        </el-button>
        <el-button
          v-if="row.status !== 1"
          type="success"
          link
          icon="Check"
          @click="handleStatusChange(1, row)"
        >
          启用
        </el-button>
        <el-button
          v-if="row.status === 1"
          type="warning"
          link
          icon="Close"
          @click="handleStatusChange(0, row)"
        >
          禁用
        </el-button>
        <el-button type="info" link icon="Refresh" @click="handleUpdateUsageCount(row)">
          更新次数
        </el-button>
      </template>
    </AppTable>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <TagForm
        v-if="dialogVisible"
        :form-data="formData"
        @submit="handleFormSubmitEnhanced"
        @cancel="dialogVisible = false"
      />
    </el-dialog>

    <MergeTagDialog v-model="mergeDialogVisible" :tags="selectedRows" @submit="handleMergeSubmit" />
  </div>
</template>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}
</style>
