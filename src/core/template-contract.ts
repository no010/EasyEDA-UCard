export type TemplateFieldType = 'text' | 'multiline' | 'url' | 'phone';

export interface TemplateFieldDef {
	key: string;
	label: string;
	type?: TemplateFieldType;
	required?: boolean;
	defaultValue?: string;
	placeholder?: string;
	helpText?: string;
	group?: string;
	order?: number;
}

export interface TemplateFallbackTextPrimitive {
	layer: number;
	x: number;
	y: number;
	fontSizeMm: number;
	lineWidthMm?: number;
	alignMode?: number;
	rotation?: number;
	text: string;
}

export interface TemplateFallbackModel {
	outline?: {
		widthMm: number;
		heightMm: number;
		lineWidthMm?: number;
	};
	textPrimitives: TemplateFallbackTextPrimitive[];
}

export interface TemplateManifest {
	schemaVersion: number;
	id: string;
	name: string;
	version: string;
	description?: string;
	widthMm: number;
	heightMm: number;
	fields: TemplateFieldDef[];
	epro2FileName?: string;
	fallback?: TemplateFallbackModel;
}

export interface TemplatePackage {
	sourceId: string;
	sourceLabel: string;
	templateId: string;
	manifest: TemplateManifest;
	epro2Blob?: Blob;
	previewUrl?: string;
}

export type TemplateApplyMode = 'import' | 'fallback';

export interface TemplateApplyResult {
	mode: TemplateApplyMode;
	replacedKeys: string[];
	warnings: string[];
}

export type TemplateFieldValueMap = Record<string, string>;

export interface RuntimeTemplateSummary {
	sourceId: string;
	sourceLabel: string;
	templateId: string;
	templateName: string;
	version: string;
	description?: string;
	previewUrl?: string;
	widthMm: number;
	heightMm: number;
}

export function normalizeTemplateValue(value: unknown): string {
	if (typeof value !== 'string')
		return '';
	return value.trim();
}

export function extractPlaceholderKeys(input: string): string[] {
	const keys = new Set<string>();
	const regex = /\{\{\s*([\w.-]+)\s*\}\}/g;
	let match: RegExpExecArray | null;
	match = regex.exec(input);
	while (match) {
		keys.add(match[1]);
		match = regex.exec(input);
	}
	return [...keys];
}

export function replacePlaceholders(input: string, values: TemplateFieldValueMap): string {
	return input.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_all, key: string) => {
		return normalizeTemplateValue(values[key]);
	});
}
