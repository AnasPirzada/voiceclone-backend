import { useCallback } from "react";
import { filesApi } from "@/lib/api/files";

export function useFiles() {
  const downloadFile = useCallback(async (fileId: string, filename: string) => {
    const blob = await filesApi.download(fileId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const getStreamUrl = useCallback((fileId: string) => {
    return filesApi.stream(fileId);
  }, []);

  const deleteFile = useCallback(async (fileId: string) => {
    await filesApi.delete(fileId);
  }, []);

  return { downloadFile, getStreamUrl, deleteFile };
}
