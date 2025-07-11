import type { UnionToTuple } from 'type-fest';

export const TilesModes = {
	Full: {title: 'Tuile unique (1×1)', structure: [1, 1]},
	HalfHorizontal: {title: 'Deux tuiles horizontales (2×1)', structure: [2, 1]},
	HalfVertical: {title: 'Deux tuiles horizontales (1×2)', structure: [1, 2]},
	Quarter: {title: 'Quatre tuiles (2×2)', structure: [2, 2]},
} as const;
export const TilesModesList = Object.keys(TilesModes) as UnionToTuple<TilesMode>;
export type TilesMode = keyof typeof TilesModes;

export enum LoopType {
	Open,
	Closed,
};

export enum GraphType {
	Time,
	Frequency,
};

export enum InputType {
	Impulse,
	Step,
	Ramp,
};

export enum VisualizationType {
	Bode,
	BlackNichols,
	Nyquist,
}
