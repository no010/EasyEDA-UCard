import { generateQRMatrixAdaptive } from '../core/qr-generator';

interface PcbCardProfile {
	name: string;
	title: string;
	company: string;
	phone: string;
	email: string;
	website: string;
	// Developer-specific fields
	github: string;
	techStack: string;
	slogan: string;
	templateId: CardTemplateId;
	widthMm: number;
	heightMm: number;
	layer: EPCB_LayerId.TOP | EPCB_LayerId.BOTTOM;
	debugLayout: boolean;
}

const LOG_PREFIX = '[UCard]';
const BUILD_STAMP = '2026-03-06T15:10+08:00';

type CardTemplateId = 'aurora' | 'mono';

interface CardTemplateDefinition {
	id: CardTemplateId;
	name: string;
	description: string;
	defaultSizeMm: {
		width: number;
		height: number;
	};
	render: (ctx: CardRenderContext) => Promise<void>;
}

interface CardRenderContext {
	profile: PcbCardProfile;
	left: number;
	top: number;
	right: number;
	bottom: number;
	widthMil: number;
	heightMil: number;
};

const CARD_TEMPLATES: ReadonlyArray<CardTemplateDefinition> = [
	{
		id: 'aurora',
		name: 'Aurora Signature',
		description: '双栏布局 + 装饰分割线 + 信息层次感',
		defaultSizeMm: {
			width: 90,
			height: 54,
		},
		render: renderAuroraTemplate,
	},
	{
		id: 'mono',
		name: 'Mono Grid',
		description: '极简网格 + 左对齐信息流 + 工程感标签',
		defaultSizeMm: {
			width: 85.6,
			height: 54,
		},
		render: renderMonoGridTemplate,
	},
];

const MIN_SIZE_MM = 20;
const MAX_SIZE_MM = 200;
const DOT_FONT_3X5: Record<string, ReadonlyArray<string>> = {
	'A': ['010', '101', '111', '101', '101'],
	'B': ['110', '101', '110', '101', '110'],
	'C': ['011', '100', '100', '100', '011'],
	'D': ['110', '101', '101', '101', '110'],
	'E': ['111', '100', '110', '100', '111'],
	'F': ['111', '100', '110', '100', '100'],
	'G': ['011', '100', '101', '101', '011'],
	'H': ['101', '101', '111', '101', '101'],
	'I': ['111', '010', '010', '010', '111'],
	'J': ['111', '001', '001', '101', '010'],
	'K': ['101', '101', '110', '101', '101'],
	'L': ['100', '100', '100', '100', '111'],
	'M': ['101', '111', '111', '101', '101'],
	'N': ['101', '111', '111', '111', '101'],
	'O': ['010', '101', '101', '101', '010'],
	'P': ['110', '101', '110', '100', '100'],
	'Q': ['010', '101', '101', '111', '011'],
	'R': ['110', '101', '110', '101', '101'],
	'S': ['011', '100', '010', '001', '110'],
	'T': ['111', '010', '010', '010', '010'],
	'U': ['101', '101', '101', '101', '111'],
	'V': ['101', '101', '101', '101', '010'],
	'W': ['101', '101', '111', '111', '101'],
	'X': ['101', '101', '010', '101', '101'],
	'Y': ['101', '101', '010', '010', '010'],
	'Z': ['111', '001', '010', '100', '111'],
	'0': ['111', '101', '101', '101', '111'],
	'1': ['010', '110', '010', '010', '111'],
	'2': ['111', '001', '111', '100', '111'],
	'3': ['111', '001', '111', '001', '111'],
	'4': ['101', '101', '111', '001', '001'],
	'5': ['111', '100', '111', '001', '111'],
	'6': ['111', '100', '111', '101', '111'],
	'7': ['111', '001', '001', '001', '001'],
	'8': ['111', '101', '111', '101', '111'],
	'9': ['111', '101', '111', '001', '111'],
	' ': ['000', '000', '000', '000', '000'],
	'.': ['000', '000', '000', '000', '010'],
	':': ['000', '010', '000', '010', '000'],
	'-': ['000', '000', '111', '000', '000'],
	'+': ['000', '010', '111', '010', '000'],
	'/': ['001', '001', '010', '100', '100'],
	'@': ['111', '101', '111', '100', '011'],
	'>': ['100', '010', '001', '010', '100'],
	'_': ['000', '000', '000', '000', '111'],
};

