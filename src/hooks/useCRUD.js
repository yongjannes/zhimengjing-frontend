import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 通用CRUD操作Hook
// 提供列表查询、新增、修改、删除等基础操作的逻辑封装
export function useCRUD(options) {
  // 解构配置选项
  const {
    api, // API对象，包含list、getById、add、update、del等方法
    initialQueryParams = {}, // 初始查询参数，默认为空对象
    formatData, // 数据格式化函数，在获取列表后对数据进行处理
    callbacks = {}, // 回调函数集合，包括onSuccess和onError
    messages = {}, // 自定义消息文本，如成功、失败提示等
    entityName = "数据", // 实体名称，默认为"数据"
  } = options;

  // 响应式状态
  const loading = ref(false); // 表格加载状态
  const tableData = ref([]); // 表格数据
  const total = ref(0); // 数据总数（用于分页）
  const queryParams = reactive({
    // 查询参数（包含分页信息）
    pageNum: 1, // 当前页码
    pageSize: 10, // 每页数量
    ...initialQueryParams, // 扩展初始查询参数
  });
  const selectedIds = ref([]); // 已选中的行ID集合

  // 弹窗相关状态
  const dialogVisible = ref(false); // 弹窗显示状态
  const dialogTitle = ref(""); // 弹窗标题
  const formData = ref({}); // 表单数据

  // 获取数据列表
  // 调用API获取数据，并处理响应
  const getList = async () => {
    loading.value = true; // 开启加载状态
    try {
      // 调用API获取数据
      const response = await api.list(queryParams);
      let records = response.records || []; // 提取数据记录

      // 如果提供了数据格式化函数，则对每条记录进行处理
      if (formatData) {
        records = records.map((item, index) => formatData(item, index, queryParams));
      }

      // 更新表格数据和总数
      tableData.value = records;
      total.value = response.total;
    } catch (error) {
      // 错误处理：显示错误消息并执行回调
      console.error("获取列表失败:", error);
      ElMessage.error(messages.listError || "获取列表失败");
      callbacks.onError?.("list", error);
    } finally {
      loading.value = false; // 关闭加载状态
    }
  };

  // 处理查询操作
  // 将页码重置为1并重新获取数据
  const handleQuery = () => {
    queryParams.pageNum = 1; // 重置到第一页
    getList(); // 重新获取数据
  };

  // 重置查询参数
  const resetQuery = (config = { fetch: true }) => {
    // 深拷贝初始参数，避免引用问题
    const cleanInitialState = JSON.parse(JSON.stringify(initialQueryParams));

    // 清空当前查询参数
    Object.keys(queryParams).forEach((key) => {
      delete queryParams[key];
    });

    // 重新设置查询参数（包含默认分页参数和初始参数）
    Object.assign(queryParams, {
      pageNum: 1,
      pageSize: 5,
      ...cleanInitialState,
    });

    // 根据配置决定是否重新获取数据
    if (config.fetch) {
      getList();
    }
  };

  // 处理表格行选择变化
  const handleSelectionChange = (selection) => {
    // 提取选中行的ID
    selectedIds.value = selection.map((item) => item.id);
  };

  // 处理新增操作
  // @param {Object} initialFormData - 初始表单数据
  const handleAdd = (initialFormData = {}) => {
    // 设置初始表单数据（默认状态为启用）
    formData.value = { status: 1, ...initialFormData };
    dialogTitle.value = `新增${entityName}`;
    dialogVisible.value = true;
  };

  // 处理修改操作
  // @param {Object} row - 要修改的数据行
  const handleUpdate = async (row) => {
    try {
      // 根据ID获取详细信息
      const data = await api.getById(row.id);
      formData.value = data;
      dialogTitle.value = `修改${entityName}`;
      dialogVisible.value = true;
    } catch (error) {
      // 错误处理
      console.error(`获取${entityName}详情失败:`, error);
      ElMessage.error(messages.getByIdError || `获取${entityName}详情失败`);
      callbacks.onError?.("getById", error);
    }
  };

  // 处理删除操作
  // @param {Object} row - 要删除的数据行（可选，不传则删除选中的行）
  const handleDelete = (row) => {
    // 确定要删除的ID数组
    const ids = row?.id ? [row.id] : selectedIds.value;

    // 检查是否有选中的数据
    if (ids.length === 0) {
      ElMessage.warning("请选择要删除的数据");
      return;
    }

    // 确认删除操作
    const confirmMessage = `是否确认删除ID为"${ids.join(",")}"的${entityName}项？`;
    ElMessageBox.confirm(confirmMessage, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        try {
          // 执行删除操作
          await api.del(ids.join(","));
          ElMessage.success(messages.delSuccess || "删除成功");
          callbacks.onSuccess?.("del", ids);
          getList(); // 重新获取数据
        } catch (error) {
          // 删除失败处理
          console.error("删除失败:", error);
          ElMessage.error(messages.delError || "删除失败");
          callbacks.onError?.("del", error);
        }
      })
      .catch(() => {});
  };

  // 处理表单提交
  // @param {Object} data - 表单数据
  const handleFormSubmit = async (data) => {
    try {
      // 判断是新增还是修改操作
      const isUpdate = !!data.id;
      if (isUpdate) {
        // 修改操作
        await api.update(data.id, data);
        ElMessage.success(messages.updateSuccess || "修改成功");
        callbacks.onSuccess?.("update", data);
      } else {
        // 新增操作
        await api.add(data);
        ElMessage.success(messages.addSuccess || "新增成功");
        callbacks.onSuccess?.("add", data);
      }
      dialogVisible.value = false; // 关闭弹窗
      getList(); // 重新获取数据
    } catch (error) {
      // 提交失败处理
      console.error("操作失败:", error);
      ElMessage.error(messages.submitError || "操作失败");
      callbacks.onError?.(data.id ? "update" : "add", error);
    }
  };

  // 组件挂载时自动获取数据
  onMounted(getList);

  // 返回所有状态和方法，供组件使用
  return {
    loading,
    tableData,
    total,
    queryParams,
    selectedIds,
    dialogVisible,
    dialogTitle,
    formData,
    getList,
    handleQuery,
    resetQuery,
    handleSelectionChange,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleFormSubmit,
  };
}
