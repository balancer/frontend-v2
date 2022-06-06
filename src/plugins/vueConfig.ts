export default function setConfig(app) {
  if (process.env.NODE_ENV === 'development') {
    app.config.performance = true;
  }
}