function clampNumber(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function normalizeTextField(value: unknown, fallback = ''): string {
	if (typeof value !== 'string')
		return fallback;
	return value.trim();
}

function normalizeVCardValue(input: string): string {
	return input.replaceAll(/[\r\n]+/g, ' ').trim();
}

function normalizeProfile(raw: any): PcbCardProfile {
	const templateId: CardTemplateId = raw?.templateId === 'aurora' ? 'aurora' : 'mono';
	const isAurora = templateId === 'aurora';
	const defaultWidth = isAurora ? 90 : 85.6;
	const defaultHeight = 54;

	const widthMmRaw = Number(raw?.widthMm);
	const heightMmRaw = Number(raw?.heightMm);
	const widthMm = Number.isFinite(widthMmRaw) ? clampNumber(widthMmRaw, MIN_SIZE_MM, MAX_SIZE_MM) : defaultWidth;
	const heightMm = Number.isFinite(heightMmRaw) ? clampNumber(heightMmRaw, MIN_SIZE_MM, MAX_SIZE_MM) : defaultHeight;

	const layer = raw?.layer === EPCB_LayerId.BOTTOM ? EPCB_LayerId.BOTTOM : EPCB_LayerId.TOP;

	return {
		name: normalizeTextField(raw?.name, 'UCard'),
		title: normalizeTextField(raw?.title, 'ENGINEER'),
		company: normalizeTextField(raw?.company),
		phone: normalizeTextField(raw?.phone),
		email: normalizeTextField(raw?.email),
		website: normalizeTextField(raw?.website),
		github: normalizeTextField(raw?.github),
		techStack: normalizeTextField(raw?.techStack),
		slogan: normalizeTextField(raw?.slogan),
		templateId,
		widthMm,
		heightMm,
		layer,
		debugLayout: raw?.debugLayout === true,
	};
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

let isSessionInitialized = false;
let isSvgBridgeInitialized = false;
const pendingSvgRequests = new Map<string, {
	resolve: (value: string) => void;
	reject: (reason?: any) => void;
	timeout: ReturnType<typeof setTimeout>;
}>();
const runtimeLayerNames = new Map<number, string>();
const verifiedLayerTags = new Set<string>();
let hasLoggedRuntimeLayers = false;

async function ensureRuntimeLayerCatalog(): Promise<void> {
	if (hasLoggedRuntimeLayers)
		return;

	hasLoggedRuntimeLayers = true;
	try {
		if (typeof eda.pcb_Layer?.getAllLayers !== 'function') {
			logWarn('runtime layers: pcb_Layer.getAllLayers unavailable');
			return;
		}
		const layers = await eda.pcb_Layer.getAllLayers();
		for (const layer of layers || []) {
			runtimeLayerNames.set(Number(layer.id), String(layer.name || layer.id));
		}
		const summary = (layers || [])
			.filter((layer: any) => [1, 2, 3, 4, 5, 6, 11].includes(Number(layer.id)))
			.map((layer: any) => `${layer.id}:${layer.name}`)
			.join(', ');
		logInfo(`runtime layers: ${summary}`);
	}
	catch (error) {
		logWarn(`runtime layers: failed to query. ${String(error)}`);
	}
}

function describeLayer(layer: EPCB_LayerId | number): string {
	const layerId = Number(layer);
	return `${layerId}${runtimeLayerNames.has(layerId) ? `:${runtimeLayerNames.get(layerId)}` : ''}`;
}

async function verifyPrimitiveLayer(tag: string, primitive: any, expectedLayer: EPCB_LayerId | number): Promise<void> {
	if (!primitive || typeof primitive.getState_Layer !== 'function')
		return;

	try {
		const actualLayer = Number(primitive.getState_Layer());
		const expectedId = Number(expectedLayer);
		const tagKey = `${tag}@${expectedId}`;
		if (actualLayer !== expectedId) {
			logWarn(`${tag}: layer mismatch expected=${describeLayer(expectedId)} actual=${describeLayer(actualLayer)}`);
			return;
		}
		if (!verifiedLayerTags.has(tagKey)) {
			verifiedLayerTags.add(tagKey);
			logInfo(`${tag}: layer confirmed ${describeLayer(actualLayer)}`);
		}
	}
	catch (error) {
		logWarn(`${tag}: unable to read created primitive layer. ${String(error)}`);
	}
}

function resetRunDiagnostics(): void {
	verifiedLayerTags.clear();
}

function ensureSvgBridgeInitialized(): void {
	if (isSvgBridgeInitialized)
		return;

	const messageBus = eda.sys_MessageBus as any;
	if (typeof messageBus?.pullPublic !== 'function' || typeof messageBus?.pushPublic !== 'function') {
		throw new TypeError('Host API missing: MessageBus.pullPublic/pushPublic');
	}

	messageBus.pullPublic('UCARD_SVG_RESULT', (cmd: any) => {
		const id = String(cmd?.id ?? '');
		if (!id)
			return;
		const pending = pendingSvgRequests.get(id);
		if (!pending)
			return;

		clearTimeout(pending.timeout);
		pendingSvgRequests.delete(id);

		if (cmd?.type === 'SVG_CONVERTED' && typeof cmd?.base64 === 'string') {
			pending.resolve(cmd.base64);
		}
		else {
			pending.reject(new TypeError(String(cmd?.error ?? 'SVG convert failed')));
		}
	});

	isSvgBridgeInitialized = true;
}

async function renderSvgToPngBlobLocal(svgString: string, widthPx: number, heightPx: number): Promise<Blob> {
	if (typeof document === 'undefined' || typeof Image === 'undefined') {
		throw new TypeError('Local SVG render unavailable: missing DOM APIs');
	}

	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, widthPx);
	canvas.height = Math.max(1, heightPx);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new TypeError('Local SVG render unavailable: no 2d context');
	}

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(svgBlob);
	try {
		await new Promise<void>((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				try {
					ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
					resolve();
				}
				catch (error) {
					reject(error);
				}
			};
			img.onerror = error => reject(new TypeError(`Local SVG image decode failed: ${String(error)}`));
			img.src = url;
		});
	}
	finally {
		URL.revokeObjectURL(url);
	}

	return await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
			}
			else {
				reject(new TypeError('Local SVG render failed: canvas.toBlob returned null'));
			}
		}, 'image/png');
	});
}

export function generatePcbBusinessCard(): void {
	if (!isSessionInitialized) {
		try {
			eda.sys_MessageBus.pullPublic('UCARD_GENERATE', async (profile: any) => {
				await runGeneratorWithProfile(profile);
				try {
					await eda.sys_IFrame.closeIFrame('ucard-iframe');
				}
				catch {
					// ignore
				}
			});

			eda.sys_MessageBus.pullPublic('UCARD_CLOSE', async () => {
				try {
					await eda.sys_IFrame.closeIFrame('ucard-iframe');
				}
				catch {
					// ignore
				}
			});
			isSessionInitialized = true;
		}
		catch (err) {
			logWarn(`Failed to register MessageBus: ${String(err)}`);
		}
	}
	void initGeneratorSession();
}

async function initGeneratorSession(): Promise<void> {
	try {
		const currentDocument = await eda.dmt_SelectControl.getCurrentDocumentInfo();
		if (!currentDocument || currentDocument.documentType !== EDMT_EditorDocumentType.PCB) {
			eda.sys_Dialog.showInformationMessage('请先切换到 PCB 页面，再生成名片。', 'UCard');
			return;
		}

		await eda.sys_IFrame.openIFrame(
			'/iframe/ucard.html',
			450,
			680,
			'ucard-iframe',
			{ maximizeButton: false, minimizeButton: false, grayscaleMask: true },
		);
	}
	catch (error) {
		logError(`initGeneratorSession: ${String(error)}`);
		eda.sys_Dialog.showInformationMessage(`启动失败：${String(error)}`, 'UCard Error');
	}
}

export async function runGeneratorWithProfile(profile: any): Promise<void> {
	try {
		resetRunDiagnostics();
		logInfo(`build=${BUILD_STAMP}`);
		const mousePos = await eda.pcb_SelectControl.getCurrentMousePosition();
		if (!mousePos) {
			eda.sys_Dialog.showInformationMessage('请把鼠标移动到 PCB 画布上的目标位置，然后再点击生成。', 'UCard');
			return;
		}

		const normalizedProfile = normalizeProfile(profile);
		await drawBusinessCard(normalizedProfile, mousePos.x, mousePos.y);

		eda.sys_Dialog.showInformationMessage(
			'PCB 名片已生成（板框 + 铜皮点阵文字）。建议执行一次 DRC 并微调位置。',
			'UCard',
		);
	}
	catch (error) {
		logError(`runGeneratorWithProfile: ${String(error)}`);
		eda.sys_Dialog.showInformationMessage(`生成失败：${String(error)}`, 'UCard Error');
	}
}

/**
 * Check if the current PCB document has existing board outline primitives
 */
async function checkBoardOutlineExists(): Promise<boolean> {
	try {
		// Attempt to query board outline layer primitives if the API supports it
		if (typeof (eda as any).pcb_PrimitiveLine?.query === 'function') {
			const outlines = await (eda as any).pcb_PrimitiveLine.query({
				layer: EPCB_LayerId.BOARD_OUTLINE,
			});
			return Array.isArray(outlines) && outlines.length > 0;
		}
		return false;
	}
	catch {
		// If query fails, assume no outline to avoid blocking
		return false;
	}
}

