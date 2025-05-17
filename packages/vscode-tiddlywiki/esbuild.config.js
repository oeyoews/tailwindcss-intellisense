const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

const commonConfig = {
  bundle: true,
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  external: ['vscode'],
  sourcemap: false,
  minify: !isWatch,
  treeShaking: true,
};

const buildConfigs = [
  {
    ...commonConfig,
    entryPoints: ['src/extension.ts'],
    outfile: 'dist/extension.js',
  },
  {
    ...commonConfig,
    entryPoints: ['src/server.ts'],
    outfile: 'dist/server.js',
  }
];

async function build() {
  try {
    if (isWatch) {
      const contexts = await Promise.all(
        buildConfigs.map(config => esbuild.context(config))
      );
      contexts.forEach(ctx => ctx.watch());
      console.log('Watching...');
    } else {
      await Promise.all(
        buildConfigs.map(config => esbuild.build(config))
      );
      console.log('Build complete');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();