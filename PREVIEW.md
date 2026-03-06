## 🎨 UCard PCB 名片效果预览

### 📋 样例数据

**用户 1 - Aurora 模板示例**
```
姓名:       张三
职位:       硬件工程师
公司:       酷芯科技
电话:       +86 13800138000
邮箱:       zhang@example.com
网址:       www.example.com
GitHub:     github.com/zhangsan
技术栈:     C++/Python/FPGA
Slogan:     Make Hardware Great Again
尺寸:       90 × 54 mm
模板:       AURORA
```

---

## 🎯 Aurora Signature 模板 - 双栏结构

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│ ┃ 张三              TEL +86 13800138000               ┃ │
│ ┃ 硬件工程师        MAIL zhang@example.com      ┏━━┓ │ │
│ ┃ 酷芯科技      WEB www.example.com             ┃  ┃ │ │
│ ┃ ─────────────        GitHub github.com/zhangsan┃ Q┃ │ │
│ ┃ Make Hardware      Stack C++/Python/FPGA      ┃ R┃ │ │
│ ┃  Great Again                                   ┗━━┛ │ │
│                                                        │
└─────────────────────────────────────────────────────────┘
   ↑              ↑                                    ↑
   │              │                                    │
 左侧色块   核心信息（姓名、职位、公司）     二维码区域
   (品牌)        + 装饰分割线               (右下角)
```

**特点：**
- ✨ 左侧渐变色块（#667eea → #764ba2）建立品牌感
- 📍 姓名最大最粗，职位和公司次之，视觉层次清晰
- 📞 右侧分行展示所有联系方式，易于逐项查看
- 🔗 包含 GitHub 和技术栈，突出开发者身份
- 📱 右下角集成二维码（18mm×18mm），扫码保存 vCard
- ✍️ 可自定义 Slogan，展现个人品味

---

## 🎯 Mono Grid 模板 - 表格结构

```
┌─────────────────────────────────────────────────────────┐
│ MONO GRID                              ┏━━━━━━━━━━━┓    │
│ ─────────────────────────────────────  ┃           ┃    │
│ NAME │ 李四                            ┃     Q     ┃    │
│ ROLE │ 嵌入式开发                      ┃     R     ┃    │
│ ORG  │ 创新电子                        ┃     C     ┃    │
│ TEL  │ +86 18900008888                 ┃     O     ┃    │
│ WEB  │ lisi@example.com                ┃     D     ┃    │
│ CODE │ github.com/lisi                 ┃     E     ┃    │
│ STACK│ Rust/Go/ARM                     ┗━━━━━━━━━━━┛    │
│                                                        │
└─────────────────────────────────────────────────────────┘
   ↑            ↑                              ↑
   │            │                              │
  标签栏      值栏                        二维码区域
 (竖列排列)  (对齐显示)                   (右上角)
