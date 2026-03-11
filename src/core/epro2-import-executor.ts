import type {
	TemplateApplyResult,
	TemplateFieldValueMap,
	TemplatePackage,
} from './template-contract';
import { replacePlaceholders } from './template-contract';

const IMPORT_LOG_PREFIX = '[UCard][Import]';

interface ImportContext {
	layer: EPCB_LayerId.TOP | EPCB_LayerId.BOTTOM;
}

interface ImportedProjectInfo {
	uuid: string;
	friendlyName: string;
}

interface CurrentEditorContext {
	projectUuid?: string;
	documentUuid?: string;
}

type ImportFileType = 'JLCEDA' | 'JLCEDA Pro' | 'EasyEDA' | 'EasyEDA Pro' | 'Allegro' | 'OrCAD' | 'EAGLE' | 'KiCad' | 'PADS' | 'LTspice';

interface ImportAttempt {
	label: string;
	fileType?: ImportFileType;
	props?: {
		importOption?: ESYS_ImportProjectImportOption;
		associate3DModel?: boolean;
		associateFootprint?: boolean;
		importFootprintNotesLayer?: boolean;
	};
}

function formatError(error: unknown): string {
	if (error instanceof Error)
		return error.stack ? `${error.message} | ${error.stack}` : error.message;
	return String(error);
}

function logImportInfo(message: string): void {
	(eda.sys_Log as any)?.add?.(`${IMPORT_LOG_PREFIX} ${message}`, ESYS_LogType.INFO);
}

function logImportWarn(message: string): void {
	(eda.sys_Log as any)?.add?.(`${IMPORT_LOG_PREFIX} ${message}`, ESYS_LogType.WARNING);
}

function logImportError(message: string): void {
	(eda.sys_Log as any)?.add?.(`${IMPORT_LOG_PREFIX} ${message}`, ESYS_LogType.ERROR);
}

function getPrimitiveText(item: any): string | undefined {
	if (typeof item?.getState_Text === 'function')
		return String(item.getState_Text() || '');
	if (typeof item?.getState_Value === 'function')
		return String(item.getState_Value() || '');
	return undefined;
}

async function setPrimitiveText(item: any, value: string): Promise<void> {
	try {
		// Use toAsync → setState → done() pattern (same as other IPCB primitive types)
		const editItem = typeof item?.toAsync === 'function' ? item.toAsync() : item;
		if (typeof editItem?.setState_Text === 'function') {
			editItem.setState_Text(value);
		}
		else if (typeof editItem?.setState_Value === 'function') {
			editItem.setState_Value(value);
		}
		else {
			logImportWarn('setPrimitiveText: no setState_Text or setState_Value method found');
			return;
		}
		if (typeof editItem?.done === 'function') {
			await editItem.done();
			logImportInfo(`setPrimitiveText done() called | value="${value}"`);
		}
		else {
			logImportWarn(`setPrimitiveText: done() not available | value="${value}"`);
		}
	}
	catch (e) {
		logImportWarn(`setPrimitiveText failed: ${formatError(e)}`);
	}
}

export interface PcbTextEntry {
	id: string;
	text: string;
}

export async function getAllPcbTexts(): Promise<PcbTextEntry[]> {
	const allItems = await queryAllTextPrimitives();
	const result: PcbTextEntry[] = [];
	for (const item of allItems) {
		const id = getPrimitiveId(item);
		const text = getPrimitiveText(item);
		if (id && text !== undefined)
			result.push({ id, text });
	}
	logImportInfo(`getAllPcbTexts | total=${result.length}`);
	return result;
}

export async function replaceTextsByIds(replacements: Record<string, string>): Promise<string[]> {
	const allItems = await queryAllTextPrimitives();
	const replacedIds: string[] = [];
	for (const item of allItems) {
		const id = getPrimitiveId(item);
		if (!id || !(id in replacements))
			continue;
		const newText = replacements[id];
		const oldText = getPrimitiveText(item);
		if (newText === oldText)
			continue;
		await setPrimitiveText(item, newText);
		replacedIds.push(id);
	}
	logImportInfo(`replaceTextsByIds | updated=${replacedIds.length}`);
	return replacedIds;
}

