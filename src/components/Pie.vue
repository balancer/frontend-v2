<template>
  <svg width="500" height="300"></svg>
</template>

<script>
const d3 = require('d3');

export default {
  mounted() {
    const svg = d3.select(this.$el);
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const margin = { top: 20, left: 0, bottom: 30, right: 0 };
    const chartWidth = width - (margin.left + margin.right);
    const chartHeight = height - (margin.top + margin.bottom);
    this.chartLayer = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    this.arc = d3
      .arc()
      .outerRadius(chartHeight / 2)
      .innerRadius(chartHeight / 4)
      .padAngle(0.03)
      .cornerRadius(8);
    this.pieG = this.chartLayer
      .append('g')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight / 2})`);
    this.drawChart(this.data);
  },
  props: ['data'],
  watch: {
    data: function(newData) {
      this.drawChart(newData);
    }
  },
  methods: {
    drawChart(data) {
      const arcs = d3
        .pie()
        .sort(null)
        .value(function(d) {
          return d.value;
        })(data);
      const block = this.pieG.selectAll('.arc').data(arcs);
      block.select('path').attr('d', this.arc);
      const newBlock = block
        .enter()
        .append('g')
        .classed('arc', true);
      newBlock
        .append('path')
        .attr('d', this.arc)
        .attr('id', function(d, i) {
          return 'arc-' + i;
        })
        .attr('fill', d => d3.interpolateCool(Math.random()));
      newBlock
        .append('text')
        .attr('dx', 10)
        .attr('dy', -5)
        .append('textPath')
        .attr('xlink:href', function(d, i) {
          return '#arc-' + i;
        })
        .text(d => d.data.name);
    }
  }
};
</script>
