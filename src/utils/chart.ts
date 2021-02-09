export function formatMarketChartData(data, chartConfig?) {
  // Reference date should be a user definable vertical line on the chart
  const refIndex = chartConfig?.dataPointIndex
    ? chartConfig.dataPointIndex
    : Math.floor(data[0].length * 0.25);
  // const refDate = data[0][refIndex][0];
  const refAmount = data[0][refIndex][1];

  // This equalizes all values from the reference date onwards
  const tokenMultipliers: any[] = [
    null,
    refAmount / data[1][refIndex][1],
    refAmount / data[2][refIndex][1]
  ];

  const response: any = {
    categories: [],
    series: [
      { name: 'MAX', type: 'area', data: [] },
      { name: 'HODL', type: 'area', data: [] },
      { name: 'MIN', type: 'area', data: [] },
      { name: 'BPT', type: 'line', data: [] }
    ]
  };

  data[0].forEach((item, i) => {
    // Categories are dates
    response.categories.push(item[0]);
    // This is the BPT values
    response.series[3].data.push(item[1]);

    // Before refDate only show BPT price
    if (i < refIndex) {
      response.series[0].data.push(null);
      response.series[1].data.push(null);
      response.series[2].data.push(null);
    } else {
      // Best performance you could get
      response.series[0].data.push(
        Math.max(
          data[1][i][1] * tokenMultipliers[1],
          data[2][i][1] * tokenMultipliers[2]
        )
      );
      // Compare with holding tokens
      // TODO: support multitoken, different weights
      response.series[1].data.push(
        0.5 * data[1][i][1] * tokenMultipliers[1] +
          0.5 * data[2][i][1] * tokenMultipliers[2]
      );
      // The worst performing you could get with these tokens
      response.series[2].data.push(
        Math.min(
          data[1][i][1] * tokenMultipliers[1],
          data[2][i][1] * tokenMultipliers[2]
        )
      );
      // TODO: Add another chart with the BPT plus fees (and optionally BAL mining)
    }
  });
  return response;
}
