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
			fullscreenClose: chart => {
				chart.update({chart: {backgroundColor: 'transparent'}});
			},
			fullscreenOpen: chart => {
				chart.update({chart: {backgroundColor: '#FAFAFA'}});
			},
		}
	},
	title: {
		text: undefined,
	},
	legend: {
		itemStyle: {
			fontWeight: 'bold',
		},
		itemHiddenStyle: {
			color: '#cccccc',
			textDecoration: 'none',
		},
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
		labels: {
			style: {
				color: '#666666',
				fontSize: '11px',
			}
		},
		lineColor: '#ccd6eb',
		tickColor: '#ccd6eb',
	},
	yAxis: {
		labels: {
			style: {
				color: '#666666',
				fontSize: '11px',
			}
		}
	},
};

/** @link https://www.highcharts.com/demo/synchronized-charts */
/** @link https://www.highcharts.com/forum/viewtopic.php?t=35134 */
export function synchronize(charts: Highcharts.Chart[]) {
	function leaveEventListener() {
		for (const chart of charts) {
			chart.tooltip.hide();
			chart.xAxis[0].hideCrosshair();
		}
	}
	
	function moveEventListener(event: TouchEvent | MouseEvent) {
		for (const chart of charts) {
			const normalizedEvent = chart.pointer.normalize(event);
			const point = chart.series[0].searchPoint(event as PointerEvent, true);
			
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
				for (const currentChart of charts) {
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
	
	const moveEventTypes = ['mousemove', 'touchmove', 'touchstart'] as const;
	for (const chart of charts) {
		chart.container.addEventListener('mouseleave', leaveEventListener);
		for (const moveEventType of moveEventTypes) {
			chart.container.addEventListener(
				moveEventType,
				moveEventListener
			);
		}
		
		const options: Highcharts.Options = {
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