async function queryAllTextPrimitives(): Promise<any[]> {
	const items: any[] = [];

	// --- pcb_PrimitiveString ---
	try {
		const api1 = (eda as any).pcb_PrimitiveString;
		if (!api1) {
			logImportWarn('queryAllTextPrimitives | pcb_PrimitiveString: undefined');
		}
		else {
			if (typeof api1.getAll === 'function') {
				const res = await api1.getAll();
				logImportInfo(`queryAllTextPrimitives | pcb_PrimitiveString.getAll() => ${Array.isArray(res) ? res.length : `non-array: ${typeof res}`} items`);
				if (Array.isArray(res)) {
					items.push(...res);
				}
			}
			else {
				logImportWarn('queryAllTextPrimitives | pcb_PrimitiveString.getAll: not a function');
			}
		}
	}
	catch (e) {
		logImportWarn(`queryAllTextPrimitives | pcb_PrimitiveString error: ${formatError(e)}`);
	}

	// --- pcb_PrimitiveAttribute ---
	try {
		const api2 = (eda as any).pcb_PrimitiveAttribute;
		if (!api2) {
			logImportWarn('queryAllTextPrimitives | pcb_PrimitiveAttribute: undefined');
		}
		else {
			if (typeof api2.getAll === 'function') {
				const res = await api2.getAll();
				logImportInfo(`queryAllTextPrimitives | pcb_PrimitiveAttribute.getAll() => ${Array.isArray(res) ? res.length : `non-array: ${typeof res}`} items`);
				if (Array.isArray(res))
					items.push(...res);
			}
			else {
				logImportWarn('queryAllTextPrimitives | pcb_PrimitiveAttribute.getAll: not a function');
			}
		}
	}
	catch (e) {
		logImportWarn(`queryAllTextPrimitives | pcb_PrimitiveAttribute error: ${formatError(e)}`);
	}

	logImportInfo(`queryAllTextPrimitives | total items: ${items.length}`);
	return items;
}

function normalizeProjectName(value: string): string {
	const normalized = String(value || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '')
		.slice(0, 32);
	return normalized || 'ucard-template';
}

function formatTimestampForName(): string {
	return new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
}

async function resolveImportNewProjectSaveTo(templatePackage: TemplatePackage): Promise<any> {
	let teamUuid = '';
	let folderUuid: string | undefined;

	try {
		const currentProject = await (eda as any).dmt_Project?.getCurrentProjectInfo?.();
		teamUuid = String(currentProject?.teamUuid || '');
		folderUuid = currentProject?.folderUuid ? String(currentProject.folderUuid) : undefined;
	}
	catch (error) {
		logImportWarn(`resolveImportNewProjectSaveTo -> getCurrentProjectInfo failed: ${formatError(error)}`);
	}

	if (!teamUuid) {
		// Try to fallback
		teamUuid = '0';
	}

	const stamp = formatTimestampForName();
	const friendlyBase = String(templatePackage.manifest.name || templatePackage.templateId || 'UCard Template');
	return {
		operation: 'New Project',
		newProjectOwnerTeamUuid: teamUuid,
		newProjectOwnerFolderUuid: folderUuid,
		newProjectFriendlyName: `UCard ${friendlyBase} ${stamp}`,
		newProjectName: `ucard-${normalizeProjectName(templatePackage.templateId || friendlyBase)}-${stamp.slice(-8)}`,
	};
}

async function resolveCurrentEditorContext(): Promise<CurrentEditorContext> {
	let currentDocument: any = null;
	let currentProject: any = null;

	try {
		currentDocument = await (eda as any).dmt_SelectControl?.getCurrentDocumentInfo?.();
	}
	catch (error) {
		logImportWarn(`resolveCurrentEditorContext -> getCurrentDocumentInfo failed: ${formatError(error)}`);
	}

	try {
		currentProject = await (eda as any).dmt_Project?.getCurrentProjectInfo?.();
	}
	catch (error) {
		logImportWarn(`resolveCurrentEditorContext -> getCurrentProjectInfo failed: ${formatError(error)}`);
	}

	const projectUuid = String(currentDocument?.parentProjectUuid || currentProject?.uuid || '');
	const documentUuid = String(currentDocument?.uuid || '');
	logImportInfo(`current editor context resolved | projectUuid=${projectUuid || 'n/a'} | documentUuid=${documentUuid || 'n/a'}`);
	return {
		projectUuid: projectUuid || undefined,
		documentUuid: documentUuid || undefined,
	};
}

function resolveImportExistingProjectSaveTo(projectUuid: string): any {
	return {
		operation: 'Existing Project',
		existingProjectUuid: projectUuid,
	};
}

async function waitForProjectSwitch(projectUuid: string, timeoutMs = 8000): Promise<boolean> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const currentProject = await (eda as any).dmt_Project?.getCurrentProjectInfo?.();
			if (String(currentProject?.uuid || '') === projectUuid)
				return true;
		}
		catch {
			// ignore and retry
		}
		await new Promise(resolve => setTimeout(resolve, 200));
	}
	return false;
}

