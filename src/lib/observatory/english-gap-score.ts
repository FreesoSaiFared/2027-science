export function englishGapScore(sourceLanguage: string, englishCoverage: number): number {
	return sourceLanguage.toLowerCase().startsWith('zh')
		? Math.max(0, 1 - englishCoverage)
		: Math.max(0, 0.6 - englishCoverage);
}
