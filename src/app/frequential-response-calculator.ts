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

export class FrequentialResponseCalculator {
	private transferFunction: TransferFunction;
	private expandedTransferFunction: TransferFunction;
	
	constructor(transferFunction: TransferFunction = new TransferFunction()) {
		this.transferFunction = transferFunction;
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
			let gain = 20*Math.log10(Math.hypot(complexValue[0], complexValue[1]));
			let phase = Math.atan2(complexValue[1], complexValue[0]);
			
			complexValue = this.expandedTransferFunction.denominator.getComplexValue(w);
			gain -= 20*Math.log10(Math.hypot(complexValue[0], complexValue[1]));
			phase -= Math.atan2(complexValue[1], complexValue[0]);
			
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
	
	getAsymptoticPolarResponse(wMin: number, wMax: number): {ws: number[], gains: number[], phases: number[]} {
		let asymptoticLowFrequencyOrder = 0;
		const asymptoticChanges: {w: number, order: number}[] = [];
		
		const calculateChange = (polynomial: Polynomial, factor: number) => {
			asymptoticLowFrequencyOrder += factor * polynomial.smallerNonZeroCoefficient;
			if (polynomial.smallerNonZeroCoefficient === polynomial.order) {
				return;
			}
			
			const realOrder = polynomial.order - polynomial.smallerNonZeroCoefficient;
			const asymptoticChange = {
				w : Math.pow(polynomial.at(polynomial.smallerNonZeroCoefficient) / polynomial.at(polynomial.order), 1/realOrder),
				order : factor * realOrder,
			};
			
			const index = asymptoticChanges.findIndex(change => change.w === asymptoticChange.w);
			if (index === -1) {
				asymptoticChanges.push(asymptoticChange);
			}
			else {
				asymptoticChanges[index].order += asymptoticChange.order;
			}
		};
		
		this.transferFunction.numerators.forEach(polynomial => calculateChange(polynomial, +1));
		this.transferFunction.denominators.forEach(polynomial => calculateChange(polynomial, -1));
		
		const ws: number[] = [];
		const gains: number[] = [];
		const phases: number[] = [];
		
		if (asymptoticChanges.length > 0) {
			asymptoticChanges.sort((a, b) => a.w - b.w);
			
			const wInitial = Math.min(wMin, asymptoticChanges[0].w);
			const staticGain = this.expandedTransferFunction.numerator.at(this.expandedTransferFunction.numerator.smallerNonZeroCoefficient) / this.expandedTransferFunction.denominator.at(this.expandedTransferFunction.denominator.smallerNonZeroCoefficient);
			
			ws.push(wInitial);
			gains.push(20*Math.log10(wInitial)*asymptoticLowFrequencyOrder + 20*Math.log10(staticGain));
			phases.push(90 * asymptoticLowFrequencyOrder);
			
			let currentAsymptoticOrder = asymptoticLowFrequencyOrder;
			asymptoticChanges.forEach((asymptoticChange, index) => {
				ws.push(asymptoticChange.w);
				gains.push(20*Math.log10(asymptoticChange.w / ws[index])*currentAsymptoticOrder + gains[index]);
				phases.push(90 * currentAsymptoticOrder);
				
				currentAsymptoticOrder += asymptoticChange.order;
				
				ws.push(asymptoticChange.w);
				gains.push(gains[gains.length - 1]);
				phases.push(90 * currentAsymptoticOrder);
			});
			
			const index = ws.length - 1;
			if (wMax > ws[index]) {
				ws.push(wMax);
				gains.push(20*Math.log10(wMax / ws[index])*currentAsymptoticOrder + gains[index]);
				phases.push(90 * currentAsymptoticOrder);
			}
		}
		
		return {
			ws: ws,
			gains: gains,
			phases: phases,
		};
	}
}
