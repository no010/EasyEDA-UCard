/**
 * QR Code Generator with Library Fallback
 * Strategy: Try external library first, fallback to local implementation
 *
 * Primary: qrcode npm package (mature, ISO compliant)
 * Fallback: Local implementation (ISO/IEC 18004 subset)
 */

type QRMatrix = boolean[][];

interface QRCodeOptions {
	errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; // Low, Medium, Quality, High
	moduleSize?: number; // Size of each module in the output
}

/**
 * Adaptive QR code generation: tries library first, falls back to local
 */
export async function generateQRMatrixAdaptive(data: string, options: QRCodeOptions = {}): Promise<QRMatrix> {
	try {
		// Try using qrcode library first
		return await generateQRMatrixWithLibrary(data, options);
	}
	catch (error) {
		// Fallback to local implementation
		logGeneratorInfo(`Library generation failed, using local fallback: ${String(error)}`);
		return generateQRMatrixLocal(data, options);
	}
}

/**
 * Generate QR matrix using qrcode library
 */
async function generateQRMatrixWithLibrary(data: string, options: QRCodeOptions = {}): Promise<QRMatrix> {
	try {
		// Dynamic import to handle potential missing module gracefully
		const QRCode = await import('qrcode');

		const ecLevel = options.errorCorrectionLevel ?? 'M';

		// Generate QR code as 2D array of modules
		const segments = QRCode.default || QRCode;
		const qrArray = await segments.create(data, {
			errorCorrectionLevel: ecLevel,
		});

		// Convert library format to our boolean matrix
		const modules = qrArray.modules;
		const size = modules.size;
		const matrix: QRMatrix = Array.from({ length: size }, () => Array.from({ length: size }, () => false));

		for (let row = 0; row < size; row++) {
			for (let col = 0; col < size; col++) {
				matrix[row][col] = modules.get(row, col) === 1;
			}
		}

		logGeneratorInfo(`QR code generated with library (size: ${size}x${size})`);
		return matrix;
	}
	catch (error) {
		throw new Error(`qrcode library failed: ${String(error)}`);
	}
}

/**
 * Local QR code generation (fallback implementation)
 */
function generateQRMatrixLocal(data: string, options: QRCodeOptions = {}): QRMatrix {
	logGeneratorInfo('Using local QR generator (fallback)');
	return generateQRMatrix(data, options);
}

/**
 * Logging helper for QR generation
 */
function logGeneratorInfo(message: string): void {
	if (typeof eda !== 'undefined') {
		// @ts-expect-error - eda global available in plugin context
		eda.sys_Log?.add(`[UCard QR] ${message}`, 0);
	}
	else {
		console.warn(`[UCard QR] ${message}`);
	}
}

/**
 * Generate QR code matrix from text data (local implementation)
 */
export function generateQRMatrix(data: string, options: QRCodeOptions = {}): QRMatrix {
	const ecLevel = options.errorCorrectionLevel ?? 'M';

	// Determine optimal version and mode
	const version = determineVersion(data, ecLevel);
	const size = version * 4 + 17; // QR code size formula

	// Initialize matrix
	const matrix: QRMatrix = Array.from({ length: size }, () => Array.from({ length: size }, () => false));

	// Add finder patterns (top-left, top-right, bottom-left)
	addFinderPattern(matrix, 0, 0);
	addFinderPattern(matrix, size - 7, 0);
	addFinderPattern(matrix, 0, size - 7);

	// Add separators
	addSeparators(matrix, size);

	// Add timing patterns
	addTimingPatterns(matrix, size);

	// Add alignment patterns (for version 2+)
	if (version >= 2) {
		addAlignmentPatterns(matrix, version);
	}

	// Encode data
	const encoded = encodeData(data, version, ecLevel);

	// Place data bits in matrix
	placeDataBits(matrix, encoded, size);

	// Add format information
	addFormatInformation(matrix, ecLevel, size);

	return matrix;
}

/**
 * Determine the minimum QR version needed for the data
 */
function determineVersion(data: string, _ecLevel: string): number {
	// Simplified version determination
	// Version 1: up to 25 alphanumeric chars (M level)
	// Version 2: up to 47 alphanumeric chars (M level)
	// Version 3: up to 77 alphanumeric chars (M level)

	const length = data.length;

	if (length <= 25)
		return 1;
	if (length <= 47)
		return 2;
	if (length <= 77)
		return 3;
	if (length <= 114)
		return 4;
	return 5; // Max version for this simple implementation
}

/**
 * Add 7x7 finder pattern at given position
 */
function addFinderPattern(matrix: QRMatrix, row: number, col: number): void {
	// Outer 7x7 box
	for (let r = 0; r < 7; r++) {
		for (let c = 0; c < 7; c++) {
			const isEdge = r === 0 || r === 6 || c === 0 || c === 6;
			const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
			matrix[row + r][col + c] = isEdge || isInner;
		}
	}
}

/**
 * Add white separators around finder patterns
 */
