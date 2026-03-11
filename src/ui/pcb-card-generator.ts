import type {
	RuntimeTemplateSummary,
	TemplateFieldValueMap,
	TemplatePackage,
} from '../core/template-contract';

import { importEpro2AndApplyFields } from '../core/epro2-import-executor';
import { normalizeTemplateValue } from '../core/template-contract';
import { applyFallbackTemplate } from '../core/template-fallback-renderer';
import {
	loadBundledTemplatePackage,
	loadBundledTemplateSummaries,
	loadLocalTemplateFromDialog,
	LOCAL_TEMPLATE_SOURCE_ID,
} from '../core/template-local-loader';

const LOG_PREFIX = '[UCard]';
const BUILD_STAMP = '2026-03-09T18:10+08:00';
const HANDLER_REVISION = '2026-03-09-iframe-restore-v2';
const GLOBAL_RUNTIME_KEY = '__UCARD_RUNTIME_STATE__';

const TOPIC_GENERATE = 'UCARD_GENERATE';
const TOPIC_CLOSE = 'UCARD_CLOSE';
const TOPIC_LOAD_TEMPLATES_REQUEST = 'UCARD_LOAD_TEMPLATES_REQUEST';
const TOPIC_LOAD_TEMPLATES_RESPONSE = 'UCARD_LOAD_TEMPLATES_RESPONSE';
const TOPIC_LOAD_TEMPLATE_PACKAGE_REQUEST = 'UCARD_LOAD_TEMPLATE_PACKAGE_REQUEST';
const TOPIC_LOAD_TEMPLATE_PACKAGE_RESPONSE = 'UCARD_LOAD_TEMPLATE_PACKAGE_RESPONSE';
const TOPIC_IMPORT_LOCAL_TEMPLATE_REQUEST = 'UCARD_IMPORT_LOCAL_TEMPLATE_REQUEST';
const TOPIC_IMPORT_LOCAL_TEMPLATE_RESPONSE = 'UCARD_IMPORT_LOCAL_TEMPLATE_RESPONSE';
const TOPIC_GET_ALL_PCB_TEXTS_REQUEST = 'UCARD_GET_ALL_PCB_TEXTS_REQUEST';
const TOPIC_GET_ALL_PCB_TEXTS_RESPONSE = 'UCARD_GET_ALL_PCB_TEXTS_RESPONSE';
const TOPIC_REPLACE_PCB_TEXTS_BY_ID = 'UCARD_REPLACE_PCB_TEXTS_BY_ID';
const TOPIC_PLACE_QR_VCARD = 'UCARD_PLACE_QR_VCARD';
const TOPIC_PLACE_QR_IMAGE = 'UCARD_PLACE_QR_IMAGE';
const GENERATOR_IFRAME_ID_IMPORT = 'ucard-iframe-import';
const GENERATOR_IFRAME_ID_APPLY = 'ucard-iframe-apply';
const GENERATOR_IFRAME_ID_QR = 'ucard-iframe-qrcode';
const LEGACY_IFRAME_IDS = ['ucard-iframe', 'ucard-iframe-local-v2', GENERATOR_IFRAME_ID_IMPORT, GENERATOR_IFRAME_ID_APPLY, GENERATOR_IFRAME_ID_QR];

interface TemplateSelection {
	sourceId: string;
	templateId: string;
}

interface GenerateRequestPayload {
	selection: TemplateSelection;
	values: TemplateFieldValueMap;
}

interface LocalTemplateEntry {
	summary: RuntimeTemplateSummary;
	package: TemplatePackage;
}

interface RuntimeState {
	isSessionInitialized: boolean;
	handlerRevision: string;
	handlerTasks: any[];
	localTemplateStore: Map<string, LocalTemplateEntry>;
}

