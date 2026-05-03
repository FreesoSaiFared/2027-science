export function sourceQualityScore(input: {
	hasAuthor?: boolean;
	hasCitations?: boolean;
	primarySource?: boolean;
}): number {
	return (
		Number(!!input.hasAuthor) * 0.25 +
		Number(!!input.hasCitations) * 0.3 +
		Number(!!input.primarySource) * 0.45
	);
}
