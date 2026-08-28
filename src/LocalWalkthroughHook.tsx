const LOCAL_WALKTHROUGH_SCRIPT_ID = 'local-walkthrough-studio-script';
const LOCAL_WALKTHROUGH_ENTRY = 'local-walkthrough/src/entry.tsx';
const OPEN_RECORDER_EVENT = 'moonshot-walkthrough-open-recorder';
const OPEN_ON_READY_KEY = '__localWalkthroughOpenOnReady';
const LOCALHOST_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

type LocalWalkthroughShortcut = {
  ctrlKey?: boolean;
  key?: string;
  metaKey?: boolean;
  shiftKey?: boolean;
};

type LocalWalkthroughHookOptions = {
  entryPath?: string;
  missingMessage?: string;
  scriptId?: string;
  shortcut?: LocalWalkthroughShortcut;
};

type LocalWalkthroughWindow = Window & {
  __localWalkthroughOpenOnReady?: boolean;
};

const DEFAULT_SHORTCUT: Required<LocalWalkthroughShortcut> = {
  ctrlKey: true,
  key: 'r',
  metaKey: false,
  shiftKey: false,
};

const isLocalDev = () => (
  import.meta.env.DEV
  && typeof window !== 'undefined'
  && LOCALHOST_HOSTS.has(window.location.hostname)
);

const openLocalWalkthrough = () => {
  window.dispatchEvent(new CustomEvent(OPEN_RECORDER_EVENT));
};

const requestOpenOnReady = () => {
  (window as LocalWalkthroughWindow)[OPEN_ON_READY_KEY] = true;
};

const matchesShortcut = (event: KeyboardEvent, shortcut: Required<LocalWalkthroughShortcut>) => (
  event.key.toLowerCase() === shortcut.key.toLowerCase()
  && event.ctrlKey === shortcut.ctrlKey
  && event.metaKey === shortcut.metaKey
  && event.shiftKey === shortcut.shiftKey
);

const loadLocalWalkthrough = ({
  entryPath = LOCAL_WALKTHROUGH_ENTRY,
  missingMessage = 'Local walkthrough studio was not found at local-walkthrough/.',
  scriptId = LOCAL_WALKTHROUGH_SCRIPT_ID,
}: LocalWalkthroughHookOptions = {}) => {
  const existingScript = document.getElementById(scriptId);
  if (existingScript) {
    openLocalWalkthrough();
    return;
  }

  requestOpenOnReady();
  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'module';
  script.src = `${import.meta.env.BASE_URL}${entryPath}`;
  script.dataset.localOnly = 'true';
  script.onload = () => window.setTimeout(openLocalWalkthrough, 0);
  script.onerror = () => {
    script.remove();
    console.info(missingMessage);
  };
  document.body.appendChild(script);
};

export const installLocalWalkthroughHook = (options: LocalWalkthroughHookOptions = {}) => {
  if (!isLocalDev()) return undefined;
  const shortcut = {
    ...DEFAULT_SHORTCUT,
    ...options.shortcut,
  };

  const handleShortcut = (event: KeyboardEvent) => {
    if (!matchesShortcut(event, shortcut)) return;
    event.preventDefault();
    loadLocalWalkthrough(options);
  };

  window.addEventListener('keydown', handleShortcut);
  return () => {
    window.removeEventListener('keydown', handleShortcut);
  };
};