async function ensureCurrentPcbDocument(projectUuid: string): Promise<void> {
	const currentDoc = await (eda as any).dmt_SelectControl?.getCurrentDocumentInfo?.();
	if (
		currentDoc
		&& currentDoc.documentType === EDMT_EditorDocumentType.PCB
		&& String(currentDoc.parentProjectUuid || '') === projectUuid
	) {
		logImportInfo(`current PCB already active | docUuid=${currentDoc.uuid}`);
		return;
	}

	const project = await (eda as any).dmt_Project?.getCurrentProjectInfo?.();
	const docs = Array.isArray(project?.data) ? project.data : [];
	const firstPcb = docs.find((item: any) => item?.itemType === EDMT_ItemType.PCB && item?.uuid);
	if (!firstPcb)
		throw new Error(`no PCB document found in imported project ${projectUuid}`);

	const openDocument = (eda as any).dmt_EditorControl?.openDocument;
	if (typeof openDocument !== 'function')
		throw new Error('dmt_EditorControl.openDocument unavailable');
	await openDocument(String(firstPcb.uuid));
	logImportInfo(`opened PCB document | docUuid=${firstPcb.uuid}`);
}

async function openImportedProject(projectUuid: string): Promise<void> {
	const projectApi = (eda as any).dmt_Project;
	if (!projectApi || typeof projectApi.openProject !== 'function')
		throw new Error('dmt_Project.openProject unavailable');

	const opened = await projectApi.openProject(projectUuid);
	if (!opened)
		throw new Error(`openProject failed for imported project ${projectUuid}`);
	logImportInfo(`openProject success | projectUuid=${projectUuid}`);

	const switched = await waitForProjectSwitch(projectUuid);
	if (!switched)
		logImportWarn(`project switch wait timeout | expected=${projectUuid}`);

	await ensureCurrentPcbDocument(projectUuid);
}

async function restoreEditorContext(context: CurrentEditorContext): Promise<void> {
	if (!context.projectUuid)
		return;
	const projectApi = (eda as any).dmt_Project;
	if (!projectApi || typeof projectApi.openProject !== 'function')
		throw new Error('dmt_Project.openProject unavailable');

	const opened = await projectApi.openProject(context.projectUuid);
	if (!opened)
		throw new Error(`restore openProject failed | projectUuid=${context.projectUuid}`);
	logImportInfo(`restore project success | projectUuid=${context.projectUuid}`);

	if (!context.documentUuid)
		return;
	const openDocument = (eda as any).dmt_EditorControl?.openDocument;
	if (typeof openDocument !== 'function') {
		logImportWarn('restore document skipped: dmt_EditorControl.openDocument unavailable');
		return;
	}
	await openDocument(context.documentUuid);
	logImportInfo(`restore document success | documentUuid=${context.documentUuid}`);
}

function getPrimitiveId(item: any): string {
	if (!item || typeof item.getState_PrimitiveId !== 'function')
		return '';
	return String(item.getState_PrimitiveId() || '');
}

function buildPrimitiveIdSet(items: any[]): Set<string> {
	const ids = new Set<string>();
	for (const item of items) {
		const id = getPrimitiveId(item);
		if (id)
			ids.add(id);
	}
	return ids;
}

function tryResolveImportApi(): ((
	projectFile: File,
	templatePackage: TemplatePackage,
	saveTo: any,
	modeLabel: string,
	allowUndefinedResult?: boolean,
) => Promise<ImportedProjectInfo | undefined>) | undefined {
	const fileManager = (eda as any).sys_FileManager;
	if (fileManager && typeof fileManager.importProjectByProjectFile === 'function') {
		return async (
			projectFile: File,
			templatePackage: TemplatePackage,
			saveTo: any,
			modeLabel: string,
			allowUndefinedResult = false,
		) => {
			logImportInfo(`import api ready | operation=${modeLabel} | file=${projectFile.name} | size=${projectFile.size} | type=${projectFile.type || 'n/a'}`);

			const attempts: ImportAttempt[] = [
				{
					label: 'auto-file-type',
					props: {
						importOption: ESYS_ImportProjectImportOption.IMPORT_DOCUMENT,
					},
				},
			];

			const errors: string[] = [];
			for (const attempt of attempts) {
				try {
					logImportInfo(`attempt begin | mode=${modeLabel} | label=${attempt.label} | fileType=${attempt.fileType || 'auto'}`);
					const result = await fileManager.importProjectByProjectFile(
						projectFile,
						attempt.fileType,
						attempt.props,
						saveTo,
					);
					if (!result) {
						if (allowUndefinedResult) {
							logImportWarn(`attempt result undefined, treat as success | mode=${modeLabel} | label=${attempt.label}`);
							return undefined;
						}
						throw new Error('importProjectByProjectFile returned undefined');
					}
					const importedProjectUuid = String(result.uuid || '');
					if (!importedProjectUuid) {
						if (allowUndefinedResult) {
							logImportWarn(`attempt result missing uuid, treat as success | mode=${modeLabel} | label=${attempt.label}`);
							return undefined;
						}
						throw new Error('importProjectByProjectFile returned project without uuid');
					}
					logImportInfo(`attempt success | mode=${modeLabel} | label=${attempt.label} | importedProjectUuid=${importedProjectUuid} | importedProjectName=${result.friendlyName || 'n/a'}`);
					return {
						uuid: importedProjectUuid,
						friendlyName: String(result.friendlyName || ''),
					};
				}
				catch (error) {
					const reason = formatError(error);
					logImportWarn(`attempt failed | mode=${modeLabel} | label=${attempt.label} | reason=${reason}`);
					errors.push(`${attempt.label}: ${reason}`);
				}
			}

			throw new Error(`import attempts failed | mode=${modeLabel} | ${errors.join(' | ')}`);
		};
	}
	logImportError('sys_FileManager.importProjectByProjectFile unavailable');
	return undefined;
}

