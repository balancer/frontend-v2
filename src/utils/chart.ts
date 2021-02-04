export function formatMarketChartData(data) {
  // Reference date should be a user definable vertical line on the chart
  const refIndex = Math.floor(data[0].length * 0.25);
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
      { name: 'HODL', data: [] },
      { name: 'MIN', data: [] },
      { name: 'MAX', data: [] },
      { name: 'LBT', data: [] }
    ]
  };

  data[0].forEach((item, i) => {
    // Categories are dates
    response.categories.push(item[0]);
    // This is the LBT values
    response.series[3].data.push(item[1]);

    // Before refDate only show LBT price
    if (i < refIndex) {
      response.series[0].data.push(null);
      response.series[1].data.push(null);
      response.series[2].data.push(null);
    } else {
      // Compare with holding tokens
      // TODO: support multitoken, different weights
      response.series[0].data.push(
        0.5 * data[1][i][1] * tokenMultipliers[1] +
          0.5 * data[2][i][1] * tokenMultipliers[2]
      );
      // The worst performing you could get with these tokens
      response.series[1].data.push(
        Math.min(
          data[1][i][1] * tokenMultipliers[1],
          data[2][i][1] * tokenMultipliers[2]
        )
      );
      // Best performance you could get
      response.series[2].data.push(
        Math.max(
          data[1][i][1] * tokenMultipliers[1],
          data[2][i][1] * tokenMultipliers[2]
        )
      );
      // TODO: Add another chart with the LBT plus fees (and optionally BAL mining)
    }
  });
  return response;
}
