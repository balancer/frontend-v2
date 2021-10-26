const isCi = process.env.CI !== undefined;

// Prevent husky from being installed in builds
if (!isCi) {
  require('husky').install();
}
