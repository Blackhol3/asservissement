import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { LoopType, GraphType, InputType, VisualizationType } from '../common-type';
import { GraphOptions } from '../graph-options';
import { StateService } from '../state.service';

import { BlackNicholsGraphComponent } from '../black-nichols-graph/black-nichols-graph.component';
import { BodeGraphComponent } from '../bode-graph/bode-graph.component';
import { NyquistGraphComponent } from '../nyquist-graph/nyquist-graph.component';
import { TimeGraphComponent } from '../time-graph/time-graph.component';

@Component({
	selector: 'app-graph',
	templateUrl: './graph.component.html',
	styleUrls: ['./graph.component.scss'],
	imports: [
		FormsModule,
		MatButtonToggleModule,

		BlackNicholsGraphComponent,
		BodeGraphComponent,
		NyquistGraphComponent,
		TimeGraphComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent {
	readonly graphOptions = input.required<GraphOptions>();
	
	readonly transferFunction = computed(() => this.state.simpleElements().transferFunction);
	readonly plottedTransferFunction = computed(() => {
		return this.graphOptions().loopType === LoopType.Open ? this.transferFunction() : this.transferFunction().getClosedLoopTransferFunction().factorize();
	});

	readonly LoopType = LoopType;
	readonly GraphType = GraphType;
	readonly InputType = InputType;
	readonly VisualizationType = VisualizationType;

	constructor(
		readonly state: StateService,
	) {}

	onLoopTypeChange(loopType: LoopType) {
		this.state.updateGraphOption(this.graphOptions(), 'loopType', loopType);
	}

	onGraphTypeChange(graphType: GraphType) {
		this.state.updateGraphOption(this.graphOptions(), 'graphType', graphType);
	}

	onInputTypeChange(inputType: InputType) {
		this.state.updateGraphOption(this.graphOptions(), 'inputType', inputType);
	}

	onVisualizationTypeChange(visualizationType: VisualizationType) {
		this.state.updateGraphOption(this.graphOptions(), 'visualizationType', visualizationType);
	}
}
