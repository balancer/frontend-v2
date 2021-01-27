<template>
  <div class="chart mr-n2 ml-n2">
    <apexchart
      width="100%"
      height="300"
      type="line"
      :options="options"
      :series="series"
    />
  </div>
</template>

<script>
export default {
	props: {
		marketCharts: Array
	},
	data() {
		const series = this.marketCharts.map(marketChart => ({
			name: '',
			data: marketChart.map(data => data[1])
		}));
		return {
			series,
			options: {
				chart: {
					type: 'line',
					animations: {
						enabled: false
					},
					zoom: {
						enabled: false
					},
					toolbar: {
						tools: {
							download: false
						}
					}
				},
				colors: ['#384aff', '#ffe200'],
				dataLabels: {
					enabled: false
				},
				stroke: {
					width: 3,
					curve: 'straight'
				},
				grid: {
					// show: false
				},
        xaxis: {
          floating: true,
          axisTicks: {
            show: false
          },
          crosshairs: {
            show: true
          },
          axisBorder: {
            show: false
          },
          labels: {
            show: false
          },
          tooltip: {
            enabled: false
          }
          // categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        },
        yaxis: {
          floating: true,
          axisTicks: {
            show: false
          },
          axisBorder: {
            show: false
          },
          labels: {
            show: false
          }
        },
        tooltip: {
          custom: ({ series, seriesIndex, dataPointIndex }) =>
	          `<div>$${this.$n(series[seriesIndex][dataPointIndex])}</div>`
        }
      }
    };
  }
};
</script>

<style lang="scss">
.apexcharts-tooltip {
  font-size: 18px;
  padding: 6px 12px 2px;
}
</style>
