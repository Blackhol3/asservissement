export class Complex {
	#abs: number | undefined;
	#theta: number | undefined;

	constructor(
		readonly real: number,
		readonly imag: number,
	) {}

	get abs() {
		if (this.#abs === undefined) {
			this.#abs = Math.hypot(this.real, this.imag);
		}

		return this.#abs;
	}

	get theta() {
		if (this.#theta === undefined) {
			this.#theta = Math.atan2(this.imag, this.real);
		}

		return this.#theta;
	}

	add(other: Complex) {
		return new Complex(
			this.real + other.real,
			this.imag + other.imag,
		);
	}

	substract(other: Complex) {
		return new Complex(
			this.real - other.real,
			this.imag - other.imag,
		);
	}

	multiply(other: number | Complex) {
		if (typeof other === "number") {
			return new Complex(other * this.real, other * this.imag);
		}

		return new Complex(
			this.real*other.real - this.imag*other.imag,
			this.real*other.imag + this.imag*other.real,
		);
	}

	power(exponant: number) {
		return Complex.fromPolar(
			Math.pow(this.abs, exponant),
			exponant * this.theta,
		);
	}

	invert() {
		const squaredAbs = this.real**2 + this.imag**2;
		return new Complex(this.real/squaredAbs, -this.imag/squaredAbs);
	}

	static fromPolar(r: number, theta: number) {
		return new Complex(r * Math.cos(theta), r * Math.sin(theta));
	}
}
