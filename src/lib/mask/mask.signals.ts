export interface MaskSignals {
	finePointer: boolean;
	touch: boolean;
	reducedMotion: boolean;
	storageAvailable: boolean;
}

export function readLocalMaskSignals(): MaskSignals {
	const hasWindow = typeof window !== 'undefined';
	return {
		finePointer: hasWindow && window.matchMedia('(pointer: fine)').matches,
		touch: typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0,
		reducedMotion: hasWindow && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
		storageAvailable: hasWindow && 'localStorage' in window
	};
}
