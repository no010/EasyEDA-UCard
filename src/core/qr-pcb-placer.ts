import { generateQRMatrixAdaptive } from './qr-generator';

const LOG_PREFIX = '[UCard][QR]';

function logInfo(message: string): void {
	eda.sys_Log.add(`${LOG_PREFIX} ${message}`, ESYS_LogType.INFO);
}

function logWarn(message: string): void {
	eda.sys_Log.add(`${LOG_PREFIX} ${message}`, ESYS_LogType.WARNING);
}

export interface VCardFields {
	name: string;
	title?: string;
	org?: string;
	tel?: string;
	email?: string;
	url?: string;
}

export interface QrPlacementOptions {
	/** QR code total size in mm. Default: 26 */
	sizeMm?: number;
	/** Layer ID (EPCB_LayerId value). Default: EPCB_LayerId.TOP_SILKSCREEN (3) */
	layer?: number;
}

function buildVCardString(fields: VCardFields): string {
	// vCard 3.0 (RFC 2426) — FN is required, CRLF line endings required
	const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

	lines.push(`FN:${fields.name}`);

	if (fields.org)
		lines.push(`ORG:${fields.org}`);
	if (fields.title)
		lines.push(`TITLE:${fields.title}`);
	if (fields.tel)
		lines.push(`TEL;TYPE=CELL:${fields.tel}`);
	if (fields.email)
		lines.push(`EMAIL;TYPE=INTERNET:${fields.email}`);
	if (fields.url)
		lines.push(`URL:${fields.url}`);

	lines.push('END:VCARD');
	// RFC 2426 §2.1: lines MUST end with CRLF
	return lines.join('\r\n');
}

/**
 * Generate a QR code from vCard fields and place it on the PCB as fill primitives.
 * Position is determined by the current mouse cursor location.
 */
export async function placeVCardQrCode(
	fields: VCardFields,
	options: QrPlacementOptions = {},
): Promise<{ moduleCount: number; sizeMil: number }> {
	const sizeMm = options.sizeMm ?? 26;
	const layer = (options.layer ?? EPCB_LayerId.TOP_SILKSCREEN) as TPCB_LayersOfFill;

	const vcardText = buildVCardString(fields);
	logInfo(`vCard text | chars=${vcardText.length}`);

	const matrix = await generateQRMatrixAdaptive(vcardText, { errorCorrectionLevel: 'M' });
	const matrixSize = matrix.length;
	logInfo(`QR matrix | size=${matrixSize}x${matrixSize} | layer=${layer}`);

	const mousePos = await eda.pcb_SelectControl.getCurrentMousePosition();
	if (!mousePos)
		throw new Error('请把鼠标移动到 PCB 画布上的目标位置，然后再点击生成。');

	const totalMil = eda.sys_Unit.mmToMil(sizeMm, 3);
	const moduleSizeMil = totalMil / matrixSize;
	const originX = mousePos.x;
	const originY = mousePos.y;

	logInfo(`placing QR fills | x=${originX} y=${originY} | totalMil=${totalMil} | moduleMil=${moduleSizeMil}`);

	let moduleCount = 0;
	for (let row = 0; row < matrixSize; row++) {
		for (let col = 0; col < matrixSize; col++) {
			if (!matrix[row][col])
				continue;

			const x = originX + col * moduleSizeMil;
			const y = originY + row * moduleSizeMil;
			const polygon = eda.pcb_MathPolygon.createPolygon(['R', x, y, moduleSizeMil, moduleSizeMil, 0, 0]);
			if (!polygon) {
				logWarn(`polygon creation failed at row=${row} col=${col}`);
				continue;
			}
			await eda.pcb_PrimitiveFill.create(layer, polygon);
			moduleCount++;
		}
	}

	logInfo(`QR placed | fills=${moduleCount} | sizeMil=${totalMil}`);
	return { moduleCount, sizeMil: totalMil };
}

/**
 * Convert a QR code image (from the iframe as a base64 data URL) to PCB image primitives.
 * Uses EasyEDA's convertImageToComplexPolygon to vectorize the image.
 * Position is determined by the current mouse cursor location.
 */
export async function placeImageQrCode(
	imageDataUrl: string,
	naturalWidth: number,
	naturalHeight: number,
	options: QrPlacementOptions = {},
): Promise<void> {
	const sizeMm = options.sizeMm ?? 26;
	const layer = (options.layer ?? EPCB_LayerId.TOP_SILKSCREEN) as TPCB_LayersOfImage;

	const mousePos = await eda.pcb_SelectControl.getCurrentMousePosition();
	if (!mousePos)
		throw new Error('请把鼠标移动到 PCB 画布上的目标位置，然后再点击生成。');

	// Convert base64 data URL to Blob
	const commaIdx = imageDataUrl.indexOf(',');
	if (commaIdx < 0)
		throw new Error('图片数据无效，请重新选择图片。');

	const base64Data = imageDataUrl.slice(commaIdx + 1);
	const mimeMatch = imageDataUrl.match(/data:([^;]+);/);
	const mimeType = mimeMatch?.[1] || 'image/png';

	const byteString = atob(base64Data);
	const ab = new ArrayBuffer(byteString.length);
	const ia = new Uint8Array(ab);
	for (let i = 0; i < byteString.length; i++)
		ia[i] = byteString.charCodeAt(i);
	const blob = new Blob([ab], { type: mimeType });

	logInfo(`converting image to polygon | w=${naturalWidth} h=${naturalHeight} | bytes=${blob.size}`);

	const complexPolygon = await eda.pcb_MathPolygon.convertImageToComplexPolygon(
		blob,
		naturalWidth,
		naturalHeight,
		0.1, // tolerance (0-1)
		0, // simplification (0-1)
		0, // smoothing (0-1.33)
		2, // despeckling (0-5)
		true, // white as background color
		false, // no inversion
	);

	if (!complexPolygon)
		throw new Error('图片转换失败，请确认图片为黑白二值图像（建议使用 PNG 格式）。');

	const widthMil = eda.sys_Unit.mmToMil(sizeMm, 3);
	const heightMil = Math.round(widthMil * naturalHeight / naturalWidth);

	logInfo(`placing image | x=${mousePos.x} y=${mousePos.y} | w=${widthMil}mil h=${heightMil}mil | layer=${layer}`);

	await eda.pcb_PrimitiveImage.create(mousePos.x, mousePos.y, complexPolygon, layer, widthMil, heightMil);
	logInfo('image QR placed successfully');
}
