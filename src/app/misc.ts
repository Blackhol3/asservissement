export const config = {
	roots: {
		tolerance: 1e-6,
		maximumIterations: 30,
	},
	tex: {
		laplaceVariable: 'p',
		maximumSignificantDigits: 3,
		maximumDigits: 4,
	},
} as const;