async function drawBusinessCard(profile: PcbCardProfile, anchorX: number, anchorY: number): Promise<void> {
	await ensureRuntimeLayerCatalog();
	const widthMil = eda.sys_Unit.mmToMil(profile.widthMm, 3);
	const heightMil = eda.sys_Unit.mmToMil(profile.heightMm, 3);

	// 宿主返回的鼠标位置更适合作为名片左上角锚点。
	// 模板内部仍然使用“左下角为原点”的虚拟坐标系，再由 bottom 反推具体位置。
	const left = anchorX;
	const top = anchorY;
	const bottom = top + heightMil;
	const right = left + widthMil;

	// Check for existing board outline
	const hasOutline = await checkBoardOutlineExists();
	let shouldDrawOutline = true;

	if (hasOutline) {
		const dialogApi = eda.sys_Dialog as any;
		if (typeof dialogApi.showConfirmDialog === 'function') {
			const userChoice = await dialogApi.showConfirmDialog(
				'检测到现有板框',
				'当前 PCB 已存在板框线。是否仍要绘制新的名片板框？\n\n选择"是"将在当前位置绘制新板框（可能重叠）\n选择"否"将仅绘制名片内容（推荐）',
				'UCard - 板框检测',
			);
			shouldDrawOutline = userChoice === true;
		}
		else {
			logWarn('showConfirmDialog is unavailable, keep drawing outline by default');
		}
	}

	if (shouldDrawOutline) {
		await drawOutline(left, top, right, bottom);
	}
	else {
		logInfo('drawBusinessCard: skipped board outline (user choice)');
	}

	const template = CARD_TEMPLATES.find(item => item.id === profile.templateId);
	if (!template) {
		throw new Error(`Unknown card template: ${profile.templateId}`);
	}

	await template.render({
		profile,
		left,
		top,
		right,
		bottom,
		widthMil,
		heightMil,
	});

	logInfo(`drawBusinessCard: template=${template.id}`);
}

// --- Layer Image Renderer ---

