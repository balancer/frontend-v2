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
    const categories = this.marketCharts[0].map(data => data[0]);
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
        colors: ['#384aff', '#101111', '#5c6170'],
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: 3,
          curve: 'straight'
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
            `<div>$${this.$n(
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
