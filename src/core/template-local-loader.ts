import type {
	RuntimeTemplateSummary,
	TemplateFallbackModel,
	TemplateFieldDef,
	TemplateManifest,
	TemplatePackage,
} from './template-contract';

import JSZip from 'jszip';

import { extractPlaceholderKeys } from './template-contract';

const LOADER_LOG_PREFIX = '[UCard][LocalLoader]';

export const BUILTIN_TEMPLATE_SOURCE_ID = 'builtin-local';
export const BUILTIN_TEMPLATE_SOURCE_LABEL = '仓库内置模板';
export const LOCAL_TEMPLATE_SOURCE_ID = 'local-upload';
export const LOCAL_TEMPLATE_SOURCE_LABEL = '本地导入模板';

const BUILTIN_TEMPLATE_FOLDER = '/templates';
const BUILTIN_EPRO2_FILENAME = 'ucard.epro2';
const BUILTIN_EPRO2_GITHUB_URL = 'https://github.com/no010/EasyEDA-UCard/raw/refs/heads/main/templates/ucard.epro2';

function buildBuiltinSyntheticManifest(): TemplateManifest {
	return {
		schemaVersion: 1,
		id: 'builtin.ucard.v1',
		name: 'UCard 名片模板',
		version: 'v1.0',
		description: '内置标准名片模板，导入后可通过「替换名片文本」修改内容。',
		widthMm: 90,
		heightMm: 54,
		epro2FileName: BUILTIN_EPRO2_FILENAME,
		fields: [],
	};
}

function logLoaderInfo(message: string): void {
	(eda.sys_Log as any)?.add?.(`${LOADER_LOG_PREFIX} ${message}`, ESYS_LogType.INFO);
}

function logLoaderWarn(message: string): void {
	(eda.sys_Log as any)?.add?.(`${LOADER_LOG_PREFIX} ${message}`, ESYS_LogType.WARNING);
}

function normalizeName(input: string): string {
	return input
		.trim()
		.replace(/\.[^.]+$/, '')
		.replace(/[^\w.-]+/g, '-')
		.replace(/-+/g, '-')
		.toLowerCase();
}

function isEpro2FileName(fileName: string): boolean {
	return /\.epro2$/i.test(fileName.trim());
}

function nowTag(): string {
	return new Date().toISOString().replace(/[.:TZ-]/g, '').slice(0, 14);
}

function toFieldDefs(keys: string[]): TemplateFieldDef[] {
	return keys.map((key, index) => ({
		key,
		label: key,
		type: key.includes('bio') || key.includes('intro') || key.includes('desc') ? 'multiline' : 'text',
		required: index === 0,
		order: index,
	}));
}

function getDefaultFieldKeys(): string[] {
	return [
		'name',
		'title',
		'company',
		'phone',
		'email',
		'website',
		'github',
		'tagline',
	];
}

function buildFallbackModel(fields: TemplateFieldDef[]): TemplateFallbackModel {
	const textPrimitives = fields.slice(0, 9).map((field, index) => {
		const y = 5 + (index * 4);
		return {
			layer: 1,
			x: 4,
			y,
			fontSizeMm: index === 0 ? 2.4 : 1.3,
			lineWidthMm: index === 0 ? 0.24 : 0.18,
			alignMode: 0,
			text: `{{${field.key}}}`,
		};
	});

	return {
		outline: {
			widthMm: 90,
			heightMm: 50,
			lineWidthMm: 0.2,
		},
		textPrimitives,
	};
}

function buildManifestFromFile(fileName: string, extractedKeys: string[]): TemplateManifest {
	const keys = extractedKeys.length > 0 ? extractedKeys : getDefaultFieldKeys();
	const fields = toFieldDefs(keys);
	const idBase = normalizeName(fileName) || 'local-template';
	return {
		schemaVersion: 1,
		id: `local.${idBase}.${nowTag()}`,
		name: `本地模板: ${fileName}`,
		version: 'local',
		description: extractedKeys.length > 0
			? '从 epro2 中识别到占位符字段。'
			: '未识别到占位符，生成阶段将基于字符串图元顺序进行字段替换。',
		widthMm: 90,
		heightMm: 50,
		epro2FileName: fileName,
		fields,
		fallback: buildFallbackModel(fields),
	};
}

async function safeExtractKeysFromZip(buffer: ArrayBuffer): Promise<Set<string>> {
	const keys = new Set<string>();
	try {
		const zip = await JSZip.loadAsync(buffer);
		const entries = Object.values(zip.files);
		for (const entry of entries) {
			if (entry.dir)
				continue;
			try {
				const text = await entry.async('string');
				for (const key of extractPlaceholderKeys(text))
					keys.add(key);
			}
			catch {
				// keep scanning other entries
			}
		}
	}
	catch {
		logLoaderWarn('epro2 zip parse failed; continue with raw text detection');
		// ignore zip parse failures
	}
	return keys;
}

