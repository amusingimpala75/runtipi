/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
const path = require('path');

const commandArgs = process.argv.slice(2);

const nativeNodeModulesPlugin = () => ({
  name: 'native-node-modules',
  setup(build) {
    // If a ".node" file is imported within a module in the "file" namespace, resolve
    // it to an absolute path and put it into the "node-file" virtual namespace.
    build.onResolve({ filter: /\.node$/, namespace: 'file' }, (args) => {
      const resolvedId = require.resolve(args.path, {
        paths: [args.resolveDir],
      });
      if (resolvedId.endsWith('.node')) {
        return {
          path: resolvedId,
          namespace: 'node-file',
        };
      }
      return {
        path: resolvedId,
      };
    });

    // Files in the "node-file" virtual namespace call "require()" on the
    // path from esbuild of the ".node" file in the output directory.
    build.onLoad({ filter: /.*/, namespace: 'node-file' }, (args) => ({
      contents: `
              import path from ${JSON.stringify(args.path)}
              try { module.exports = require(path) }
              catch {}
            `,
      resolveDir: path.dirname(args.path),
    }));

    // If a ".node" file is imported within a module in the "node-file" namespace, put
    // it in the "file" namespace where esbuild's default loading behavior will handle
    // it. It is already an absolute path since we resolved it to one above.
    build.onResolve({ filter: /\.node$/, namespace: 'node-file' }, (args) => ({
      path: args.path,
      namespace: 'file',
    }));

    // Tell esbuild's default loading behavior to use the "file" loader for
    // these ".node" files.
    const opts = build.initialOptions;
    opts.loader = opts.loader || {};
    opts.loader['.node'] = 'file';
  },
});

/* Bundle server */
esbuild.build({
  entryPoints: ['./src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  external: ['pg-native'],
  sourcemap: commandArgs.includes('--sourcemap'),
  watch: commandArgs.includes('--watch'),
  outfile: 'dist/server.bundle.js',
  plugins: [nativeNodeModulesPlugin()],
  logLevel: 'info',
  minifySyntax: true,
  minifyWhitespace: true,
});

const glob = require('glob');

/* Migrations */
const migrationFiles = glob.sync('./src/config/migrations/*.ts');

esbuild.buildSync({
  entryPoints: migrationFiles,
  platform: 'node',
  target: 'node18',
  minify: false,
  outdir: 'dist/config/migrations',
  logLevel: 'info',
  format: 'cjs',
  minifySyntax: true,
  minifyWhitespace: true,
});