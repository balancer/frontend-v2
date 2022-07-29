export function generateTemplate(story: string): string {
  return `
<div :class="{ dark: args.darkMode }">
  <div id="storybook-app">
    ${story}
  </div>
</div>`;
}
