export default function template(templateString, templateVariables) {
  return templateString.replace(/{{(.*?)}}/g, (_, g) => templateVariables[g]);
}