async function drawSvgLayerImage(
	svgElements: string,
	layer: EPCB_LayerId | number,
	startX: number,
	startY: number,
	widthMil: number,
	heightMil: number,
): Promise<void> {
	if (widthMil <= 0 || heightMil <= 0) {
		throw new TypeError(`Invalid image size: width=${widthMil}, height=${heightMil}`);
	}
	const vw = 900;
	const vh = Math.round(900 * (heightMil / widthMil));

	const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" viewBox="0 0 ${vw} ${vh}">
<rect width="100%" height="100%" fill="white" />
${svgElements}
</svg>`;

	let blob: Blob;
	try {
		// Preferred path: local rendering in host runtime, no bridge dependency.
		blob = await renderSvgToPngBlobLocal(svgString, vw, vh);
	}
	catch (localError) {
		logWarn(`drawSvgLayerImage: local render failed, fallback to iframe bridge. ${String(localError)}`);
		const id = Math.random().toString(36).substring(2, 10);
		ensureSvgBridgeInitialized();
		const messageBus = eda.sys_MessageBus as any;
		if (typeof messageBus?.pushPublic !== 'function') {
			throw new TypeError('Host API missing: MessageBus.pushPublic');
		}

		const base64Data = await new Promise<string>((resolve, reject) => {
			const timeout = setTimeout(() => {
				pendingSvgRequests.delete(id);
				reject(new Error('SVG Render timeout'));
			}, 20000);
			pendingSvgRequests.set(id, { resolve, reject, timeout });
			try {
				messageBus.pushPublic('UCARD_SVG_CONVERT', {
					type: 'CONVERT_SVG',
					id,
					svgString,
					width: widthMil,
					height: heightMil,
				});
			}
			catch (error) {
				clearTimeout(timeout);
				pendingSvgRequests.delete(id);
				reject(error);
			}
		});

		const base64Split = base64Data.split(',');
		if (base64Split.length < 2) {
			throw new Error('Invalid base64 image payload');
		}
		const byteString = atob(base64Split[1]);
		const buffer = new ArrayBuffer(byteString.length);
		const view = new Uint8Array(buffer);
		for (let i = 0; i < byteString.length; i++) {
			view[i] = byteString.charCodeAt(i);
		}
		blob = new Blob([view], { type: 'image/png' });
	}

	if (typeof eda.pcb_MathPolygon?.convertImageToComplexPolygon === 'function') {
		const complexPoly = await eda.pcb_MathPolygon.convertImageToComplexPolygon(
			blob,
			widthMil,
			heightMil,
			undefined,
			undefined,
			undefined,
			undefined,
			true, // whiteAsBackgroundColor -> black becomes polygon
			false,
		);

		if (complexPoly && typeof eda.pcb_PrimitiveImage?.create === 'function') {
			const primitive = await eda.pcb_PrimitiveImage.create(
				startX,
				startY, // Anchor top-left
				complexPoly,
				layer as any,
				widthMil,
				heightMil,
			);
			await verifyPrimitiveLayer('svg-image', primitive, layer);
			logInfo(`drawSvgLayerImage: success for layer ${describeLayer(layer)}`);
		}
	}
	else {
		logError('Image polygon conversion API missing!');
	}
}

async function tryDrawSvgLayerImage(
	svgElements: string,
	layer: EPCB_LayerId | number,
	startX: number,
	startY: number,
	widthMil: number,
	heightMil: number,
	tag: string,
): Promise<void> {
	try {
		await drawSvgLayerImage(svgElements, layer, startX, startY, widthMil, heightMil);
	}
	catch (error) {
		logWarn(`tryDrawSvgLayerImage: skipped ${tag}. ${String(error)}`);
	}
}

// Map from virtual 900x540 coordinates to physical placement for vias
function mapX(vx: number, left: number, widthMil: number) {
	return left + (vx / 900) * widthMil;
}
function mapY(vy: number, top: number, widthMil: number, heightMil: number) {
	const vh = Math.round(900 * heightMil / widthMil);
	return top + (vy / vh) * heightMil;
}

function mapYFromBottom(vy: number, bottom: number, heightMil: number, virtualHeight = 540) {
	return bottom - (vy / virtualHeight) * heightMil;
}

async function createLinePrimitive(
	tag: string,
	layer: EPCB_LayerId | number,
	startX: number,
	startY: number,
	endX: number,
	endY: number,
	lineWidth?: number,
): Promise<void> {
	const primitive = await eda.pcb_PrimitiveLine.create('', layer as any, startX, startY, endX, endY, lineWidth);
	if (primitive && typeof primitive.toSync === 'function' && typeof primitive.done === 'function') {
		await primitive.done();
	}
	await verifyPrimitiveLayer(tag, primitive, layer);
}

async function createFillPrimitive(
	tag: string,
	layer: EPCB_LayerId | number,
	polygonSource: Array<'L' | 'ARC' | 'CARC' | 'C' | 'R' | 'CIRCLE' | number>,
): Promise<void> {
	const polygon = eda.pcb_MathPolygon?.createPolygon?.(polygonSource as any);
	if (!polygon)
		throw new Error(`createFillPrimitive: invalid polygon for ${tag}`);
	const primitive = await eda.pcb_PrimitiveFill.create(layer as any, polygon);
	await verifyPrimitiveLayer(tag, primitive, layer);
}

async function drawNativeStroke(
	layer: EPCB_LayerId | number,
	left: number,
	top: number,
	widthMil: number,
	heightMil: number,
	vx1: number,
	vy1: number,
	vx2: number,
	vy2: number,
	strokeWidthMil: number,
	tag = 'native-stroke',
): Promise<void> {
	const x1 = mapX(vx1, left, widthMil);
	const y1 = mapY(vy1, top, widthMil, heightMil);
	const x2 = mapX(vx2, left, widthMil);
	const y2 = mapY(vy2, top, widthMil, heightMil);
	const isAxisAligned = Math.abs(x1 - x2) < 0.001 || Math.abs(y1 - y2) < 0.001;
	if (Number(layer) !== Number(EPCB_LayerId.BOARD_OUTLINE) && isAxisAligned) {
		const rectX = Math.min(x1, x2);
		const rectY = Math.min(y1, y2) - (Math.abs(y1 - y2) < 0.001 ? strokeWidthMil / 2 : 0);
		const rectW = Math.max(Math.abs(x2 - x1), strokeWidthMil);
		const rectH = Math.abs(x1 - x2) < 0.001 ? Math.max(Math.abs(y2 - y1), strokeWidthMil) : strokeWidthMil;
		const adjustedX = Math.abs(x1 - x2) < 0.001 ? rectX - strokeWidthMil / 2 : rectX;
		await createFillPrimitive(tag, layer, ['R', adjustedX, rectY, rectW, rectH, 0, 0]);
		return;
	}

	await createLinePrimitive(tag, layer as any, x1, y1, x2, y2, strokeWidthMil);
}

async function drawNativePixel(
	layer: EPCB_LayerId | number,
	left: number,
	top: number,
	widthMil: number,
	heightMil: number,
	vx: number,
	vy: number,
	sizeMil: number,
	tag = 'native-pixel',
): Promise<void> {
	const x = mapX(vx, left, widthMil);
	const y = mapY(vy, top, widthMil, heightMil);
	await createFillPrimitive(tag, layer, ['R', x, y, Math.max(sizeMil, 1), Math.max(sizeMil, 1), 0, 0]);
}

async function drawDotText(
	layer: EPCB_LayerId | number,
	text: string,
	left: number,
	top: number,
	widthMil: number,
	heightMil: number,
	startVX: number,
	startVY: number,
	moduleVX: number,
	moduleMil: number,
	tag = 'native-dot-text',
): Promise<void> {
	let cursorVX = startVX;
	const content = text.toUpperCase();
	for (const char of content) {
		const glyph = DOT_FONT_3X5[char] ?? DOT_FONT_3X5[' '];
		for (let row = 0; row < glyph.length; row++) {
			for (let col = 0; col < glyph[row].length; col++) {
				if (glyph[row][col] !== '1')
					continue;
				await drawNativePixel(
					layer,
					left,
					top,
					widthMil,
					heightMil,
					cursorVX + col * moduleVX,
					startVY + row * moduleVX,
					moduleMil,
					tag,
				);
			}
		}
		cursorVX += moduleVX * 4;
	}
}

async function drawNativeText(
	layer: EPCB_LayerId | number,
	text: string,
	left: number,
	top: number,
	widthMil: number,
	heightMil: number,
	startVX: number,
	startVY: number,
	fontSizeMm: number,
	lineWidthMm = 0.18,
	tag = 'native-text',
): Promise<void> {
	const api = (eda as any).pcb_PrimitiveString;
	if (api && typeof api.create === 'function') {
		try {
			const primitive = await api.create(
				layer as any,
				mapX(startVX, left, widthMil),
				mapY(startVY, top, widthMil, heightMil),
				String(text || ''),
				'',
				eda.sys_Unit.mmToMil(fontSizeMm, 3),
				eda.sys_Unit.mmToMil(lineWidthMm, 3),
				EPCB_PrimitiveStringAlignMode.LEFT_TOP,
				0,
				false,
				100,
				false,
				false,
			);
			await verifyPrimitiveLayer(tag, primitive, layer);
			return;
		}
		catch (error) {
			logWarn(`drawNativeText: PrimitiveString failed, fallback to dot text. ${String(error)}`);
		}
	}
	else {
		logWarn('drawNativeText: PrimitiveString.create unavailable, fallback to dot text');
	}

	const moduleVX = Math.max(4.5, Math.round(fontSizeMm * 3.2));
	const moduleMil = eda.sys_Unit.mmToMil(Math.max(fontSizeMm * 0.22, 0.2), 3);
	await drawDotText(layer, text, left, top, widthMil, heightMil, startVX, startVY, moduleVX, moduleMil, `${tag}-fallback`);
}

async function drawVia(x: number, y: number, drillSizeMil: number, diameterMil: number): Promise<void> {
	const primitive = await eda.pcb_PrimitivePad.create(
		EPCB_LayerId.MULTI,
		'',
		x,
		y,
		0,
		[EPCB_PrimitivePadShapeType.ELLIPSE, diameterMil, diameterMil],
		'',
		[EPCB_PrimitivePadHoleType.ROUND, drillSizeMil, drillSizeMil],
		0,
		0,
		0,
		true,
		EPCB_PrimitivePadType.NORMAL,
	);
	await verifyPrimitiveLayer('native-via', primitive, EPCB_LayerId.MULTI);
}

function buildVCardPayload(profile: PcbCardProfile): string {
	const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${normalizeVCardValue(profile.name)}`];
	if (profile.title)
		lines.push(`TITLE:${normalizeVCardValue(profile.title)}`);
	if (profile.company)
		lines.push(`ORG:${normalizeVCardValue(profile.company)}`);
	if (profile.phone)
		lines.push(`TEL:${normalizeVCardValue(profile.phone)}`);
	if (profile.email)
		lines.push(`EMAIL:${normalizeVCardValue(profile.email)}`);
	if (profile.website)
		lines.push(`URL:${normalizeVCardValue(profile.website)}`);
	lines.push('END:VCARD');
	return lines.join('\n');
}

async function drawNativeQr(
	layer: EPCB_LayerId | number,
	profile: PcbCardProfile,
	left: number,
	top: number,
	widthMil: number,
	heightMil: number,
	vx: number,
	vy: number,
	vSize: number,
	moduleMil: number,
	tag = 'native-qr',
): Promise<void> {
	const matrix = await generateQRMatrixAdaptive(buildVCardPayload(profile), { errorCorrectionLevel: 'L' });
	if (!matrix)
		return;
	const moduleSize = vSize / matrix.length;
	for (let row = 0; row < matrix.length; row++) {
		for (let col = 0; col < matrix.length; col++) {
			if (matrix[row][col]) {
				await drawNativePixel(
					layer,
					left,
					top,
					widthMil,
					heightMil,
					vx + col * moduleSize,
					vy + row * moduleSize,
					moduleMil,
					tag,
				);
			}
		}
	}
}

