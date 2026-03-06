[简体中文](#) | [English](./README.en.md)

# EasyEDA-UCard

嘉立创EDA 专业版扩展 - 模板化 PCB 名片生成工具

[![GitHub Repo Stars](https://img.shields.io/github/stars/no010/EasyEDA-UCard)](https://github.com/no010/EasyEDA-UCard)
[![GitHub Issues](https://img.shields.io/github/issues/no010/EasyEDA-UCard)](https://github.com/no010/EasyEDA-UCard/issues)
[![GitHub License](https://img.shields.io/github/license/no010/EasyEDA-UCard)](https://github.com/no010/EasyEDA-UCard/blob/main/LICENSE)

## 功能介绍

**EasyEDA-UCard** 是一款专为嘉立创EDA专业版设计的模板化 PCB 名片生成插件，仅在 PCB 编辑器中可用，旨在让开发者快速创建属于自己的 PCB 名片。

### 核心功能

- 💳 **PCB 名片生成**：在 PCB 页面输入姓名/联系方式后，一键生成名片板框与铜皮点阵文字
- 🎨 **模板化设计框架**：支持模板选择与后续扩展，内置 `Aurora Signature` 与 `Mono Grid` 设计模板
- 🌐 **双语支持**：完整支持中文和英文界面
- ⚡ **专注 PCB 工作流**：仅集成在 PCB 编辑器工具栏，交互聚焦名片快速生成

### 功能演示

![EasyEDA-UCard 功能演示](./images/demo.gif)

## 安装方法

### 方法一：从 LCEDA 扩展市场安装（推荐）

1. 打开嘉立创EDA专业版
2. 点击 **扩展 > 管理扩展**
3. 在扩展市场中搜索 **UCard**
4. 点击 **安装** 完成安装

详见 [LCEDA 安装指南](https://prodocs.lceda.cn/cn/api/guide/how-to-install.html)，也可直接访问 [LCEDA 扩展市场](https://ext.lceda.cn/)。

### 方法二：从源码构建

需要 Node.js >= 20.17.0

```shell
# 1. 克隆仓库
git clone https://github.com/no010/EasyEDA-UCard.git
cd EasyEDA-UCard

# 2. 安装依赖
npm install

# 3. 构建扩展包
npm run build

# 4. 在 ./build/dist/ 目录找到生成的 .eext 文件并安装
```

## 使用指南

### 生成 PCB 名片

1. 在 PCB 编辑器中，将鼠标移动到希望生成名片的左上角
2. 点击菜单栏 **UCard > Generate PCB Business Card...**
3. 先选择模板（当前提供 `AURORA` / `MONO`）
4. 依次输入姓名、职位、公司、电话、邮箱、网址与名片尺寸
5. 选择文字所在铜层（TOP/BOTTOM）
6. 插件会自动生成板框（Board Outline）与模板化图形 + 点阵铜皮文字

### Aurora Signature 模板特性

- 双栏信息布局（左侧身份信息 / 右侧联系方式）
- 内框 + 分割线 + 角标装饰，提升视觉层次
- 主标题大字号，其它信息细字号，突出重点

### Mono Grid 模板特性

- 极简网格布局，结构清晰
- 工程化标签列（NAME / ROLE / ORG / TEL / WEB）
- 更克制的视觉语言，适合偏技术风格名片

## 开发贡献

欢迎提交 Issue 和 Pull Request！

### 开发环境设置

```shell
# 安装依赖
npm install

# 编译（监视模式）
npm run compile

# 代码检查
npm run lint

# 自动修复代码风格
npm run fix

# 构建发布包
npm run build
```

### 项目结构

```
src/
├── index.ts                    # 入口文件
└── ui/
    └── pcb-card-generator.ts   # PCB 名片模板生成逻辑
locales/                        # 国际化文件
├── en.json                     # 英文翻译
├── zh-Hans.json                # 简体中文翻译
└── extensionJson/              # 菜单翻译
extension.json                  # 扩展配置文件
```

## 开源许可

本项目使用 [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/) 开源许可协议。

---

Made with ❤️ for EasyEDA Pro Community
