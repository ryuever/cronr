import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

export default {
  input: 'index.js',
  output: [
		{
			format: 'es',
			file: pkg.module
		},
		{
			format: 'cjs',
			file: pkg.main
		}
  ],
  plugins: [
    typescript(),
    resolve(),
    commonjs({
      include: 'node_modules/**',
    }),
    babel({
      babelrc: false,
      "presets": [
        ["env", {
          "modules": false
        }]
      ],
      "plugins": ["external-helpers", "transform-object-rest-spread"],
      exclude: 'node_modules/**'
    })
  ]
};