function getRuntimeState(): RuntimeState {
	const root = globalThis as any;
	if (!root[GLOBAL_RUNTIME_KEY]) {
		root[GLOBAL_RUNTIME_KEY] = {
			isSessionInitialized: false,
			handlerRevision: '',
			handlerTasks: [],
			localTemplateStore: new Map<string, LocalTemplateEntry>(),
		} as RuntimeState;
	}
	return root[GLOBAL_RUNTIME_KEY] as RuntimeState;
}

const runtimeState = getRuntimeState();
const localTemplateStore = runtimeState.localTemplateStore;

function formatError(error: unknown): string {
	if (error instanceof Error)
		return error.stack ? `${error.message} | ${error.stack}` : error.message;
	return String(error);
}

function logInfo(message: string): void {
	eda.sys_Log.add(`${LOG_PREFIX} ${message}`, ESYS_LogType.INFO);
}

function logWarn(message: string): void {
	eda.sys_Log.add(`${LOG_PREFIX} ${message}`, ESYS_LogType.WARNING);
}

function logError(message: string): void {
	eda.sys_Log.add(`${LOG_PREFIX} ${message}`, ESYS_LogType.ERROR);
}

function toTemplateStoreKey(selection: TemplateSelection): string {
	return `${selection.sourceId}::${selection.templateId}`;
}

function isLocalSourceId(sourceId: string): boolean {
	const normalized = normalizeTemplateValue(sourceId).toLowerCase();
	return normalized === LOCAL_TEMPLATE_SOURCE_ID || normalized.startsWith('local');
}

function resolveLocalTemplatePackage(selection: TemplateSelection): TemplatePackage | undefined {
	const exact = localTemplateStore.get(toTemplateStoreKey(selection));
	if (exact)
		return exact.package;

	for (const item of localTemplateStore.values()) {
		if (item.summary.templateId === selection.templateId)
			return item.package;
	}

	return undefined;
}

function dedupeRuntimeTemplates(items: RuntimeTemplateSummary[]): RuntimeTemplateSummary[] {
	const deduped = new Map<string, RuntimeTemplateSummary>();
	for (const item of items) {
		const key = `${item.sourceId}::${item.templateId}`;
		if (!deduped.has(key))
			deduped.set(key, item);
	}
	return [...deduped.values()];
}

function listLocalTemplateSummaries(): RuntimeTemplateSummary[] {
	return [...localTemplateStore.values()].map(item => item.summary);
}

function saveLocalTemplate(summary: RuntimeTemplateSummary, pkg: TemplatePackage): void {
	localTemplateStore.set(toTemplateStoreKey({ sourceId: summary.sourceId, templateId: summary.templateId }), {
		summary,
		package: pkg,
	});
}

function normalizeGeneratePayload(raw: any): GenerateRequestPayload {
	const selection = raw?.selection || {};
	const rawValues = raw?.values && typeof raw.values === 'object' ? raw.values : {};
	const values: TemplateFieldValueMap = {};
	for (const [key, value] of Object.entries(rawValues))
		values[key] = normalizeTemplateValue(value);

	return {
		selection: {
			sourceId: normalizeTemplateValue(selection.sourceId),
			templateId: normalizeTemplateValue(selection.templateId),
		},
		values,
	};
}

function getMessageBus(): any {
	const bus = eda.sys_MessageBus as any;
	if (!bus || typeof bus.pullPublic !== 'function' || typeof bus.pushPublic !== 'function')
		throw new TypeError('Host API missing: MessageBus.pullPublic/pushPublic');
	return bus;
}

function emitPublic(topic: string, payload: any): void {
	const bus = getMessageBus();
	if (typeof bus.publishPublic === 'function') {
		bus.publishPublic(topic, payload);
		return;
	}
	bus.pushPublic(topic, payload);
}

function cleanupHandlerTasks(): void {
	for (const task of runtimeState.handlerTasks) {
		try {
			if (task && typeof task.cancel === 'function')
				task.cancel();
		}
		catch {
			// ignore task cancel errors
		}
	}
	runtimeState.handlerTasks = [];
}

function registerPublicListener(topic: string, callback: (payload: any) => Promise<void> | void): void {
	const bus = getMessageBus();
	const task = bus.pullPublic(topic, callback);
	if (task)
		runtimeState.handlerTasks.push(task);
}

