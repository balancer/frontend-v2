import { computed } from 'vue';

export default function useCloseIconClasses(props) {
  const isGradient = props.color === 'gradient';
  const colorClass = isGradient ? 'text-white' : `text-${props.color}-500`;

  const classes = computed(() => {
    return {
      [colorClass]: true
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
