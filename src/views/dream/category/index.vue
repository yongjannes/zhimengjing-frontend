<script setup>
import { ElMessage } from "element-plus";
import { useCRUD } from "@/hooks/useCRUD.js";
import * as CategoryAPI from "@/api/category.js";
import CategoryForm from "./components/CategoryForm.vue";

// --- 搜索表单配置 ---
const searchItems = ref([
  {
    type: "input",
    label: "分类名称",
    prop: "name",
    placeholder: "请输入分类名称",
  },
  {
    type: "select",
    label: "状态",
    prop: "status",
    placeholder: "请选择状态",
    options: [
      { label: "启用", value: 1 },
      { label: "禁用", value: 0 },
    ],
    width: 225,
  },
]);

// --- 工具函数 ---
const findCategoryNameById = (tree, id) => {
  for (const node of tree) {
    if (node.id === id) {
      return node.name;
    }
    if (node.children && node.children.length > 0) {
      const foundName = findCategoryNameById(node.children, id);
      if (foundName) return foundName;
    }
  }
  return null;
};

const normalizeCategoryIds = (categories) => {
  if (!Array.isArray(categories)) return [];
  return categories.map((category) => {
    const normalizedCategory = { ...category, id: Number(category.id) };
    if (category.children && category.children.length > 0) {
      normalizedCategory.children = normalizeCategoryIds(category.children);
    }
    return normalizedCategory;
  });
};

// --- 核心修改：递归禁用自己及子节点 ---
const filterAndDisableCategory = (tree, disableId) => {
  if (!Array.isArray(tree)) return [];
  return tree.map((node) => {
    const newNode = { ...node };
    // 禁用自己
    if (newNode.id === disableId) {
      newNode.disabled = true; // 禁用自己
      // 递归禁用所有子节点
      const disableChildren = (children) => {
        if (!children) return;
        children.forEach((child) => {
          child.disabled = true;
          if (child.children) disableChildren(child.children);
        });
      };
      disableChildren(newNode.children);
    } else if (newNode.children && newNode.children.length > 0) {
      // 在其他分支中继续递归
      newNode.children = filterAndDisableCategory(newNode.children, disableId);
    }
    return newNode;
  });
};

const transformStatusToIsActive = (data) => {
  const payload = { ...data, isActive: data.status === 1 };
  delete payload.status;
  payload.parentId = payload.parentId === 0 ? null : payload.parentId;
  delete payload.level;
  delete payload.isSystem;
  delete payload.parentName;
  delete payload.seq;
  return payload;
};

// --- 树数据 ---
const categoryListForTreeSelect = ref([]);

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
    list: CategoryAPI.getCategoriesByPage,
    add: (data) => CategoryAPI.addCategory(transformStatusToIsActive(data)),
    update: (id, data) => CategoryAPI.updateCategory(id, transformStatusToIsActive(data)),
    del: (ids) => CategoryAPI.deleteCategory(ids),
    getById: CategoryAPI.getCategoryById,
  },
  initialQueryParams: {
    name: "",
    status: null,
    pageNum: 1,
    pageSize: 5,
  },
  formatData: (item, index, params) => {
    let parentName = "顶级分类";
    if (item.parentId && item.parentId !== 0) {
      if (item.parentName) {
        parentName = item.parentName;
      } else {
        const foundName = findCategoryNameById(categoryListForTreeSelect.value, item.parentId);
        parentName = foundName || "未知上级";
      }
    }
    return {
      ...item,
      status: item.isActive ? 1 : 0,
      parentName,
      seq: (params.pageNum - 1) * params.pageSize + index + 1,
    };
  },
  entityName: "梦境分类",
});

// --- 上级分类树（修改/新增时禁用自己） ---
const categoryTreeForForm = computed(() => {
  if (formData.value && formData.value.id) {
    return filterAndDisableCategory(categoryListForTreeSelect.value, formData.value.id);
  }
  return categoryListForTreeSelect.value;
});

// --- 获取分类树 ---
const fetchCategoryTree = async () => {
  try {
    const data = await CategoryAPI.getAllCategories();
    categoryListForTreeSelect.value = normalizeCategoryIds(data || []);
  } catch (error) {
    console.error("获取分类树失败:", error);
  }
};

// --- 修改分类 ---
const handleUpdateEnhanced = async (row) => {
  await fetchCategoryTree();
  try {
    const data = await CategoryAPI.getCategoryById(row.id);
    dialogTitle.value = `修改梦境分类 - ${data.name}`;
    Object.assign(formData.value, {
      ...data,
      id: data.id, // 确保 id 为数字类型
      status: data.isActive ? 1 : 0,
      parentId: data.parentId === 0 || data.parentId === null ? null : Number(data.parentId),
    });
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error(`获取分类详情失败: ${error.message || "未知错误"}`);
  }
};

