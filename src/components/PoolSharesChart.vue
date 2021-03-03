<template>
  <div class="-mr-3 -ml-3">
    <apexchart
      width="100%"
      height="210"
      type="line"
      :options="options"
      :series="series"
    />
  </div>
</template>

<script>
export default {
  props: {
    marketCharts: Object
  },
  data() {
    const categories = this.marketCharts['categories'];
    const series = this.marketCharts['series'];
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
        colors: ['#10CA16'],
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: [2],
          curve: 'straight'
        },
        grid: {
          xaxis: {
            lines: {
              show: false
            }
          },
          yaxis: {
            lines: {
              show: false
            }
          }
        },
        xaxis: {
          type: 'datetime',
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
          categories
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
          custom: ({ seriesIndex, dataPointIndex }) =>
            `<div>${series[seriesIndex].name}: $${series[seriesIndex].data[
              dataPointIndex
            ].toFixed(2)}</div>`
        }
      }
    };
  }
};
</script>

<style lang="css">
.apexcharts-tooltip {
  font-size: 14px;
  padding: 8px 12px;
}
.apexcharts-xaxistooltip {
  all: initial;
  padding-left: 12px;
}
.apexcharts-xaxistooltip > * {
  all: unset;
}
.apexcharts-xaxistooltip > .apexcharts-xaxistooltip-text {
  font-family: 'Inter' !important;
  font-size: 14px !important;
  color: var(--text-color) !important;
}
.apexcharts-xaxistooltip::before,
.apexcharts-xaxistooltip::after {
  all: initial;
}
</style>
