<template>
  <svg
    width="38px"
    height="38px"
    viewBox="0 0 38 38"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <defs>
      <filter
        x="-8.3%"
        y="-3.1%"
        width="116.6%"
        height="108.3%"
        filterUnits="objectBoundingBox"
        id="minus-square-icon-filter-1"
      >
        <feOffset
          dx="0"
          dy="2"
          in="SourceAlpha"
          result="shadowOffsetOuter1"
        ></feOffset>
        <feGaussianBlur
          stdDeviation="2"
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
        ></feGaussianBlur>
        <feColorMatrix
          values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.05 0"
          type="matrix"
          in="shadowBlurOuter1"
          result="shadowMatrixOuter1"
        ></feColorMatrix>
        <feMerge>
          <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
          <feMergeNode in="SourceGraphic"></feMergeNode>
        </feMerge>
      </filter>
    </defs>
    <g
      stroke="none"
      stroke-width="1"
      fill="none"
      fill-rule="evenodd"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <g transform="translate(-71.000000, -764.000000)" stroke="#F0335C">
        <g
          filter="url(#minus-square-icon-filter-1)"
          transform="translate(62.000000, 246.000000)"
        >
          <g transform="translate(19.000000, 521.000000)">
            <g transform="translate(0.000000, 7.000000)">
              <rect
                id="Rectangle"
                x="-0.5"
                y="-0.5"
                width="19"
                height="19"
                rx="2"
              ></rect>
              <line x1="5" y1="9" x2="13" y2="9" id="Path"></line>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>
