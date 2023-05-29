import { spawn } from 'child_process';

async function buildWithChunkSizeCheck() {
  const buildCommand = spawn('npm run build', {
    shell: true,
    stdio: ['inherit', 'inherit'],
  });

  buildCommand.stderr.on('data', data => {
    const output = data.toString();
    failWhenBigChunkDetected(output);
  });
}

function failWhenBigChunkDetected(data) {
  const bigChunksText = '(!) Some chunks are larger than';
  process.stderr.write(data);
  if (data.includes(bigChunksText)) {
    console.error(
      '📦🚨 Build contains big chunks exceeding the max size limit. Review your changes to fix this problem before deploying this version.'
    );
    process.exit(1);
  }
}

buildWithChunkSizeCheck();
