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
      const totalSize = data.reduce((result, e) => result + e.value, 0);
      const numOfSlices = 12; // Simplify the pool to this amount of slices

      const newArray = [];
      let alpha, name, gradient;

      // Normalize values and create the gradient slices
      data.forEach((d, i) => {
        d.value = d.value / totalSize;
        const slices = d.value * numOfSlices;
        for (let n = 0; n < slices; n++) {
          alpha = 0.25 + (0.75 * (slices - n)) / slices;
          name = d.name + '-slice-' + n;
          newArray.push({
            name: name,
            class: n == 0 ? 'header' : 'tail',
            color: d3.hsl(
              d3.hsl(d.color).h,
              d3.hsl(d.color).s,
              1 - 0.5 * ((slices - n) / slices),
              1
            ),
            colorTo: d3.hsl(
              d3.hsl(d.color).h,
              d3.hsl(d.color).s,
              1 - 0.5 * ((slices - n - 1) / slices),
              1
            ),
            value: 1,
            alpha: alpha
          });
        }
      });

      // Remove extra tail slices to reduce it back to number of slices desired
      // This will increase the sizes of heads displayed. It is desirable
      for (let i = newArray.length - 1; i >= 0; i--) {
        if (newArray.length > numOfSlices && newArray[i].class != 'header')
          newArray.splice(i, 1);
      }

      // Define gradients
      newArray.forEach((d, i) => {
        const svg = d3.select('svg');
        const defs = svg.append('defs');
        // Angle of gradients
        gradient = defs
          .append('linearGradient')
          .attr('id', 'svgGradient-' + d.name)
          .attr(
            'x1',
            0.5 +
              0.25 * Math.cos(TAU * (0.5 + i / numOfSlices - 0.5 / numOfSlices))
          )
          .attr(
            'x2',
            0.5 + 0.25 * Math.cos(TAU * (i / numOfSlices + 0.5 / numOfSlices))
          )
          .attr(
            'y1',
            0.5 +
              0.25 * Math.sin(TAU * (0.5 + i / numOfSlices - 0.5 / numOfSlices))
          )
          .attr(
            'y2',
            0.5 + 0.25 * Math.sin(TAU * (i / numOfSlices + 0.5 / numOfSlices))
          );

        gradient
          .append('stop')
          .attr('class', 'start')
          .attr('offset', '0%')
          .attr('stop-color', d.color)
          .attr('stop-opacity', 1);

        gradient
          .append('stop')
          .attr('class', 'end')
          .attr('offset', '100%')
          .attr('stop-color', d.colorTo)
          // .attr('stop-color', 'black')
          .attr('stop-opacity', 1);
      });

      const arcs = d3
        .pie()
        .sort(null)
        .value(d => d.value)(newArray);
      const block = this.pieG.selectAll('.arc').data(arcs);
      block.select('path').attr('d', this.arc);

      // DRAW THE BLOCKS
      const newBlock = block
        .enter()
        .append('g')
        .classed('arc', true)
        .append('path')
        .attr('d', this.arc)
        .attr('id', (d, i) => 'arc-' + d.data.name)
        .attr('fill', (d, i) => 'url(#svgGradient-' + d.data.name + ')')
        .attr('stroke', (d, i) => 'url(#svgGradient-' + d.data.name + ')')
        .attr('stroke-width', 0.5);

      // draw semicircles
      let c, angle, x, y;
      for (let i = newArray.length - 1; i >= 0; i--) {
        c = newArray[i];
        angle = i / numOfSlices + 0.01;

        if (c.class == 'header') {
          x = height * (1 / 2 + (3 / 8) * Math.sin(angle * TAU));
          y = height * (1 / 2 - (3 / 8) * Math.cos(angle * TAU));
          const svg = d3
            .select('svg')
            .append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')');

          // Function is used
          const arc = d3
            .arc()
            .innerRadius(0)
            .outerRadius(height / 8)
            .startAngle(TAU * (angle + 0.5))
            .endAngle(TAU * (angle + 1.0));

          svg
            .append('path')
            .attr('class', 'arc')
            .attr('d', arc)
            .attr('id', 'mycircle')
            .attr('fill', c.color);
        }
      }
    }
  }
};
</script>
