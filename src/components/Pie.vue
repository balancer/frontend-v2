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
    this.drawChart(this.data, chartHeight);
  },
  props: ['data'],
  watch: {
    data: newData => this.drawChart(newData)
  },
  methods: {
    drawChart(data, height) {
      const TAU = 6.2318;
      // const newData = data.map();
      // const extraSize = data.length * 10;
      const totalSize = data.reduce((result, e) => result + e.value, 0);
      const numOfSlices = 12; // Simplify the pool to this amount of slices

      const newArray = [];
      data.forEach((d, i) => {
        d.value = d.value / totalSize;
        // newArray.push({ name: d.name, color: d.color, value: 10, alpha: 1 });
        const slices = d.value * numOfSlices;
        for (let n = 0; n < slices; n++) {
          newArray.push({
            name: d.name + '-slice-' + n,
            class: n == 0 ? 'header' : 'tail',
            color: d.color,
            value: 1,
            alpha: 0.25 + (0.75 * (slices - n)) / slices
          });
        }
      });

      // while (newArray.length > 12) {
      for (let i = newArray.length - 1; i >= 0; i--) {
        if (newArray.length > numOfSlices && newArray[i].class != 'header')
          newArray.splice(i, 1);
      }
      // }
      console.log('data', data, totalSize, newArray);

      const arcs = d3
        .pie()
        .sort(null)
        .value(d => d.value)(newArray);
      const block = this.pieG.selectAll('.arc').data(arcs);
      block.select('path').attr('d', this.arc);
      // console.log('drawChart!', data, newArray, 'pie', arcs);
      const svg = d3
        .select('body')
        .append('svg')
        .attr('width', 500)
        .attr('height', 300);

      const defs = svg.append('defs');

      // DEFINE A GRADIENT
      // const gradient = defs
      //   .append('linearGradient')
      //   .attr('id', 'svgGradient')
      //   .attr('x1', '0%')
      //   .attr('x2', '100%')
      //   .attr('y1', '0%')
      //   .attr('y2', '100%');
      //
      // gradient
      //   .append('stop')
      //   .attr('class', 'start')
      //   .attr('offset', '0%')
      //   .attr('stop-color', 'red')
      //   .attr('stop-opacity', 1);
      //
      // gradient
      //   .append('stop')
      //   .attr('class', 'end')
      //   .attr('offset', '100%')
      //   .attr('stop-color', 'blue')
      //   .attr('stop-opacity', 1);

      // DRAW THE BLOCKS

      const newBlock = block
        .enter()
        .append('g')
        .classed('arc', true)
        .append('path')
        .attr('d', this.arc)
        .attr('id', (d, i) => 'arc-' + d.data.name)
        // .attr('fill', 'url(#svgGradient)');
        .attr('fill', function(d, i) {
          return d3.hsl(
            d3.hsl(d.data.color).h,
            d3.hsl(d.data.color).s,
            d3.hsl(d.data.color).l,
            d.data.alpha
          );
        });

      // draw semicircles
      let c, angle, x, y;
      for (let i = newArray.length - 1; i >= 0; i--) {
        c = newArray[i];
        angle = i / numOfSlices + 0.01;
        console.log(
          'data circles',
          i,
          c,
          angle,
          Math.sin(angle),
          Math.cos(angle)
        );

        if (c.class == 'header') {
          x = height * (0.5 + 0.38 * Math.sin(angle * TAU));
          y = height * (0.5 - 0.38 * Math.cos(angle * TAU));
          const svg = d3
            .select('svg')
            .append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')');

          // Function is used
          const arc = d3
            .arc()
            .innerRadius(0)
            .outerRadius(height / 8)
            .startAngle(TAU * (angle + 0.45))
            .endAngle(TAU * (angle + 1.05));

          svg
            .append('path')
            .attr('class', 'arc')
            .attr('d', arc)
            .attr('id', 'mycircle')
            .attr('fill', c.color);
        }
      }

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
