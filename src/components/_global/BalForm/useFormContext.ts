import { inject } from 'vue';
import { FormContextSymbol, FormInstance } from './useForm';

export default function useFormContext(): FormInstance {
  const formContext = inject(FormContextSymbol) as FormInstance;
  return formContext;
}
