export interface TranslationPlan {
	sourceUrl: string;
	sourceLanguage: string;
	output: 'summary' | 'excerpt';
}
export function planTranslation(sourceUrl: string, sourceLanguage = 'zh'): TranslationPlan {
	return { sourceUrl, sourceLanguage, output: 'summary' };
}
