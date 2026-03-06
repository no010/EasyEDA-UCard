[简体中文](./README.md) | [English](#)

# EasyEDA-UCard

**Template-driven PCB Business Card Generator — EasyEDA Pro Extension**

[![GitHub Repo Stars](https://img.shields.io/github/stars/no010/EasyEDA-UCard)](https://github.com/no010/EasyEDA-UCard)
[![GitHub Issues](https://img.shields.io/github/issues/no010/EasyEDA-UCard)](https://github.com/no010/EasyEDA-UCard/issues)
[![GitHub License](https://img.shields.io/github/license/no010/EasyEDA-UCard)](https://github.com/no010/EasyEDA-UCard/blob/main/LICENSE)

## Overview

Generate stylish PCB business cards in EasyEDA Pro with a template system (`Aurora` / `Mono`). The plugin is PCB-editor only and focused on helping developers create their own PCB name cards quickly.

## Installation

### Option 1: From LCEDA Extension Market (Recommended)

1. Open EasyEDA Pro
2. Click **Extensions → Manage Extensions**
3. Search for **UCard** in the marketplace
4. Click **Install** to complete installation

See [LCEDA Installation Guide](https://prodocs.lceda.cn/en/api/guide/how-to-install.html) or visit [LCEDA Extension Market](https://ext.lceda.cn/).

### Option 2: Build from Source

Requires Node.js >= 20.17.0

```shell
# 1. Clone repository
git clone https://github.com/no010/EasyEDA-UCard.git
cd EasyEDA-UCard

# 2. Install dependencies
npm install

# 3. Build extension package
npm run build

# 4. Find the generated .eext file in ./build/dist/ and install it
```

## Features Demo

![EasyEDA-UCard Demo](./images/demo.gif)

## Features

- **PCB business card generator**: Create card outline and dot-matrix copper text from your profile fields
- **Template-driven architecture**: Select a card template and extend with new templates easily (`Aurora Signature` + `Mono Grid`)
- **Bilingual**: Full English & Chinese support
- **PCB-only workflow**: Available only in PCB editor toolbar for fast card creation

## Quick Start

### Generate PCB Business Card

1. In PCB editor, move the mouse to the target top-left position
2. Click **UCard → Generate PCB Business Card...**
3. Select a template first (`AURORA` or `MONO`)
4. Enter name, title, company, phone, email, website, and card size
5. Choose target copper layer (`TOP` / `BOTTOM`)
6. The plugin creates board outline and template graphics + dot-matrix copper text

### Aurora Signature Template

- Elegant dual-column layout (identity on left, contact on right)
- Inner frame, separator, and corner marks for visual structure
- Strong hierarchy with larger name title and compact supporting lines

### Mono Grid Template

- Minimalist grid composition with clear structure
- Engineering-style label column (`NAME / ROLE / ORG / TEL / WEB`)
- Restrained visual rhythm for a clean technical identity

## License

This project uses [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/).

---

Made with ❤️ for EasyEDA Pro Community
