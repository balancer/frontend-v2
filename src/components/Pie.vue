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
    const innerRadius = 1 / 2; //.5;
    this.chartLayer = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    this.arc = d3
      .arc()
      .outerRadius(chartHeight / 2)
      .innerRadius(innerRadius * (chartHeight / 2)); //4
    // .padAngle(0.03)
    // .cornerRadius(2);
    this.pieG = this.chartLayer
      .append('g')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight / 2})`);
    this.drawChart(this.data, chartHeight, innerRadius);
  },
  props: ['data'],
  watch: {
    data(newData) {
      const svg = d3.select(this.$el);
      const height = svg.attr('height');
      const innerRadius = 1 / 2;
      this.drawChart(newData, height, innerRadius);
    }
  },
  methods: {
    drawChart(data, height, innerRadius) {
      const svg = d3.select('svg');

      const TAU = 6.2318;
      const totalSize = data.reduce((result, e) => result + e.value, 0);
      const numOfSlices = 12; // Simplify the pool to this amount of slices

      const newArray = [];
      let alpha, name, gradient;

      // Normalize values and create the gradient slices
      data.forEach(d => {
        d.value = d.value / totalSize;
        const slices = d.value * numOfSlices;
        for (let n = 0; n < slices; n++) {
          alpha = 0.25 + (0.75 * (slices - n)) / slices;
          name = d.name + '-slice-' + n;
          const z = 1 - n / slices;
          const z2 = 1 - (n + 1) / slices;
          newArray.push({
            name: name,
            token: d.name,
            percentage: Math.floor(d.value * 100),
            class: n === 0 ? 'header' : 'tail',
            color: d3.hsl(
              d3.hsl(d.color).h * z + d3.hsl(d.color2).h * (1 - z),
              d3.hsl(d.color).s * z + d3.hsl(d.color2).s * (1 - z),
              d3.hsl(d.color).l * z + d3.hsl(d.color2).l * (1 - z),
              1
            ),
            colorTo: d3.hsl(
              d3.hsl(d.color).h * z2 + d3.hsl(d.color2).h * (1 - z2),
              d3.hsl(d.color).s * z2 + d3.hsl(d.color2).s * (1 - z2),
              d3.hsl(d.color).l * z2 + d3.hsl(d.color2).l * (1 - z2),
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
        if (newArray.length > numOfSlices && newArray[i].class !== 'header')
          newArray.splice(i, 1);
      }

      // Define gradients
      newArray.forEach((d, i) => {
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
      block
        .enter()
        .append('g')
        .classed('arc', true)
        .append('path')
        .attr('d', this.arc)
        .attr('id', d => 'arc-' + d.data.name)
        .attr('class', 'arc')
        .attr('class', d => 'arc-token-' + d.data.token)
        .attr('fill', d => 'url(#svgGradient-' + d.data.name + ')')
        .attr('stroke', d => 'url(#svgGradient-' + d.data.name + ')')
        .attr('stroke-width', 0.5)
        .on('mouseover', (ev, el) => {
          d3.select('#curve-text-' + el.data.token)
            .transition()
            .duration(1000)
            .attr('transform', 'rotate(30)')
            .attr('text-shadow', 'black 2px 2px 2px')
            .attr('opacity', 1);

          d3.select('#logo-' + el.data.token)
            .transition()
            .duration(100)
            .attr('opacity', 0);

          d3.select('#main-value')
            .text(el.data.percentage + '%')
            .transition()
            .duration(500)
            .attr('opacity', 1);

          d3.select('#main-symbol')
            .text(el.data.token)
            .transition()
            .duration(2000)
            .attr('opacity', 0.5);

          // d3.selectAll('.arc')
          //   .transition()
          //   .duration(10)
          //   .attr('opacity', 1);
          //
          // d3.selectAll('.arc-token-' + el.data.token)
          //   .transition()
          //   .duration(100)
          //   .attr('opacity', 0.5);

          // After some time, turn it all back
          setTimeout(function() {
            d3.select('#curve-text-' + el.data.token)
              .transition()
              .duration(1000)
              .attr('transform', 'rotate(0)')
              .attr('opacity', 0);

            d3.select('#logo-' + el.data.token)
              .transition()
              .duration(1000)
              .attr('opacity', 1);

            d3.select('#main-value')
              .transition()
              .duration(2000)
              // .attr('transform', 'translate(0,-20)')
              .attr('opacity', 0);

            d3.select('#main-symbol')
              .transition()
              .duration(1500)
              // .attr('transform', 'translate(0,20)')
              .attr('opacity', 0);

            d3.selectAll('.arc-token-' + el.data.token)
              .transition()
              .duration(100)
              // .attr('transform', 'translate(0,-1)')
              .attr('opacity', 1);
          }, 5000);
        });

      // for (var i = 0; i < 100; i++) {
      //   setTimeout(function() {
      //     d3.select('#main-value').text(i);
      //   }, i * 200);
      // }

      // draw semicircles
      let c, angle, x, y;
      for (let i = newArray.length - 1; i >= 0; i--) {
        c = newArray[i];
        angle = i / numOfSlices + 0.01;

        if (c.class === 'header') {
          x = height * (1 / 2 + (3 / 4) * innerRadius * Math.sin(angle * TAU));
          y = height * (1 / 2 - (3 / 4) * innerRadius * Math.cos(angle * TAU));
          // 3/4 is an approximation derived mostly from trial than logic
          // x = height * (1 / 2 + (3 / 8) * Math.sin(angle * TAU));
          // y = height * (1 / 2 - (3 / 8) * Math.cos(angle * TAU));
          const svg = d3
            .select('svg')
            .append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')');

          // Function is used
          const arc = d3
            .arc()
            .innerRadius(0)
            .outerRadius((height * (1 - innerRadius)) / 4) // 8
            .startAngle(TAU * (angle + 0.5))
            .endAngle(TAU * (angle + 1.0));

          svg
            .append('path')
            .attr('class', 'arc')
            .attr('class', 'arc-token-' + c.token)
            .attr('d', arc)
            .attr('id', 'mycircle')
            .attr('fill', c.color);

          // LOGOS
          // x -= 28;
          // y -= 28;

          svg
            .append('g')
            .attr('transform', 'translate(-6,-6)')
            .append('image')
            .attr('class', 'myimage')
            .attr('id', 'logo-' + c.token)
            .attr('xlink:href', 'tokens/token-' + c.token + '.png')
            .attr('width', 12)
            .attr('height', 12);

          // .attr('transform', 'translate(' + x + 'px,' + y + 'px)');

          // Add text
          // const text = svg
          //   .append('text')
          //   .attr('transform', function(d) {
          //     const x = (Math.sin(0) * height) / 2;
          //     const y = (Math.cos(TAU * 0.5) * height) / 2;
          //   })
          //   .attr('text-anchor', 'middle')
          //   .text(function(d) {
          //     return c.token;
          //   });
          //
          const svg2 = d3
            .select('svg')
            .append('g')
            .attr('transform', 'translate(30,30)');
          // textPath
          const arc2 = d3
            .arc()
            .innerRadius(0)
            .outerRadius(height * 0.35) // 8
            .startAngle(TAU * (angle - 0.1))
            .endAngle(TAU * (angle + 0.5));

          // console.log('text', angle, TAU * angle, c);

          svg2
            .append('defs')
            .append('path')
            .attr('id', 'curve-' + c.token)
            .attr('d', arc2)
            .attr('fill', 'none');

          svg2
            .append('text')
            .attr('id', 'curve-text-' + c.token)
            .attr('opacity', 0)
            .append('textPath')
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'middle')
            .attr('xlink:href', '#curve-' + c.token)
            .text(c.token)
            // .text(c.token + ' ' + c.percentage + '%')
            .attr('font-size', '9px')
            .attr('stroke', 'rgba(0,0,0,0.4)')
            .attr('stroke-width', 0.5)
            .attr('fill', '#fff');

          svg2
            .append('use')
            .attr('id', 'curve-line')
            .attr('xlink:href', '#curve');
        }
      }

      svg
        .append('text')
        .attr('x', height / 2)
        .attr('y', height / 2 - 2)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('id', 'main-value')
        .attr('opacity', 0)
        .style('font-size', '10px')
        .style('font-weight', 'light')
        .style('font-family', 'Inter, Helvetica, Arial')
        .text('100');

      svg
        .append('text')
        .attr('x', height / 2)
        .attr('y', height / 2 + 6)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('id', 'main-symbol')
        .attr('opacity', 0)
        .style('font-size', '8px')
        .style('font-weight', 'black')
        .style('font-family', 'Inter, Helvetica, Arial')
        .text('%');
    }
  }
};
</script>
