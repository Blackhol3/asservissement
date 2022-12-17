import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DragDropModule } from '@angular/cdk/drag-drop';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { GraphComponent } from './graph/graph.component';
import { BlackNicholsGraphComponent } from './black-nichols-graph/black-nichols-graph.component';
import { BodeGraphComponent } from './bode-graph/bode-graph.component';
import { TimeGraphComponent } from './time-graph/time-graph.component';

import { MathModule } from './math/math.module';
import { ExplicitGridDirective } from './explicit-grid.directive';
import { SimpleElementComponent } from './simple-element/simple-element.component';
import { NyquistGraphComponent } from './nyquist-graph/nyquist-graph.component';

import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsAnnotation from 'highcharts/modules/annotations';
import Exporting from 'highcharts/modules/exporting';
HighchartsMore(Highcharts);
HighchartsAnnotation(Highcharts);
Exporting(Highcharts);

Highcharts.SVGRenderer.prototype.symbols.plus = function (x: number, y: number, w: number, h: number) {
    return ['M', x + w/2, y, 'v', h, 'm', -w/2, -h/2, 'h', w, 'z'];
};

@NgModule({
	declarations: [
		AppComponent,
		ExplicitGridDirective,
		SimpleElementComponent,
		
		GraphComponent,
		BlackNicholsGraphComponent,
		BodeGraphComponent,
		TimeGraphComponent,
  		NyquistGraphComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		DragDropModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatCardModule,
		MatCheckboxModule,
		MatDividerModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatMenuModule,
		MatSidenavModule,
		MatSnackBarModule,
		MatToolbarModule,
		MathModule,
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
