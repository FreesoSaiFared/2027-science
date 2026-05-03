export interface CandidateSource {
	title: string;
	url: string;
	language: string;
	snippet?: string;
}
export async function discoverSources(): Promise<CandidateSource[]> {
	return [];
}