async function drawStrokeFromBottom(
	layer: EPCB_LayerId | number,
	left: number,
	bottom: number,
	widthMil: number,
	heightMil: number,
	vx1: number,
	vy1: number,
	vx2: number,
	vy2: number,
	strokeWidthMil: number,
	tag: string,
): Promise<void> {
	const x1 = mapX(vx1, left, widthMil);
	const y1 = mapYFromBottom(vy1, bottom, heightMil);
	const x2 = mapX(vx2, left, widthMil);
	const y2 = mapYFromBottom(vy2, bottom, heightMil);
	const isAxisAligned = Math.abs(x1 - x2) < 0.001 || Math.abs(y1 - y2) < 0.001;
	if (Number(layer) !== Number(EPCB_LayerId.BOARD_OUTLINE) && isAxisAligned) {
		const rectX = Math.min(x1, x2);
		const rectY = Math.min(y1, y2) - (Math.abs(y1 - y2) < 0.001 ? strokeWidthMil / 2 : 0);
		const rectW = Math.max(Math.abs(x2 - x1), strokeWidthMil);
		const rectH = Math.abs(x1 - x2) < 0.001 ? Math.max(Math.abs(y2 - y1), strokeWidthMil) : strokeWidthMil;
		const adjustedX = Math.abs(x1 - x2) < 0.001 ? rectX - strokeWidthMil / 2 : rectX;
		await createFillPrimitive(tag, layer, ['R', adjustedX, rectY, rectW, rectH, 0, 0]);
		return;
	}
	await createLinePrimitive(tag, layer, x1, y1, x2, y2, strokeWidthMil);
}

async function drawTextFromBottom(
	layer: EPCB_LayerId | number,
	text: string,
	left: number,
	bottom: number,
	widthMil: number,
	heightMil: number,
	vx: number,
	vy: number,
	fontSizeMm: number,
	lineWidthMm: number,
	tag: string,
): Promise<void> {
	const api = (eda as any).pcb_PrimitiveString;
	if (api && typeof api.create === 'function') {
		try {
			const primitive = await api.create(
				layer as any,
				mapX(vx, left, widthMil),
				mapYFromBottom(vy, bottom, heightMil),
				String(text || ''),
				'',
				eda.sys_Unit.mmToMil(fontSizeMm, 3),
				eda.sys_Unit.mmToMil(lineWidthMm, 3),
				EPCB_PrimitiveStringAlignMode.LEFT_TOP,
				0,
				false,
				100,
				false,
				false,
			);
			await verifyPrimitiveLayer(tag, primitive, layer);
			return;
		}
		catch (error) {
			logWarn(`drawTextFromBottom: PrimitiveString failed, fallback to top-origin helper. ${String(error)}`);
		}
	}
	await drawNativeText(layer, text, left, bottom - heightMil, widthMil, heightMil, vx, 540 - vy, fontSizeMm, lineWidthMm, tag);
}

async function fillCircleFromBottom(
	layer: EPCB_LayerId | number,
	left: number,
	bottom: number,
	widthMil: number,
	heightMil: number,
	cx: number,
	cy: number,
	radiusV: number,
	tag: string,
): Promise<void> {
	await createFillPrimitive(
		tag,
		layer,
		['CIRCLE', mapX(cx, left, widthMil), mapYFromBottom(cy, bottom, heightMil), (radiusV / 900) * widthMil],
	);
}

function logLayoutRect(
	tag: string,
	left: number,
	bottom: number,
	widthMil: number,
	heightMil: number,
	vx: number,
	vy: number,
	vw: number,
	vh: number,
): void {
	const x1 = Math.round(mapX(vx, left, widthMil));
	const y1 = Math.round(mapYFromBottom(vy, bottom, heightMil));
	const x2 = Math.round(mapX(vx + vw, left, widthMil));
	const y2 = Math.round(mapYFromBottom(vy + vh, bottom, heightMil));
	logInfo(`${tag}: bl=(${x1},${y1}) tr=(${x2},${y2})`);
}

async function drawDebugRectFromBottom(
	layer: EPCB_LayerId | number,
	left: number,
	bottom: number,
	widthMil: number,
	heightMil: number,
	vx: number,
	vy: number,
	vw: number,
	vh: number,
	tag: string,
): Promise<void> {
	await drawStrokeFromBottom(layer, left, bottom, widthMil, heightMil, vx, vy, vx + vw, vy, eda.sys_Unit.mmToMil(0.12, 3), `${tag}-debug-box`);
	await drawStrokeFromBottom(layer, left, bottom, widthMil, heightMil, vx + vw, vy, vx + vw, vy + vh, eda.sys_Unit.mmToMil(0.12, 3), `${tag}-debug-box`);
	await drawStrokeFromBottom(layer, left, bottom, widthMil, heightMil, vx + vw, vy + vh, vx, vy + vh, eda.sys_Unit.mmToMil(0.12, 3), `${tag}-debug-box`);
	await drawStrokeFromBottom(layer, left, bottom, widthMil, heightMil, vx, vy + vh, vx, vy, eda.sys_Unit.mmToMil(0.12, 3), `${tag}-debug-box`);
	await drawTextFromBottom(layer, tag.toUpperCase(), left, bottom, widthMil, heightMil, vx + 6, vy + vh - 12, 0.9, 0.1, `${tag}-debug-label`);
	logLayoutRect(tag, left, bottom, widthMil, heightMil, vx, vy, vw, vh);
}

async function drawLayoutDebugMono(
	ctx: CardRenderContext,
	tSilk: EPCB_LayerId | number,
): Promise<void> {
	const { left, bottom, widthMil, heightMil } = ctx;
	logInfo(`layout origin: left=${Math.round(left)} bottom=${Math.round(bottom)} width=${Math.round(widthMil)} height=${Math.round(heightMil)}`);
	await drawStrokeFromBottom(tSilk, left, bottom, widthMil, heightMil, 0, 0, 140, 0, eda.sys_Unit.mmToMil(0.14, 3), 'debug-origin');
	await drawStrokeFromBottom(tSilk, left, bottom, widthMil, heightMil, 0, 0, 0, 140, eda.sys_Unit.mmToMil(0.14, 3), 'debug-origin');
	await drawTextFromBottom(tSilk, 'ORIGIN', left, bottom, widthMil, heightMil, 8, 10, 0.9, 0.1, 'debug-origin');
	for (const vx of [100, 300, 500, 700]) {
		await drawStrokeFromBottom(tSilk, left, bottom, widthMil, heightMil, vx, 0, vx, 540, eda.sys_Unit.mmToMil(0.08, 3), 'debug-grid');
		await drawTextFromBottom(tSilk, `${vx}`, left, bottom, widthMil, heightMil, vx + 4, 8, 0.8, 0.1, 'debug-grid');
	}
	for (const vy of [100, 200, 300, 400, 500]) {
		await drawStrokeFromBottom(tSilk, left, bottom, widthMil, heightMil, 0, vy, 900, vy, eda.sys_Unit.mmToMil(0.08, 3), 'debug-grid');
		await drawTextFromBottom(tSilk, `${vy}`, left, bottom, widthMil, heightMil, 6, vy + 4, 0.8, 0.1, 'debug-grid');
	}
	await drawDebugRectFromBottom(tSilk, left, bottom, widthMil, heightMil, 36, 24, 828, 492, 'safe-zone');
	await drawDebugRectFromBottom(tSilk, left, bottom, widthMil, heightMil, 64, 272, 456, 210, 'top-hero-left');
	await drawDebugRectFromBottom(tSilk, left, bottom, widthMil, heightMil, 558, 244, 300, 254, 'top-hero-right');
	await drawDebugRectFromBottom(tSilk, left, bottom, widthMil, heightMil, 72, 64, 380, 160, 'top-contact');
	await drawDebugRectFromBottom(tSilk, left, bottom, widthMil, heightMil, 88, 394, 724, 90, 'back-band-top');
	await drawDebugRectFromBottom(tSilk, left, bottom, widthMil, heightMil, 126, 162, 648, 220, 'back-core');
	await drawDebugRectFromBottom(tSilk, left, bottom, widthMil, heightMil, 88, 52, 724, 92, 'back-band-bottom');
}

