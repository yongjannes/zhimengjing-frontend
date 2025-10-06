<script setup>
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import { useCRUD } from "@/hooks/useCRUD.js";
import * as UserAPI from "@/api/user.js";
import UserForm from "./components/UserForm.vue";

// 用于存储批量操作选中的用户ID
const selectedIds = ref([]);

// --- CRUD Hook ---
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
  handleSelectionChange: crudHandleSelectionChange, // 重命名以避免冲突
  handleUpdate,
  handleDelete,
  handleFormSubmit,
  getList,
} = useCRUD({
  api: {
    list: UserAPI.getUserList,
    update: (id, data) => UserAPI.updateUser(id, data),
    del: UserAPI.deleteUser,
    getById: UserAPI.getUserBasic,
  },
  initialQueryParams: {
    username: "",
    phone: "",
    email: "",
    status: "",
    userLevel: "",
    pageNum: 1,
    pageSize: 5,
  },
  formatData: (item, index, params) => ({
    ...item,
    seq: (params.pageNum - 1) * params.pageSize + index + 1,
  }),
  entityName: "用户",
});

// --- 包装选择更改处理 ---
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map((item) => item.id);
  crudHandleSelectionChange(selection);
};

// --- 搜索表单配置 ---
const searchItems = ref([
  {
    type: "input",
    label: "用户名",
    prop: "username",
    placeholder: "请输入用户名",
  },
  {
    type: "input",
    label: "手机号",
    prop: "phone",
    placeholder: "请输入手机号",
  },
  {
    type: "input",
    label: "邮箱",
    prop: "email",
    placeholder: "请输入邮箱",
  },
  {
    type: "select",
    label: "用户状态",
    prop: "status",
    placeholder: "用户状态",
    options: [
      { label: "正常", value: 1 },
      { label: "禁用", value: 0 },
      { label: "待审核", value: 2 },
    ],
    width: 210,
  },
  {
    type: "select",
    label: "用户等级",
    prop: "userLevel",
    placeholder: "用户等级",
    options: [
      { label: "普通", value: 1 },
      { label: "VIP", value: 2 },
      { label: "高级VIP", value: 3 },
    ],
    width: 210,
  },
]);

const dateFormatter = (row, column, cellValue) => {
  if (!cellValue) return "";
  // 后端返回数组格式 [year, month, day, hour, minute, second]
  if (Array.isArray(cellValue) && cellValue.length >= 6) {
    const d = cellValue;
    // 注意：JS Date 构造函数中月份是 0-11，所以需要减 1
    const dateObj = new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5]);
    return dayjs(dateObj).format("YYYY-MM-DD HH:mm:ss");
  }
  // 如果是其他有效格式，dayjs 也能尝试解析
  if (dayjs(cellValue).isValid()) {
    return dayjs(cellValue).format("YYYY-MM-DD HH:mm:ss");
  }
  return cellValue;
};
// --- 表格列配置 ---
const tableColumns = ref([
  { type: "selection", width: 55 },
  { type: "index", label: "序号", width: 70 },
  { prop: "username", label: "用户名" },
  { prop: "nickname", label: "昵称" },
  { prop: "email", label: "邮箱", width: 180 },
  { prop: "phone", label: "手机号", width: 120 },
  { prop: "userLevel", label: "用户等级", slot: "userLevel", width: 100 },
  { prop: "availablePoints", label: "积分", width: 80 },
  { prop: "balance", label: "余额(元)", width: 100 },
  { prop: "status", label: "状态", slot: "status", width: 100 },
  { prop: "loginCount", label: "登录次数", width: 90 },
  { prop: "createTime", label: "注册时间", width: 180, formatter: dateFormatter },
]);

// --- 业务方法 ---

// 通用的状态变更处理器
const handleChangeStatus = async (row, newStatus, actionText) => {
  try {
    await ElMessageBox.confirm(`确认要${actionText}用户 "${row.username}" 吗？`, "警告", {
      type: "warning",
    });
    await UserAPI.updateUserStatus(row.id, newStatus);
    ElMessage.success(`操作成功`);
    await getList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("操作失败");
    }
  }
};

