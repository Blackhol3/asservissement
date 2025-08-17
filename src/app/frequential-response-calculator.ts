import { Polynomial } from './polynomial';
import { TransferFunction } from './transfer-function';

function unwrap(list: number[], step = 180): number[] {
	if (list.length === 0) {
		return list;
	}
	
	let previousValue = list[0];
	return list.map(value => {
		while (Math.abs(value - previousValue) > step) {
			value -= Math.sign(value - previousValue) * 2 * step;
		}
		
		previousValue = value;
		return value;
	});
}

function zeroLinearInterpolation(x0: number, y0: number, x1: number, y1: number): number {
	return x0 - y0 * (x1 - x0) / (y1 - y0);
}

function linearInterpolation(x0: number, y0: number, x1: number, y1: number, xInterp: number): number {
	return y0 + (xInterp - x0) * (y1 - y0) / (x1 - x0);
}

export type GainMargin = {frequency: number, gain: number} | null;
export type PhaseMargin = {frequency: number, phase: number} | null;

export class FrequentialResponseCalculator {
	protected expandedTransferFunction: TransferFunction;
	
	constructor(
		protected transferFunction: TransferFunction,
	) {
		this.expandedTransferFunction = transferFunction.getExpandedTransferFunction();
	}
	
	getCartesianResponse(wMin: number, wMax: number, nbPoints: number): {ws: number[], reals: number[], imaginaries: number[]} {
		const polarResponse = this.getPolarResponse(wMin, wMax, nbPoints);
		
		const reals: number[] = [];
		const imaginaries: number[] = [];
		
		for (let index = 0; index < polarResponse.ws.length; ++index) {
			const norm = Math.pow(10, polarResponse.gains[index]/20);
			const angle = polarResponse.phases[index] * Math.PI / 180;
			
			reals.push(norm * Math.cos(angle));
			imaginaries.push(norm * Math.sin(angle));
		}
		
		return {
			ws: polarResponse.ws,
			reals: reals,
			imaginaries: imaginaries,
		};
	}
	
	getPolarResponse(wMin: number, wMax: number, nbPoints: number): {ws: number[], gains: number[], phases: number[]} {
		const wLogMin = Math.log10(wMin);
		const wLogMax = Math.log10(wMax);
		const wLogStep = (wLogMax - wLogMin)/(nbPoints - 1);
		
		const ws: number[] = [];
		const gains: number[] = [];
		const phases: number[] = [];
		
		for (let wLog = wLogMin; wLog < wLogMax; wLog += wLogStep) {
			const w = Math.pow(10, wLog);
			
			let complexValue = this.expandedTransferFunction.numerator.getComplexValue(w);
			let gain = 20*Math.log10(complexValue.abs);
			let phase = complexValue.theta;
			
			complexValue = this.expandedTransferFunction.denominator.getComplexValue(w);
			gain -= 20*Math.log10(complexValue.abs);
			phase -= complexValue.theta;
			
			ws.push(w);
			gains.push(gain);
			phases.push(phase * 180 / Math.PI);
		}
		
		let phaseShift = 0;
		switch (this.expandedTransferFunction.zeroMultiplicity % 4) {
			case -3: phaseShift = +90;  break;
			case -2: phaseShift = -180; break;
			case -1: phaseShift = -90;  break;
			case +1: phaseShift = +90;  break;
			case +2: phaseShift = -180; break;
			case +3: phaseShift = -90;  break;
		}
		phaseShift -= this.expandedTransferFunction.zeroMultiplicity * 90;
		
		return {
			ws: ws,
			gains: gains,
			phases: unwrap(phases.map(phase => phase + phaseShift)),
		};
	}

