[简体中文](./README.md) | [English](#)

# EasyEDA-UCard

PCB Business Card Toolkit — EasyEDA Pro Extension

[![GitHub Repo Stars](https://img.shields.io/github/stars/no010/EasyEDA-UCard)](https://github.com/no010/EasyEDA-UCard)
[![GitHub Issues](https://img.shields.io/github/issues/no010/EasyEDA-UCard)](https://github.com/no010/EasyEDA-UCard/issues)
[![GitHub License](https://img.shields.io/github/license/no010/EasyEDA-UCard)](https://github.com/no010/EasyEDA-UCard/blob/main/LICENSE)

## Overview

**EasyEDA-UCard** is an EasyEDA Pro extension (PCB editor only) that provides three focused tools for creating PCB business cards:

| # | Menu Item | Description |
|---|-----------|-------------|
| 1 | **Import Card Template** | Import the built-in epro2 template (or your own local template) into the current project |
| 2 | **Replace Card Text** | Read all text primitives in the current PCB and replace them in bulk |
| 3 | **Generate Card QR Code** | Place a vCard contact QR code or image QR code on the PCB |

### Demo

![EasyEDA-UCard Demo](./images/demo.gif)

## Installation

### Option 1: From LCEDA Extension Market (Recommended)

1. Open EasyEDA Pro
2. Click **Extensions → Manage Extensions**
3. Search for **UCard** and click **Install**

See [LCEDA Installation Guide](https://prodocs.lceda.cn/en/api/guide/how-to-install.html) or visit [LCEDA Extension Market](https://ext.lceda.cn/).

### Option 2: Build from Source

Requires Node.js >= 20.17.0

```shell
git clone https://github.com/no010/EasyEDA-UCard.git
cd EasyEDA-UCard
npm install
npm run build
# Install the .eext file from ./build/dist/
```

## Usage

### Step 1: Import Card Template

1. Open the PCB editor
2. Click **UCard > 1. Import Card Template...**
3. The built-in `ucard.epro2` template is used by default; click "Replace with local template" to use your own epro2 file
4. Click "Import Card Template" — the dialog closes immediately and the template is imported in the background
5. A notification appears on completion; the built-in template keeps placeholder text (e.g. `{{name}}`) for Step 2

### Step 2: Replace Card Text

1. Make sure you are on a PCB editor tab
2. Click **UCard > 2. Replace Card Text...**
3. All text primitives in the current PCB are listed with their current content
4. Edit the values you want to change, then click "Replace Card Text"

### Step 3: Generate Card QR Code (optional)

1. Click **UCard > 3. Generate Card QR Code...**
2. Two modes available:
   - **vCard Contact**: fill in name, phone, email, etc. — scanning with WeChat or a phone camera saves contact directly
   - **Image QR Code**: upload or paste a PNG/JPG image to convert it to copper fill

## Development

```shell
npm install       # install dependencies
npm run compile   # compile only (no bundling)
npm run lint      # lint
npm run build     # build release package → build/dist/
```

### Project Structure

```
src/
├── index.ts                         # entry: exports three menu functions
├── core/
│   ├── template-contract.ts         # type definitions & utilities
│   ├── template-local-loader.ts     # built-in / local template loader (GitHub fallback)
│   ├── template-fallback-renderer.ts# fallback draw mode for local templates
│   ├── epro2-import-executor.ts     # epro2 import + text replacement
│   ├── qr-generator.ts              # QR matrix generation
│   └── qr-pcb-placer.ts             # QR placement on PCB
└── ui/
    └── pcb-card-generator.ts        # message bus handlers + IFrame lifecycle
iframe/
├── import.html                      # Step 1 UI
├── apply.html                       # Step 2 UI
└── qrcode.html                      # Step 3 UI
templates/
└── ucard.epro2                      # built-in card template
locales/                             # i18n files
extension.json                       # extension manifest
```

## License

[Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/)

---

Made with ❤️ for EasyEDA Pro Community
