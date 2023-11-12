import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';

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

if (environment.production) {
	enableProdMode();
}

bootstrapApplication(AppComponent, {
	providers: [
		provideAnimations(),
	],
})
.catch(err => console.error(err));
