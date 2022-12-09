import { Component, Input, OnChanges } from '@angular/core';
import { TransferFunction } from '../transfer-function';
import { LoopType, GraphType, InputType, VisualizationType } from '../common-type';

@Component({
	selector: 'app-graph',
	templateUrl: './graph.component.html',
	styleUrls: ['./graph.component.scss']
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
