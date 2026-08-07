import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

// Azure Static Web Apps doesn't add Access-Control-Allow-Origin to static
// files by default. Once frontend-shell and react-app are deployed as two
// separate Azure Static Web Apps (see task #8), frontend-shell loading this
// app's remoteEntry.js (Module Federation) is a cross-origin request and
// gets blocked by the browser without this config - this file is what makes
// that work in production, mirroring what webpack devServer's
// 'Access-Control-Allow-Origin': '*' header already does in local dev (see
// webpack.config.ts).
describe('staticwebapp.config.json', () => {
  const config = JSON.parse(readFileSync(path.resolve(__dirname, './staticwebapp.config.json'), 'utf-8'));

  it('is valid JSON with a routes array', () => {
    expect(Array.isArray(config.routes)).toBe(true);
  });

  it('allows cross-origin loading of remoteEntry.js', () => {
    const route = config.routes.find((r: { route: string }) => r.route === '/remoteEntry.js');
    expect(route?.headers?.['Access-Control-Allow-Origin']).toBe('*');
  });

  it("doesn't let remoteEntry.js be cached, since its filename is stable (unlike the content-hashed chunks) and must always resolve to the latest remote build", () => {
    const route = config.routes.find((r: { route: string }) => r.route === '/remoteEntry.js');
    expect(route?.headers?.['Cache-Control']).toMatch(/no-cache/);
  });

  it('allows cross-origin loading of the content-hashed Module Federation chunk files too', () => {
    const route = config.routes.find((r: { route: string }) => r.route === '/*.js');
    expect(route?.headers?.['Access-Control-Allow-Origin']).toBe('*');
  });
});
