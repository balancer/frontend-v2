# BalForm

`<BalForm />` is a useful component for creating wrappers for simple and complex form structures on our frontend. There are a few motivations behind using a form component for creating forms:

- Centralised and instance specific state. The form owns its state and can pass down its state (aka form values) to children at any nested level. This also means not needing to creating and managing your own form state in whichever component / composable that might need to feed into your form.
- Centralised validation. If your component accepts in a rules prop, you can integrate it as a form component (more on this below) and have it validate against all passed in rules, whenever the components value changes. Any errors present during submission of the form will prevent the submission function from executing and a list of errors for each field be exported by the forms instance. 
- Simplified integration**. All you need to do is define the form component you are using as a child of `<BalForm />` to have its values, rules and any change handlers bound to the form, automatically.

  ** Assuming that all child form components (e.g. inputs, radio buttons, complex inputs such as <TokenInput/> have code that allows them to integrate as a form component.


## Usage

```typescript
// somecomponent.vue

/// script

// defines a component instance that will be
// passed into <BalForm />. Names are tied to 
// form instances and are unique. The value returned
// represents the form instance.
const form = useForm({ name: 'my-form' })

function mySubmit(formValues: T) {
 // do stuff
}

/// template
<BalForm :form="form" :submit="form.handleSubmit(mySubmit)"
  <div v-if="form.errors.username.length > 0">There are errors in your username</div>
  <TokenInput name="tokenIn" />
  <input :value="form.register('username', [isLowerCase()])" />
</BalForm>
```

In the above example. `<TokenInput />` is registered as a complex form component. However, all that needs to be done to register this component to the forms state is to simply give it a name and have it as a child of `<BalForm />`. 
The other plain `<input />` component is not a complex component and displays how a plain html input component can be registered.

Any changes to values of either input component will be registered to the form instance and available to consume via `form.values`. Any validation errors that are registered from an inputs rules will be available via `form.errors`. 

Values which the form was submitted with will be passed to the `mySubmit` function, however this function will only be called IF there are no errors inside `form.errors`.

## Registering a complex component
In the above example the `<TokenInput />` component was registered as a complex component. The `TokenInput` component is comprised of two main parts. A token selector (address) and a normal test component (amount). 

Here we have the `BalTextInput` part of this component getting its value through the `getValue` function. This allows it to hook into a form instance IF there is one, and to use the value returned from there, while also ensuring that if this component is not a child of a form, then just behave as it would normally!

In regards to making sure that the value inside the form state is always up to date, we ensure that all changes to the input pass through `handleTextInputChange` which ensures that the forms onChange method is called for that input, while also preserving the original behaviour of emitting the updated value.

The same thing is done for the `TokenSelectInput`.

The register function is a wrapper for "does this input exist in the form instance with a value? if yes, return that value. if not, bind it with an empty value and return that value". 

Why do we need to construct form key though? The `<TokenInput />` component accepts a `name` prop (e.g `tokenIn`) but it has 2 parts to its value, the `address` and the `amount`. The form needs to be able to track both of these values so we simply construct this key so that the form can track each value appropriately in the form of `tokenIn.amount` and `tokenIn.address` for our example below. If there were only one part, this would be uneccessary and only the name would be passed back into `register` and `onChange`.

Registering a component only needs to be done once and makes it super simple to use with a form structure for future UI work!

```typescript
 /// script
function getValue(id: string, fallBack: unknown) {
  const formInputKey = `${props.name}.${id}`;
  // if this component is a child of a <BalForm /> bind it.
  if (formContext) {
    return formContext.register(formInputKey, props.rules as RuleFunction[]);
  }
  return fallBack;
}
function handleTextInputChange(id: string, event) {
  const formInputKey = `${props.name}.${id}`;
  emit('update:weight', event);
  if (formContext) {
    formContext.onChange(formInputKey, event);
  }
}

function handleAddressChange(id: string, event) {
  const formInputKey = `${props.name}.${id}`;
  emit('update:address', event);
  if (formContext) {
    formContext.onChange(formInputKey, event);
  }
}

 // other props omitted
  <BalTextInput
    :modelValue="getValue('amount', _amount)"
    @update:modelValue="handleTextInputChange('amount', $event)"
  >
    <template #prepend>
      <slot name="tokenSelect">
        <TokenSelectInput
          :modelValue="getValue('address', _address)"
          @update:modelValue="handleAddressChange('address', $event)"
        />
      </slot>
     ...
    </template>
```
