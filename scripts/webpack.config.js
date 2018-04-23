const createVariants = require('parallel-webpack').createVariants;
const AddModuleExportsPlugin = require('add-module-exports-webpack-plugin');
const path = require('path');

const variants = {
  minified: [true, false],
  target: ['commonjs2', 'umd'],
};

const createConfig = options => {
  const { target, minified } = options;

  const library = 'Cronr';
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
    entry: './src/index.ts',
    mode: options.minified ? 'production' : 'development',
    output: {
      path: path.resolve(process.cwd(), 'lib'),
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
