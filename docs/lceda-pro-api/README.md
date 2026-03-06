# LCEDA Pro API Docs Mirror (Curated)

这个目录用于把 LCEDA / EasyEDA Pro API 文档整理到仓库内，便于插件开发时快速检索。

## 文件说明

- `all-api-index.md`: 全量 API 索引（Class / Interface / Enum）
- `pcb-api-reference.md`: PCB 相关 API 重点文档（含类方法签名）

## 更新方式

```bash
node tools/generate-lceda-api-docs.js
```

脚本来源为本地 `@jlceda/pro-api-types`，并附官方文档链接用于跳转核对。
