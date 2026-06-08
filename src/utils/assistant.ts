import {
  AppliedFilterIntent,
  AssistantProjectSynopsisRequest,
  AssistantProjectSynopsisResponse,
  FilterCatalog,
} from '../Types';
import { getMoonshotProxyBaseUrl, parseQueryLocally } from './dashboardFilters';

const buildUrl = (path: string) => `${getMoonshotProxyBaseUrl()}${path}`;
const DEFAULT_REQUEST_TIMEOUT_MS = 45000;
const HEALTH_REQUEST_TIMEOUT_MS = 5000;

const fetchWithTimeout = async (
  input: RequestInfo,
  init?: RequestInit,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('The assistant request timed out. Please try again.');
    }

    throw error;
  } finally {
    window.clearTimeout(timer);
  }
};

const isOkResponse = async (response: Response) => {
  if (response.ok) return response.json();
  const message = await response.text();

  try {
    const parsed = JSON.parse(message);
    if (parsed?.error && typeof parsed.error === 'string') {
      throw new Error(parsed.error);
    }
    if (parsed?.detail && typeof parsed.detail === 'string') {
      throw new Error(parsed.detail);
    }
  } catch (_error) {
    // Fall through to the raw response text when the body is not JSON.
  }

  throw new Error(message || response.statusText || `Request failed with status ${response.status}`);
};

export const parseQueryWithFallback = async (
  query: string,
  locale: string,
  filterCatalog: FilterCatalog,
): Promise<AppliedFilterIntent> => {
  try {
    const response = await fetchWithTimeout(buildUrl('/api/moonshot/parse-query'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        locale,
        filterCatalog,
      }),
    });

    const data = await isOkResponse(response);
    return {
      filters: data.filters || {},
      unresolvedTerms: data.unresolvedTerms || [],
    };
  } catch (_error) {
    return parseQueryLocally(query, filterCatalog);
  }
};

export const fetchProjectSynopsis = async (
  request: AssistantProjectSynopsisRequest,
): Promise<AssistantProjectSynopsisResponse> => {
  const response = await fetchWithTimeout(buildUrl('/api/moonshot/project-synopsis'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return isOkResponse(response);
};

export const resolveProjectDocument = async (request: {
  projectId: string;
  title: string;
  verticalFunded: boolean;
}) => {
  const response = await fetchWithTimeout(buildUrl('/api/moonshot/prodoc'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return isOkResponse(response);
};

export const buildProjectDocumentDownloadUrl = (request: {
  sourceUrl: string;
}) => {
  const url = new URL(buildUrl('/api/moonshot/prodoc/download-url'), window.location.origin);
  url.searchParams.set('url', request.sourceUrl);
  return url.toString();
};

export const isAssistantAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(
      buildUrl('/api/moonshot/health'),
      {
        method: 'GET',
      },
      HEALTH_REQUEST_TIMEOUT_MS,
    );

    const data = await isOkResponse(response);
    return Boolean(data?.ok && data?.configured);
  } catch (_error) {
    return false;
  }
};
