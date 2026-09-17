import { afterEach, describe, it, expect } from 'vitest';
import { applyRuntimeOidc, environment } from './environment';

const initial = { ...environment.oidc };
const server = {
  authority: 'https://idp.server.example/realms/okdp',
  clientId: 'server-client',
  scope: 'openid offline_access admin',
};

describe('applyRuntimeOidc', () => {
  afterEach(() => {
    environment.oidc = { ...initial };
  });

  it('never requests offline_access by default', () => {
    expect(environment.oidc.scope.split(' ')).not.toContain('offline_access');
  });

  it('keeps what /config.js set', () => {
    applyRuntimeOidc(server);
    expect(environment.oidc.authority).toBe('https://keycloak.test.invalid/realms/test');
    expect(environment.oidc.clientId).toBe('okdp-ui-test');
  });

  it('never takes the scope from the server', () => {
    applyRuntimeOidc(server, { authority: '', clientId: '' });
    expect(environment.oidc.scope).toBe(initial.scope);
  });

  it('fills in an authority and client id /config.js left unset', () => {
    applyRuntimeOidc(server, { authority: '', clientId: '' });
    expect(environment.oidc.authority).toBe(server.authority);
    expect(environment.oidc.clientId).toBe(server.clientId);
  });

  it('takes only the client id for the configured authority', () => {
    applyRuntimeOidc(
      { ...server, authority: initial.authority },
      { authority: initial.authority, clientId: '' },
    );
    expect(environment.oidc.authority).toBe(initial.authority);
    expect(environment.oidc.clientId).toBe(server.clientId);
  });

  it('ignores a client id issued by another authority', () => {
    applyRuntimeOidc(server, { authority: initial.authority, clientId: '' });
    expect(environment.oidc.authority).toBe(initial.authority);
    expect(environment.oidc.clientId).toBe(initial.clientId);
  });

  it('ignores an incomplete answer', () => {
    applyRuntimeOidc(undefined, { authority: '', clientId: '' });
    applyRuntimeOidc(
      { authority: server.authority, clientId: '' },
      { authority: '', clientId: '' },
    );
    expect(environment.oidc).toEqual(initial);
  });
});
