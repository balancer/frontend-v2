export function isNumber(str: string | number): boolean {
  if (str === '') {
    return false;
  }

  return !Number.isNaN(Number(str));
}

export function formatPercentage(percentageString: string) {
  const percentage = parseFloat(percentageString);

  if (isNaN(percentage)) {
    return '-';
  }
  const formattedPercentage = (percentage * 100).toFixed(4);
  return `${formattedPercentage}%`;
}
