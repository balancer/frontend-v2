const modules = import.meta.glob('./**/*.json', {
  eager: true,
});

export default Object.fromEntries(
  Object.keys(modules).map(fileName => [
    fileName.replace('./', '').replace('.json', ''),
    //@ts-ignore
    modules[fileName].default,
  ])
);
