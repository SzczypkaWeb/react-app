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
    publicPath: 'auto',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ }],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'public/index.html') }),
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
    open: true,
  },
};

export default config;