// 批量操作（审核、启用、禁用）
const handleBatchOperation = async (status, operationType) => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请至少选择一个用户");
    return;
  }

  let confirmText = "";
  let successText = "";
  if (operationType === "review") {
    const action = status === 1 ? "通过" : "拒绝";
    confirmText = `确认要批量审核${action}选中的 ${selectedIds.value.length} 个用户吗？`;
    successText = `批量审核${action}成功`;
  } else {
    const action = status === 1 ? "启用" : "禁用";
    confirmText = `确认要批量${action}选中的 ${selectedIds.value.length} 个用户吗？`;
    successText = `批量${action}成功`;
  }

  try {
    await ElMessageBox.confirm(confirmText, "警告", { type: "warning" });
    await UserAPI.batchUpdateUserStatus(selectedIds.value, status);
    ElMessage.success(successText);
    await getList();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("操作失败");
    }
  }
};

// --- Helper Functions ---

const getStatusTagType = (status) => {
  const map = { 0: "danger", 1: "success", 2: "info" };
  return map[status];
};

const getStatusTagText = (status) => {
  const map = { 0: "禁用", 1: "正常", 2: "待审核" };
  return map[status] || "未知";
};

const getUserLevelText = (level) => {
  const map = { 1: "普通", 2: "VIP", 3: "高级VIP" };
  return map[level] || "未知";
};

const getUserLevelType = (level) => {
  const map = { 1: "info", 2: "warning", 3: "danger" };
  return map[level] || "info";
};
</script>

<template>
  <div class="app-container">
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
      :actions-col-width="200"
      tableKey="normal-user-table"
      :page-num="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :pagination-align="'center'"
      :show-column-control="false"
      :show-export="false"
      :excel-name="'普通用户列表'"
      @selection-change="handleSelectionChange"
      @refresh="getList"
      @update:page-num="(val) => (queryParams.pageNum = val)"
      @update:page-size="(val) => (queryParams.pageSize = val)"
    >
      <template #toolbar>
        <el-button type="success" plain @click="handleBatchOperation(1, 'review')">
          <el-icon><Check /></el-icon>
          批量通过
        </el-button>
        <el-button type="warning" plain @click="handleBatchOperation(0, 'review')">
          <el-icon><i-ep-Close /></el-icon>
          批量拒绝
        </el-button>
        <el-button type="success" plain @click="handleBatchOperation(1, 'status')">
          <el-icon><i-ep-CircleCheckFilled /></el-icon>
          批量启用
        </el-button>
        <el-button type="warning" plain @click="handleBatchOperation(0, 'status')">
          <el-icon><i-ep-CircleCloseFilled /></el-icon>
          批量禁用
        </el-button>
        <el-button type="danger" plain @click="handleDelete()">
          <el-icon><i-ep-Delete /></el-icon>
          删除
        </el-button>
      </template>

      <template #userLevel="{ row }">
        <el-tag :type="getUserLevelType(row.userLevel)" size="small">
          {{ getUserLevelText(row.userLevel) }}
        </el-tag>
      </template>

      <template #status="{ row }">
        <el-tag :type="getStatusTagType(row.status)">
          {{ getStatusTagText(row.status) }}
        </el-tag>
      </template>

      <template #actions="{ row }">
        <template v-if="row.status === 2">
          <el-button type="success" link @click="handleChangeStatus(row, 1, '通过')">
            <el-icon><i-ep-Check /></el-icon>
            通过
          </el-button>
          <el-button type="danger" link @click="handleChangeStatus(row, 0, '拒绝')">
            <el-icon><i-ep-Close /></el-icon>
            拒绝
          </el-button>
        </template>

        <template v-else-if="row.status === 1">
          <el-button type="warning" link @click="handleChangeStatus(row, 0, '禁用')">
            <el-icon><i-ep-CircleCloseFilled /></el-icon>
            禁用
          </el-button>
          <el-button type="primary" link @click="handleUpdate(row)">
            <el-icon><i-ep-Edit /></el-icon>
            编辑
          </el-button>
        </template>

        <template v-else-if="row.status === 0">
          <el-button type="success" link @click="handleChangeStatus(row, 1, '启用')">
            <el-icon><i-ep-CircleCheckFilled /></el-icon>
            启用
          </el-button>
          <el-button type="primary" link @click="handleUpdate(row)">
            <el-icon><i-ep-Edit /></el-icon>
            编辑
          </el-button>
        </template>

        <el-button type="danger" link @click="handleDelete(row)">
          <el-icon><i-ep-Delete /></el-icon>
          删除
        </el-button>
      </template>
    </AppTable>

    <UserForm
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}
</style>
