import type * as Highcharts from 'highcharts';

export const colors = [
	'#1f77b4',
	'#ff7f0e',
	'#2ca02c',
	'#d62728',
];

export const options: Highcharts.Options = {
	chart: {
		backgroundColor: 'transparent',
		panKey: 'ctrl',
		panning: {
			enabled: true,
			type: 'xy',
		},
		zoomType: 'xy',
		spacing: [5, 20, 5, 10],
	},
	title: {
		text: undefined,
	},
	legend: {
		verticalAlign: 'top',
	},
	credits: {
		enabled: false,
	},
	tooltip: {
		valueDecimals: 3,
		/** @todo À corriger avec chiffres significatifs */
	},
	plotOptions: {
		series: {
			marker: {
				enabled: false,
			},
			states: {
				inactive: {
					opacity: 0.5,
				},
			},
		},
	},
	xAxis: {
		crosshair: true,
	},
};

/** @link https://www.highcharts.com/demo/synchronized-charts */
export function synchronize(charts: Highcharts.Chart[]) {
	function eventListener(event: any): void {
		for (let chart of charts) {
			let normalizedEvent = chart.pointer.normalize(event);
			let point = chart.series[0].searchPoint(event, true);
			
			if (point) {
				highlight(point, normalizedEvent);
			}
		}
	}
	
	function highlight(point: Highcharts.Point, event: Highcharts.PointerEventObject): void {
		event = point.series.chart.pointer.normalize(event);
		/** @todo Fait apparaître un marqueur sur les courbes liées, mais engendre un bug lors du zoom */ // point.onMouseOver();
	    point.series.chart.tooltip.refresh(point);
	    point.series.chart.xAxis[0].drawCrosshair(event, point);
	}
	
	function getSyncExtremes(chart: Highcharts.Chart) {
		return function (event: Highcharts.AxisSetExtremesEventObject) {
			if (event.trigger !== 'syncExtremes') {
				for (let currentChart of charts) {
			        if (chart !== currentChart) {
		                currentChart.xAxis[0].setExtremes(
		                    event.min,
		                    event.max,
		                    undefined,
		                    false,
		                    { trigger: 'syncExtremes' }
		                );
			        }
			    }
			}
		}
	}
	
	let eventTypes = ['mousemove', 'touchmove', 'touchstart'];
	for (let chart of charts) {
		for (let eventType of eventTypes) {
		    chart.container.addEventListener(
		        eventType,
		        eventListener
			);
		}
		
		let options: Highcharts.Options = {
			xAxis: {
				events: {
					setExtremes: getSyncExtremes(chart)
				},
			}
		};
		
		chart.update(options, false);
	}
}