// --- 新增分类 ---
const handleAddEnhanced = async () => {
  await fetchCategoryTree();
  dialogTitle.value = `新增梦境分类`;
  Object.assign(formData.value, {
    id: undefined,
    name: "",
    parentId: null,
    description: "",
    icon: "",
    color: "",
    sortOrder: 0,
    status: 1,
    level: 1,
    isSystem: false,
  });
  dialogVisible.value = true;
};

// --- 表单提交 ---
const handleFormSubmitEnhanced = async (data) => {
  await crudHandleFormSubmit(data);
  getList();
  fetchCategoryTree();
};

// --- 状态修改 ---
const handleStatusChange = async (newStatus, row) => {
  if (!row || typeof row.name === "undefined") return;

  if (row.isSystem) {
    ElMessage.warning("系统内置分类状态不允许修改");
    row.status = row.status === 1 ? 0 : 1;
    return;
  }

  const text = newStatus === 1 ? "启用" : "禁用";
  const oldStatus = row.status;

  try {
    const payload = transformStatusToIsActive({
      ...row,
      status: newStatus,
      parentId: row.parentId === 0 ? null : row.parentId,
    });
    await CategoryAPI.updateCategory(row.id, payload);
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

// --- 表格列 ---
const tableColumns = ref([
  { type: "selection", width: 55 },
  { prop: "seq", label: "序号", width: 70 },
  { prop: "name", label: "分类名称", minWidth: 150, width: 100 },
  { prop: "level", label: "级别", width: 80 },
  { prop: "parentName", label: "上级分类", width: 120 },
  { prop: "dreamCount", label: "梦境数", width: 90 },
  { prop: "subCategoryCount", label: "子分类数", width: 100 },
  { prop: "description", label: "描述", minWidth: 200, showOverflowTooltip: true },
  { prop: "icon", label: "图标", width: 100, slot: "icon" },
  { prop: "color", label: "颜色", slot: "color", width: 100 },
  { prop: "sortOrder", label: "排序", width: 80 },
  { prop: "isSystem", label: "系统内置", slot: "isSystem", width: 100 },
  { prop: "status", label: "状态", slot: "status", width: 100 },
  { prop: "createTime", label: "创建时间", width: 160 },
  { prop: "updateTime", label: "更新时间", width: 160 },
]);

// --- 初始化 ---
onMounted(() => {
  fetchCategoryTree().then(() => {
    getList();
  });
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
      :actions-col-width="240"
      tableKey="dream-category-table"
      :page-num="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @selection-change="crudHandleSelectionChange"
      @update:page-num="(val) => (queryParams.pageNum = val)"
      @update:page-size="(val) => (queryParams.pageSize = val)"
      @refresh="getList"
    >
      <template #toolbar>
        <el-button type="primary" plain icon="Plus" @click="handleAddEnhanced()">
          新增分类
        </el-button>
        <el-button type="danger" plain icon="Delete" @click="handleDeleteEnhanced()">
          批量删除
        </el-button>
      </template>

      <template #icon="{ row }">
        <el-icon v-if="row.icon" size="20">
          <component :is="row.icon" />
        </el-icon>
        <span v-else>--</span>
      </template>

      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
          {{ row.status === 1 ? "启用" : "禁用" }}
        </el-tag>
      </template>

      <template #isSystem="{ row }">
        <el-tag :type="row.isSystem ? 'warning' : 'info'" size="small">
          {{ row.isSystem ? "是" : "否" }}
        </el-tag>
      </template>

      <template #color="{ row }">
        <div
          v-if="row.color"
          :style="{
            width: '100%',
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
        <el-button
          type="primary"
          link
          icon="Edit"
          :disabled="row.isSystem"
          @click="handleUpdateEnhanced(row)"
        >
          修改
        </el-button>
        <el-button
          type="danger"
          link
          icon="Delete"
          :disabled="row.isSystem"
          @click="handleDeleteEnhanced(row)"
        >
          删除
        </el-button>
        <el-button
          v-if="row.status !== 1"
          type="success"
          link
          icon="Check"
          :disabled="row.isSystem"
          @click="handleStatusChange(1, row)"
        >
          启用
        </el-button>
        <el-button
          v-if="row.status === 1"
          type="warning"
          link
          icon="Close"
          :disabled="row.isSystem"
          @click="handleStatusChange(0, row)"
        >
          禁用
        </el-button>
      </template>
    </AppTable>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <CategoryForm
        v-if="dialogVisible"
        :form-data="formData"
        :category-tree="categoryTreeForForm"
        @submit="handleFormSubmitEnhanced"
        @cancel="dialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}
</style>