async function detectPlaceholderKeys(file: File): Promise<string[]> {
	const keys = new Set<string>();
	const buffer = await file.arrayBuffer();

	try {
		const rawText = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
		for (const key of extractPlaceholderKeys(rawText))
			keys.add(key);
	}
	catch {
		logLoaderWarn(`raw text decode failed for file=${file.name}`);
		// ignore text decode failure
	}

	const zipKeys = await safeExtractKeysFromZip(buffer);
	for (const key of zipKeys)
		keys.add(key);

	return [...keys];
}

function toRuntimeSummary(pkg: TemplatePackage): RuntimeTemplateSummary {
	return {
		sourceId: pkg.sourceId,
		sourceLabel: pkg.sourceLabel,
		templateId: pkg.templateId,
		templateName: pkg.manifest.name,
		version: pkg.manifest.version,
		description: pkg.manifest.description,
		previewUrl: pkg.previewUrl,
		widthMm: pkg.manifest.widthMm,
		heightMm: pkg.manifest.heightMm,
	};
}

export async function loadBundledTemplatePackage(_templateId: string): Promise<TemplatePackage> {
	const manifest = buildBuiltinSyntheticManifest();

	// Try local extension filesystem first, then fall back to GitHub
	let epro2Blob: Blob | undefined;
	const fsApi = (eda as any).sys_FileSystem;
	if (fsApi && typeof fsApi.getExtensionFile === 'function') {
		try {
			const templateFile = await fsApi.getExtensionFile(`${BUILTIN_TEMPLATE_FOLDER}/${BUILTIN_EPRO2_FILENAME}`) as File | undefined;
			if (templateFile) {
				epro2Blob = templateFile;
				logLoaderInfo(`loadBundledTemplatePackage local hit | file=${BUILTIN_EPRO2_FILENAME}`);
			}
		}
		catch (localError) {
			logLoaderWarn(`getExtensionFile failed: ${String(localError)}`);
		}
	}

	if (!epro2Blob) {
		logLoaderWarn(`fetching epro2 from GitHub | url=${BUILTIN_EPRO2_GITHUB_URL}`);
		try {
			const response = await fetch(BUILTIN_EPRO2_GITHUB_URL);
			if (!response.ok)
				throw new Error(`HTTP ${response.status}`);
			epro2Blob = await response.blob();
			logLoaderInfo('loadBundledTemplatePackage GitHub fetch success');
		}
		catch (fetchError) {
			throw new Error(`无法获取模板文件：本地不存在且 GitHub 获取失败 (${String(fetchError)})`);
		}
	}

	return {
		sourceId: BUILTIN_TEMPLATE_SOURCE_ID,
		sourceLabel: BUILTIN_TEMPLATE_SOURCE_LABEL,
		templateId: manifest.id,
		manifest,
		epro2Blob,
	};
}

export function loadBundledTemplateSummaries(): RuntimeTemplateSummary[] {
	const manifest = buildBuiltinSyntheticManifest();
	return [{
		sourceId: BUILTIN_TEMPLATE_SOURCE_ID,
		sourceLabel: BUILTIN_TEMPLATE_SOURCE_LABEL,
		templateId: manifest.id,
		templateName: manifest.name,
		version: manifest.version,
		description: manifest.description,
		widthMm: manifest.widthMm,
		heightMm: manifest.heightMm,
	}];
}

export async function loadLocalTemplateFromDialog(): Promise<{ summary: RuntimeTemplateSummary; package: TemplatePackage } | undefined> {
	const fsApi = (eda as any).sys_FileSystem;
	if (!fsApi || typeof fsApi.openReadFileDialog !== 'function')
		throw new Error('sys_FileSystem.openReadFileDialog unavailable');

	logLoaderInfo('openReadFileDialog begin');
	const selectedFile = await fsApi.openReadFileDialog(['epro2', '.epro2'], false) as File | undefined;
	if (!selectedFile) {
		logLoaderInfo('openReadFileDialog canceled by user');
		return undefined;
	}

	logLoaderInfo(`file selected | name=${selectedFile.name} | size=${selectedFile.size} | type=${selectedFile.type || 'n/a'}`);
	if (!isEpro2FileName(selectedFile.name || '')) {
		logLoaderWarn(`invalid local template file extension | file=${selectedFile.name}`);
		throw new Error('仅支持导入 .epro2 文件，请重新选择。');
	}

	const detectedKeys = await detectPlaceholderKeys(selectedFile);
	logLoaderInfo(`placeholder detection done | count=${detectedKeys.length} | keys=${detectedKeys.slice(0, 12).join(', ') || 'none'}`);
	const manifest = buildManifestFromFile(selectedFile.name || 'template.epro2', detectedKeys);
	const templateId = manifest.id;
	const templatePackage: TemplatePackage = {
		sourceId: LOCAL_TEMPLATE_SOURCE_ID,
		sourceLabel: LOCAL_TEMPLATE_SOURCE_LABEL,
		templateId,
		manifest,
		epro2Blob: selectedFile,
	};

	return {
		summary: toRuntimeSummary(templatePackage),
		package: templatePackage,
	};
}
