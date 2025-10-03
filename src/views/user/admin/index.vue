<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useCRUD } from "@/hooks/useCRUD.js";
import * as AdminUserAPI from "@/api/adminUser";
import AuthAPI from "@/api/auth.js";
import { getAllRoles } from "@/api/adminRole.js";
import UserForm from "./components/UserForm.vue";
import AppSearchForm from "@/components/AppSearchForm/index.vue";
import AppTable from "@/components/AppTable/index.vue";

// --- 角色映射 ---
const roleMap = ref({});
const getRoles = async () => {
  try {
    const roles = (await getAllRoles()) || [];
    roleMap.value = roles.reduce((map, item) => {
      map[item.id] = item.roleName;
      return map;
    }, {});
  } catch (error) {
    console.error("获取角色列表失败:", error);
  }
};

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
  handleSelectionChange,
  handleAdd,
  handleUpdate,
  handleDelete,
  handleFormSubmit,
  getList, // useCRUD 返回 getList 以便手动刷新
} = useCRUD({
  api: {
    list: AdminUserAPI.getAdminUserList,
    add: AdminUserAPI.addAdminUser,
    update: (id, data) => AdminUserAPI.updateAdminUser(id, data),
    del: (ids) => AdminUserAPI.deleteAdminUser(ids),
    getById: AdminUserAPI.getAdminUser,
  },
  initialQueryParams: {
    username: "",
    realName: "",
    status: "",
    pageNum: 1,
    pageSize: 5,
  },
  formatData: (item, index, params) => {
    // 格式化数据，添加序号
    return {
      ...item,
      seq: (params.pageNum - 1) * params.pageSize + index + 1,
    };
  },
  entityName: "管理员",
});

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
    label: "昵称",
    prop: "realName",
    placeholder: "请输入昵称",
  },
  {
    type: "select",
    label: "状态",
    prop: "status",
    placeholder: "用户状态",
    options: [
      { label: "正常", value: 1 },
      { label: "停用", value: 0 },
    ],
    width: 210,
  },
]);

// --- 表格列配置 ---
const tableColumns = ref([
  { type: "selection", width: 55 },
  { type: "index", label: "序号", width: 70 },
  { prop: "username", label: "用户名" },
  { prop: "realName", label: "昵称" },
  { prop: "roleId", label: "角色", slot: "role" },
  { prop: "status", label: "状态", slot: "status" },
  { prop: "createTime", label: "创建时间", width: 160 },
  { prop: "updateTime", label: "更新时间", width: 160 },
]);

// --- 特定业务方法 ---
// 状态切换
const handleStatusChange = async (newStatus, row) => {
  if (!row || !row.id) {
    return;
  }
  const text = newStatus === 1 ? "启用" : "停用";
  const oldStatus = newStatus === 1 ? 0 : 1; // 根据新状态计算旧状态
  try {
    await ElMessageBox.confirm(`确认要${text}用户 "${row.username}" 吗？`, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    // 使用新状态提交更新
    await AdminUserAPI.updateAdminUser(row.id, { ...row, status: newStatus });
    ElMessage.success(`${text}成功`);
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    // 如果操作失败或用户取消，恢复UI上的状态
    row.status = oldStatus;
  }
};

// 重置密码
const handleResetPassword = async (row) => {
  try {
    await ElMessageBox.confirm(`确认要重置用户 "${row.username}" 的密码吗？`, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    const res = await AuthAPI.resetPassword(row.id);
    ElMessage.success(`重置成功，新密码为: ${res}`);
  } catch (error) {
    console.error("重置密码失败:", error);
  }
};

// --- 生命周期 ---
onMounted(async () => {
  await getRoles();
  // useCRUD 默认会调用 getList，这里无需手动调用
});
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
      :actions-col-width="250"
      tableKey="admin-user-table"
      :page-num="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :pagination-align="'center'"
      :excel-name="'用户信息列表'"
      :show-column-control="false"
      :show-export="false"
      @selection-change="handleSelectionChange"
      @refresh="getList"
      @update:page-num="(val) => (queryParams.pageNum = val)"
      @update:page-size="(val) => (queryParams.pageSize = val)"
    >
      <template #toolbar>
        <el-button type="primary" plain icon="Plus" @click="handleAdd()">新增</el-button>
        <el-button type="danger" plain icon="Delete" @click="handleDelete()">删除</el-button>
      </template>

      <template #role="{ row }">
        <el-tag v-if="roleMap[row.roleId]" type="success">{{ roleMap[row.roleId] }}</el-tag>
        <el-tag v-else type="info">未分配</el-tag>
      </template>

      <template #status="{ row }">
        <el-switch
          v-model="row.status"
          :active-value="1"
          :inactive-value="0"
          :disabled="roleMap[row.roleId] === '超级管理员'"
          @change="(val) => handleStatusChange(val, row)"
        />
      </template>

      <template #actions="{ row }">
        <el-button
          type="warning"
          link
          icon="Refresh"
          :disabled="roleMap[row.roleId] === '超级管理员'"
          @click="handleResetPassword(row)"
        >
          重置密码
        </el-button>
        <el-button
          type="primary"
          link
          icon="Edit"
          :disabled="roleMap[row.roleId] === '超级管理员'"
          @click="handleUpdate(row)"
        >
          修改
        </el-button>
        <el-button
          type="danger"
          link
          icon="Delete"
          :disabled="roleMap[row.roleId] === '超级管理员'"
          @click="handleDelete(row)"
        >
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
