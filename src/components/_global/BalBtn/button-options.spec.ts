import { generateButtonClassSafelist } from './button-options.js';

test('Generates tailwind safelist for dynamic button options', () => {
  expect(generateButtonClassSafelist()).toEqual([
    'hover:from-primary-700',
    'hover:to-primary-700',
    'from-primary-400',
    'to-primary-400',
    'bg-primary-50',
    'hover:bg-primary-100',
    'dark:bg-primary-50',
    'dark:hover:bg-primary-700',
    'bg-primary-400',
    'dark:bg-primary-dark-400',
    'bg-primary-600',
    'dark:bg-primary-gray-400',
    'hover:bg-primary-700',
    'dark:hover:bg-primary-gray-600',
    'border-primary-200',
    'dark:border-primary-700',
    'dark:hover:border-primary-600',
    'dark:focus:border-primary-600',
    'text-primary-500 ',
    'dark:text-primary-400',
    'hover:from-gradient-700',
    'hover:to-gradient-700',
    'from-gradient-400',
    'to-gradient-400',
    'bg-gradient-50',
    'hover:bg-gradient-100',
    'dark:bg-gradient-50',
    'dark:hover:bg-gradient-700',
    'bg-gradient-400',
    'dark:bg-gradient-dark-400',
    'bg-gradient-600',
    'dark:bg-gradient-gray-400',
    'hover:bg-gradient-700',
    'dark:hover:bg-gradient-gray-600',
    'border-gradient-200',
    'dark:border-gradient-700',
    'dark:hover:border-gradient-600',
    'dark:focus:border-gradient-600',
    'text-gradient-500 ',
    'dark:text-gradient-400',
    'hover:from-gradient-reverse-700',
    'hover:to-gradient-reverse-700',
    'from-gradient-reverse-400',
    'to-gradient-reverse-400',
    'bg-gradient-reverse-50',
    'hover:bg-gradient-reverse-100',
    'dark:bg-gradient-reverse-50',
    'dark:hover:bg-gradient-reverse-700',
    'bg-gradient-reverse-400',
    'dark:bg-gradient-reverse-dark-400',
    'bg-gradient-reverse-600',
    'dark:bg-gradient-reverse-gray-400',
    'hover:bg-gradient-reverse-700',
    'dark:hover:bg-gradient-reverse-gray-600',
    'border-gradient-reverse-200',
    'dark:border-gradient-reverse-700',
    'dark:hover:border-gradient-reverse-600',
    'dark:focus:border-gradient-reverse-600',
    'text-gradient-reverse-500 ',
    'dark:text-gradient-reverse-400',
    'hover:from-gradient-pink-yellow-700',
    'hover:to-gradient-pink-yellow-700',
    'from-gradient-pink-yellow-400',
    'to-gradient-pink-yellow-400',
    'bg-gradient-pink-yellow-50',
    'hover:bg-gradient-pink-yellow-100',
    'dark:bg-gradient-pink-yellow-50',
    'dark:hover:bg-gradient-pink-yellow-700',
    'bg-gradient-pink-yellow-400',
    'dark:bg-gradient-pink-yellow-dark-400',
    'bg-gradient-pink-yellow-600',
    'dark:bg-gradient-pink-yellow-gray-400',
    'hover:bg-gradient-pink-yellow-700',
    'dark:hover:bg-gradient-pink-yellow-gray-600',
    'border-gradient-pink-yellow-200',
    'dark:border-gradient-pink-yellow-700',
    'dark:hover:border-gradient-pink-yellow-600',
    'dark:focus:border-gradient-pink-yellow-600',
    'text-gradient-pink-yellow-500 ',
    'dark:text-gradient-pink-yellow-400',
    'hover:from-gray-700',
    'hover:to-gray-700',
    'from-gray-400',
    'to-gray-400',
    'bg-gray-50',
    'hover:bg-gray-100',
    'dark:bg-gray-50',
    'dark:hover:bg-gray-700',
    'bg-gray-400',
    'dark:bg-gray-dark-400',
    'bg-gray-600',
    'dark:bg-gray-gray-400',
    'hover:bg-gray-700',
    'dark:hover:bg-gray-gray-600',
    'border-gray-200',
    'dark:border-gray-700',
    'dark:hover:border-gray-600',
    'dark:focus:border-gray-600',
    'text-gray-500 ',
    'dark:text-gray-400',
    'hover:from-red-700',
    'hover:to-red-700',
    'from-red-400',
    'to-red-400',
    'bg-red-50',
    'hover:bg-red-100',
    'dark:bg-red-50',
    'dark:hover:bg-red-700',
    'bg-red-400',
    'dark:bg-red-dark-400',
    'bg-red-600',
    'dark:bg-red-gray-400',
    'hover:bg-red-700',
    'dark:hover:bg-red-gray-600',
    'border-red-200',
    'dark:border-red-700',
    'dark:hover:border-red-600',
    'dark:focus:border-red-600',
    'text-red-500 ',
    'dark:text-red-400',
    'hover:from-white-700',
    'hover:to-white-700',
    'from-white-400',
    'to-white-400',
    'bg-white-50',
    'hover:bg-white-100',
    'dark:bg-white-50',
    'dark:hover:bg-white-700',
    'bg-white-400',
    'dark:bg-white-dark-400',
    'bg-white-600',
    'dark:bg-white-gray-400',
    'hover:bg-white-700',
    'dark:hover:bg-white-gray-600',
    'border-white-200',
    'dark:border-white-700',
    'dark:hover:border-white-600',
    'dark:focus:border-white-600',
    'text-white-500 ',
    'dark:text-white-400',
    'hover:from-blue-700',
    'hover:to-blue-700',
    'from-blue-400',
    'to-blue-400',
    'bg-blue-50',
    'hover:bg-blue-100',
    'dark:bg-blue-50',
    'dark:hover:bg-blue-700',
    'bg-blue-400',
    'dark:bg-blue-dark-400',
    'bg-blue-600',
    'dark:bg-blue-gray-400',
    'hover:bg-blue-700',
    'dark:hover:bg-blue-gray-600',
    'border-blue-200',
    'dark:border-blue-700',
    'dark:hover:border-blue-600',
    'dark:focus:border-blue-600',
    'text-blue-500 ',
    'dark:text-blue-400',
  ]);
});
