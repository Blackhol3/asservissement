import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
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
import { SimpleElementTypes } from './simple-elements';

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
	
	readonly simpleElementTypes = SimpleElementTypes;
	readonly tilesModes = TilesModes;
	readonly tilesModesList = TilesModesList;

	constructor(
		readonly state: StateService,
		readonly snackBar: MatSnackBar,
		iconRegistry: MatIconRegistry,
		sanitizer: DomSanitizer,
	) {
		for (const tilesMode of TilesModesList) {
			iconRegistry.addSvgIconInNamespace('app', tilesMode, sanitizer.bypassSecurityTrustResourceUrl(`assets/tiles/${tilesMode}.svg`));
		}
	}

	shouldAddDividerAfter(simpleElementType: SimpleElementType) {
		return this.dividersAfter.some(type => simpleElementType instanceof type);
	}

	async copyToClipboard() {
		await this.state.copyToClipboard();
		this.snackBar.open("Le lien a été copié dans le presse-papier.", undefined, {duration: 3000});
	}
}
