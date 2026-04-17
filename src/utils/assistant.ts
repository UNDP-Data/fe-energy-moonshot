import {
  AppliedFilterIntent,
  AssistantProjectSynopsisRequest,
  AssistantProjectSynopsisResponse,
  FilterCatalog,
} from '../Types';
import { getAssistantProxyBaseUrl, parseQueryLocally } from './dashboardFilters';

const buildUrl = (path: string) => `${getAssistantProxyBaseUrl()}${path}`;
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
  throw new Error(message || `Request failed with status ${response.status}`);
};

export const parseQueryWithFallback = async (
  query: string,
  locale: string,
  filterCatalog: FilterCatalog,
): Promise<AppliedFilterIntent> => {
  try {
    const response = await fetchWithTimeout(buildUrl('/api/assistant/parse-query'), {
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
  const response = await fetchWithTimeout(buildUrl('/api/assistant/project-synopsis'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return isOkResponse(response);
};

export const isAssistantAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(
      buildUrl('/api/assistant/health'),
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
