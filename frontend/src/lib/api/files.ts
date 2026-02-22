import apiClient from "./client";

export const filesApi = {
  download: (fileId: string) =>
    apiClient.get(`/files/${fileId}/download`, { responseType: "blob" }).then((r) => r.data),

  stream: (fileId: string) =>
    `${apiClient.defaults.baseURL}/files/${fileId}/stream`,

  delete: (fileId: string) =>
    apiClient.delete(`/files/${fileId}`).then((r) => r.data),
};
