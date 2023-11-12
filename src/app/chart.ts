import Highcharts from 'highcharts/es-modules/masters/highcharts.src';

export const colors = {
	input: '#1f77b4',
	output: '#ff7f0e',
	rapidity: '#2ca02c',
	asymptotic: '#d62728',
	stability: '#9467bd',
};

export const options: Highcharts.Options = {
	chart: {
		backgroundColor: 'transparent',
		panKey: 'ctrl',
		panning: {
			enabled: true,
			type: 'xy',
		},
		zooming: {
			type: 'xy',
		},
		spacing: [5, 20, 5, 10],
		events: {
			fullscreenClose: function (this: any) {
				this.update({chart: {backgroundColor: 'transparent'}});
			},
			fullscreenOpen: function (this: any) {
				this.update({chart: {backgroundColor: '#FAFAFA'}});
			},
		}
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
/** @link https://www.highcharts.com/forum/viewtopic.php?t=35134 */
export function synchronize(charts: Highcharts.Chart[]) {
	function leaveEventListener(event: any): void {
		for (let chart of charts) {
			chart.tooltip.hide();
			chart.xAxis[0].hideCrosshair();
		}
	}
	
	function moveEventListener(event: any): void {
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
	
	let moveEventTypes = ['mousemove', 'touchmove', 'touchstart'];
	for (let chart of charts) {
		chart.container.addEventListener('mouseleave', leaveEventListener);
		for (let moveEventType of moveEventTypes) {
		    chart.container.addEventListener(
		        moveEventType,
		        moveEventListener
			);
		}
		
		let options: Highcharts.Options = {
			xAxis: {
				events: {
					setExtremes: getSyncExtremes(chart),
				},
			},
		};
		
		chart.update(options, false);
	}
}

const frequencyFormatter = new Intl.NumberFormat(undefined, {
	notation: 'scientific',
	maximumSignificantDigits: 3,
});
export function formatFrequency(frequency: number): string {
	const result = frequencyFormatter.format(frequency);
	return (
		result.includes('E0') 
		? result.replace('E0', '') + ' rad/s'
		: result.replace('E', '⋅10<tspan style="font-size:0.8em" dy="-0.5em">') +'</tspan><tspan dy="0.5em"> rad/s</tspan>'
	);
}