```

**特点：**
- 📊 标签-值结构，逻辑清晰
- 🔲 所有字段按顺序排列，便于阅读
- 📐 采用等宽间距，图表感强
- 🖇️ 标签栏左侧有竖线分隔，边界明确
- 📱 右上角集成二维码（16mm×16mm），节省空间
- 🎨 高对比度，黑白配色，打印友好

---

## 📱 二维码功能

### 扫码所得信息（vCard 3.0 格式）

```
BEGIN:VCARD
VERSION:3.0
FN:张三
TITLE:硬件工程师
ORG:酷芯科技
TEL:+86 13800138000
EMAIL:zhang@example.com
URL:www.example.com
NOTE:GitHub: github.com/zhangsan | Stack: C++/Python/FPGA | Make Hardware Great Again
END:VCARD
```

**优势：**
- ✅ 标准 vCard 格式，支持所有手机和联系人应用
- 🔗 包含所有开发者字段（GitHub、技术栈、slogan）
- 📲 扫码即可一键添加到通讯录
- 🌐 无需网络访问，完全本地生成

---

## 🎨 设计细节对比

| 特性 | Aurora | Mono Grid | 选择建议 |
|------|--------|-----------|---------|
| 视觉感 | 现代、彩色 | 极简、黑白 | 看个人风格 |
| 信息量 | 中等 | 高（8 行） | 信息多选 Mono |
| 品牌感 | 强（左侧色块） | 弱（纯几何） | 需要美感选 Aurora |
| 二维码位置 | 右下 | 右上 | Aurora 更隐蔽 |
| 打印效果 | 需彩色 | 纯黑白可用 | 黑白打印选 Mono |
| 易读性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | - |

---

## 📐 尺寸规范

**国际标准商务卡尺寸：90 × 54 mm**

转换为其他单位：
- 英寸：3.54" × 2.13"
- 像素（300 DPI）：1063 × 638 px
- 毫米（PCB）：90 × 54 mm
- 密位（EasyEDA）：35,433 × 21,260 mil

**PCB 工艺**：
- 板层：TOP 或 BOTTOM（可选）
- 线宽：0.1-0.2 mm（建议）
- 焊盘：0.6-1.2 mm（推荐用文字图元）
- 板框：包围整个名片边界

---

## 🚀 生成流程示意

```
┌─ 启动插件 ─────────────────────────────────────────┐
│ 在 EasyEDA Pro PCB 编辑器中运行                    │
└─ │ ─────────────────────────────────────────────────┘
   │
   ├─ 采集用户信息（9 个字段）
   │  ├─ 名字 ★
   │  ├─ 职位
   │  ├─ 公司
   │  ├─ 电话
   │  ├─ 邮箱
   │  ├─ 网址
   │  ├─ GitHub ★ (新)
   │  ├─ 技术栈 ★ (新)
   │  └─ Slogan ★ (新)
   │
   ├─ 选择配置
   │  ├─ 模板（AURORA / MONO）
   │  ├─ 尺寸（默认 90×54 mm）
   │  └─ 铜层（TOP / BOTTOM）
   │
   ├─ 检测现有板框 ← 新增，防止重复
   │  ├─ 如果有 → 询问用户是否覆盖
   │  └─ 如果没有 → 直接绘制
   │
   ├─ 渲染名片内容
   │  ├─ 绘制板框
   │  ├─ 渲染模板布局
   │  ├─ 尝试文字图元（优先） ← 新策略
   │  │  └─ 失败时降级到点阵焊盘
   │  ├─ 生成 QR 码 ← 新策略
   │  │  ├─ 优先使用 qrcode 库
   │  │  └─ 失败时降级到本地实现
   │  └─ 添加装饰元素（边框、分割线等）
   │
   └─ 完成 ✅
      提示用户：
      ├─ 名片已生成
      ├─ 建议执行 DRC 检查
      └─ 可微调位置
```

---

## 💾 文件生成物

生成后的 PCB 文件内容：

```
PCB_PrimitiveLine  (板框，4 条边)
PCB_PrimitivePad   (文字 - 点阵或图元)
PCB_PrimitivePad   (二维码 - 矩阵)
PCB_PrimitiveLine  (装饰线 - 分割线、边框)
```

**尺寸大概**：
- 纯文字（文字图元）：< 10 KB
- 纯文字（点阵焊盘）：50-100 KB（因焊盘数量）
- 含二维码：用点阵表示，额外 30-50 个焊盘

---

## 🧪 测试案例

### 案例 1：标准开发者卡
```
Zhang San | Senior Hardware Engineer | CoolChip Tech
+86 138 0013 8000 | engineering@coolchip.cn
github.com/zhangsan | C++/Python/FPGA
→ 选择 Aurora 模板，彩色打印，突出品牌感
```

### 案例 2：极简技术型
```
Li Si | Embedded Developer | InnovatE Electronics
lisi@example.com | github.com/lisi
Rust/Go/ARM
→ 选择 Mono Grid，黑白打印，逻辑清晰
```

### 案例 3：个性化展示
```
Wang Wu | IoT Architect | Self-employed
微博/Twitter: @wang_wu_iot | github.com/wangwu
Python/JavaScript/cloud-native
📌 "Build things, change world" ← 自定义 Slogan
→ 选择 Aurora，展示个人 Slogan 和技术风范
```

---

## ✅ 功能完整性检查

| 功能 | 状态 | 备注 |
|------|------|------|
| 基础字段采集 | ✅ | 9 个字段完整 |
| Aurora 模板 | ✅ | 双栏布局已实现 |
| Mono Grid 模板 | ✅ | 表格布局已实现 |
| GitHub 字段集成 | ✅ | 新增，两个模板支持 |
| 技术栈显示 | ✅ | 新增，两个模板支持 |
| Slogan 集成 | ✅ | Aurora 中显示，Mono 隐藏 |
| 二维码生成 | ✅ | vCard 格式，两层降级 |
| 文字渲染策略 | ✅ | 文字图元优先 + 点阵降级 |
| 板框检测 | ✅ | 检测并提示用户 |
| 多语言支持 | ✅ | 中英文菜单 |
| 国际化确认 | ✅ | 所有提示文本已翻译 |

---

**🎉 准备好了吗？在 EasyEDA Pro 中试试看吧！**
