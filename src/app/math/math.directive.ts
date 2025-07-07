import { Directive, type OnChanges, type OnInit, Input, ElementRef, type OnDestroy, type SimpleChanges } from "@angular/core";
import { Subject } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { MathService } from "./math.service";

@Directive({
	selector: '[appMath]',
})
export class MathDirective implements OnInit, OnChanges, OnDestroy {
	@Input() appMath: string = '';
	private alive$ = new Subject<boolean>();
	private readonly el: HTMLElement;

	constructor(private mathService: MathService, elementRef: ElementRef<HTMLElement>) {
		this.el = elementRef.nativeElement;
	}

	ngOnInit() {
		this.render();
	}

	ngOnChanges(changes: SimpleChanges) {
		if(changes && changes['appMath'] && changes['appMath'].currentValue) {
			this.render();
		}
	}

	private render() {
		this.mathService.ready().pipe(
			take(1),
			takeUntil(this.alive$)
		).subscribe(() => void this.mathService.render(this.el, '$$' + this.appMath + '$$'));
	}

	ngOnDestroy() {
		this.alive$.next(false);
	}

}
