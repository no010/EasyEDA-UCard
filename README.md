[简体中文](#) | [English](./README.en.md)

# EasyEDA-UCard

嘉立创EDA 专业版扩展 — PCB 名片工具集

[![GitHub Repo Stars](https://img.shields.io/github/stars/no010/EasyEDA-UCard)](https://github.com/no010/EasyEDA-UCard)
[![GitHub Issues](https://img.shields.io/github/issues/no010/EasyEDA-UCard)](https://github.com/no010/EasyEDA-UCard/issues)
[![GitHub License](https://img.shields.io/github/license/no010/EasyEDA-UCard)](https://github.com/no010/EasyEDA-UCard/blob/main/LICENSE)

## 功能介绍

**EasyEDA-UCard** 是一款专为嘉立创EDA专业版设计的 PCB 名片工具插件，仅在 PCB 编辑器中可用，包含三个独立功能：

| # | 菜单项 | 说明 |
|---|--------|------|
| 1 | **导入名片模板** | 将内置 epro2 模板（或用户自己的本地模板）直接导入到当前工程 |
| 2 | **替换名片文本** | 读取当前 PCB 中所有文本图元，逐一编辑后批量替换 |
| 3 | **生成名片二维码** | 在 PCB 上生成 vCard 联系人二维码或导入图片二维码 |

### 功能演示

![EasyEDA-UCard 功能演示](./images/demo.gif)

## 安装方法

### 方法一：从 LCEDA 扩展市场安装（推荐）

1. 打开嘉立创EDA专业版
2. 点击 **扩展 > 管理扩展**
3. 搜索 **UCard**，点击 **安装**

详见 [LCEDA 安装指南](https://prodocs.lceda.cn/cn/api/guide/how-to-install.html)，也可直接访问 [LCEDA 扩展市场](https://ext.lceda.cn/)。

### 方法二：从源码构建

需要 Node.js >= 20.17.0

```shell
git clone https://github.com/no010/EasyEDA-UCard.git
cd EasyEDA-UCard
npm install
npm run build
# 在 ./build/dist/ 目录找到 .eext 文件并安装
```

## 使用指南

> 注意安装扩展后要允许外部交互权限。

![扩展权限](./images/扩展权限.png)

### 步骤 1：导入名片模板

1. 打开 PCB 编辑器
2. 点击菜单 **UCard > 1. 导入名片模板...**
3. 默认使用内置模板（`ucard.epro2`），也可点击"替换为本地模板"选择自己的 epro2 文件
4. 点击"导入名片模板"，窗口自动关闭，模板在后台导入到当前工程
5. 导入完成后弹窗提示；内置模板保留占位符文本（如 `{{name}}`），进行第 2 步替换

![demo1](./images/demo1.gif)

### 步骤 2：替换名片文本

1. 确保当前在 PCB 编辑器页面
2. 点击菜单 **UCard > 2. 替换名片文本...**
3. 列表中显示当前 PCB 的所有文本图元与其内容
4. 直接修改需要更改的文本，点击"替换名片文本"完成替换

![demo2](./images/demo2.gif)

### 步骤 3：生成名片二维码（可选）

1. 点击菜单 **UCard > 3. 生成名片二维码...**
2. 支持两种模式：
   - **vCard 联系人**：填写姓名、电话、邮箱等，微信/手机扫码可直接保存联系人
   - **图片二维码**：上传或粘贴 PNG/JPG 图片转为铜皮二维码

## 开发贡献

欢迎提交 Issue 和 Pull Request！

```shell
npm install       # 安装依赖
npm run compile   # 编译（不打包）
npm run lint      # 代码检查
npm run build     # 构建发布包（输出到 build/dist/）
```

### 项目结构

```
src/
├── index.ts                         # 入口：导出三个菜单函数
├── core/
│   ├── template-contract.ts         # 类型定义与工具函数
│   ├── template-local-loader.ts     # 内置/本地模板加载（含 GitHub 回源）
│   ├── template-fallback-renderer.ts# fallback 绘制模式
│   ├── epro2-import-executor.ts     # epro2 导入 + 文本替换逻辑
│   ├── qr-generator.ts              # QR 矩阵生成
│   └── qr-pcb-placer.ts             # QR 图形放置到 PCB
└── ui/
    └── pcb-card-generator.ts        # 消息总线处理 + IFrame 管理
iframe/
├── import.html                      # 步骤 1 UI
├── apply.html                       # 步骤 2 UI
└── qrcode.html                      # 步骤 3 UI
templates/
└── ucard.epro2                      # 内置名片模板
locales/                             # 国际化文件
extension.json                       # 扩展配置
```

## 开源许可

本项目使用 [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/) 开源许可协议。

---

Made with ❤️ for EasyEDA Pro Community
