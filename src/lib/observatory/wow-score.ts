export function wowScore(input: {
	novelty: number;
	usefulness: number;
	sourceQuality: number;
	englishGap: number;
}): number {
	return (
		Math.round(
			(input.novelty * 0.3 +
				input.usefulness * 0.3 +
				input.sourceQuality * 0.2 +
				input.englishGap * 0.2) *
				100
		) / 100
	);
}
