import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { SimpleElement } from './simple-element'

@Component({
	selector: 'app-simple-element',
	templateUrl: './simple-element.component.html',
	styleUrls: ['./simple-element.component.scss'],
	imports: [
		FormsModule,

		MatCardModule,
		MatButtonModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleElementComponent {
	simpleElement = input.required<SimpleElement>();
	
	update = output();
	remove = output();
	
	onChange(isValid: boolean): void {
		if (isValid) {
			this.update.emit();
		}
	}
}
