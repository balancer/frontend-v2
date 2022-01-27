import { RuleFunction, Rules } from '@/types';
import { get, isEmpty, isPlainObject, set } from 'lodash';
import { onBeforeMount, reactive, ref, Ref } from 'vue';

/**
 * TYPES
 */
type UseFormRequest<T> = {
  name: string;
  defaultValues?: Partial<T>;
};

export type FormState<T> = {
  name: string;
  values: T;
  errors: { [key in keyof T]: string[] };
  rules: { [key in keyof T]: RuleFunction[] | undefined };
  defaultValues: T;
};

export type FormInstance<T> = FormState<T> & {
  register: (name: string, rules?: Rules) => any;
  onChange: (name: string, value: any) => void;
  handleSubmit: (submit: () => void) => void;
  setValue: (name: string, value: any) => void;
};

export type ReactiveFormInstance<T> = FormInstance<T> & {
  values: Record<string, Ref>;
  errors: Record<string, Ref>;
};

function validateAgainst(value: any, rules?: RuleFunction[]) {
  if (rules?.length) {
    const failedRules = rules
      .map(rule => {
        const pass = rule(value);
        if (typeof pass === 'string') {
          return pass;
        }
      })
      .filter(result => result !== undefined);
    return failedRules;
  }
  return [];
}

function toRefRecursive(value: Record<string, any>) {
  if (isEmpty(value)) return {};
  const refObj = {};

  for (const key of Object.keys(value)) {
    // not a leaf node
    if (isPlainObject(value[key])) {
      refObj[key] = toRefRecursive(value[key]);
    } else {
      refObj[key] = ref(value[key]);
    }
  }
  return refObj;
}

/**
 * GLOBAL
 */
const formCache = reactive<Record<string, FormInstance<any>>>({});
export function useFormCache(name: string) {
  return formCache[name];
}

export const FormContextSymbol = Symbol('FORM_CONTEXT');

export default function useForm<T>({
  name: formName,
  defaultValues = {}
}: UseFormRequest<T>) {
  // this initialisation is not in a lifecycle hook as
  // the return operation of this function executes before
  // the beforeMount hook, which means that an undefined
  // value is returned to consumers.
  if (!formCache[formName]) {
    // each useForm call spawns its own instance to support
    // the usage of multiple forms on the same page
    formCache[formName] = reactive<FormInstance<T>>({
      name: formName,
      values: {} as T,
      errors: {} as { [key in keyof T]: string[] },
      rules: {} as { [key in keyof T]: RuleFunction[] | undefined },
      defaultValues: {} as T,
      register,
      onChange,
      setValue,
      handleSubmit
    }) as any;
    registerDefaultValues();
  }

  onBeforeMount(() => {
    if (!formName) {
      throw new Error(
        `Failed to create a form instance. No form name was provided.`
      );
    }
  });

  /**
   * STATE
   */
  const formState = formCache[formName];

  /**
   * METHODS
   */
  function registerDefaultValues() {
    formCache[formName].defaultValues = defaultValues;
    for (const key of Object.keys(defaultValues)) {
      formCache[formName].values[key] = defaultValues[key];
    }
  }

  // this method is used to pass in a form value to a field
  // make sure it is passed to the :value prop or an equivalent
  // as it is bound only one way (read only)
  function register(key: string, rules?: Rules) {
    // invalid key
    if (key === '') {
      throw new Error(
        `Failed to register input for form [${formName}], name was empty string.`
      );
    }
    // if the field isn't registered yet set it up with an empty value
    if (get(formState.values, key) === undefined) {
      set(formState.values, key, '');
    }
    // register any rules the field has
    if (!formState.rules[key] && rules?.length) {
      formState.rules[key] = rules;
    }

    // return the value
    return get(formState.values, key);
  }

  // call this function to update bound form values
  function onChange(key: string, value: any) {
    if (get(formState.values, key) === undefined) {
      throw new Error(
        `[${key}] is not a registered input for form [${formState.name}]`
      );
    }
    set(formState.values, key, value);

    // validate against any rules that might be registered
    // for this form field
    const rules = formState.rules[key];
    const failedRules = validateAgainst(value, rules);
    formState.errors[key] = failedRules as string[];
  }

  function setValue(key: string, value: any) {
    onChange(key, value);
  }

  function handleSubmit(submit: () => void) {
    return function() {
      const hasErrors = Object.values(formState).every(
        errorListForInput => errorListForInput.length === 0
      );
      if (!hasErrors) {
        submit();
      } else {
        console.log(
          `Form [${formName}] has errors. ${JSON.stringify(formState.errors)}`
        );
      }
    };
  }

  return formCache[formName];
}