async function closeGeneratorIFrames(): Promise<void> {
	for (const iframeId of LEGACY_IFRAME_IDS) {
		try {
			await eda.sys_IFrame.closeIFrame(iframeId);
			logInfo(`closeGeneratorIFrames | closed iframe=${iframeId}`);
		}
		catch {
			// ignore missing iframe
		}
	}
}

function collectRuntimeTemplates(): RuntimeTemplateSummary[] {
	const merged = dedupeRuntimeTemplates([
		...loadBundledTemplateSummaries(),
		...listLocalTemplateSummaries(),
	]);
	logInfo(`collectRuntimeTemplates | local=${localTemplateStore.size} | merged=${merged.length}`);
	return merged;
}

async function resolveTemplatePackage(selection: TemplateSelection): Promise<TemplatePackage> {
	logInfo(`resolveTemplatePackage start | sourceId=${selection.sourceId} | templateId=${selection.templateId}`);
	if (isLocalSourceId(selection.sourceId)) {
		const local = resolveLocalTemplatePackage(selection);
		if (!local)
			throw new Error(`local template not found: ${selection.templateId} | localStoreSize=${localTemplateStore.size}`);
		logInfo(`resolveTemplatePackage local hit | templateId=${selection.templateId} | fields=${local.manifest.fields.length}`);
		return local;
	}

	const bundled = await loadBundledTemplatePackage(selection.templateId);
	logInfo(`resolveTemplatePackage bundled | templateId=${selection.templateId}`);
	return bundled;
}

async function notifyImportLocalTemplateRequest(request: any): Promise<void> {
	const requestId = String(request?.id || '');
	logInfo(`local template import request received | id=${requestId || 'n/a'}`);
	try {
		const loaded = await loadLocalTemplateFromDialog();
		if (!loaded) {
			logInfo(`local template import canceled | id=${requestId || 'n/a'}`);
			emitPublic(TOPIC_IMPORT_LOCAL_TEMPLATE_RESPONSE, {
				type: 'UCARD_LOCAL_TEMPLATE_SELECTED',
				id: requestId,
				payload: null,
			});
			return;
		}

		saveLocalTemplate(loaded.summary, loaded.package);
		logInfo(`local template import success | id=${requestId || 'n/a'} | templateId=${loaded.summary.templateId} | templateName=${loaded.summary.templateName} | fieldCount=${loaded.package.manifest.fields.length} | hasFallback=${loaded.package.manifest.fallback ? 'yes' : 'no'} | localStoreSize=${localTemplateStore.size}`);
		emitPublic(TOPIC_IMPORT_LOCAL_TEMPLATE_RESPONSE, {
			type: 'UCARD_LOCAL_TEMPLATE_SELECTED',
			id: requestId,
			payload: {
				summary: loaded.summary,
				manifest: loaded.package.manifest,
			},
		});
		logInfo(`local template import response push | id=${requestId || 'n/a'} | type=UCARD_LOCAL_TEMPLATE_SELECTED`);
	}
	catch (error) {
		logWarn(`local template import failed | id=${requestId || 'n/a'} | error=${formatError(error)}`);
		emitPublic(TOPIC_IMPORT_LOCAL_TEMPLATE_RESPONSE, {
			type: 'UCARD_LOCAL_TEMPLATE_ERROR',
			id: requestId,
			error: String(error),
		});
	}
}

function validateFieldValues(templatePackage: TemplatePackage, values: TemplateFieldValueMap): string[] {
	const errors: string[] = [];
	for (const field of templatePackage.manifest.fields) {
		if (!field.required)
			continue;
		const value = normalizeTemplateValue(values[field.key] ?? field.defaultValue ?? '');
		if (!value)
			errors.push(`字段 ${field.label || field.key} 不能为空`);
	}
	return errors;
}