export async function replaceTemplateTexts(fieldValues: TemplateFieldValueMap, beforePrimitiveIds?: Set<string>): Promise<string[]> {
	const replacedKeys = new Set<string>();
	const allItems = await queryAllTextPrimitives();
	let targetItems = allItems;
	if (beforePrimitiveIds && beforePrimitiveIds.size > 0) {
		targetItems = allItems.filter((item) => {
			const id = getPrimitiveId(item);
			return id && !beforePrimitiveIds.has(id);
		});
	}
	let updatedPrimitiveCount = 0;
	let placeholderUpdatedCount = 0;
	logImportInfo(`string primitives loaded | all=${allItems.length} | target=${targetItems.length}`);
	for (const item of targetItems) {
		const originalText = getPrimitiveText(item);
		if (originalText === undefined)
			continue;
		let hasKey = false;
		for (const key of Object.keys(fieldValues)) {
			if (originalText.includes(`{{${key}}}`)) {
				hasKey = true;
				replacedKeys.add(key);
			}
		}
		if (!hasKey)
			continue;

		const updatedText = replacePlaceholders(originalText, fieldValues);
		if (updatedText === originalText)
			continue;
		await setPrimitiveText(item, updatedText);
		placeholderUpdatedCount += 1;
		updatedPrimitiveCount += 1;
	}

	if (placeholderUpdatedCount === 0) {
		const orderedInputs = Object.entries(fieldValues).filter(([, value]) => String(value || '').trim().length > 0);
		if (orderedInputs.length > 0) {
			const sortableItems = targetItems.filter(item => getPrimitiveText(item) !== undefined);
			sortableItems.sort((a, b) => {
				const ay = Number(typeof a?.getState_Y === 'function' ? a.getState_Y() : 0);
				const by = Number(typeof b?.getState_Y === 'function' ? b.getState_Y() : 0);
				if (ay !== by)
					return ay - by;
				const ax = Number(typeof a?.getState_X === 'function' ? a.getState_X() : 0);
				const bx = Number(typeof b?.getState_X === 'function' ? b.getState_X() : 0);
				return ax - bx;
			});

			const limit = Math.min(sortableItems.length, orderedInputs.length);
			for (let index = 0; index < limit; index += 1) {
				const [key, value] = orderedInputs[index];
				const item = sortableItems[index];
				const originalText = getPrimitiveText(item) || '';
				const updatedText = String(value || '');
				if (updatedText === originalText)
					continue;
				await setPrimitiveText(item, updatedText);
				replacedKeys.add(key);
				updatedPrimitiveCount += 1;
			}
			logImportInfo(`positional replace fallback applied | fields=${orderedInputs.length} | applied=${updatedPrimitiveCount} | target=${targetItems.length}`);
		}
	}

	logImportInfo(`replace summary | allPrimitives=${allItems.length} | targetPrimitives=${targetItems.length} | placeholderUpdated=${placeholderUpdatedCount} | updatedPrimitives=${updatedPrimitiveCount} | replacedKeys=${[...replacedKeys].join(', ') || 'none'}`);
	return [...replacedKeys];
}

