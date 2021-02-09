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
            enabled: false
          },
          toolbar: {
            tools: {
              download: false
            }
          },
          events: {
            click: (event, chartContext, config) => {
              this.$emit('click', config);
            }
            // mouseMove: function(event, chartContext, config) {}
          }
        },
        // annotations: {
        //   xaxis: [
        //     {
        //       x: 205,
        //       strokeDashArray: 2,
        //       width: 2,
        //       borderColor: '#C2D3F8',
        //       label: {
        //         borderColor: '#C2D3F8',
        //         style: {
        //           color: '#596167',
        //           background: '#C2D3F8'
        //         },
        //         text: 'yield range'
        //       }
        //     }
        //        {
        //          x: new Date('26 Nov 2017').getTime(),
        //          x2: new Date('28 Nov 2017').getTime(),
        //          fillColor: '#B3F7CA',
        //          opacity: 0.4,
        //          label: {
        //            borderColor: '#B3F7CA',
        //            style: {
        //              fontSize: '10px',
        //              color: '#fff',
        //              background: '#00E396'
        //            },
        //            offsetY: -10,
        //            text: 'X-axis range'
        //          }
        //        }
        //   ]
        // },
        colors: ['#C2D5F7', '#00AAFA', '#CCE7FE', '#00AAFA'],
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: [3, 1, 3, 3],
          curve: 'straight',
          dashArray: [0, 2, 0, 0]
        },
        fill: {
          colors: ['#C2D3F8', '#C8E6FE', '#fff', 'transparent']
          // type: ['gradient', 'gradient', 'none', 'none'],
          // gradient: {
          //   shade: 'dark',
          //   gradientToColors: undefined,
          //   type: 'vertical',
          //   shadeIntensity: 0.9,
          //   inverseColors: true,
          //   opacityFrom: 0.5,
          //   opacityTo: 0,
          //   stops: [0, 90, 100]
          // }
        },

        grid: {
          show: true
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
