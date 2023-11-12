import { Component, Input, OnChanges } from '@angular/core';
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
	standalone: true,
	imports: [
		FormsModule,
		MatButtonToggleModule,

		BlackNicholsGraphComponent,
		BodeGraphComponent,
		NyquistGraphComponent,
		TimeGraphComponent,
	],
})
export class GraphComponent implements OnChanges {
	@Input('transferFunction') transferFunctionOpenLoop: TransferFunction = new TransferFunction();
	transferFunction: TransferFunction = new TransferFunction();

	loopType: LoopType = LoopType.Open;
	graphType: GraphType = GraphType.Time;
	inputType: InputType = InputType.Step;
	visualizationType: VisualizationType = VisualizationType.Bode;
	
	constructor() { }
	
	ngOnChanges() {
		this.transferFunction = this.loopType === LoopType.Open ? this.transferFunctionOpenLoop : this.transferFunctionOpenLoop.getClosedLoopTransferFunction();
	}
}
