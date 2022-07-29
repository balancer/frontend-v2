# Page Layouts

The components in this directory should only be full page layout
components that include a `<router-view>` tag. Every layout component
exported in the `index.ts` file is auto imported in the root `App.vue` component. This allows for different page components used in the router to use these layouts by setting the route meta -> layout attribute, e.g:

```ts
...
{
    path: '/something',
    name: 'something',
    component: SomethingPage,
    meta: { layout: 'BlankLayout' }
},
...
```
