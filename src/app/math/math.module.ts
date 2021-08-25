import { NgModule } from '@angular/core';
import { MathService } from './math.service';
import { MathDirective } from './math.directive';

@NgModule({
	declarations: [MathDirective],
	exports: [MathDirective],
	providers: [MathService],
})
export class MathModule { }
