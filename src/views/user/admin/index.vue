<script setup>
import {
  getAdminUserList,
  addAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAdminUser,
} from "@/api/adminUser";
import AuthAPI from "@/api/auth.js";
import { getAllRoles } from "@/api/adminRole.js";
import UserForm from "./components/UserForm.vue";
import { ElMessage, ElMessageBox } from "element-plus";

// --- 响应式数据 ---
const loading = ref(true);
const tableData = ref([]);
const total = ref(0);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  username: "",
  realName: "",
  status: undefined,
});
const selectedIds = ref([]);

// 角色映射表
const roleMap = ref({});

// --- 弹窗相关 ---
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formData = ref({});

// --- 表格 ref ---
const tableRef = ref(null);

// --- 方法 ---
// 获取角色列表并创建映射表
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

// 获取用户列表
const getList = async () => {
  loading.value = true;
  try {
    const response = await getAdminUserList(queryParams);
    tableData.value = response.records
      .sort((a, b) => {
        if (a.id === 1) return -1; // 1号管理员排最前
        if (b.id === 1) return 1;
        return a.id - b.id; // 其他按ID升序
      })
      .map((item, index) => ({
        ...item,
        seq: (queryParams.pageNum - 1) * queryParams.pageSize + index + 1,
      }));
    total.value = response.total;
  } catch (error) {
    console.error("获取列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 重置搜索
const resetQuery = () => {
  queryParams.username = "";
  queryParams.realName = "";
  queryParams.status = undefined;
  handleQuery();
};

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map((item) => item.id);
};

// 新增
const handleAdd = () => {
  formData.value = { status: 1, roleId: null };
  dialogTitle.value = "新增管理员";
  dialogVisible.value = true;
};

// 修改
const handleUpdate = async (row) => {
  try {
    const data = await getAdminUser(row.id);
    formData.value = data;
    dialogTitle.value = "修改管理员";
    dialogVisible.value = true;
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

// 删除
const handleDelete = (row) => {
  const userIds = row?.id ? [row.id] : selectedIds.value;
  if (!userIds.length) {
    ElMessage.warning("请选择要删除的数据");
    return;
  }

  ElMessageBox.confirm(`是否确认删除用户ID为"${userIds.join(",")}"的数据项？`, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await deleteAdminUser(userIds.join(","));
      ElMessage.success("删除成功");
      getList();
    })
    .catch(() => {});
};

// 表单提交
const handleFormSubmit = async (data) => {
  try {
    if (data.id) {
      await updateAdminUser(data.id, data);
      ElMessage.success("修改成功");
    } else {
      await addAdminUser(data);
      ElMessage.success("新增成功");
    }
    dialogVisible.value = false;
    await getList(); // 刷新列表
  } catch (error) {
    console.error("操作失败:", error);
  }
};

// 状态切换
const handleStatusChange = async (row) => {
  const text = row.status === 1 ? "启用" : "停用";
  const oldStatus = row.status === 1 ? 0 : 1; // 记录切换前状态
  try {
    await ElMessageBox.confirm(`确认要${text}用户 "${row.username}" 吗？`, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await updateAdminUser(row.id, { ...row, status: row.status });
    ElMessage.success(`${text}成功`);
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    row.status = oldStatus; // 恢复原状态
  }
};

const handleResetPassword = async (row) => {
  try {
    await ElMessageBox.confirm(`确认要重置用户 "${row.username}" 的密码吗？`, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const res = await AuthAPI.resetPassword(row.id);
    ElMessage.success(`重置成功，新密码为: ${res}`); // res 是后端返回的新密码
  } catch (error) {
    console.error("重置密码失败:", error);
  }
};

// --- 生命周期 ---
onMounted(async () => {
  await getRoles();
  await getList();
});
</script>

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-form ref="queryForm" :model="queryParams" class="search-form">
        <div class="form-left">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="queryParams.username"
              placeholder="请输入用户名"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="昵称" prop="realName">
            <el-input
              v-model="queryParams.realName"
              placeholder="请输入昵称"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status" style="width: 140px">
            <el-select v-model="queryParams.status" placeholder="用户状态" clearable>
              <el-option label="正常" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item class="form-buttons">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="2">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="2">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="selectedIds.length === 0"
              @click="handleDelete"
              >删除</el-button
            >
          </el-col>
        </el-row>
      </template>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" align="center" prop="seq" width="70" />
        <el-table-column label="用户名" align="center" prop="username" />
        <el-table-column label="昵称" align="center" prop="realName" />
        <el-table-column label="角色" align="center">
          <template #default="{ row }">
            <el-tag v-if="roleMap[row.roleId]" type="success">{{ roleMap[row.roleId] }}</el-tag>
            <el-tag v-else type="info">未分配</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              :disabled="roleMap[row.roleId] === '超级管理员'"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
        <el-table-column label="更新时间" align="center" prop="updateTime" width="160" />
        <el-table-column label="操作" align="center" width="250">
          <template #default="{ row }">
            <el-button
              type="warning"
              link
              icon="Refresh"
              :disabled="roleMap[row.roleId] === '超级管理员'"
              @click="handleResetPassword(row)"
              >重置密码</el-button
            >
            <el-button
              type="primary"
              link
              icon="Edit"
              :disabled="roleMap[row.roleId] === '超级管理员'"
              @click="handleUpdate(row)"
              >修改</el-button
            >
            <el-button
              type="danger"
              link
              icon="Delete"
              :disabled="roleMap[row.roleId] === '超级管理员'"
              @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getList"
        @current-change="getList"
      />
    </el-card>

    <!-- 弹窗表单 -->
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
.search-card {
  height: 80px;
  margin-bottom: 10px;
}

.search-form {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 左右两边对齐 */
}

.form-left {
  display: flex;
  gap: 10px; /* 输入框之间的间距 */
  align-items: center;
}

.form-right {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