// Outline functions
async function drawOutline(left: number, top: number, right: number, bottom: number): Promise<void> {
	const outlineWidth = eda.sys_Unit.mmToMil(0.2, 3);
	const l = EPCB_LayerId.BOARD_OUTLINE;
	logInfo(`drawOutline: using pcb_PrimitivePolyline.create on ${describeLayer(l)}`);

	const polygon = eda.pcb_MathPolygon.createPolygon([
		'R',
		left,
		top,
		right - left,
		bottom - top,
		0,
		0,
	]);
	if (!polygon)
		throw new Error('drawOutline: failed to create outline polygon');

	const primitive = await eda.pcb_PrimitivePolyline.create('', l, polygon, outlineWidth, false);
	if (primitive && typeof primitive.done === 'function') {
		await primitive.done();
	}
	await verifyPrimitiveLayer('board-outline-polyline', primitive, l);
}

// Templates implementation using pure SVGs layered mapping
async function renderAuroraTemplate(ctx: CardRenderContext): Promise<void> {
	const isTop = ctx.profile.layer === EPCB_LayerId.TOP;
	const tSilk = isTop ? EPCB_LayerId.TOP_SILKSCREEN : EPCB_LayerId.BOTTOM_SILKSCREEN;
	const tMask = isTop ? EPCB_LayerId.TOP_SOLDER_MASK : EPCB_LayerId.BOTTOM_SOLDER_MASK;
	const tCopper = isTop ? EPCB_LayerId.TOP : EPCB_LayerId.BOTTOM;

	const bCopper = isTop ? EPCB_LayerId.BOTTOM : EPCB_LayerId.TOP;
	const bSilk = isTop ? EPCB_LayerId.BOTTOM_SILKSCREEN : EPCB_LayerId.TOP_SILKSCREEN;
	const bMask = isTop ? EPCB_LayerId.BOTTOM_SOLDER_MASK : EPCB_LayerId.TOP_SOLDER_MASK;

	const { left, top, widthMil, heightMil, profile } = ctx;
	logInfo(`aurora layers: tSilk=${describeLayer(tSilk)} tMask=${describeLayer(tMask)} tCopper=${describeLayer(tCopper)} bSilk=${describeLayer(bSilk)} bMask=${describeLayer(bMask)} bCopper=${describeLayer(bCopper)}`);

	await drawNativeText(tSilk, profile.name, left, top, widthMil, heightMil, 175, 80, 4.8, 0.22, 'aurora-top-text');
	await drawNativeText(tSilk, profile.title, left, top, widthMil, heightMil, 180, 145, 2, 0.16, 'aurora-top-text');
	await drawNativeText(tSilk, `>> ${profile.techStack}`, left, top, widthMil, heightMil, 450, 420, 1.5, 0.14, 'aurora-top-text');
	if (profile.email)
		await drawNativeText(tSilk, `>> EMAIL: ${profile.email}`, left, top, widthMil, heightMil, 450, 450, 1.2, 0.12, 'aurora-top-text');
	if (profile.github)
		await drawNativeText(tSilk, `>> GIT: ${profile.github}`, left, top, widthMil, heightMil, 450, 480, 1.2, 0.12, 'aurora-top-text');
	await drawNativeText(tSilk, profile.slogan || 'ART MEETS ENGINEERING', left, top, widthMil, heightMil, 35, 435, 1.3, 0.12, 'aurora-top-text');
	await drawNativeText(tSilk, 'REV A1', left, top, widthMil, heightMil, 35, 485, 1.1, 0.12, 'aurora-top-text');
	await drawNativeText(tSilk, 'SCAN VCARD', left, top, widthMil, heightMil, 640, 290, 1.1, 0.12, 'aurora-top-text');
	await drawNativeStroke(tSilk, left, top, widthMil, heightMil, 30, 500, 250, 500, eda.sys_Unit.mmToMil(0.28, 3), 'aurora-top-silk-stroke');
	await drawNativeStroke(tSilk, left, top, widthMil, heightMil, 30, 500, 30, 480, eda.sys_Unit.mmToMil(0.28, 3), 'aurora-top-silk-stroke');
	await drawNativeStroke(tSilk, left, top, widthMil, heightMil, 250, 500, 250, 480, eda.sys_Unit.mmToMil(0.28, 3), 'aurora-top-silk-stroke');
	await drawNativeStroke(tSilk, left, top, widthMil, heightMil, 320, 48, 620, 48, eda.sys_Unit.mmToMil(0.7, 3), 'aurora-top-silk-stroke');
	await drawNativeStroke(tSilk, left, top, widthMil, heightMil, 320, 77, 710, 77, eda.sys_Unit.mmToMil(0.4, 3), 'aurora-top-silk-stroke');
	await drawNativeQr(tSilk, profile, left, top, widthMil, heightMil, 640, 170, 100, eda.sys_Unit.mmToMil(0.32, 3), 'aurora-top-qr');

	// Mask (Exposed areas)
	const maskSvg = `
<path d="M 750,0 L 900,0 L 900,540 L 700,540 Z" fill="black" />
<rect x="40" y="40" width="250" height="120" fill="black" />
<circle cx="700" cy="200" r="20" fill="black"/>
<circle cx="700" cy="235" r="20" fill="black"/>
<circle cx="700" cy="270" r="20" fill="black"/>
<path d="M 580,0 L 580,100 L 380,300 L 380,540" stroke="black" fill="none" stroke-width="6"/>
<rect x="30" y="30" width="120" height="120" fill="none" stroke="black" stroke-width="8" rx="10"/>
`;
	await tryDrawSvgLayerImage(maskSvg, tMask, left, top, widthMil, heightMil, 'aurora-top-mask');

	// Copper (Traces, pads, ENIG areas matching mask)
	const copperSvg = `
${maskSvg}
<rect x="0" y="320" width="450" height="220" fill="black" opacity="0.3" />
<path d="M -50,100 L 200,100 L 300,200 L 700,200" stroke="black" fill="none" stroke-width="12"/>
<path d="M -50,130 L 190,130 L 290,230 L 700,230" stroke="black" fill="none" stroke-width="12"/>
<path d="M -50,160 L 180,160 L 280,260 L 700,260" stroke="black" fill="none" stroke-width="12"/>
<rect x="50" y="50" width="80" height="80" fill="black" />
<path d="M 55,510 L 420,510 L 420,528 L 55,528 Z" fill="black" />
<circle cx="120" cy="435" r="22" fill="black"/>
<circle cx="170" cy="435" r="22" fill="black"/>
<circle cx="220" cy="435" r="22" fill="black"/>
`;
	await tryDrawSvgLayerImage(copperSvg, tCopper, left, top, widthMil, heightMil, 'aurora-top-copper');

	// Back Copper + Back Mask + Back Silk for dual-side artwork
	const bCopperSvg = `
<rect x="50" y="50" width="800" height="440" stroke="black" stroke-width="12" fill="none" rx="20"/>
<rect x="70" y="70" width="760" height="400" stroke="black" stroke-width="12" fill="none" rx="15"/>
<rect x="90" y="90" width="720" height="360" stroke="black" stroke-width="12" fill="none" rx="10"/>
<path d="M 220,140 L 680,140 L 680,400 L 220,400 Z" stroke="black" fill="none" stroke-width="8"/>
<path d="M 230,260 L 670,260" stroke="black" fill="none" stroke-width="14"/>
<circle cx="450" cy="260" r="62" fill="none" stroke="black" stroke-width="10"/>
`;
	const bMaskSvg = `
<rect x="230" y="110" width="440" height="320" fill="black"/>
<circle cx="450" cy="260" r="90" fill="none" stroke="black" stroke-width="20"/>
<path d="M 260,430 L 640,430" stroke="black" fill="none" stroke-width="14"/>
`;
	await tryDrawSvgLayerImage(bCopperSvg, bCopper, left, top, widthMil, heightMil, 'aurora-back-copper');
	await tryDrawSvgLayerImage(bMaskSvg, bMask, left, top, widthMil, heightMil, 'aurora-back-mask');
	await drawNativeText(bSilk, 'PCB ART CARD', left, top, widthMil, heightMil, 250, 215, 1.8, 0.15, 'aurora-back-text');
	await drawNativeText(bSilk, profile.website || profile.github || 'EASYEDA', left, top, widthMil, heightMil, 250, 255, 1.35, 0.12, 'aurora-back-text');
	await drawNativeText(bSilk, 'LAYER STACK CU MASK SILK FR4', left, top, widthMil, heightMil, 250, 318, 1.1, 0.12, 'aurora-back-text');
	await drawNativeStroke(bSilk, left, top, widthMil, heightMil, 250, 292, 650, 292, eda.sys_Unit.mmToMil(0.25, 3), 'aurora-back-silk-stroke');

	// Physical vias
	await drawVia(mapX(700, left, widthMil), mapY(200, top, widthMil, heightMil), eda.sys_Unit.mmToMil(0.4, 3), eda.sys_Unit.mmToMil(0.8, 3));
	await drawVia(mapX(700, left, widthMil), mapY(235, top, widthMil, heightMil), eda.sys_Unit.mmToMil(0.4, 3), eda.sys_Unit.mmToMil(0.8, 3));
	await drawVia(mapX(700, left, widthMil), mapY(270, top, widthMil, heightMil), eda.sys_Unit.mmToMil(0.4, 3), eda.sys_Unit.mmToMil(0.8, 3));
	await drawVia(mapX(450, left, widthMil), mapY(198, top, widthMil, heightMil), eda.sys_Unit.mmToMil(0.35, 3), eda.sys_Unit.mmToMil(0.75, 3));
	await drawVia(mapX(450, left, widthMil), mapY(260, top, widthMil, heightMil), eda.sys_Unit.mmToMil(0.35, 3), eda.sys_Unit.mmToMil(0.75, 3));
	await drawVia(mapX(450, left, widthMil), mapY(322, top, widthMil, heightMil), eda.sys_Unit.mmToMil(0.35, 3), eda.sys_Unit.mmToMil(0.75, 3));
}

