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
          }
        },
        annotations: {
          xaxis: [
            {
              x: new Date('2020-10-01').getTime(),
              strokeDashArray: 2,
              width: 4,
              strokeWidth: 4,
              borderColor: '#00ADFF',
              label: {
                borderColor: '#00ADFF',
                style: {
                  color: '#FFF',
                  fontSize: '13px',
                  background: '#00ADFF'
                },
                text: 'comparing to 01 march 2020'
              }
            }
          ],
          points: [
            //Points represent when user bought/sold
            {
              x: new Date('2020-11-01').getTime(),
              y: 11,
              marker: {
                strokeColor: '#00ADFF',
                fillColor: '#00ADFF',
                size: 6
              }
            },
            {
              x: new Date('2020-10-01').getTime(),
              y: 15,
              marker: {
                strokeColor: '#00ADFF',
                fillColor: '#00ADFF',
                size: 6
              }
            },
            {
              x: new Date('2021-01-01').getTime(),
              y: 20,
              marker: {
                strokeColor: '#00ADFF',
                fillColor: '#00ADFF',
                size: 6
              }
            }
          ]
        },
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
          max: 100,
          min: 0,
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
