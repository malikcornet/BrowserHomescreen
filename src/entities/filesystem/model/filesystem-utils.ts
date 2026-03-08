import { DirectoryItem } from "./directory-item";
import { FileItem } from "./file-item";
import type { FileSystemItemBase } from "./filesystem-item";

const URL_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

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

export const getFileSystemItemKey = (item: FileSystemItemBase, index: number): string => {
  return `${item.kind}-${item.name}-${index}`;
};
