<script setup>
import { computed } from "vue";

// --- Props 定义 ---
const props = defineProps({
  // 表格列配置
  columns: {
    type: Array,
    default: () => [],
  },
  // 表格数据
  data: {
    type: Array,
    default: () => [],
  },
  // 是否显示选择框
  showSelection: {
    type: Boolean,
    default: true,
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false,
  },
  // 分页总数
  total: {
    type: Number,
    default: 0,
  },
  // 分页参数
  pageNum: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
});

const emit = defineEmits([
  "update:pageNum",
  "update:pageSize",
  "selection-change",
  "refresh", // 统一刷新事件
]);

// --- 计算属性，处理 v-model ---
const currentPage = computed({
  get: () => props.pageNum,
  set: (val) => emit("update:pageNum", val),
});

const currentPageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit("update:pageSize", val),
});

// --- 事件处理 ---
const handleSelectionChange = (selection) => {
  emit("selection-change", selection);
};

// 分页变化：触发刷新
const handlePageChange = (val) => {
  emit("update:pageNum", val);
  emit("refresh");
};

const handlePageSizeChange = (val) => {
  emit("update:pageSize", val);
  // 页码重置为 1
  emit("update:pageNum", 1);
  emit("refresh");
};
</script>

<template>
  <div class="app-table-container">
    <el-table
      v-loading="loading"
      :data="data"
      border
      stripe
      @selection-change="handleSelectionChange"
    >
      <!-- 可选选择列 -->
      <el-table-column v-if="showSelection" type="selection" width="55" align="center" />

      <!-- 动态渲染列 -->
      <template v-for="col in columns" :key="col.prop">
        <el-table-column
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :align="col.align || 'center'"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <!-- 插槽优先 -->
            <slot :name="col.prop" :row="row">
              {{ row[col.prop] }}
            </slot>
          </template>
        </el-table-column>
      </template>

      <!-- 操作列 -->
      <el-table-column v-if="$slots.actions" label="操作" align="center" fixed="right" width="180">
        <template #default="{ row }">
          <slot name="actions" :row="row" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="total > 0"
      v-model:current-page="currentPage"
      v-model:page-size="currentPageSize"
      class="pagination"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handlePageSizeChange"
      @current-change="handlePageChange"
    />
  </div>
</template>

<style scoped>
.app-table-container {
  width: 100%;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