export async function importEpro2AndApplyFields(
	templatePackage: TemplatePackage,
	fieldValues: TemplateFieldValueMap,
	_ctx: ImportContext,
): Promise<TemplateApplyResult> {
	logImportInfo(`import start | source=${templatePackage.sourceId} | template=${templatePackage.templateId} | layer=${_ctx.layer} | inputFields=${Object.keys(fieldValues).length}`);
	if (!templatePackage.epro2Blob)
		logImportError('template package has no epro2 payload');
	if (!templatePackage.epro2Blob)
		throw new Error('template package has no epro2 payload');

	const importApi = tryResolveImportApi();
	if (!importApi)
		logImportError('importProjectByProjectFile unavailable in current host runtime');
	if (!importApi)
		throw new Error('importProjectByProjectFile unavailable in current host runtime');

	const fileName = templatePackage.manifest.epro2FileName || `${templatePackage.templateId}.epro2`;
	const epro2File = templatePackage.epro2Blob instanceof File
		? templatePackage.epro2Blob
		: new File([templatePackage.epro2Blob], fileName, { type: templatePackage.epro2Blob.type || 'application/octet-stream' });
	logImportInfo(`prepared file | name=${epro2File.name} | size=${epro2File.size} | type=${epro2File.type || 'n/a'}`);
	const originalContext = await resolveCurrentEditorContext();
	logImportInfo('current editor context resolved');

	let existingSaveTo: any;
	if (originalContext.projectUuid) {
		existingSaveTo = resolveImportExistingProjectSaveTo(originalContext.projectUuid);
	}
	else {
		existingSaveTo = await resolveImportNewProjectSaveTo(templatePackage);
	}

	let beforeDocs = new Set<string>();
	try {
		const prjInfo = await (eda as any).dmt_Project?.getCurrentProjectInfo?.();
		const docs = Array.isArray(prjInfo?.data) ? prjInfo.data : [];
		for (const doc of docs) {
			if (doc?.uuid)
				beforeDocs.add(doc.uuid);
		}
	}
	catch (e) {}

	await importApi(epro2File, templatePackage, existingSaveTo, 'Import PCB Template', true);
	logImportInfo('importProjectByProjectFile finished');

	await new Promise(resolve => setTimeout(resolve, 3000));

	let newDocUuid: string | undefined;
	try {
		const prjInfo = await (eda as any).dmt_Project?.getCurrentProjectInfo?.();
		const docs = Array.isArray(prjInfo?.data) ? prjInfo.data : [];
		for (const doc of docs) {
			if (doc?.uuid && !beforeDocs.has(doc.uuid) && doc.itemType === EDMT_ItemType.PCB) {
				newDocUuid = doc.uuid;
				break;
			}
		}
		if (!newDocUuid) {
			for (const doc of docs) {
				if (doc?.uuid && !beforeDocs.has(doc.uuid)) {
					newDocUuid = doc.uuid;
					break;
				}
			}
		}

		if (newDocUuid) {
			logImportInfo(`found new imported document, switching to it | uuid=${newDocUuid}`);
			const openDocument = (eda as any).dmt_EditorControl?.openDocument;
			if (typeof openDocument === 'function') {
				await openDocument(newDocUuid);
				await new Promise(resolve => setTimeout(resolve, 2000));
			}
		}
	}
	catch (e) {
		logImportWarn(`failed to switch to new document: ${formatError(e)}`);
	}
	let retries = 20;
	while (retries > 0) {
		let isSwitched = false;
		if (newDocUuid) {
			try {
				const currentDoc = await (eda as any).dmt_SelectControl?.getCurrentDocumentInfo?.();
				if (currentDoc && currentDoc.uuid === newDocUuid) {
					isSwitched = true;
				}
			}
			catch (e) {}
		}
		else {
			isSwitched = true;
		}

		if (isSwitched) {
			const checkItems = await queryAllTextPrimitives();
			if (checkItems.length > 0) {
				logImportInfo(`document switched and ${checkItems.length} primitives loaded.`);
				break;
			}
		}

		logImportInfo(`waiting for document switch or text primitives... retries left=${retries}`);
		await new Promise(resolve => setTimeout(resolve, 1000));
		retries--;
	}

	await new Promise(resolve => setTimeout(resolve, 5000));

	const replacedKeys = await replaceTemplateTexts(fieldValues, new Set<string>());

	try {
		(eda as any).sys_Dialog?.showInformationMessage?.('【极速生成成功】\n\n受限于扩展接口能力，系统已自动在当前工程中为您新建了一个【新标签页】，并替换了名片文字。\n\n👉 您只需在当前弹出的新页面中【全选 (Ctrl+A)】并【复制 (Ctrl+C)】，然后切回您原本的画板【粘贴 (Ctrl+V)】即可！', '操作指南');
	}
	catch (e) {}

	return {
		mode: 'import',
		replacedKeys,
		warnings: [],
	};
}
