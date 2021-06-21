import { computed, onMounted, onUnmounted, ref } from 'vue';

export default function useBreakpoints() {
  const windowWidth = ref(window.innerWidth);

  const onWidthChange = () => (windowWidth.value = window.innerWidth);
  onMounted(() => window.addEventListener('resize', onWidthChange));
  onUnmounted(() => window.removeEventListener('resize', onWidthChange));

  const bp = computed(() => {
    if (windowWidth.value < 440) return 'xs';
    if (windowWidth.value < 640) return 'sm';
    if (windowWidth.value < 748) return 'md';
    if (windowWidth.value < 1024) return 'lg';
    if (windowWidth.value < 1280) return 'xl';
    return '2xl';
  });

  const width = computed(() => windowWidth.value);

  const upToLargeBreakpoint = computed(() =>
    ['sm', 'md', 'lg'].includes(bp.value)
  );

  return { width, bp, upToLargeBreakpoint };
}
