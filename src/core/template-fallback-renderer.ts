import type {
	TemplateApplyResult,
	TemplateFieldValueMap,
	TemplatePackage,
} from './template-contract';
import { replacePlaceholders } from './template-contract';

const FALLBACK_LOG_PREFIX = '[UCard][Fallback]';

function logFallbackInfo(message: string): void {
	(eda.sys_Log as any)?.add?.(`${FALLBACK_LOG_PREFIX} ${message}`, ESYS_LogType.INFO);
}

interface FallbackRenderContext {
	anchorX: number;
	anchorY: number;
	layer: EPCB_LayerId.TOP | EPCB_LayerId.BOTTOM;
}

function toLayer(layer: number, preferred: EPCB_LayerId.TOP | EPCB_LayerId.BOTTOM): number {
	if (layer === Number(EPCB_LayerId.TOP) || layer === Number(EPCB_LayerId.BOTTOM))
		return preferred;
	return layer;
}

function mmToMil(mm: number): number {
	return eda.sys_Unit.mmToMil(mm, 3);
}

async function drawOutline(anchorX: number, anchorY: number, widthMm: number, heightMm: number, lineWidthMm: number): Promise<void> {
	const widthMil = mmToMil(widthMm);
	const heightMil = mmToMil(heightMm);
	const polygon = eda.pcb_MathPolygon.createPolygon([
		'R',
		anchorX,
		anchorY,
		widthMil,
		heightMil,
		0,
		0,
	]);
	if (!polygon)
		throw new Error('fallback outline polygon create failed');
	await eda.pcb_PrimitivePolyline.create('', EPCB_LayerId.BOARD_OUTLINE, polygon, mmToMil(lineWidthMm), false);
}

async function createTextPrimitive(item: any, text: string): Promise<void> {
	const api = (eda as any).pcb_PrimitiveString;
	if (!api || typeof api.create !== 'function')
		throw new Error('pcb_PrimitiveString.create unavailable');
	await api.create(
		item.layer,
		item.x,
		item.y,
		text,
		'',
		item.fontSize,
		item.lineWidth,
		item.alignMode,
		item.rotation,
		false,
		100,
		false,
		false,
	);
}

export async function applyFallbackTemplate(
	templatePackage: TemplatePackage,
	fieldValues: TemplateFieldValueMap,
	ctx: FallbackRenderContext,
): Promise<TemplateApplyResult> {
	logFallbackInfo(`applyFallbackTemplate start | template=${templatePackage.templateId} | fields=${Object.keys(fieldValues).length} | anchorX=${ctx.anchorX} | anchorY=${ctx.anchorY} | layer=${ctx.layer}`);
	const fallback = templatePackage.manifest.fallback;
	if (!fallback)
		throw new Error('template has no fallback definition');

	const replacedKeys = new Set<string>();
	if (fallback.outline) {
		logFallbackInfo(`draw outline | widthMm=${fallback.outline.widthMm} | heightMm=${fallback.outline.heightMm} | lineWidthMm=${fallback.outline.lineWidthMm ?? 0.2}`);
		await drawOutline(
			ctx.anchorX,
			ctx.anchorY,
			fallback.outline.widthMm,
			fallback.outline.heightMm,
			fallback.outline.lineWidthMm ?? 0.2,
		);
	}

	for (const textPrimitive of fallback.textPrimitives) {
		const resolvedText = replacePlaceholders(textPrimitive.text, fieldValues);
		for (const fieldKey of Object.keys(fieldValues)) {
			if (textPrimitive.text.includes(`{{${fieldKey}}}`))
				replacedKeys.add(fieldKey);
		}
		await createTextPrimitive({
			layer: toLayer(textPrimitive.layer, ctx.layer),
			x: ctx.anchorX + mmToMil(textPrimitive.x),
			y: ctx.anchorY + mmToMil(textPrimitive.y),
			fontSize: mmToMil(textPrimitive.fontSizeMm),
			lineWidth: mmToMil(textPrimitive.lineWidthMm ?? 0.18),
			alignMode: textPrimitive.alignMode ?? EPCB_PrimitiveStringAlignMode.LEFT_TOP,
			rotation: textPrimitive.rotation ?? 0,
		}, resolvedText);
	}
	logFallbackInfo(`applyFallbackTemplate done | textPrimitives=${fallback.textPrimitives.length} | replacedKeys=${[...replacedKeys].join(', ') || 'none'}`);

	return {
		mode: 'fallback',
		replacedKeys: [...replacedKeys],
		warnings: [],
	};
}