async function runTemplateApply(
	templatePackage: TemplatePackage,
	payload: GenerateRequestPayload,
	anchorX: number,
	anchorY: number,
): Promise<{ mode: 'import' | 'fallback'; replacedKeys: string[]; warnings: string[] }> {
	try {
		logInfo(`runTemplateApply import start | template=${templatePackage.templateId}`);
		const importResult = await importEpro2AndApplyFields(templatePackage, payload.values, {} as any);
		logInfo(`runTemplateApply import done | mode=${importResult.mode} | replaced=${importResult.replacedKeys.join(', ') || 'none'}`);
		return importResult;
	}
	catch (error) {
		if (!templatePackage.manifest.fallback)
			throw new Error(`import mode failed and no fallback available: ${String(error)}`);
		logWarn(`import mode failed; fallback enabled. ${formatError(error)}`);
		const fallbackResult = await applyFallbackTemplate(templatePackage, payload.values, {
			anchorX,
			anchorY,
			layer: EPCB_LayerId.TOP,
		});
		fallbackResult.warnings.push(`import failed: ${String(error)}`);
		logInfo(`runTemplateApply fallback done | replaced=${fallbackResult.replacedKeys.join(', ') || 'none'}`);
		return fallbackResult;
	}
}

let activeOpMode: 'import' | 'apply' = 'import';

async function notifyTemplateListRequest(request: any): Promise<void> {
	const requestId = String(request?.id || '');
	logInfo(`template list request received | id=${requestId || 'n/a'} | forceRefresh=${request?.forceRefresh === true}`);
	try {
		const templates = collectRuntimeTemplates();
		logInfo(`template list response push | id=${requestId || 'n/a'} | count=${templates.length}`);
		emitPublic(TOPIC_LOAD_TEMPLATES_RESPONSE, {
			type: 'UCARD_TEMPLATE_INDEX',
			id: requestId,
			templates,
		});
	}
	catch (error) {
		logWarn(`template list request failed | id=${requestId || 'n/a'} | error=${formatError(error)}`);
		emitPublic(TOPIC_LOAD_TEMPLATES_RESPONSE, {
			type: 'UCARD_TEMPLATE_INDEX_ERROR',
			id: requestId,
			error: String(error),
		});
	}
}

async function notifyTemplatePackageRequest(request: any): Promise<void> {
	const requestId = String(request?.id || '');
	try {
		const payload = request?.payload;
		const selection: TemplateSelection = {
			sourceId: normalizeTemplateValue(payload?.sourceId),
			templateId: normalizeTemplateValue(payload?.templateId),
		};
		if (!selection.sourceId || !selection.templateId)
			throw new Error('sourceId/templateId is required');
		logInfo(`template package request received | id=${requestId || 'n/a'} | sourceId=${selection.sourceId} | templateId=${selection.templateId}`);

		const templatePackage = await resolveTemplatePackage(selection);
		logInfo(`template package response push | id=${requestId || 'n/a'} | fields=${templatePackage.manifest.fields.length} | hasEpro2=${templatePackage.epro2Blob ? 'yes' : 'no'} | hasFallback=${templatePackage.manifest.fallback ? 'yes' : 'no'}`);
		emitPublic(TOPIC_LOAD_TEMPLATE_PACKAGE_RESPONSE, {
			type: 'UCARD_TEMPLATE_PACKAGE',
			id: requestId,
			payload: {
				sourceId: templatePackage.sourceId,
				templateId: templatePackage.templateId,
				manifest: templatePackage.manifest,
				previewUrl: templatePackage.previewUrl,
			},
		});
	}
	catch (error) {
		logWarn(`template package request failed | id=${requestId || 'n/a'} | error=${formatError(error)}`);
		emitPublic(TOPIC_LOAD_TEMPLATE_PACKAGE_RESPONSE, {
			type: 'UCARD_TEMPLATE_PACKAGE_ERROR',
			id: requestId,
			error: String(error),
		});
	}
}

