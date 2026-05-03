export function transsettingPrompt(summary: string): string {
	return `Explain why this under-translated source matters to an English reader, without reproducing the source: ${summary}`;
}
