const path = require('path');
const fs = require('fs');

const network = process.argv[2] || 'docker-parity';
const networkCamelcase = process.argv[2] || 'dockerParity';

function contractAddress(contractName) {
  const contractArtifactPath = path.resolve(
    __dirname,
    '../../core/deployments/artifacts/' +
      networkCamelcase +
      '/' +
      contractName +
      '.json'
  );
  const file = fs.readFileSync(contractArtifactPath, 'utf8');
  const json = JSON.parse(file);
  return json.address;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const jsonConfigFilePath = path.resolve(
  __dirname,
  '../src/lib/utils/balancer/configs/' + network + '.json'
);
const doc = JSON.parse(fs.readFileSync(jsonConfigFilePath, 'utf8'));

Object.entries(doc).forEach(([contractName]) => {
  try {
    const address = contractAddress(capitalizeFirstLetter(contractName));
    doc[contractName] = address;
  } catch (err) {
    const msg =
      'Cannot find ' +
      network +
      ' contract artifacts for ' +
      contractName +
      ' - missing deployment artifacts?';
    console.log(msg);
  }
});

fs.writeFile(jsonConfigFilePath, JSON.stringify(doc, null, 2), err => {
  if (err) {
    console.log(err);
  }
});
