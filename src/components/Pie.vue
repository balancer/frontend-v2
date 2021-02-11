<template>
  <svg />
</template>

<script>
const d3 = require('d3');

export default {
  mounted() {
    const svg = d3.select(this.$el);
    const width = svg.attr('width');
    const height = svg.attr('height');
    const margin = { top: 0, left: 0, bottom: 0, right: 0 };
    const chartWidth = width - (margin.left + margin.right);
    const chartHeight = height - (margin.top + margin.bottom);
    this.chartLayer = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    this.arc = d3
      .arc()
      .outerRadius(chartHeight / 2)
      .innerRadius(chartHeight / 4);
    // .padAngle(0.03)
    // .cornerRadius(2);
    this.pieG = this.chartLayer
      .append('g')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight / 2})`);
    this.drawChart(this.data);
  },
  props: ['data'],
  watch: {
    data: newData => this.drawChart(newData)
  },
  methods: {
    drawChart(data) {
      // const newData = data.map();
      console.log('color', d3.hsl('green'), d3.hsl('#333333'));
      const newArray = [];
      data.forEach((d, i) => {
        newArray.push({ name: d.name, color: d.color, value: 10, alpha: 1 });
        for (let n = 0; n < d.value; n++) {
          newArray.push({
            name: d.name + '-slice-' + n,
            color: d.color,
            value: 1,
            alpha: 0.25 + (0.75 * (d.value - n)) / d.value
          });
        }
      });

      const arcs = d3
        .pie()
        .sort(null)
        .value(d => d.value)(newArray);
      const block = this.pieG.selectAll('.arc').data(arcs);
      block.select('path').attr('d', this.arc);
      // console.log('drawChart!', data, newArray, 'pie', arcs);

      const newBlock = block
        .enter()
        .append('g')
        .classed('arc', true)
        .append('path')
        .attr('d', this.arc)
        .attr('id', (d, i) => 'arc-' + d.data.name)
        .attr('fill', function(d, i) {
          return d3.hsl(
            d3.hsl(d.data.color).h,
            d3.hsl(d.data.color).s,
            d3.hsl(d.data.color).l,
            d.data.alpha
          );
        });
      // console.log('block', block, newBlock);

      //circles?
      // const arcGenerator = d3
      //   .arc()
      //   .outerRadius(100)
      //   .innerRadius(0)
      //   .startAngle(-Math.PI / 2)
      //   .endAngle(Math.PI / 2);
      //
      // const arc = block
      //   .append('path')
      //   .attr('transform', 'translate(150,120)')
      //   .attr('id', 'circlemagic')
      //   .attr('d', arcGenerator());
    }
  }
};
</script>