async function initializeMessageBusHandlers(): Promise<void> {
	if (runtimeState.handlerTasks.length > 0) {
		logInfo(`initializeMessageBusHandlers cleanup old handlers | oldRevision=${runtimeState.handlerRevision || 'n/a'} | taskCount=${runtimeState.handlerTasks.length}`);
		cleanupHandlerTasks();
	}

	registerPublicListener(TOPIC_GENERATE, async (payload: any) => {
		logInfo('message bus event | TOPIC_GENERATE received');
		await runGeneratorWithProfile(payload);
		try {
			await closeGeneratorIFrames();
		}
		catch {
			// ignore
		}
	});

	registerPublicListener(TOPIC_CLOSE, async () => {
		logInfo('message bus event | TOPIC_CLOSE received');
		try {
			await closeGeneratorIFrames();
		}
		catch {
			// ignore
		}
	});

	registerPublicListener(TOPIC_LOAD_TEMPLATES_REQUEST, async (request: any) => {
		logInfo('message bus event | TOPIC_LOAD_TEMPLATES_REQUEST received');
		await notifyTemplateListRequest(request);
	});

	registerPublicListener(TOPIC_LOAD_TEMPLATE_PACKAGE_REQUEST, async (request: any) => {
		logInfo('message bus event | TOPIC_LOAD_TEMPLATE_PACKAGE_REQUEST received');
		await notifyTemplatePackageRequest(request);
	});

	registerPublicListener(TOPIC_IMPORT_LOCAL_TEMPLATE_REQUEST, async (request: any) => {
		logInfo('message bus event | TOPIC_IMPORT_LOCAL_TEMPLATE_REQUEST received');
		await notifyImportLocalTemplateRequest(request);
	});

	registerPublicListener(TOPIC_GET_ALL_PCB_TEXTS_REQUEST, async (request: any) => {
		const requestId = String(request?.id || '');
		logInfo(`message bus event | TOPIC_GET_ALL_PCB_TEXTS_REQUEST received | id=${requestId || 'n/a'}`);
		try {
			const { getAllPcbTexts } = await import('../core/epro2-import-executor');
			const items = await getAllPcbTexts();
			logInfo(`get all pcb texts done | count=${items.length}`);
			emitPublic(TOPIC_GET_ALL_PCB_TEXTS_RESPONSE, {
				type: 'UCARD_ALL_PCB_TEXTS',
				id: requestId,
				items,
			});
		}
		catch (error) {
			logWarn(`get all pcb texts failed | ${String(error)}`);
			emitPublic(TOPIC_GET_ALL_PCB_TEXTS_RESPONSE, {
				type: 'UCARD_ALL_PCB_TEXTS_ERROR',
				id: requestId,
				error: String(error),
			});
		}
	});

	registerPublicListener(TOPIC_REPLACE_PCB_TEXTS_BY_ID, async (payload: any) => {
		logInfo('message bus event | TOPIC_REPLACE_PCB_TEXTS_BY_ID received');
		try {
			const { replaceTextsByIds } = await import('../core/epro2-import-executor');
			const replacedIds = await replaceTextsByIds(payload?.replacements || {});
			logInfo(`replaceTextsByIds done | count=${replacedIds.length}`);
			eda.sys_Dialog.showInformationMessage(`已替换 ${replacedIds.length} 处文本`, 'UCard');
		}
		catch (error) {
			logError(`replaceTextsByIds error | ${String(error)}`);
			eda.sys_Dialog.showInformationMessage(`替换失败：${String(error)}`, 'UCard Error');
		}
		try {
			await closeGeneratorIFrames();
		}
		catch {
			// ignore
		}
	});

	registerPublicListener(TOPIC_PLACE_QR_VCARD, async (payload: any) => {
		logInfo('message bus event | TOPIC_PLACE_QR_VCARD received');
		try {
			const { placeVCardQrCode } = await import('../core/qr-pcb-placer');
			const fields = payload?.fields || {};
			const options = { sizeMm: Number(payload?.sizeMm) || 26, layer: Number(payload?.layer) || 3 };
			const result = await placeVCardQrCode(fields, options);
			logInfo(`placeVCardQrCode done | fills=${result.moduleCount}`);
			eda.sys_Dialog.showInformationMessage(`二维码已生成 (${result.moduleCount} 个图元)`, 'UCard');
		}
		catch (error) {
			logError(`placeVCardQrCode error | ${String(error)}`);
			eda.sys_Dialog.showInformationMessage(`生成失败：${String(error)}`, 'UCard Error');
		}
		try {
			await closeGeneratorIFrames();
		}
		catch {
			// ignore
		}
	});

	registerPublicListener(TOPIC_PLACE_QR_IMAGE, async (payload: any) => {
		logInfo('message bus event | TOPIC_PLACE_QR_IMAGE received');
		try {
			const { placeImageQrCode } = await import('../core/qr-pcb-placer');
			const { imageDataUrl, naturalWidth, naturalHeight, sizeMm, layer } = payload || {};
			if (!imageDataUrl)
				throw new Error('imageDataUrl missing');
			const options = { sizeMm: Number(sizeMm) || 26, layer: Number(layer) || 3 };
			await placeImageQrCode(String(imageDataUrl), Number(naturalWidth), Number(naturalHeight), options);
			logInfo('placeImageQrCode done');
			eda.sys_Dialog.showInformationMessage('二维码图片已导入到 PCB', 'UCard');
		}
		catch (error) {
			logError(`placeImageQrCode error | ${String(error)}`);
			eda.sys_Dialog.showInformationMessage(`导入失败：${String(error)}`, 'UCard Error');
		}
		try {
			await closeGeneratorIFrames();
		}
		catch {
			// ignore
		}
	});

	runtimeState.isSessionInitialized = true;
	runtimeState.handlerRevision = HANDLER_REVISION;
	logInfo(`initializeMessageBusHandlers done | revision=${HANDLER_REVISION} | handlerTasks=${runtimeState.handlerTasks.length} | localStoreSize=${localTemplateStore.size}`);
}

