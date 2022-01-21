import { inject } from "vue";
import { FormContextSymbol } from "./useForm";


export default function useFormContext() {

  const formContext = inject(FormContextSymbol);

  console.log('contexst', formContext)
  return formContext;
}