import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';
import { animate, style, trigger, transition } from '@angular/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { TransferFunction } from './transfer-function';
import { TilesModeType } from './common-type';

import { SimpleElement } from './simple-element/simple-element';
import { FirstOrder } from './simple-element/first-order';
import { SecondOrder } from './simple-element/second-order';
import { InverseFirstOrder } from './simple-element/inverse-first-order';
import { InverseSecondOrder } from './simple-element/inverse-second-order';
import { Integrator } from './simple-element/integrator';
import { Differentiator } from './simple-element/differentiator';
import { PController } from './simple-element/p-controller';
import { PIController } from './simple-element/pi-controller';
import { PIDController } from './simple-element/pid-controller';
import { PhaseLeadCompensator } from './simple-element/phase-lead-compensator';

import { ExplicitGridDirective } from './explicit-grid.directive';
import { GraphComponent } from './graph/graph.component';
import { MathDirective } from './math/math.directive';
import { SimpleElementComponent } from './simple-element/simple-element.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	animations: [
		trigger('items', [
			transition(':enter', [
				style({ transform: 'scale(0.5)', opacity: 0 }),
				animate(
					'250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
					style({ transform: 'scale(1)', opacity: 1 })
				),
			]),
			transition(':leave', [
				style({ transform: 'scale(1)', opacity: 1, height: '*' }),
				animate(
					'250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
					style({ transform: 'scale(0.5)', opacity: 0, height: '0px' })
				),
			]),
		])
	],
	imports: [
		MatButtonModule,
		MatDividerModule,
		MatMenuModule,
		MatSidenavModule,
		MatToolbarModule,
		
		ExplicitGridDirective,
		GraphComponent,
		MathDirective,
		SimpleElementComponent,
	],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
	simpleElements = signal<SimpleElement[]>([]);
	simpleElementTypes: ([string, () => SimpleElement] | null)[] = [
		[(new FirstOrder()).name, () => new FirstOrder()],
		[(new SecondOrder()).name, () => new SecondOrder()],
		null,
		[(new InverseFirstOrder()).name, () => new InverseFirstOrder()],
		[(new InverseSecondOrder()).name, () => new InverseSecondOrder()],
		null,
		[(new Integrator()).name, () => new Integrator()],
		[(new Differentiator()).name, () => new Differentiator()],
		null,
		[(new PController()).name, () => new PController()],
		[(new PIController()).name, () => new PIController()],
		[(new PIDController()).name, () => new PIDController()],
		[(new PhaseLeadCompensator()).name, () => new PhaseLeadCompensator()],
	];
	
	transferFunction = signal(new TransferFunction());
	transferFunctionTex = signal('');
	
	transferFunctionClosedLoop = signal(new TransferFunction());
	transferFunctionClosedLoopTex = signal('');
	
	tilesMode = signal(TilesModeType.HalfHorizontal);
	
	add(index: number): void {
		this.simpleElements.update(x => [...x, this.simpleElementTypes[index]![1]()]);
		this.update();
	}
	
	remove(index: number): void {
		this.simpleElements.update(x => { x.splice(index, 1); return x; });
		this.update();
	}
	
	update(): void {
		let transferFunction = new TransferFunction();
		let transferFunctionTex = '\\begin{align}FTBO(p) &= ';
		
		this.simpleElements().forEach((element) => {
			transferFunction = transferFunction.multiply(element.transferFunction);
			transferFunctionTex += element.transferFunction.getTex();
		});
		
		const transferFunctionClosedLoop = transferFunction.getClosedLoopTransferFunction();
		let transferFunctionClosedLoopTex = '\\begin{align}FTBF(p) &= ';
		
		if (this.simpleElements().length === 0) {
			transferFunctionTex += '1';
			transferFunctionClosedLoopTex += '\\frac12';
			
		}
		else {
			transferFunctionClosedLoopTex += transferFunctionClosedLoop.getTex();
			
			if (this.simpleElements().length > 1) {
				transferFunctionTex += '\\\\&= ' + transferFunction.getExpandedTransferFunction().getTex();
			}
		}
		
		transferFunctionTex += '\\end{align}';
		transferFunctionClosedLoopTex += '\\end{align}';

		this.transferFunction.set(transferFunction);
		this.transferFunctionTex.set(transferFunctionTex);

		this.transferFunctionClosedLoop.set(transferFunctionClosedLoop);
		this.transferFunctionClosedLoopTex.set(transferFunctionClosedLoopTex);
	}
}