async function renderMonoGridTemplate(ctx: CardRenderContext): Promise<void> {
	const isTop = ctx.profile.layer === EPCB_LayerId.TOP;
	const tSilk = isTop ? EPCB_LayerId.TOP_SILKSCREEN : EPCB_LayerId.BOTTOM_SILKSCREEN;
	const tMask = isTop ? EPCB_LayerId.TOP_SOLDER_MASK : EPCB_LayerId.BOTTOM_SOLDER_MASK;
	const tCopper = isTop ? EPCB_LayerId.TOP : EPCB_LayerId.BOTTOM;
	const bSilk = isTop ? EPCB_LayerId.BOTTOM_SILKSCREEN : EPCB_LayerId.TOP_SILKSCREEN;
	const bMask = isTop ? EPCB_LayerId.BOTTOM_SOLDER_MASK : EPCB_LayerId.TOP_SOLDER_MASK;
	const bCopper = isTop ? EPCB_LayerId.BOTTOM : EPCB_LayerId.TOP;

	const { left, bottom, widthMil, heightMil, profile } = ctx;
	logInfo(`mono layers: tSilk=${describeLayer(tSilk)} tMask=${describeLayer(tMask)} tCopper=${describeLayer(tCopper)} bSilk=${describeLayer(bSilk)} bMask=${describeLayer(bMask)} bCopper=${describeLayer(bCopper)}`);

	const toVX = (mmFromLeft: number) => (mmFromLeft / profile.widthMm) * 900;
	const toVY = (mmFromTop: number) => (1 - (mmFromTop / profile.heightMm)) * 540;

	if (profile.debugLayout) {
		await drawLayoutDebugMono(ctx, tSilk);
	}

	const topCopperSvg = `
<polygon points="0,0 900,0 900,540 0,540" fill="black" opacity="0.08" />
<polygon points="0,0 520,0 360,300 0,540" fill="black" />
<polygon points="560,0 900,0 900,218 688,262" fill="black" />
<polygon points="612,332 900,250 900,540 502,540" fill="black" />
<polygon points="70,430 250,330 420,430 250,530" fill="black" />
<polygon points="260,300 330,260 400,300 400,380 330,420 260,380" fill="black" />
<polygon points="410,300 480,260 550,300 550,380 480,420 410,380" fill="black" />
<polygon points="560,300 630,260 700,300 700,380 630,420 560,380" fill="black" />
`;

	const topMaskSvg = `
<polygon points="66,56 500,56 410,226 90,226" fill="black" />
<polygon points="84,254 370,254 322,332 84,332" fill="black" />
<rect x="74" y="350" width="360" height="110" rx="8" fill="black" />
<polygon points="690,54 858,54 858,158 646,218" fill="black" />
<polygon points="640,248 854,200 854,332 608,388" fill="black" />
<polygon points="590,412 854,352 854,488 560,520" fill="black" />
`;

	const topSilkSvg = `
<polyline points="48,42 530,42 380,320 48,498" fill="none" stroke="black" stroke-width="4" />
<polyline points="584,44 868,44 868,500 532,500" fill="none" stroke="black" stroke-width="4" />
<line x1="574" y1="226" x2="848" y2="164" stroke="black" stroke-width="3" />
<line x1="536" y1="394" x2="846" y2="324" stroke="black" stroke-width="3" />
<polygon points="258,298 332,256 406,298 406,382 332,424 258,382" fill="none" stroke="black" stroke-width="2" />
<polygon points="408,298 482,256 556,298 556,382 482,424 408,382" fill="none" stroke="black" stroke-width="2" />
<polygon points="558,298 632,256 706,298 706,382 632,424 558,382" fill="none" stroke="black" stroke-width="2" />
`;

	await tryDrawSvgLayerImage(topCopperSvg, tCopper, left, bottom - heightMil, widthMil, heightMil, 'mono-top-copper-poly');
	await tryDrawSvgLayerImage(topMaskSvg, tMask, left, bottom - heightMil, widthMil, heightMil, 'mono-top-mask-window');
	await tryDrawSvgLayerImage(topSilkSvg, tSilk, left, bottom - heightMil, widthMil, heightMil, 'mono-top-silk-poly');

	const topName = profile.name || 'UCARD';
	const topTitle = profile.title || 'PCB DESIGNER';
	const topContact = [profile.email, profile.phone].filter(Boolean).join('  ') || profile.website || profile.github || 'CONTACT';
	await drawTextFromBottom(tMask, topName, left, bottom, widthMil, heightMil, toVX(8.0), toVY(8.0), 2.95, 0.16, 'mono-top-mask-text');
	await drawTextFromBottom(tMask, topTitle, left, bottom, widthMil, heightMil, toVX(8.4), toVY(14.6), 1.75, 0.12, 'mono-top-mask-text');
	await drawTextFromBottom(tSilk, '/ POLYGON + COPPER POUR /', left, bottom, widthMil, heightMil, toVX(8.4), toVY(18.8), 1.1, 0.1, 'mono-top-silk-text');
	await drawTextFromBottom(tMask, topContact, left, bottom, widthMil, heightMil, toVX(8.4), toVY(23.3), 1.1, 0.1, 'mono-top-mask-text');
	if (profile.website || profile.github) {
		await drawTextFromBottom(tSilk, profile.website || profile.github, left, bottom, widthMil, heightMil, toVX(8.4), toVY(27.0), 1.0, 0.1, 'mono-top-silk-text');
	}

	const stackSource = profile.techStack || 'Embedded, RF, Power, CAD';
	const stackLines = stackSource
		.split(/[|,;/]+/g)
		.map(item => item.trim())
		.filter(Boolean)
		.slice(0, 4);
	const displayStackLines = stackLines.length > 0 ? stackLines : [stackSource];
	for (let i = 0; i < displayStackLines.length; i++) {
		await drawTextFromBottom(
			tMask,
			displayStackLines[i].toUpperCase(),
			left,
			bottom,
			widthMil,
			heightMil,
			toVX(66.5),
			toVY(7.6 + i * 4.0),
			1.05,
			0.1,
			'mono-top-mask-stack',
		);
	}

	const backCopperSvg = `
<polygon points="0,0 900,0 900,540 0,540" fill="black" opacity="0.07" />
<polygon points="0,0 900,0 900,128 0,258" fill="black" />
<polygon points="0,540 900,540 900,384 0,286" fill="black" />
<polygon points="130,162 770,162 660,380 240,380" fill="black" />
<polygon points="170,198 340,198 300,282 130,282" fill="black" />
<polygon points="560,198 730,198 770,282 600,282" fill="black" />
<polygon points="350,392 450,332 550,392 450,452" fill="black" />
`;

	const backMaskSvg = `
<rect x="88" y="70" width="724" height="96" rx="10" fill="black" />
<polygon points="170,190 730,190 646,352 254,352" fill="black" />
<rect x="88" y="382" width="724" height="96" rx="10" fill="black" />
<polygon points="334,206 450,140 566,206 566,304 450,370 334,304" fill="black" />
`;

	const backSilkSvg = `
<rect x="70" y="52" width="760" height="436" fill="none" stroke="black" stroke-width="4" rx="16" />
<line x1="112" y1="174" x2="788" y2="174" stroke="black" stroke-width="2" />
<line x1="112" y1="366" x2="788" y2="366" stroke="black" stroke-width="2" />
<polygon points="334,206 450,140 566,206 566,304 450,370 334,304" fill="none" stroke="black" stroke-width="2.5" />
<line x1="302" y1="398" x2="598" y2="398" stroke="black" stroke-width="2" />
<line x1="302" y1="430" x2="598" y2="430" stroke="black" stroke-width="2" />
`;

	await tryDrawSvgLayerImage(backCopperSvg, bCopper, left, bottom - heightMil, widthMil, heightMil, 'mono-back-copper-poly');
	await tryDrawSvgLayerImage(backMaskSvg, bMask, left, bottom - heightMil, widthMil, heightMil, 'mono-back-mask-window');
	await tryDrawSvgLayerImage(backSilkSvg, bSilk, left, bottom - heightMil, widthMil, heightMil, 'mono-back-silk-poly');

	await drawTextFromBottom(bMask, (profile.company || 'PROJECT PORTFOLIO').toUpperCase(), left, bottom, widthMil, heightMil, toVX(10.2), toVY(11.3), 1.75, 0.12, 'mono-back-mask-text');
	await drawTextFromBottom(bSilk, 'SOLDER MASK WINDOWS / COPPER GEOMETRY', left, bottom, widthMil, heightMil, toVX(10.2), toVY(15.8), 1.0, 0.1, 'mono-back-silk-text');
	await drawTextFromBottom(bMask, 'SKILL MATRIX', left, bottom, widthMil, heightMil, toVX(36.0), toVY(21.7), 1.28, 0.11, 'mono-back-mask-text');
	for (let i = 0; i < displayStackLines.length; i++) {
		await drawTextFromBottom(
			bSilk,
			displayStackLines[i].toUpperCase(),
			left,
			bottom,
			widthMil,
			heightMil,
			toVX(20.0),
			toVY(27.3 + i * 4.2),
			1.0,
			0.1,
			'mono-back-silk-stack',
		);
	}
	await drawTextFromBottom(bMask, (profile.slogan || 'DESIGNED FOR FABRICATION').toUpperCase(), left, bottom, widthMil, heightMil, toVX(10.2), toVY(44.0), 1.25, 0.11, 'mono-back-mask-text');
	if (profile.website || profile.github) {
		await drawTextFromBottom(bSilk, (profile.website || profile.github).toUpperCase(), left, bottom, widthMil, heightMil, toVX(10.2), toVY(48.3), 1.0, 0.1, 'mono-back-silk-text');
	}

	const markerX = toVX(profile.widthMm - 6.8);
	const markerR = (1.45 / profile.widthMm) * 900;
	await fillCircleFromBottom(tCopper, left, bottom, widthMil, heightMil, markerX, toVY(8.7), markerR, 'mono-top-marker-copper');
	await fillCircleFromBottom(tMask, left, bottom, widthMil, heightMil, markerX, toVY(8.7), markerR, 'mono-top-marker-mask');
	await fillCircleFromBottom(bCopper, left, bottom, widthMil, heightMil, markerX, toVY(46.0), markerR, 'mono-back-marker-copper');
	await fillCircleFromBottom(bMask, left, bottom, widthMil, heightMil, markerX, toVY(46.0), markerR, 'mono-back-marker-mask');
}
