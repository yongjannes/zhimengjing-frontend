<script setup>
import { ref, computed, onMounted } from "vue";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// 定义组件接收的 props
const props = defineProps({
  // 表格列配置
  columns: { type: Array, default: () => [] },
  // 表格数据
  data: { type: Array, default: () => [] },
  // 加载状态
  loading: { type: Boolean, default: false },
  // 数据总条数
  total: { type: Number, default: 0 },
  // 当前页码
  pageNum: { type: Number, default: 1 },
  // 每页显示条数
  pageSize: { type: Number, default: 5 },
  // 分页组件对齐方式
  paginationAlign: { type: String, default: "center" },
  // 导出Excel文件名
  excelName: { type: String, default: "table" },
  // 是否显示列控制按钮
  showColumnControl: { type: Boolean, default: true },
  // 是否显示导出按钮
  showExport: { type: Boolean, default: true },
  // 操作列宽度
  actionsColWidth: { type: Number, default: 200 },
  // 表格key
  tableKey: { type: String, default: "default-table" },

  //工具栏按钮尺寸
  toolButtonSize: {
    type: String,
    default: "default", // 默认尺寸
    validator: (val) => ["large", "default", "small"].includes(val),
  },
  // 操作列按钮尺寸
  actionButtonSize: {
    type: String,
    default: "default",
    validator: (val) => ["large", "default", "small"].includes(val),
  },
});

// 定义组件触发的事件
const emit = defineEmits([
  "update:pageNum", // 更新页码
  "update:pageSize", // 更新每页条数
  "selection-change", // 选择项变化
  "row-click", // 行点击
  "sort-change", // 排序变化
  "refresh", // 刷新数据
]);

// 计算属性：当前页码
const currentPage = computed({
  get: () => props.pageNum,
  set: (val) => emit("update:pageNum", val),
});

// 计算属性：当前每页条数
const currentPageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit("update:pageSize", val),
});

// 处理页码变化
const handlePageChange = (val) => {
  emit("update:pageNum", val);
  emit("refresh"); // 触发刷新事件
};

// 处理每页条数变化
const handlePageSizeChange = (val) => {
  emit("update:pageSize", val);
  emit("update:pageNum", 1); // 重置为第一页
  emit("refresh"); // 触发刷新事件
};

// --- 列控制功能 ---
// 本地存储键名
const STORAGE_KEY = computed(() => `app_table_column_visibility_${props.tableKey}`);
// 存储列可见性状态
const columnVisibility = ref({});

// 计算可切换的列（排除选择列和索引列）
const toggleableColumns = computed(() => {
  return props.columns.filter((col) => col.type !== "selection" && col.type !== "index");
});

// 初始化列可见性状态
const initColumnVisibility = () => {
  const saved = localStorage.getItem(STORAGE_KEY.value);
  const savedObj = saved ? JSON.parse(saved) : {};

  props.columns.forEach((col) => {
    // 跳过选择列和索引列
    if (col.type === "selection" || col.type === "index") return;

    // 从本地存储获取或使用默认值
    columnVisibility.value[col.prop] =
      savedObj[col.prop] !== undefined ? savedObj[col.prop] : col.show !== false;
  });
};

// 组件挂载时初始化列可见性
onMounted(initColumnVisibility);

// 切换列可见性
const toggleColumn = (prop) => {
  columnVisibility.value[prop] = !columnVisibility.value[prop];
  // 保存到本地存储
  localStorage.setItem(STORAGE_KEY.value, JSON.stringify(columnVisibility.value));
};

// 导出Excel功能
const exportExcel = () => {
  // 处理导出数据
  const exportData = props.data.map((row, index) => {
    const obj = {};
    props.columns.forEach((col) => {
      if (col.type === "selection") return; // 跳过选择列

      if (col.type === "index") {
        // 索引列
        obj[col.label || "序号"] = index + 1;
        return;
      }

      // 根据可见性添加列数据
      if (columnVisibility.value[col.prop] !== false) {
        let value = row[col.prop];

        // 数值格式化处理
        if (typeof value === "number") value = Number(value.toFixed(2));
        obj[col.label || col.prop] = value;
      }
    });
    return obj;
  });

  // 创建工作表和工作簿
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // 生成Excel文件并下载
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `${props.excelName}.xlsx`);
};
</script>

<template>
  <div class="app-table-container">
    <div class="toolbar" style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px">
      <slot name="toolbar" />

      <!-- 列控制 -->
      <el-dropdown v-if="showColumnControl">
        <el-button type="primary" :size="toolButtonSize" plain>
          <el-icon><i-ep-Setting /></el-icon>
          列控制
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="col in toggleableColumns" :key="col.prop">
              <el-checkbox
                :model-value="columnVisibility[col.prop]"
                @change="() => toggleColumn(col.prop)"
              >
                {{ col.label }}
              </el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 导出 Excel -->
      <el-button v-if="showExport" type="success" :size="toolButtonSize" plain @click="exportExcel">
        <el-icon><i-ep-Download /></el-icon>
        导出 Excel
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="data"
      border
      stripe
      highlight-current-row
      @selection-change="(rows) => emit('selection-change', rows)"
      @row-click="(row) => emit('row-click', row)"
      @sort-change="(sort) => emit('sort-change', sort)"
    >
      <el-table-column
        v-if="columns.find((c) => c.type === 'selection')"
        type="selection"
        width="55"
        align="center"
      />

      <el-table-column
        v-if="columns.find((c) => c.type === 'index')"
        type="index"
        :label="columns.find((c) => c.type === 'index')?.label || '序号'"
        width="60"
        align="center"
      />

      <template v-for="col in columns" :key="col.prop">
        <el-table-column
          v-if="
            col.type !== 'selection' && col.type !== 'index' && columnVisibility[col.prop] !== false
          "
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :sortable="col.sortable || false"
          :align="col.align || 'center'"
          show-overflow-tooltip
        >
          <template #default="{ row, column }">
            <slot v-if="col.slot" :name="col.slot" :row="row" />
            <span v-else-if="col.formatter">{{ col.formatter(row, column, row[col.prop]) }}</span>
            <span v-else>{{ row[col.prop] }}</span>
          </template>
        </el-table-column>
      </template>

      <el-table-column
        v-if="$slots.actions"
        label="操作"
        align="center"
        fixed="right"
        :width="actionsColWidth"
      >
        <template #default="{ row }">
          <slot name="actions" :row="row" :size="actionButtonSize" />
        </template>
      </el-table-column>

      <template #empty>
        <slot name="empty">
          <el-empty description="暂无数据" />
        </slot>
      </template>
    </el-table>
    <div :class="`pagination align-${paginationAlign}`">
      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        class="pagination"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 15px"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.pagination {
  display: flex;
  margin-top: 15px;

  &.align-left {
    justify-content: flex-start;
  }
  &.align-center {
    justify-content: center;
  }
  &.align-right {
    justify-content: flex-end;
  }
}
</style>
