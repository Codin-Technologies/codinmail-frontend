export const signKeys = {
  all: ['sign'] as const,
  lists: (workspaceId: string) => [...signKeys.all, workspaceId, 'list'] as const,
  list: (workspaceId: string, filters?: unknown) =>
    [...signKeys.all, workspaceId, 'list', filters] as const,
  stats: (workspaceId: string) => [...signKeys.all, workspaceId, 'stats'] as const,
  detail: (workspaceId: string, requestId: string) =>
    [...signKeys.all, workspaceId, 'request', requestId] as const,
  recipients: (workspaceId: string, requestId: string) =>
    [...signKeys.all, workspaceId, 'request', requestId, 'recipients'] as const,
  audit: (workspaceId: string, requestId: string) =>
    [...signKeys.all, workspaceId, 'request', requestId, 'audit'] as const,
  integrity: (workspaceId: string, requestId: string) =>
    [...signKeys.all, workspaceId, 'request', requestId, 'integrity'] as const,
  completion: (workspaceId: string, requestId: string) =>
    [...signKeys.all, workspaceId, 'request', requestId, 'completion'] as const,
};
