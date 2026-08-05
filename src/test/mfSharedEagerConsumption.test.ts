import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

/**
 * Regression test for the Module Federation runtime error:
 *
 *   "Shared module is not available for eager consumption:
 *    webpack/sharing/consume/default/react/react"
 *
 * Root cause: tsconfig.json had `"module": "CommonJS"`. With that setting,
 * ts-loader downlevels the `import('./bootstrap')` dynamic import in
 * src/index.tsx into a synchronous `require('./bootstrap')` call wrapped in
 * an already-resolved Promise. Webpack's code splitting only recognizes the
 * *syntactic* `import()` expression - and by the time webpack's parser sees
 * the ts-loader output, that syntax is already gone. So the "async boundary"
 * pattern (index.tsx -> dynamic import -> bootstrap.tsx) silently stopped
 * creating an async chunk: bootstrap.tsx, Widget.tsx, react and react-dom all
 * got bundled directly into the synchronous `main` entry chunk, alongside the
 * `consume-shared` runtime module for react/react-dom. Since the Module
 * Federation share scope isn't initialized until an async boundary is
 * crossed, consuming the shared module synchronously from `main` throws the
 * eager-consumption error at runtime.
 *
 * This test runs a real build through the project's actual webpack config
 * and loader chain (the same command `pnpm build` runs) and asserts that the
 * `main` entry chunk stays a minimal synchronous shell that does not eagerly
 * pull in react, react-dom, or the shared-consume runtime module - i.e. that
 * the dynamic import in src/index.tsx genuinely creates an async chunk
 * boundary rather than being downleveled into a synchronous require.
 */
describe('Module Federation shared-module async boundary', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stats: any;

  beforeAll(() => {
    const output = execFileSync(
      process.execPath,
      [
        path.join('node_modules', 'webpack', 'bin', 'webpack.js'),
        '--config',
        'webpack.config.ts',
        '--json',
      ],
      { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 1024 * 1024 * 50 },
    );
    stats = JSON.parse(output);
  }, 60_000);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function findChunkByName(name: string): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return stats.chunks.find((chunk: any) => chunk.names?.includes(name));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function moduleNamesOf(chunk: any): string[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (chunk.modules ?? []).map((m: any) => m.name ?? m.identifier ?? '');
  }

  it('produces a successful build with no compile errors', () => {
    expect(stats.errorsCount).toBe(0);
  });

  it('keeps the main entry chunk free of react/react-dom source modules', () => {
    const mainChunk = findChunkByName('main');
    expect(mainChunk).toBeTruthy();

    // Only look at *real* bundled source modules (their identifiers start with
    // './'). Synthetic sharing modules like "provide shared module ... =
    // ./node_modules/.../react-dom/index.js" also mention the react-dom path
    // as text but don't actually bundle react's source into this chunk, so
    // they're intentionally excluded here (and are covered by the dedicated
    // "consume shared module" assertion below instead).
    const pullsInReact = moduleNamesOf(mainChunk)
      .filter((n) => n.startsWith('./'))
      .some((n) => /node_modules[\\/].*[\\/]react(-dom)?[\\/]/.test(n));
    expect(pullsInReact).toBe(false);
  });

  it('keeps the main entry chunk free of the "consume shared module" runtime for react', () => {
    const mainChunk = findChunkByName('main');

    const eagerlyConsumesShared = moduleNamesOf(mainChunk).some((n) =>
      /consume shared module.*react/.test(n),
    );
    expect(eagerlyConsumesShared).toBe(false);
  });

  it('splits src/bootstrap.tsx into a separate (async) chunk rather than bundling it into main', () => {
    const mainChunk = findChunkByName('main');
    expect(
      moduleNamesOf(mainChunk).some((n) => n.includes('src/bootstrap.tsx')),
    ).toBe(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allModuleNames = stats.chunks.flatMap((chunk: any) =>
      moduleNamesOf(chunk),
    );
    expect(
      allModuleNames.some((n: string) => n.includes('src/bootstrap.tsx')),
    ).toBe(true);
  });

  it('resolves the react "consume shared module" only from an async (non-initial) chunk', () => {
    // Registering ("providing") a shared module is safe to do eagerly - only
    // *consuming* one synchronously, before the share scope is initialized,
    // is what throws at runtime. So we assert the consume-shared module for
    // react is reachable only via a non-initial (async) chunk.
    const chunkConsumingReact = stats.chunks.find((chunk: any) =>
      moduleNamesOf(chunk).some(
        (n) => n.startsWith('consume shared module') && n.includes('react@'),
      ),
    );
    expect(chunkConsumingReact).toBeTruthy();
    expect(chunkConsumingReact.initial).toBe(false);
  });
});
