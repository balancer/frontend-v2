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
            enabled: true
          },
          toolbar: {
            tools: {
              download: false
            }
          }
        },
        colors: ['#00AAFA', '#C2D5F7', '#CCE7FE', '#00AAFA'],
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: [2, 3, 3, 3, 4],
          curve: 'straight',
          dashArray: [2, 0, 0, 0]
        },
        grid: {
          show: true
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
          categories
        },
        yaxis: {
          // logarithmic: true,
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
            `<div>$${this._num(
              series[seriesIndex][dataPointIndex],
              '0,0.00'
            )}</div>`
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

.apexcharts-xaxistooltip {
  all: initial;
  padding-left: 12px;

  * {
    all: unset;
  }

  .apexcharts-xaxistooltip-text {
    font-family: 'Calibre' !important;
    color: var(--text-color) !important;
    font-size: 17px !important;
  }

  &:before,
  &:after {
    all: initial;
  }
}
</style>
