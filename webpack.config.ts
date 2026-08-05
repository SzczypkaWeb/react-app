import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Configuration } from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';

interface FullConfiguration extends Configuration {
  devServer?: DevServerConfiguration;
}

const { ModuleFederationPlugin } = webpack.container;

// Dev server / remote port for this app. Also documented in the PR description
// and README: the 'reactApp' remote is served at http://localhost:8081, with
// remoteEntry.js at http://localhost:8081/remoteEntry.js.
const PORT = 8081;

const config: FullConfiguration = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/index.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    // Required so the remoteEntry.js and its chunks can be resolved correctly
    // when this app is loaded from a different origin (the host shell).
    chunkFilename: '[name].[contenthash].js',
    publicPath: 'auto',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            // tsconfig.json's top-level `module` is CommonJS (required so
            // ts-node/webpack-cli can load *this* config file, which uses
            // CommonJS globals like __dirname). CommonJS output, however,
            // downlevels `import()` into a synchronous `require()` call
            // wrapped in an already-resolved Promise - which happens BEFORE
            // webpack's parser ever sees the code. Webpack's code-splitting
            // only recognizes the literal `import()` syntax, so a downleveled
            // dynamic import silently stops being split into its own chunk.
            //
            // That matters here because src/index.tsx uses `import('./bootstrap')`
            // specifically to create an async boundary: Module Federation needs
            // that boundary to initialize its shared scope (react/react-dom)
            // before any app code that consumes those shared singletons runs.
            // Without a real async chunk, react/react-dom/bootstrap/Widget all
            // get bundled into the synchronous main entry chunk together with
            // the `consume-shared` runtime module, which throws "Shared module
            // is not available for eager consumption" at runtime.
            //
            // Overriding `module`/`moduleResolution` here (only for the app
            // source ts-loader compiles into the bundle, not for the config
            // file itself) keeps native ESM `import()` syntax intact so webpack
            // can actually split it off into an async chunk.
            compilerOptions: {
              module: 'ES2022',
              moduleResolution: 'Bundler',
            },
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
    }),
    new ModuleFederationPlugin({
      name: 'reactApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Widget': './src/Widget',
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
      },
    }),
  ],
  devServer: {
    port: PORT,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    open: true,
  },
};

export default config;
