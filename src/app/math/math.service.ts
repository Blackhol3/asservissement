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
        promise: Promise<any>;
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
    source: "https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.0/es5/tex-svg.min.js",
    integrity: "sha512-K90Mc/rYzO+mxOtUsnp8quUB+3T9o5L0QIk6C9O5eJ3juahzkWz751FnYs7BHtHkkNV4YLe8kvYGgK/oSHln1g==",
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
      script.onerror = error => reject(error);
      document.head.appendChild(script);
    });
  }

  ready(): Observable<void> {
    return this.signal;
  }

  render(element: HTMLElement, math: string) {
    // Take initial typesetting which MathJax performs into account
    window.MathJax.startup.promise.then(() => {
      element.innerHTML = math;
      window.MathJax.typesetPromise();
    });
  }
}
