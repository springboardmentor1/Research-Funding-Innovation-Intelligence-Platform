import { describe, it, expect, vi } from 'vitest';
import client from '../api/client';

describe('API Client Configuration', () => {
  it('should have base URL configured', () => {
    expect(client).toBeDefined();
    expect(client.defaults).toBeDefined();
    expect(client.defaults.baseURL).toBeDefined();
  });

  it('should have interceptors for auth', () => {
    expect(client.interceptors).toBeDefined();
    expect(client.interceptors.request).toBeDefined();
    expect(client.interceptors.response).toBeDefined();
  });

  it('should have CRUD methods', () => {
    expect(client.post).toBeDefined();
    expect(client.get).toBeDefined();
    expect(client.put).toBeDefined();
    expect(client.delete).toBeDefined();
  });
});
