import { computed } from 'vue';

export function useChipClasses(props) {
  const sizeClasses = () => {
    switch (props.size) {
      case 'sm':
        return 'p-1 text-xs';
      case 'lg':
        return 'p-2 text-base';
      default:
        return 'p-1 text-sm';
    }
  };

  const bgColorClasses = (): string => {
    if (props.color === 'gradient')
      return 'text-white bg-gradient-to-tr from-blue-500 to-pink-500';
    if (props.color === 'white') return 'bg-white dark:bg-gray-900';
    if (props.color === 'red') return 'text-white bg-red-500';
    if (props.color === 'orange') return 'text-black bg-orange-300';

    return `bg-${props.color}-100 dark:bg-${props.color}-800`;
  };

  const outlineClasses = (): string => {
    if (props.outline) {
      return `border-gray-100 dark:border-gray-900 border shadow-lg`;
    }
    return 'shadow-lg';
  };

  const shapeClasses = () => {
    if (props.rounded) return 'rounded-full';
    return 'rounded';
  };

  return computed(() => {
    return {
      [sizeClasses()]: true,
      [bgColorClasses()]: true,
      [outlineClasses()]: true,
      [shapeClasses()]: true,
    };
  });
}

export function useCloseIconClasses(props) {
  const isGradient = props.color === 'gradient';
  const colorClass = isGradient ? 'text-white' : `text-${props.color}-500`;

  const classes = computed(() => {
    return {
      [colorClass]: true,
    };
  });

  const iconSize = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'xxs';
      case 'lg':
        return 'sm';
      default:
        return 'xs';
    }
  });

  return { classes, iconSize };
}
