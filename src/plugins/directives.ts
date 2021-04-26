import { App } from 'vue';

export default function registerDirectives(app: App) {
  app.directive('click-outside', {
    beforeMount(el, binding) {
      el.onClickOutside = function(event) {
        const callback = binding.value;

        if (
          typeof callback === 'function' &&
          !(el === event.target || el.contains(event.target))
        ) {
          callback(event);
        }
      };
      document.body.addEventListener('click', el.onClickOutside);
    },
    unmounted(el) {
      document.body.removeEventListener('click', el.onClickOutside);
    }
  });
}