export function generatePcbBusinessCard(): void {
	activeOpMode = 'import';
	void (async () => {
		try {
			await initializeMessageBusHandlers();
			await closeGeneratorIFrames();
			await eda.sys_IFrame.openIFrame(
				'/iframe/import.html',
				550,
				720,
				GENERATOR_IFRAME_ID_IMPORT,
				{ maximizeButton: false, minimizeButton: false, grayscaleMask: true },
			);
			logInfo('iframe opened for generatePcbBusinessCard (import)');
		}
		catch (error) {
			logError(`generatePcbBusinessCard init failed: ${String(error)}`);
			eda.sys_Dialog.showInformationMessage(`启动失败：${String(error)}`, 'UCard Error');
		}
	})();
}

export function applyPcbBusinessCardText(): void {
	activeOpMode = 'apply';
	void (async () => {
		try {
			const currentDocument = await eda.dmt_SelectControl.getCurrentDocumentInfo();
			if (!currentDocument || currentDocument.documentType !== EDMT_EditorDocumentType.PCB) {
				eda.sys_Dialog.showInformationMessage('请先切换到 PCB 页面，然后在界面中执行替换操作。', 'UCard');
				return;
			}
			await initializeMessageBusHandlers();
			await closeGeneratorIFrames();
			await eda.sys_IFrame.openIFrame(
				'/iframe/apply.html',
				550,
				720,
				GENERATOR_IFRAME_ID_APPLY,
				{ maximizeButton: false, minimizeButton: false, grayscaleMask: true },
			);
			logInfo('iframe opened for applyPcbBusinessCardText (apply)');
		}
		catch (error) {
			logError(`applyPcbBusinessCardText init failed: ${String(error)}`);
			eda.sys_Dialog.showInformationMessage(`启动失败：${String(error)}`, 'UCard Error');
		}
	})();
}

