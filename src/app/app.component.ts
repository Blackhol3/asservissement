import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, signal } from '@angular/core';
import { animate, style, trigger, transition } from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TilesModes, TilesModesList } from './common-type';
import { TransferFunction } from './transfer-function';

import { type SimpleElementType } from './simple-element/simple-element';
import { SecondOrder } from './simple-element/second-order';
import { InverseSecondOrder } from './simple-element/inverse-second-order';
import { Differentiator } from './simple-element/differentiator';

import { GraphsGridComponent } from './graphs-grid/graphs-grid.component';
import { MathDirective } from './math/math.directive';
import { SimpleElementComponent } from './simple-element/simple-element.component';
import { StateService } from './state.service';

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
		MatIconModule,
		MatMenuModule,
		MatSidenavModule,
		MatToolbarModule,
		MatTooltipModule,
		
		GraphsGridComponent,
		MathDirective,
		SimpleElementComponent,
	],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
	protected readonly dividersAfter = [SecondOrder, InverseSecondOrder, Differentiator] as const;

	readonly transferFunction = signal(new TransferFunction());
	readonly transferFunctionTex = signal('');
	readonly transferFunctionClosedLoopTex = signal('');

	readonly tilesModes = TilesModes;
	readonly tilesModesList = TilesModesList;

	constructor(
		readonly state: StateService,
		readonly snackBar: MatSnackBar,
		private readonly iconRegistry: MatIconRegistry,
		private readonly sanitizer: DomSanitizer,
	) {
		effect(() => this.update());

		for (const tilesMode of TilesModesList) {
			iconRegistry.addSvgIconInNamespace('app', tilesMode, sanitizer.bypassSecurityTrustResourceUrl(`assets/tiles/${tilesMode}.svg`));
		}
	}

	shouldAddDividerAfter(simpleElementType: SimpleElementType) {
		return this.dividersAfter.some(type => simpleElementType instanceof type);
	}
	
	update(): void {
		let transferFunction = new TransferFunction();
		let transferFunctionTex = '\\begin{align}FTBO(p) &= ';
		
		this.state.simpleElements().forEach((element) => {
			transferFunction = transferFunction.multiply(element.transferFunction);
			transferFunctionTex += element.transferFunction.getTex();
		});
		
		let transferFunctionClosedLoopTex = '\\begin{align}FTBF(p) &= ';
		
		if (this.state.simpleElements().length === 0) {
			transferFunctionTex += '\\frac11';
			transferFunctionClosedLoopTex += '\\frac12';
		}
		else {
			transferFunctionClosedLoopTex += transferFunction.getClosedLoopTransferFunction().getTex();
			
			if (this.state.simpleElements().length > 1) {
				transferFunctionTex += '\\\\&= ' + transferFunction.getExpandedTransferFunction().getTex();
			}
		}
		
		transferFunctionTex += '\\end{align}';
		transferFunctionClosedLoopTex += '\\end{align}';

		this.transferFunction.set(transferFunction);
		this.transferFunctionTex.set(transferFunctionTex);
		this.transferFunctionClosedLoopTex.set(transferFunctionClosedLoopTex);
	}

	async copyToClipboard() {
		await this.state.copyToClipboard();
		this.snackBar.open("Le lien a été copié dans le presse-papier.", undefined, {duration: 3000});
	}
}
