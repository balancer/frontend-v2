import { inject } from 'vue';
import { FormContextSymbol, FormInstance, useFormCache } from './useForm';

/**
 * @param name If supplied, will access the form from the form cache rather than
 * the provided form
 * @returns Form instance
 */
export default function useFormContext<T>(name?: string): FormInstance<T> {
  let formContext: FormInstance<T>;
  if (name && name !== '') {
    formContext = (useFormCache(name) as unknown) as FormInstance<T>;
  } else {
    formContext = inject(FormContextSymbol) as FormInstance<T>;
  }
  return formContext;
}