export function generateQrCode(): void {
	void (async () => {
		try {
			const currentDocument = await eda.dmt_SelectControl.getCurrentDocumentInfo();
			if (!currentDocument || currentDocument.documentType !== EDMT_EditorDocumentType.PCB) {
				eda.sys_Dialog.showInformationMessage('请先切换到 PCB 页面，然后再生成二维码。', 'UCard');
				return;
			}
			await initializeMessageBusHandlers();
			await closeGeneratorIFrames();
			await eda.sys_IFrame.openIFrame(
				'/iframe/qrcode.html',
				480,
				640,
				GENERATOR_IFRAME_ID_QR,
				{ maximizeButton: false, minimizeButton: false, grayscaleMask: true },
			);
			logInfo('iframe opened for generateQrCode');
		}
		catch (error) {
			logError(`generateQrCode init failed: ${String(error)}`);
			eda.sys_Dialog.showInformationMessage(`启动失败：${String(error)}`, 'UCard Error');
		}
	})();
}

export async function runGeneratorWithProfile(rawPayload: any): Promise<void> {
	try {
		logInfo(`build=${BUILD_STAMP}`);
		const payload = normalizeGeneratePayload(rawPayload);
		logInfo(`generate request | sourceId=${payload.selection.sourceId || 'n/a'} | templateId=${payload.selection.templateId || 'n/a'} | valueKeys=${Object.keys(payload.values).length}`);
		if (!payload.selection.sourceId || !payload.selection.templateId) {
			logWarn('generate aborted: template selection missing');
			eda.sys_Dialog.showInformationMessage('请选择模板后再生成。', 'UCard');
			return;
		}

		const mousePos = await eda.pcb_SelectControl.getCurrentMousePosition();
		if (!mousePos) {
			logWarn('generate aborted: current mouse position unavailable');
			eda.sys_Dialog.showInformationMessage('请把鼠标移动到 PCB 画布上的目标位置，然后再点击生成。', 'UCard');
			return;
		}
		logInfo(`mouse position | x=${mousePos.x} | y=${mousePos.y}`);

		const templatePackage = await resolveTemplatePackage(payload.selection);
		logInfo(`template resolved | source=${templatePackage.sourceId} | templateId=${templatePackage.templateId} | manifest=${templatePackage.manifest.name}@${templatePackage.manifest.version} | hasEpro2=${templatePackage.epro2Blob ? 'yes' : 'no'} | hasFallback=${templatePackage.manifest.fallback ? 'yes' : 'no'}`);
		const hasUserValues = Object.keys(payload.values).length > 0;
		if (hasUserValues) {
			const validationErrors = validateFieldValues(templatePackage, payload.values);
			if (validationErrors.length > 0) {
				logWarn(`generate aborted: validation failed | ${validationErrors.join(' | ')}`);
				eda.sys_Dialog.showInformationMessage(validationErrors.join('\n'), 'UCard 字段校验失败');
				return;
			}
		}
		else {
			logInfo('generate: no values provided, importing template as-is (raw import mode)');
		}

		const applyResult = await runTemplateApply(templatePackage, payload, mousePos.x, mousePos.y);
		logInfo(`template apply done | mode=${applyResult.mode} | replacedKeys=${applyResult.replacedKeys.join(', ') || 'none'} | warnings=${applyResult.warnings.join(' | ') || 'none'}`);
		const tips: string[] = [
			`模板：${templatePackage.manifest.name} (${templatePackage.manifest.version})`,
			`应用模式：${applyResult.mode === 'import' ? 'epro2 导入' : 'fallback 绘制'}`,
			`替换字段：${applyResult.replacedKeys.length > 0 ? applyResult.replacedKeys.join(', ') : '无'}`,
		];
		if (applyResult.warnings.length > 0)
			tips.push(`警告：${applyResult.warnings.join(' | ')}`);

		eda.sys_Dialog.showInformationMessage(tips.join('\n'), 'UCard 生成完成');
	}
	catch (error) {
		logError(`runGeneratorWithProfile failed: ${String(error)}`);
		eda.sys_Dialog.showInformationMessage(`生成失败：${String(error)}`, 'UCard Error');
	}
}
