import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { TransferFunction } from '../transfer-function';
import { LoopType, GraphType, InputType, VisualizationType } from '../common-type';

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
	transferFunction = input.required<TransferFunction>();
	plottedTransferFunction = computed(() => {
		return this.loopType() === LoopType.Open ? this.transferFunction() : this.transferFunction().getClosedLoopTransferFunction();
	});

	loopType = signal(LoopType.Open);
	graphType = signal(GraphType.Time);
	inputType = signal(InputType.Step);
	visualizationType = signal(VisualizationType.Bode);
	
	constructor() { }
}
