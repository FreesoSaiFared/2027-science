export type BrowserTier =
	| 'reader-basic'
	| 'reader-native-overlays'
	| 'reader-native-animations'
	| 'reader-canary-text-lab'
	| 'reader-gpu-ai'
	| 'author-lab';

export interface WebPlatformCapability {
	id: string;
	category: string;
	feature: string;
	browserPrimitive: string;
	status: string;
	chromeFlag: string;
	featureDetection: string;
	replacesJSPattern: string;
	readerUseCase: string;
	performanceBenefit: string;
	fallbackStrategy: string;
	exampleSnippet: string;
	docsUrl: string;
}

export interface CapabilityDetection {
	webgpu: boolean;
	customHighlight: boolean;
	popover: boolean;
	dialog: boolean;
	anchorPositioning: boolean;
	scrollDrivenAnimations: boolean;
	viewTransitions: boolean;
	navigationApi: boolean;
	declarativeShadowDom: boolean;
	sanitizerApi: boolean;
	editContext: boolean;
	wasm: boolean;
	wasmSimd: boolean;
	translator: boolean;
	languageDetector: boolean;
	summarizer: boolean;
	languageModel: boolean;
	finePointer: boolean;
	touch: boolean;
	reducedMotion: boolean;
	storageEstimate: boolean;
	cssCarousels: boolean;
	scrollStateQueries: boolean;
	containerQueries: boolean;
	styleQueries: boolean;
	cssScope: boolean;
	cssNesting: boolean;
	hasSelector: boolean;
	subgrid: boolean;
	advancedTypography: boolean;
	storageQuota?: number;
	storageUsage?: number;
}

export interface CapabilityStatus {
	id: string;
	available: boolean;
	note: string;
}
