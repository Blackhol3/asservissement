import { immerable } from 'immer';
import { GraphType, InputType, LoopType, TilesModes, TilesModesList, VisualizationType } from './common-type';

export class GraphOptions {
	[immerable] = true;

	constructor(
		readonly loopType = LoopType.Open,
		readonly graphType = GraphType.Time,
		readonly inputType = InputType.Step,
		readonly visualizationType = VisualizationType.Bode,
	) {}

	toJSON() {
		return [this.loopType, this.graphType, this.inputType, this.visualizationType];
	}

	static fromJSON(data: ReturnType<GraphOptions['toJSON']>) {
		return new GraphOptions(...data as number[]);
	}
}

export class GraphsOptions {
	[immerable] = true;

	private readonly list: readonly GraphOptions[];

	constructor(list?: readonly GraphOptions[]) {
		const maximalNumberOfGraphs = Math.max(...TilesModesList.map(mode => TilesModes[mode].structure[0] * TilesModes[mode].structure[1]));
		const defaultList: GraphOptions[] = [];
		for (let i = 0; i < maximalNumberOfGraphs; ++i) {
			defaultList.push(new GraphOptions());
		}

		if (list !== undefined && list.length !== maximalNumberOfGraphs) {
			throw new Error(`The number of graphs options should be ${maximalNumberOfGraphs}.`);
		}

		this.list = list ?? defaultList;
	}

	at(index: number) {
		return this.list[index];
	}

	findIndex(graphOptions: GraphOptions) {
		return this.list.findIndex(x => x === graphOptions);
	}

	toJSON() {
		return this.list.map(graphOptions => graphOptions.toJSON());
	}

	static fromJSON(data: ReturnType<GraphsOptions['toJSON']>) {
		return new GraphsOptions(data.map(x => GraphOptions.fromJSON(x)));
	}
}
