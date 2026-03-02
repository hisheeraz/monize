import { describe, it, expect, beforeEach } from 'vitest';
import { useConnectionStore } from './connectionStore';

describe('connectionStore', () => {
  beforeEach(() => {
    useConnectionStore.setState({ isBackendDown: false, downSince: null });
  });

  it('initializes with backend up', () => {
    const state = useConnectionStore.getState();
    expect(state.isBackendDown).toBe(false);
    expect(state.downSince).toBeNull();
  });

  it('sets backend down with timestamp', () => {
    const before = Date.now();
    useConnectionStore.getState().setBackendDown();
    const state = useConnectionStore.getState();
    expect(state.isBackendDown).toBe(true);
    expect(state.downSince).toBeGreaterThanOrEqual(before);
    expect(state.downSince).toBeLessThanOrEqual(Date.now());
  });

  it('guards against redundant setBackendDown calls', () => {
    useConnectionStore.getState().setBackendDown();
    const firstDownSince = useConnectionStore.getState().downSince;

    // Second call should be a no-op (guard prevents redundant updates)
    useConnectionStore.getState().setBackendDown();
    const secondDownSince = useConnectionStore.getState().downSince;

    expect(secondDownSince).toBe(firstDownSince);
  });

  it('sets backend up and clears timestamp', () => {
    useConnectionStore.getState().setBackendDown();
    expect(useConnectionStore.getState().isBackendDown).toBe(true);

    useConnectionStore.getState().setBackendUp();
    const state = useConnectionStore.getState();
    expect(state.isBackendDown).toBe(false);
    expect(state.downSince).toBeNull();
  });

  it('allows setting down again after recovery', () => {
    useConnectionStore.getState().setBackendDown();
    useConnectionStore.getState().setBackendUp();
    useConnectionStore.getState().setBackendDown();

    expect(useConnectionStore.getState().isBackendDown).toBe(true);
    expect(useConnectionStore.getState().downSince).not.toBeNull();
  });
});
