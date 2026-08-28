import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  DEFAULT_CURSOR_SETTINGS,
  loadCursorSettings,
  saveCursorSettings,
} from '../local-walkthrough/src/cursorSettings';
import {
  loadSavedRecordings,
  savePreviewPlan,
  saveRecording,
} from '../local-walkthrough/src/storage';
import { WalkthroughPlan } from '../local-walkthrough/src/types';

const testPlan: WalkthroughPlan = {
  defaults: {
    circleDurationMs: 1200,
    circleRadius: 50,
    moveDurationMs: 500,
    pauseMs: 300,
    scrollDurationMs: 700,
  },
  scenes: [
    {
      actions: [],
      caption: '',
      id: 'test',
    },
  ],
  start: {
    x: 0,
    y: 0,
  },
  title: 'Test walkthrough',
};

describe('walkthrough storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('falls back safely when localStorage reads are denied', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });

    expect(loadSavedRecordings()).toEqual([]);
    expect(loadCursorSettings()).toEqual(DEFAULT_CURSOR_SETTINGS);
  });

  it('does not throw when localStorage writes are denied', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });

    expect(() => savePreviewPlan(testPlan)).not.toThrow();
    expect(() => saveCursorSettings(DEFAULT_CURSOR_SETTINGS)).not.toThrow();
    expect(saveRecording(testPlan, 'Denied storage')).toBeUndefined();
  });
});
