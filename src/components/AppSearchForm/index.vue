<script setup>
import { computed, ref } from "vue";

// Props & Emits
const props = defineProps({
  modelValue: { type: Object, required: true },
  items: { type: Array, required: true },
  defaultVisibleCount: { type: Number, default: 3 }, // 默认显示多少个
});
const emit = defineEmits(["update:modelValue", "search", "reset"]);

// 表单数据
const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 展开/收起状态
const expanded = ref(false);

// 控制显示的搜索项
const visibleItems = computed(() =>
  expanded.value ? props.items : props.items.slice(0, props.defaultVisibleCount),
);

// 搜索方法
const handleSearch = () => emit("search", formData.value);

// 重置方法
const handleReset = () => {
  const resetVal = {};
  props.items.forEach((item) => {
    if (item.default !== undefined) resetVal[item.prop] = item.default;
    else if (["daterange", "datetimerange"].includes(item.type)) resetVal[item.prop] = [];
    else if (item.type === "multiple" || item.type === "checkbox") resetVal[item.prop] = [];
    else resetVal[item.prop] = "";
  });
  emit("update:modelValue", resetVal);
  emit("reset", resetVal);
};

// 辅助函数：处理宽度（数字加 px，字符串直接用）
const getWidth = (width) => {
  if (!width) return {};
  return { width: typeof width === "number" ? width + "px" : width };
};
</script>

<template>
  <el-card shadow="never" class="search-card">
    <el-form :model="formData" label-width="100px">
      <el-row :gutter="10" type="flex" wrap>
        <!-- 渲染搜索项 -->
        <el-col
          v-for="item in visibleItems"
          :key="item.prop"
          :style="{ flex: '0 0 auto', marginRight: '10px', ...getWidth(item.width) }"
        >
          <el-form-item :label="item.label" :prop="item.prop">
            <el-input
              v-if="item.type === 'input'"
              v-model="formData[item.prop]"
              :placeholder="item.placeholder || '请输入'"
              clearable
              :style="getWidth(item.width)"
              @keyup.enter="handleSearch"
            />
            <el-input
              v-else-if="item.type === 'textarea'"
              v-model="formData[item.prop]"
              type="textarea"
              :placeholder="item.placeholder || '请输入'"
              clearable
              :style="getWidth(item.width)"
            />
            <el-input
              v-else-if="item.type === 'number'"
              v-model="formData[item.prop]"
              type="number"
              :placeholder="item.placeholder || '请输入数字'"
              clearable
              :style="getWidth(item.width)"
            />
            <el-select
              v-else-if="item.type === 'select'"
              v-model="formData[item.prop]"
              :placeholder="item.placeholder || '请选择'"
              clearable
              :style="getWidth(item.width)"
              @change="handleSearch"
            >
              <el-option
                v-for="opt in item.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <el-select
              v-else-if="item.type === 'multiple'"
              v-model="formData[item.prop]"
              multiple
              :placeholder="item.placeholder || '请选择'"
              clearable
              :style="getWidth(item.width)"
              @change="handleSearch"
            >
              <el-option
                v-for="opt in item.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <el-radio-group
              v-else-if="item.type === 'radio'"
              v-model="formData[item.prop]"
              :style="getWidth(item.width)"
              @change="handleSearch"
            >
              <el-radio v-for="opt in item.options" :key="opt.value" :label="opt.value">
                {{ opt.label }}
              </el-radio>
            </el-radio-group>
            <el-checkbox-group
              v-else-if="item.type === 'checkbox'"
              v-model="formData[item.prop]"
              :style="getWidth(item.width)"
              @change="handleSearch"
            >
              <el-checkbox v-for="opt in item.options" :key="opt.value" :label="opt.value">
                {{ opt.label }}
              </el-checkbox>
            </el-checkbox-group>
            <el-switch
              v-else-if="item.type === 'switch'"
              v-model="formData[item.prop]"
              :style="getWidth(item.width)"
              @change="handleSearch"
            />
            <el-slider
              v-else-if="item.type === 'slider'"
              v-model="formData[item.prop]"
              :min="item.min || 0"
              :max="item.max || 100"
              :style="getWidth(item.width)"
              @change="handleSearch"
            />
            <el-date-picker
              v-else-if="item.type === 'date'"
              v-model="formData[item.prop]"
              type="date"
              :placeholder="item.placeholder || '请选择日期'"
              value-format="YYYY-MM-DD"
              clearable
              :style="getWidth(item.width)"
              @change="handleSearch"
            />
            <el-date-picker
              v-else-if="item.type === 'datetime'"
              v-model="formData[item.prop]"
              type="datetime"
              :placeholder="item.placeholder || '请选择日期时间'"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
              :style="getWidth(item.width)"
              @change="handleSearch"
            />
            <el-date-picker
              v-else-if="item.type === 'daterange'"
              v-model="formData[item.prop]"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              clearable
              :style="getWidth(item.width)"
              @change="handleSearch"
            />
            <el-date-picker
              v-else-if="item.type === 'datetimerange'"
              v-model="formData[item.prop]"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
              :style="getWidth(item.width)"
              @change="handleSearch"
            />
            <el-cascader
              v-else-if="item.type === 'cascader'"
              v-model="formData[item.prop]"
              :options="item.options"
              clearable
              :style="getWidth(item.width)"
              @change="handleSearch"
            />
            <component
              :is="item.component"
              v-else-if="item.type === 'custom'"
              v-model="formData[item.prop]"
              :style="getWidth(item.width)"
            />
          </el-form-item>
        </el-col>

        <!-- 操作按钮 + 展开收起 -->
        <el-col :style="{ flex: '0 0 auto', marginLeft: '10px' }" class="search-actions">
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
            <el-button type="text" @click="expanded = !expanded">
              {{ expanded ? "收起" : "展开" }}
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-card>
</template>

<style scoped>
.search-card {
  margin-bottom: 10px;
}
.search-actions {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
</style>
