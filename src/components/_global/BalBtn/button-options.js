const buttonColors = [
  'primary',
  'gray',
  'red',
  'white',
  'blue',
  'pink',
  'yellow',
  'transparent',
];

/**
 *
 * Tailwind deletes all the dynamic classes like the ones in this file.
 * We used to use safelist setup:
 * // https://tailwindcss.com/docs/content-configuration#safelisting-classes
 * // https://github.com/tailwindlabs/tailwindcss/discussions/10079
 *
 * But it was including too many unused styles and it was difficult to maintain.
 * Using this function is unit tested and easier to maintain.
 */
const generateButtonClassSafelist = () => {
  return buttonColors.reduce((safelist, color) => {
    return [
      ...safelist,

      gradientFrom(color),
      gradientTo(color),

      hoverFrom(color),
      hoverTo(color),

      loadingFrom(color),
      loadingTo(color),

      backgroundFlat(color),
      hoverBackgroundFlat(color),
      darkBackgroundFlat(color),
      darkHoverBackgroundFlat(color),

      loadingBackground(color),
      loadingDarkBackground(color),

      background(color),
      darkBackground(color),
      hoverBackground(color),
      darkHoverBackground(color),

      border(color),
      darkBorder(color),
      darkHoverBorder(color),
      darkFocusBorder(color),

      text(color),
      darkText(color),
    ];
  }, []);
};

const gradientFrom = fromColor => `from-${fromColor}-600`;
const gradientTo = toColor => `to-${toColor}-600`;

const hoverFrom = fromColor => `hover:from-${fromColor}-700`;
const hoverTo = toColor => `hover:to-${toColor}-700`;

const loadingFrom = fromColor => `from-${fromColor}-400`;
const loadingTo = toColor => `to-${toColor}-400`;

const backgroundFlat = color => `bg-${color}-50`;
const hoverBackgroundFlat = color => `hover:bg-${color}-100`;
const darkBackgroundFlat = color => `dark:bg-${color}-50`;
const darkHoverBackgroundFlat = color => `dark:hover:bg-${color}-700`;

const loadingBackground = color => `bg-${color}-400`;
const loadingDarkBackground = color => `dark:bg-${color}-dark-400`;

const background = color => `bg-${color}-600`;
const darkBackground = color => `dark:bg-${color}-gray-400`;
const hoverBackground = color => `hover:bg-${color}-700`;
const darkHoverBackground = color => `dark:hover:bg-${color}-gray-600`;

const border = color => `border-${color}-200`;
const darkBorder = color => `dark:border-${color}-700`;
const darkHoverBorder = color => `dark:hover:border-${color}-600`;
const darkFocusBorder = color => `dark:focus:border-${color}-600`;

const text = color => `text-${color}-500 `;
const darkText = color => `dark:text-${color}-400`;

module.exports = {
  gradientFrom,
  gradientTo,
  hoverFrom,
  hoverTo,
  loadingFrom,
  loadingTo,
  backgroundFlat,
  darkBackgroundFlat,
  darkHoverBackgroundFlat,
  hoverBackgroundFlat,
  hoverBackground,
  loadingBackground,
  loadingDarkBackground,
  background,
  darkHoverBackground,
  darkBackground,
  border,
  darkBorder,
  darkHoverBorder,
  text,
  darkText,
  darkFocusBorder,
  generateButtonClassSafelist,
};
