// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

import 'highcharts/es-modules/masters/highcharts.src';
import 'highcharts/es-modules/masters/highcharts-more.src';
import 'highcharts/es-modules/masters/modules/accessibility.src';
import 'highcharts/es-modules/masters/modules/annotations.src';
import 'highcharts/es-modules/masters/modules/exporting.src';
import 'highcharts/es-modules/masters/modules/export-data.src';

@NgModule({
	providers: [provideZonelessChangeDetection()],
})
class ZonelessModule {}

getTestBed().initTestEnvironment(
	[BrowserTestingModule, ZonelessModule],
	platformBrowserTesting(),
);
