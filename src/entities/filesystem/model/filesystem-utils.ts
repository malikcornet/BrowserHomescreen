import { DirectoryItem } from "./directory-item";
import { FileItem } from "./file-item";
import type { FileSystemItemBase } from "./filesystem-item";

const URL_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

export const isDirectoryItem = (item: FileSystemItemBase): item is DirectoryItem => {
  return item.kind === "directory";
};

export const isFileItem = (item: FileSystemItemBase): item is FileItem => {
  return item.kind === "file";
};

export const resolveFileUrl = (url: string): string => {
  const trimmedUrl = url.trim();

  return URL_SCHEME_PATTERN.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
};

export const getFaviconUrlForFileUrl = (url: string): string | null => {
  const normalizedUrl = url.trim();

  if (!normalizedUrl) {
    return null;
  }

  try {
    const resolvedUrl = new URL(resolveFileUrl(normalizedUrl));

    if (!HTTP_PROTOCOLS.has(resolvedUrl.protocol)) {
      return null;
    }

    return `https://www.google.com/s2/favicons?sz=4&domain_url=${encodeURIComponent(resolvedUrl.origin)}`;
  } catch {
    return null;
  }
};

export const getFileSystemItemKey = (item: FileSystemItemBase, index: number): string => {
  return `${item.kind}-${item.name}-${index}`;
};