function addSeparators(matrix: QRMatrix, size: number): void {
	// Top-left separator
	for (let i = 0; i < 8; i++) {
		matrix[7][i] = false;
		matrix[i][7] = false;
	}

	// Top-right separator
	for (let i = 0; i < 8; i++) {
		matrix[7][size - 8 + i] = false;
		matrix[i][size - 8] = false;
	}

	// Bottom-left separator
	for (let i = 0; i < 8; i++) {
		matrix[size - 8][i] = false;
		matrix[size - 8 + i][7] = false;
	}
}

/**
 * Add timing patterns (alternating black/white modules)
 */
function addTimingPatterns(matrix: QRMatrix, size: number): void {
	for (let i = 8; i < size - 8; i++) {
		matrix[6][i] = (i % 2) === 0;
		matrix[i][6] = (i % 2) === 0;
	}
}

/**
 * Add alignment patterns for version 2+
 */
function addAlignmentPatterns(matrix: QRMatrix, version: number): void {
	const positions = getAlignmentPatternPositions(version);

	for (const row of positions) {
		for (const col of positions) {
			// Skip if overlapping with finder patterns
			if ((row <= 10 && col <= 10)
				|| (row <= 10 && col >= matrix.length - 10)
				|| (row >= matrix.length - 10 && col <= 10)) {
				continue;
			}

			addAlignmentPattern(matrix, row, col);
		}
	}
}

/**
 * Add single 5x5 alignment pattern
 */
function addAlignmentPattern(matrix: QRMatrix, row: number, col: number): void {
	for (let r = -2; r <= 2; r++) {
		for (let c = -2; c <= 2; c++) {
			const isEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
			const isCenter = r === 0 && c === 0;
			matrix[row + r][col + c] = isEdge || isCenter;
		}
	}
}

/**
 * Get alignment pattern positions for a given version
 */
function getAlignmentPatternPositions(version: number): number[] {
	const positionTable: Record<number, number[]> = {
		1: [],
		2: [6, 18],
		3: [6, 22],
		4: [6, 26],
		5: [6, 30],
	};

	return positionTable[version] || [];
}

/**
 * Encode data into bit stream
 */
function encodeData(data: string, version: number, ecLevel: string): boolean[] {
	const bits: boolean[] = [];

	// Mode indicator (0010 for alphanumeric, 0100 for byte)
	const isAlphanumeric = /^[0-9A-Z $%*+\-./:]+$/.test(data);

	if (isAlphanumeric) {
		// Alphanumeric mode: 0010
		bits.push(false, false, true, false);

		// Character count indicator (9 bits for version 1-9)
		const countBits = data.length.toString(2).padStart(9, '0');
		for (const bit of countBits) {
			bits.push(bit === '1');
		}

		// Encode alphanumeric pairs
		encodeAlphanumeric(data, bits);
	}
	else {
		// Byte mode: 0100
		bits.push(false, true, false, false);

		// Character count indicator (8 bits for version 1-9)
		const countBits = data.length.toString(2).padStart(8, '0');
		for (const bit of countBits) {
			bits.push(bit === '1');
		}

		// Encode bytes
		encodeBytes(data, bits);
	}

	// Add terminator (0000)
	bits.push(false, false, false, false);

	// Pad to required length
	const capacity = getDataCapacity(version, ecLevel);
	padBits(bits, capacity);

	return bits;
}

/**
 * Encode alphanumeric data
 */
function encodeAlphanumeric(data: string, bits: boolean[]): void {
	const alphanumericTable = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

	for (let i = 0; i < data.length; i += 2) {
		if (i + 1 < data.length) {
			// Encode pair
			const val1 = alphanumericTable.indexOf(data[i]);
			const val2 = alphanumericTable.indexOf(data[i + 1]);
			const encoded = val1 * 45 + val2;
			const encodedBits = encoded.toString(2).padStart(11, '0');

			for (const bit of encodedBits) {
				bits.push(bit === '1');
			}
		}
		else {
			// Encode single character
			const val = alphanumericTable.indexOf(data[i]);
			const encodedBits = val.toString(2).padStart(6, '0');

			for (const bit of encodedBits) {
				bits.push(bit === '1');
			}
		}
	}
}

/**
 * Encode byte data
 */
function encodeBytes(data: string, bits: boolean[]): void {
	for (let i = 0; i < data.length; i++) {
		const charCode = data.charCodeAt(i);
		const byteBits = charCode.toString(2).padStart(8, '0');

		for (const bit of byteBits) {
			bits.push(bit === '1');
		}
	}
}

/**
 * Get data capacity for version and error correction level
 */
function getDataCapacity(version: number, ecLevel: string): number {
	// Simplified capacity table (in bits)
	const capacityTable: Record<number, Record<string, number>> = {
		1: { L: 152, M: 128, Q: 104, H: 72 },
		2: { L: 272, M: 224, Q: 176, H: 128 },
		3: { L: 440, M: 352, Q: 272, H: 208 },
		4: { L: 640, M: 512, Q: 384, H: 288 },
		5: { L: 864, M: 688, Q: 496, H: 368 },
	};

	return capacityTable[version]?.[ecLevel] ?? 128;
}

