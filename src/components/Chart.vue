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
  data() {
    return {
      series: [
        {
          name: 'Value ($)',
          data: [
            10,
            22,
            41,
            44,
            35,
            65,
            51,
            64,
            49,
            71,
            62,
            51,
            69,
            120,
            91,
            148
          ]
        }
      ],
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
        colors: ['#384aff'],
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
            `<div>$${series[seriesIndex][dataPointIndex]}</div>`
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
