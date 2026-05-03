import type { RedactedQuestProfile } from './quest-profile';

export function generateChineseDiscoveryQueries(profile: RedactedQuestProfile): string[] {
	return profile.interests
		.slice(0, 8)
		.flatMap((interest) => [
			`${interest} 深度 综述`,
			`${interest} 研究 笔记`,
			`${interest} 开源 项目`
		]);
}
