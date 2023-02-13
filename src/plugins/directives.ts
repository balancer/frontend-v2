import { App } from 'vue';

export default function registerDirectives(app: App) {
  app.directive('click-outside', {
    beforeMount(el, binding) {
      el.__vueOnClickOutside = function (event) {
        const callback = binding.value;
        const path = event.path || (event.composedPath && event.composedPath());

        const isClickOutside = path
          ? path.indexOf(el) < 0
          : !el.contains(event.target);

        if (typeof callback === 'function' && isClickOutside) {
          callback(event);
        }
      };
      document.body.addEventListener('click', el.__vueOnClickOutside);
    },
    unmounted(el) {
      document.body.removeEventListener('click', el.__vueOnClickOutside);
    },
  });
}