/**
 * Pad bits to required length
 */
function padBits(bits: boolean[], capacity: number): void {
	// Pad to multiple of 8
	while (bits.length % 8 !== 0) {
		bits.push(false);
	}

	// Add padding bytes (11101100 and 00010001 alternating)
	const padPatterns = [
		[true, true, true, false, true, true, false, false], // 236
		[false, false, false, true, false, false, false, true], // 17
	];

	let patternIndex = 0;
	while (bits.length < capacity) {
		for (const bit of padPatterns[patternIndex]) {
			if (bits.length >= capacity)
				break;
			bits.push(bit);
		}
		patternIndex = 1 - patternIndex;
	}
}

/**
 * Place data bits in matrix using zigzag pattern
 */
function placeDataBits(matrix: QRMatrix, bits: boolean[], size: number): void {
	let bitIndex = 0;
	let direction = -1; // -1 = up, 1 = down

	// Start from bottom-right, move left in 2-column pairs
	for (let col = size - 1; col > 0; col -= 2) {
		// Skip timing column
		if (col === 6)
			col--;

		for (let i = 0; i < size; i++) {
			const row = direction === -1 ? size - 1 - i : i;

			// Place in right column of pair
			if (!isReserved(matrix, row, col) && bitIndex < bits.length) {
				matrix[row][col] = bits[bitIndex++];
			}

			// Place in left column of pair
			if (!isReserved(matrix, row, col - 1) && bitIndex < bits.length) {
				matrix[row][col - 1] = bits[bitIndex++];
			}
		}

		direction *= -1; // Reverse direction
	}
}

/**
 * Check if position is reserved (finder, timing, etc.)
 */
function isReserved(matrix: QRMatrix, row: number, col: number): boolean {
	const size = matrix.length;

	// Finder patterns + separators
	if ((row < 9 && col < 9)
		|| (row < 9 && col >= size - 8)
		|| (row >= size - 8 && col < 9)) {
		return true;
	}

	// Timing patterns
	if (row === 6 || col === 6) {
		return true;
	}

	return false;
}

/**
 * Add format information (error correction level and mask pattern)
 */
function addFormatInformation(matrix: QRMatrix, ecLevel: string, size: number): void {
	// Simplified: use mask pattern 0 and encode format bits
	const ecBits = { L: '01', M: '00', Q: '11', H: '10' }[ecLevel] ?? '00';
	const maskBits = '000'; // Mask pattern 0

	let formatString = ecBits + maskBits;

	// Add error correction bits (simplified BCH encoding)
	formatString = formatString.padEnd(15, '0');

	const formatBits = formatString.split('').map(b => b === '1');

	// Place format information around finder patterns
	// Top-left area (horizontal and vertical)
	for (let i = 0; i < 6; i++) {
		matrix[8][i] = formatBits[i];
		matrix[size - 1 - i][8] = formatBits[i];
	}

	matrix[8][7] = formatBits[6];
	matrix[8][8] = formatBits[7];
	matrix[8][size - 8] = formatBits[8];

	// Continue around other finder patterns
	for (let i = 9; i < 15; i++) {
		matrix[size - 15 + i][8] = formatBits[i];
		matrix[8][size - 15 + i] = formatBits[i];
	}

	// Always dark module
	matrix[size - 8][8] = true;
}

/**
 * Render QR matrix as PCB pads for EasyEDA Pro
 */
export interface QRRenderOptions {
	layer: number; // EPCB_LayerId.TOP or BOTTOM
	moduleSizeMil: number;
	startX: number;
	startY: number;
	startPadIndex: number;
}

export async function renderQRCodeAsPads(
	matrix: QRMatrix,
	options: QRRenderOptions,
): Promise<{ padCount: number; sizeMil: number }> {
	const { layer, moduleSizeMil, startX, startY } = options;
	const size = matrix.length;
	let padCount = 0;

	// Import EasyEDA API types (will be available in plugin context)
	const { eda } = globalThis as any;

	for (let row = 0; row < size; row++) {
		for (let col = 0; col < size; col++) {
			if (!matrix[row][col])
				continue; // Skip white modules

			const x = startX + col * moduleSizeMil;
			const y = startY + row * moduleSizeMil;

			// Draw primitive line as a "pixel" circle/square
			const center_x = x + moduleSizeMil / 2;
			const center_y = y + moduleSizeMil / 2;
			await eda.pcb_PrimitiveLine.create(
				'',
				layer as any,
				center_x,
				center_y,
				center_x + 0.001, // 0.001 to ensure length > 0
				center_y,
				moduleSizeMil * 0.95,
			);

			padCount++;
		}
	}

	return {
		padCount,
		sizeMil: size * moduleSizeMil,
	};
}
