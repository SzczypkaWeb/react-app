import { describe, expect, it } from 'vitest';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import config from './webpack.config';

// These tests lock in the Module Federation contract required by the task spec:
//  - the remote is named 'reactApp'
//  - it exposes a placeholder component at './Widget'
//  - react and react-dom are shared as singletons
// They also lock in the general webpack config pattern copied from frontend-shell
// (entry/output/resolve/ts-loader/HtmlWebpackPlugin/devServer).
describe('webpack.config', () => {
  const plugins = config.plugins ?? [];

  function findPlugin<T>(ctor: new (...args: never[]) => T): T {
    const found = plugins.find((p) => p instanceof ctor);
    if (!found) {
      throw new Error(`Expected plugin ${ctor.name} to be configured`);
    }
    return found as T;
  }

  it('sets development mode and a tsx entry point', () => {
    expect(config.mode).toBe('development');
    expect(String(config.entry)).toMatch(/src[\\/]index\.tsx$/);
  });

  it('outputs a bundle with a resolvable publicPath for remote loading', () => {
    expect(config.output?.filename).toBe('bundle.js');
    expect(config.output?.publicPath).toBe('auto');
  });

  it('resolves .tsx/.ts/.js and compiles them via ts-loader', () => {
    expect(config.resolve?.extensions).toEqual(expect.arrayContaining(['.tsx', '.ts', '.js']));

    const rules = config.module?.rules ?? [];
    const tsRule = rules.find(
      (rule) =>
        rule &&
        typeof rule === 'object' &&
        'test' in rule &&
        (rule.test as RegExp)?.toString() === /\.tsx?$/.toString(),
    );
    expect(tsRule).toBeDefined();
    expect((tsRule as { use: unknown }).use).toBe('ts-loader');
  });

  it('configures HtmlWebpackPlugin', () => {
    expect(() => findPlugin(HtmlWebpackPlugin)).not.toThrow();
  });

  function getMfOptions() {
    const mfPlugin = findPlugin(webpack.container.ModuleFederationPlugin);
    // webpack stores the constructor options on `options` (some versions used
    // `_options`); support both so this test isn't brittle across webpack versions.
    const withOptions = mfPlugin as unknown as {
      options?: Record<string, unknown>;
      _options?: Record<string, unknown>;
    };
    const options = withOptions.options ?? withOptions._options;
    if (!options) {
      throw new Error('Could not read ModuleFederationPlugin options');
    }
    return options;
  }

  it('exposes itself as the "reactApp" Module Federation remote with a ./Widget module', () => {
    const options = getMfOptions();

    expect(options.name).toBe('reactApp');
    expect(options.filename).toBe('remoteEntry.js');
    expect(options.exposes).toMatchObject({ './Widget': expect.stringMatching(/Widget/) });
  });

  it('shares react and react-dom as singletons', () => {
    const options = getMfOptions();
    const shared = options.shared as Record<string, { singleton?: boolean }>;

    expect(shared.react.singleton).toBe(true);
    expect(shared['react-dom'].singleton).toBe(true);
  });

  it('runs the dev server on a fixed, documented port', () => {
    expect(config.devServer?.port).toBe(8081);
  });
});
