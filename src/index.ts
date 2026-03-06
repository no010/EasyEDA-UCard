/**
 * Entry point for EasyEDA-UCard extension
 *
 * This extension generates styled PCB business cards with selectable templates.
 */
/**
 * Extension activation function
 * Called when the extension is loaded
 */
// eslint-disable-next-line unused-imports/no-unused-vars
export function activate(status?: 'onStartupFinished', arg?: string): void {
	// logic moved to generatePcbBusinessCard
}

/**
 * Generate PCB business card directly on PCB canvas
 * This function is registered in extension.json headerMenus
 */
export { generatePcbBusinessCard } from './ui/pcb-card-generator';