	getAsymptoticChanges() {
		const asymptoticChanges = new Map<number, number>();
		
		const calculateChange = (polynomial: Polynomial, factor: number) => {
			const w = polynomial.getCharacteristicFrequency();
			if (w === null) {
				return;
			}
			
			const realOrder = polynomial.order - polynomial.zeroMultiplicity;
			const previousOrder = asymptoticChanges.get(w) ?? 0;
			asymptoticChanges.set(w, previousOrder + factor * realOrder);
		};
		
		this.transferFunction.numerators.forEach(polynomial => calculateChange(polynomial, +1));
		this.transferFunction.denominators.forEach(polynomial => calculateChange(polynomial, -1));
		
		return [...asymptoticChanges].map(([w, order]) => ({w, order})).sort((a, b) => a.w - b.w);
	}
	
	getAsymptoticPolarResponse(wMin: number, wMax: number): {ws: number[], gains: number[], phases: number[]} {
		const asymptoticLowFrequencyOrder = -this.transferFunction.zeroMultiplicity;
		const asymptoticChanges = this.getAsymptoticChanges();
		
		const wInitial = asymptoticChanges.length > 0 ? Math.min(wMin, asymptoticChanges[0].w) : wMin;
		const staticGain = this.expandedTransferFunction.staticGain;
		
		const ws = [wInitial];
		const gains = [20*Math.log10(wInitial)*asymptoticLowFrequencyOrder + 20*Math.log10(staticGain)];
		const phases = [90 * asymptoticLowFrequencyOrder];
		
		let currentAsymptoticOrder = asymptoticLowFrequencyOrder;
		for (const asymptoticChange of asymptoticChanges) {
			const index = ws.length - 1;
			ws.push(asymptoticChange.w);
			gains.push(20*Math.log10(asymptoticChange.w / ws[index])*currentAsymptoticOrder + gains[index]);
			phases.push(90 * currentAsymptoticOrder);
			
			currentAsymptoticOrder += asymptoticChange.order;
			
			ws.push(asymptoticChange.w);
			gains.push(gains[gains.length - 1]);
			phases.push(90 * currentAsymptoticOrder);
		}
		
		const index = ws.length - 1;
		if (wMax > ws[index]) {
			ws.push(wMax);
			gains.push(20*Math.log10(wMax / ws[index])*currentAsymptoticOrder + gains[index]);
			phases.push(90 * currentAsymptoticOrder);
		}
		
		return {
			ws: ws,
			gains: gains,
			phases: phases,
		};
	}

	getGainMargin(polarResponse: {ws: number[], gains: number[], phases: number[]}): GainMargin {
		let gainMargin: GainMargin = null;
		
		for (let i = 1; i < polarResponse.ws.length; ++i) {
			if (Math.sign(polarResponse.phases[i - 1] + 180) != Math.sign(polarResponse.phases[i] + 180) && (gainMargin === null || polarResponse.gains[i] > gainMargin.gain)) {
				const w = zeroLinearInterpolation(polarResponse.ws[i - 1], polarResponse.phases[i - 1] + 180, polarResponse.ws[i], polarResponse.phases[i] + 180)
				gainMargin = {
					frequency: w,
					gain: linearInterpolation(polarResponse.ws[i - 1], polarResponse.gains[i - 1], polarResponse.ws[i], polarResponse.gains[i], w),
				};
			}
		}

		return gainMargin;
	}

	getPhaseMargin(polarResponse: {ws: number[], gains: number[], phases: number[]}): PhaseMargin {
		let phaseMargin: PhaseMargin = null;
		
		for (let i = 1; i < polarResponse.ws.length; ++i) {
			if (Math.sign(polarResponse.gains[i - 1]) != Math.sign(polarResponse.gains[i]) && (phaseMargin === null || polarResponse.phases[i] < phaseMargin.phase)) {
				const w = zeroLinearInterpolation(polarResponse.ws[i - 1], polarResponse.gains[i - 1], polarResponse.ws[i], polarResponse.gains[i])
				phaseMargin = {
					frequency: w,
					phase: linearInterpolation(polarResponse.ws[i - 1], polarResponse.phases[i - 1], polarResponse.ws[i], polarResponse.phases[i], w),
				};
			}
		}

		return phaseMargin;
	}
}
