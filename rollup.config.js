import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const browserPlugins = [
    resolve({browser: true}), // so Rollup can properly resolve cuid
    babel({
        exclude: 'node_modules/**'
    }),
    // builtins(),
    commonjs() // so Rollup can convert `ms` to an ES module
]

export default [
    // browser-friendly UMD build
    {
        input: 'src/index.js',
        output: {
            name: 'thinflux',
            file: pkg.browser,
            format: 'umd'
        },
        plugins: browserPlugins,
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    // {
    //     input: 'src/index.js',
    //     external: ['ms'],
    //     output: [
    //         {file: pkg.main, format: 'cjs'},
    //         {file: pkg.module, format: 'es'}
    //     ],
    //
    //     plugins: [
    //         resolve()
    //     ],
    // }
];
