import apiClient from './api';

export interface RestoreResult {
  message: string;
  restored: Record<string, number>;
}

async function compressGzip(data: Uint8Array): Promise<Blob> {
  const stream = new Blob([data]).stream().pipeThrough(
    new CompressionStream('gzip'),
  );
  return new Response(stream).blob();
}

export const backupApi = {
  exportBackup: async (): Promise<Blob> => {
    const response = await apiClient.post('/backup/export', {}, {
      responseType: 'blob',
      timeout: 120000,
    });
    return response.data;
  },

  restoreBackup: async (params: {
    file: File;
    password?: string;
    oidcIdToken?: string;
  }): Promise<RestoreResult> => {
    const fileBytes = new Uint8Array(await params.file.arrayBuffer());
    const compressed = await compressGzip(fileBytes);

    const headers: Record<string, string> = {
      'Content-Type': 'application/gzip',
    };
    if (params.password) {
      headers['X-Restore-Password'] = params.password;
    }
    if (params.oidcIdToken) {
      headers['X-Restore-OIDC-Token'] = params.oidcIdToken;
    }

    const response = await apiClient.post<RestoreResult>(
      '/backup/restore',
      compressed,
      { headers, timeout: 300000 },
    );
    return response.data;
  },
};
