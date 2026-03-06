/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const DTS_PATH = path.join(ROOT, 'node_modules', '@jlceda', 'pro-api-types', 'index.d.ts');
const OUT_DIR = path.join(ROOT, 'docs', 'lceda-pro-api');

function ensureDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

function readText(filePath) {
	return fs.readFileSync(filePath, 'utf8');
}

function uniqSorted(values) {
	return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function docUrlFor(name, lang = 'cn') {
	const slug = name.toLowerCase();
	return `https://prodocs.lceda.cn/${lang}/api/reference/pro-api.${slug}.html`;
}

function extractByRegex(text, regex) {
	const list = [];
	for (const m of text.matchAll(regex)) {
		list.push(m[1]);
	}
	return uniqSorted(list);
}

function extractClassBlock(text, className) {
	const startRe = new RegExp(`declare class ${className}\\b[^\\n]*\\{`, 'm');
	const startMatch = startRe.exec(text);
	if (!startMatch) {
		return '';
	}

	let i = startMatch.index + startMatch[0].length;
	let depth = 1;
	while (i < text.length && depth > 0) {
		const ch = text[i];
		if (ch === '{')
			depth += 1;
		else if (ch === '}')
			depth -= 1;
		i += 1;
	}
	return text.slice(startMatch.index, i);
}

function extractMethodSigs(classBlock) {
	const lines = classBlock.split(/\r?\n/).map(line => line.trim());
	const sigs = [];
	for (const line of lines) {
		if (!line || line.startsWith('//') || line.startsWith('*') || line.startsWith('export declare class'))
			continue;
		if (line.startsWith('constructor('))
			continue;
		if (!line.includes('(') || !line.includes('):'))
			continue;
		if (!line.endsWith(';'))
			continue;
		sigs.push(line);
	}
	return sigs;
}

function buildApiIndexMarkdown(meta) {
	const generatedAt = new Date().toISOString();
	return [
		'# LCEDA / EasyEDA Pro API 索引（本地整理）',
		'',
		`- 生成时间: ${generatedAt}`,
		'- 来源 1: `node_modules/@jlceda/pro-api-types/index.d.ts`',
		'- 来源 2: 官方总览页面: https://prodocs.lceda.cn/cn/api/reference/pro-api.html',
		'',
		'> 说明: 此索引优先保证“可查找性”，链接按命名规则自动拼接；若个别页面命名变更，请以总览页为准。',
		'',
		`## Classes (${meta.classes.length})`,
		'',
		...meta.classes.map(name => `- [${name}](${docUrlFor(name)})`),
		'',
		`## Interfaces (${meta.interfaces.length})`,
		'',
		...meta.interfaces.map(name => `- [${name}](${docUrlFor(name)})`),
		'',
		`## Enums (${meta.enums.length})`,
		'',
		...meta.enums.map(name => `- [${name}](${docUrlFor(name)})`),
		'',
	].join('\n');
}

function buildPcbReferenceMarkdown(meta, methodMap) {
	const generatedAt = new Date().toISOString();
	const pcbClasses = meta.classes.filter(name => name.startsWith('PCB_') || name.startsWith('IPCB_'));
	const pcbEnums = meta.enums.filter(name => name.startsWith('EPCB_'));
	const pcbInterfaces = meta.interfaces.filter(name => name.startsWith('IPCB_'));

	const parts = [
		'# PCB API 重点整理（LCEDA Pro）',
		'',
		`- 生成时间: ${generatedAt}`,
		'- 官方总览: https://prodocs.lceda.cn/cn/api/reference/pro-api.html',
		'',
		'## PCB Classes',
		'',
		...pcbClasses.map((name) => {
			const methods = methodMap.get(name) || [];
			return [
				`### [${name}](${docUrlFor(name)})`,
				methods.length ? '' : '- 方法签名: （未在 d.ts 中提取到）',
				...methods.map(sig => `- \`${sig}\``),
				'',
			].join('\n');
		}),
		'## PCB Interfaces',
		'',
		...pcbInterfaces.map(name => `- [${name}](${docUrlFor(name)})`),
		'',
		'## PCB Enums',
		'',
		...pcbEnums.map(name => `- [${name}](${docUrlFor(name)})`),
		'',
	].join('\n');
	return parts;
}

function buildReadme() {
	return [
		'# LCEDA Pro API Docs Mirror (Curated)',
		'',
		'这个目录用于把 LCEDA / EasyEDA Pro API 文档整理到仓库内，便于插件开发时快速检索。',
		'',
		'## 文件说明',
		'',
		'- `all-api-index.md`: 全量 API 索引（Class / Interface / Enum）',
		'- `pcb-api-reference.md`: PCB 相关 API 重点文档（含类方法签名）',
		'',
		'## 更新方式',
		'',
		'```bash',
		'node tools/generate-lceda-api-docs.js',
		'```',
		'',
		'脚本来源为本地 `@jlceda/pro-api-types`，并附官方文档链接用于跳转核对。',
		'',
	].join('\n');
}

function main() {
	if (!fs.existsSync(DTS_PATH)) {
		throw new Error(`Missing file: ${DTS_PATH}`);
	}
	ensureDir(OUT_DIR);

	const dts = readText(DTS_PATH);
	const classes = extractByRegex(dts, /declare class (\w+)\b/g);
	const interfaces = extractByRegex(dts, /declare interface (\w+)\b/g);
	const enums = extractByRegex(dts, /declare enum (\w+)\b/g);

	const meta = { classes, interfaces, enums };
	const methodMap = new Map();

	for (const name of classes.filter(n => n.startsWith('PCB_') || n.startsWith('IPCB_'))) {
		const block = extractClassBlock(dts, name);
		if (!block) {
			continue;
		}
		methodMap.set(name, extractMethodSigs(block));
	}

	fs.writeFileSync(path.join(OUT_DIR, 'README.md'), buildReadme(), 'utf8');
	fs.writeFileSync(path.join(OUT_DIR, 'all-api-index.md'), buildApiIndexMarkdown(meta), 'utf8');
	fs.writeFileSync(path.join(OUT_DIR, 'pcb-api-reference.md'), buildPcbReferenceMarkdown(meta, methodMap), 'utf8');

	console.log(`Generated docs in: ${OUT_DIR}`);
}

main();
