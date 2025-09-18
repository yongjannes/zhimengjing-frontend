import presetWeapp from "unocss-preset-weapp";
import { extractorAttributify, transformerClass } from "unocss-preset-weapp/transformer";

// 提取 attributify 功能
const { presetWeappAttributify, transformerAttributify } = extractorAttributify();

export default {
  // 使用的预设
  presets: [
    presetWeapp(), // weapp 核心 preset
    presetWeappAttributify(), // attributify 自动完成
  ],

  // 自定义快捷类
  shortcuts: [
    { "flex-center": "flex justify-center items-center" },
    { "flex-col": "flex flex-col" },
  ],

  // 转换器
  transformers: [
    transformerAttributify(), // 支持 attributify 语法
    transformerClass(), // 支持 class 扩展写法
  ],
};
