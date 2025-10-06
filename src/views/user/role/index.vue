<script setup>
import { ElMessage } from "element-plus";
import { useCRUD } from "@/hooks/useCRUD.js";
import * as AdminRoleAPI from "@/api/adminRole.js";
import RoleForm from "./components/RoleForm.vue";
import AppTable from "@/components/AppTable/index.vue";
import AppSearchForm from "@/components/AppSearchForm/index.vue";

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
  getList,
} = useCRUD({
  api: {
    // 切换到分页接口
    list: AdminRoleAPI.getRolesByPage,
    add: AdminRoleAPI.addRole,
    update: (id, data) => AdminRoleAPI.updateRole(id, data),
    del: AdminRoleAPI.deleteRole,
    getById: AdminRoleAPI.getRoleById,
  },
  initialQueryParams: {
    roleName: "",
    status: null, // 初始值设为 null 以便 placeholder 显示
    pageNum: 1,
    pageSize: 5,
  },
  formatData: (item, index) => {
    // seq 现在可以根据分页计算
    return {
      ...item,
      seq: (queryParams.pageNum - 1) * queryParams.pageSize + index + 1,
    };
  },
  entityName: "角色",
});

// --- 搜索表单配置 ---
const searchItems = ref([
  {
    type: "input",
    label: "角色名称",
    prop: "roleName",
    placeholder: "请输入角色名称",
  },
  {
    type: "select",
    label: "状态",
    prop: "status",
    placeholder: "角色状态",
    options: [
      { label: "启用", value: 1 },
      { label: "禁用", value: 0 },
    ],
    width: 210,
    clearable: true,
  },
]);

// --- 表格列配置 ---
const tableColumns = ref([
  { type: "selection", width: 55 },
  { prop: "seq", label: "序号", width: 70 }, // 使用 formatData 生成的 seq
  { prop: "roleName", label: "角色名称" },
  { prop: "roleCode", label: "角色编码" },
  { prop: "description", label: "描述", width: 200 },
  { prop: "isSystem", label: "系统角色", slot: "isSystem", width: 100 },
  { prop: "status", label: "状态", slot: "status", width: 100 },
  { prop: "updateTime", label: "更新时间", width: 160 },
]);

// 状态切换
const handleStatusChange = async (newStatus, row) => {
  if (!row || typeof row.roleName === "undefined") {
    return;
  }
  const text = newStatus === 1 ? "启用" : "禁用";
  // 保存旧状态，以便操作取消或失败时回滚
  const oldStatus = newStatus === 1 ? 0 : 1;

  try {
    await ElMessageBox.confirm(`确认要${text}角色 "${row.roleName}" 吗？`, "警告", {
      type: "warning",
    });

    // 准备提交的数据
    const submitData = { ...row, status: newStatus };

    //检查并解析 permissions 字段
    if (submitData.permissions && typeof submitData.permissions === "string") {
      try {
        submitData.permissions = JSON.parse(submitData.permissions);
      } catch (e) {
        console.error("解析权限字符串失败:", e);
        submitData.permissions = []; // 解析失败时，赋为空数组，避免后端报错
      }
    }

    await AdminRoleAPI.updateRole(row.id, submitData);
    ElMessage.success(`${text}成功`);
    await getList(); // 重新加载列表以获取最新状态
  } catch (error) {
    // 如果用户点击了“取消”或API请求失败，将开关状态恢复
    row.status = oldStatus;
    if (error !== "cancel") {
      ElMessage.error(`${text}失败`);
    }
  }
};

// 自定义删除确认（检查系统角色）
const handleCustomDelete = (row) => {
  if (row && row.isSystem === 1) {
    ElMessage.warning("系统内置角色不允许删除");
    return;
  }
  handleDelete(row);
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
      :actions-col-width="180"
      tableKey="role-table"
      :page-num="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :pagination-align="'center'"
      :excel-name="'角色信息列表'"
      :show-column-control="false"
      :show-export="false"
      @selection-change="handleSelectionChange"
      @update:page-num="(val) => (queryParams.pageNum = val)"
      @update:page-size="(val) => (queryParams.pageSize = val)"
      @refresh="getList"
    >
      <template #toolbar>
        <el-button type="primary" plain icon="Plus" @click="handleAdd()">新增</el-button>
        <el-button type="danger" plain icon="Delete" @click="handleDelete()">删除</el-button>
      </template>

      <template #isSystem="{ row }">
        <el-tag v-if="row.isSystem === 1" type="warning">是</el-tag>
        <el-tag v-else type="info">否</el-tag>
      </template>

      <template #status="{ row }">
        <el-switch
          v-model="row.status"
          :active-value="1"
          :inactive-value="0"
          :disabled="row.isSystem === 1"
          @change="(val) => handleStatusChange(val, row)"
        />
      </template>

      <template #actions="{ row }">
        <el-button
          type="primary"
          link
          icon="Edit"
          :disabled="row.isSystem === 1"
          @click="handleUpdate(row)"
        >
          修改
        </el-button>
        <el-button
          type="danger"
          link
          icon="Delete"
          :disabled="row.isSystem === 1"
          @click="handleCustomDelete(row)"
        >
          删除
        </el-button>
      </template>
    </AppTable>

    <RoleForm
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
