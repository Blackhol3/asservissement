import { provideHttpClient } from '@angular/common/http';
import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';

import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import 'highcharts/es-modules/masters/highcharts-more.src';
import 'highcharts/es-modules/masters/modules/accessibility.src';
import 'highcharts/es-modules/masters/modules/annotations.src';
import 'highcharts/es-modules/masters/modules/exporting.src';
import 'highcharts/es-modules/masters/modules/export-data.src';

Highcharts.SVGRenderer.prototype.symbols.plus = function (x: number, y: number, w: number, h: number) {
	return ['M', x + w/2, y, 'v', h, 'm', -w/2, -h/2, 'h', w, 'z'];
};

if (environment.production) {
	enableProdMode();
}

bootstrapApplication(AppComponent, {
	providers: [
		provideAnimations(),
		provideZonelessChangeDetection(),
		provideHttpClient(),
	],
})
	.catch(err => console.error(err));
