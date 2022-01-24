import { Rules } from '@/types';
import { onBeforeMount, reactive, toRefs, watch, ToRefs, Ref } from 'vue';

type UseFormRequest<DefaultValues> = {
  name: string;
  defaultValues?: Partial<
    { [Property in keyof DefaultValues]: Ref<any> | any }
  >;
};

export type FormState = {
  name: string;
  values: Record<string, any>;
  errors: Record<string, string[]>;
  rules: Record<string, Rules | undefined>;
  defaultValues: Record<string, any>;
};

export type FormInstance = ToRefs<FormState> & {
  register: (name: string, rules?: Rules) => any;
  onChange: (name: string, value: any) => void;
  handleSubmit: (submit: () => void) => void;
};

export const FormContextSymbol = Symbol('FORM_CONTEXT');

export default function useForm<DefaultValues>({
  name: formName,
  defaultValues = {}
}: UseFormRequest<DefaultValues>): FormInstance {
  onBeforeMount(() => {
    if (!formName) {
      throw new Error(
        `Failed to create a form instance. No form name was provided.`
      );
    }
    formInstance.name = formName;
    registerDefaultValues();
  });

  /**
   * STATE
   */
  // each useForm call spawns its own instance to support
  // the usage of multiple forms on the same page
  const formInstance = reactive<FormState>({
    name: '',
    values: {},
    errors: {},
    rules: {},
    defaultValues: {}
  });

  /**
   * METHODS
   */
  function registerDefaultValues() {
    formInstance.defaultValues = defaultValues;
    for (const key of Object.keys(defaultValues)) {
      formInstance.values[key] = defaultValues[key];
    }
  }

  // this method is used to pass in a form value to a field
  // make sure it is passed to the :value prop or an equivalent
  // as it is bound only one way (read only)
  function register(name: string, rules?: Rules) {
    // invalid name
    if (name === '') {
      throw new Error(
        `Failed to register input for form [${formName}], name was empty string.`
      );
    }
    // if the field isn't registered yet set it up with an empty value
    if (!formInstance.values[name]) {
      formInstance.values[name] = '';
    }
    // register any rules the field has
    if (!formInstance.rules[name] && rules?.length) {
      formInstance.rules[name] = rules;
    }
    // return the value
    return formInstance.values[name];
  }

  // call this function to update bound form values
  function onChange(name: string, value: any) {
    if (formInstance.values[name] === undefined) {
      throw new Error(
        `[${name}] is not a registered input for form [${formInstance.name}]`
      );
    }
    formInstance.values[name] = value;

    // validate against any rules that might be registered
    // for this form field
    const rules = formInstance.rules[name];
    if (rules?.length) {
      const failedRules = rules
        .map(rule => {
          const pass = rule(formInstance.values[name]);
          if (typeof pass === 'string') {
            return pass;
          }
        })
        .filter(result => result !== undefined);
      formInstance.errors[name] = failedRules as string[];
    }
  }

  function handleSubmit(submit: () => void) {
    return function() {
      const hasErrors = Object.values(formInstance).every(
        errorListForInput => errorListForInput.length === 0
      );
      if (!hasErrors) {
        submit();
      } else {
        console.log(
          `Form [${formName}] has errors. ${JSON.stringify(
            formInstance.errors
          )}`
        );
      }
    };
  }

  watch(
    () => formInstance.values,
    () => {
      console.log('f', formInstance.values);
    },
    {
      deep: true
    }
  );

  return {
    ...toRefs(formInstance),
    register,
    onChange,
    handleSubmit
  };
}
