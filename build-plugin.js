const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function buildPlugin() {
  const pluginDist = path.join(__dirname, 'plugin', 'dist');
  if (!fs.existsSync(pluginDist)) {
    fs.mkdirSync(pluginDist, { recursive: true });
  }

  await esbuild.build({
    entryPoints: [path.join(__dirname, 'plugin', 'code.ts')],
    bundle: true,
    outfile: path.join(__dirname, 'plugin', 'dist', 'code.js'),
    target: 'es2020',
    platform: 'browser',
    sourcemap: false,
    minify: false,
  });

  console.log('Figma plugin built successfully to plugin/dist/code.js');
}

buildPlugin().catch((err) => {
  console.error('Plugin build failed:', err);
  process.exit(1);
});
