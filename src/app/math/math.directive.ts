import { Directive, OnChanges, OnInit, Input, ElementRef, OnDestroy, SimpleChanges } from "@angular/core";
import { Subject } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { MathService } from "./math.service";

@Directive({
  selector: '[appMath]',
  providers: [MathService],
  standalone: true,
})
export class MathDirective implements OnInit, OnChanges, OnDestroy {
  @Input() appMath: string = '';
  private alive$ = new Subject<boolean>();
  private readonly el: HTMLElement;

  constructor(private mathService: MathService, elementRef: ElementRef) {
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
  ).subscribe(() => this.mathService.render(this.el, '$$' + this.appMath + '$$'));
  }

  ngOnDestroy() {
    this.alive$.next(false);
  }

}
