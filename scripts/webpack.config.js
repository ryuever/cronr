const createVariants = require('parallel-webpack').createVariants;
const AddModuleExportsPlugin = require('add-module-exports-webpack-plugin');
const path = require('path');

const variants = {
  minified: [true, false],
  lib: ['Cronr', 'CronrCounter'],
  target: ['commonjs2', 'umd'],
};

const entries = {
  'Cronr': './src/index.ts',
  'CronrCounter': './src/CronrCounter.ts',
};

const createConfig = options => {
  const { target, minified, lib } = options;

  const library = lib;
  let filename = library;

  if (target === 'commonjs2') {
    filename = `${filename}.cjs`;
  } else {
    filename = `${filename}.${target}`;
  }

  if (minified) {
    filename = `${filename}.min`;
  }

  filename = `${filename}.js`;

  return {
    entry: entries[library],
    mode: options.minified ? 'production' : 'development',
    output: {
      path: path.resolve(process.cwd(), 'lib', minified ? 'minified' : 'normal'),
      filename,
      library,
      libraryTarget: options.target,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    plugins:
      options.target === 'commonjs2' ? [new AddModuleExportsPlugin()] : [],
    module: {
      rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
    },
  };
};

module.exports = createVariants({}, variants, createConfig);
