import { Injectable } from "@angular/core";
import { Subject, ReplaySubject, Observable } from "rxjs";

interface MathJaxConfig {
	source: string;
	integrity: string;
	id: string;
}

declare global {
	interface Window {
		MathJax: {
			typesetPromise: () => void;
			startup: {
				promise: Promise<never>;
			};
		};
	}
}

@Injectable({
	providedIn: "root"
})
export class MathService {
	private signal: Subject<void>;
	private mathJax: MathJaxConfig = {
		source: "https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js",
		integrity: "sha512-si8sZ9hrLKf+1QHOzVXtT6F9GH5yK4VeeZ4pm0LOBFriwiXFL6Pu6+VMArzgh1sDJb5gKyktGtN0rMT16k1/cQ==",
		id: "MathJaxScript"
	};
  
	constructor() {
		this.signal = new ReplaySubject<void>();
		void this.registerMathJaxAsync(this.mathJax)
			.then(() => this.signal.next())
			.catch((error) => console.log(error));
	}

	private async registerMathJaxAsync(config: MathJaxConfig): Promise<void> {
		return new Promise((resolve, reject) => {
			const script: HTMLScriptElement = document.createElement("script");
			script.id = config.id;
			script.type = "text/javascript";
			script.src = config.source;
			script.integrity = config.integrity;
			script.crossOrigin = "anonymous";
			script.async = true;
			script.onload = () => resolve();
			// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
			script.onerror = error => reject(error);
			document.head.appendChild(script);
		});
	}

	ready(): Observable<void> {
		return this.signal;
	}

	async render(element: HTMLElement, math: string) {
		// Take initial typesetting which MathJax performs into account
		await window.MathJax.startup.promise;
		element.innerHTML = math;
		window.MathJax.typesetPromise();
	}
}
