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
        id="plus-square-filter-1"
        x="-8.3%"
        y="-3.1%"
        width="116.6%"
        height="108.3%"
        filterUnits="objectBoundingBox"
      >
        <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur
          stdDeviation="2"
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
        />
        <feColorMatrix
          values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.05 0"
          type="matrix"
          in="shadowBlurOuter1"
          result="shadowMatrixOuter1"
        />
        <feMerge>
          <feMergeNode in="shadowMatrixOuter1" />
          <feMergeNode in="SourceGraphic" />
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
      <g transform="translate(-73.000000, -890.000000)" stroke="#03953F">
        <g
          filter="url(#plus-square-filter-1)"
          transform="translate(62.000000, 246.000000)"
        >
          <g transform="translate(19.000000, 521.000000)">
            <g transform="translate(2.000000, 126.000000)">
              <g transform="translate(0.000000, 7.000000)">
                <rect
                  id="Rectangle"
                  x="-0.5"
                  y="-0.5"
                  width="19"
                  height="19"
                  rx="1.66666667"
                />
                <line id="Path" x1="9" y1="5" x2="9" y2="13" />
                <line id="Path" x1="5" y1="9" x2="13" y2="9" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>
