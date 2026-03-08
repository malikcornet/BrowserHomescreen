import { DirectoryItem } from "./directory-item";
import { FileItem } from "./file-item";
import type { FileSystemItemBase, FileSystemItemKind } from "./filesystem-item";
import { isFileItem } from "./filesystem-utils";

export const NEW_FOLDER_BASE_NAME = "New Folder";
export const NEW_FILE_BASE_NAME = "New File";
export const NEW_FILE_DEFAULT_URL = "about:blank";

const normalizeItemName = (name: string): string => {
  return name.trim();
};

const getUniqueItemName = (
  parentDirectory: DirectoryItem,
  baseName: string,
  excludedItem?: FileSystemItemBase,
): string => {
  const existingNames = new Set(
    parentDirectory.children
      .filter((item) => item !== excludedItem)
      .map((item) => item.name.toLowerCase()),
  );

  if (!existingNames.has(baseName.toLowerCase())) {
    return baseName;
  }

  let suffix = 2;

  while (existingNames.has(`${baseName} (${suffix})`.toLowerCase())) {
    suffix += 1;
  }

  return `${baseName} (${suffix})`;
};

export const createDirectoryIn = (
  parentDirectory: DirectoryItem,
  baseName = NEW_FOLDER_BASE_NAME,
): DirectoryItem => {
  const normalizedBaseName = normalizeItemName(baseName) || NEW_FOLDER_BASE_NAME;
  const directoryName = getUniqueItemName(parentDirectory, normalizedBaseName);
  const newDirectory = new DirectoryItem(directoryName, []);

  parentDirectory.children.push(newDirectory);

  return newDirectory;
};

export const createFileIn = (
  parentDirectory: DirectoryItem,
  baseName = NEW_FILE_BASE_NAME,
  url = NEW_FILE_DEFAULT_URL,
): FileItem => {
  const normalizedBaseName = normalizeItemName(baseName) || NEW_FILE_BASE_NAME;
  const fileName = getUniqueItemName(parentDirectory, normalizedBaseName);
  const newFile = new FileItem(fileName, url.trim() || NEW_FILE_DEFAULT_URL);

  parentDirectory.children.push(newFile);

  return newFile;
};

export const findItemInDirectory = (
  parentDirectory: DirectoryItem,
  itemName: string,
  itemKind: FileSystemItemKind,
): FileSystemItemBase | null => {
  return (
    parentDirectory.children.find((item) => item.name === itemName && item.kind === itemKind) ?? null
  );
};

export const renameItem = (
  parentDirectory: DirectoryItem,
  targetItem: FileSystemItemBase,
  requestedName: string,
): FileSystemItemBase | null => {
  if (!parentDirectory.children.includes(targetItem)) {
    return null;
  }

  const normalizedRequestedName = normalizeItemName(requestedName);

  if (!normalizedRequestedName) {
    return null;
  }

  const nextName = getUniqueItemName(parentDirectory, normalizedRequestedName, targetItem);
  targetItem.name = nextName;

  return targetItem;
};

export const renameItemIn = (
  parentDirectory: DirectoryItem,
  itemName: string,
  itemKind: FileSystemItemKind,
  requestedName: string,
): FileSystemItemBase | null => {
  const targetItem = findItemInDirectory(parentDirectory, itemName, itemKind);

  if (!targetItem) {
    return null;
  }

  return renameItem(parentDirectory, targetItem, requestedName);
};

export const removeItem = (
  parentDirectory: DirectoryItem,
  targetItem: FileSystemItemBase,
): FileSystemItemBase | null => {
  const targetIndex = parentDirectory.children.findIndex((item) => item === targetItem);

  if (targetIndex < 0) {
    return null;
  }

  const [removedItem] = parentDirectory.children.splice(targetIndex, 1);

  return removedItem ?? null;
};

export const removeItemIn = (
  parentDirectory: DirectoryItem,
  itemName: string,
  itemKind: FileSystemItemKind,
): FileSystemItemBase | null => {
  const targetItem = findItemInDirectory(parentDirectory, itemName, itemKind);

  if (!targetItem) {
    return null;
  }

  return removeItem(parentDirectory, targetItem);
};

export const updateFileUrl = (
  parentDirectory: DirectoryItem,
  targetItem: FileSystemItemBase,
  nextUrl: string,
): FileItem | null => {
  if (!parentDirectory.children.includes(targetItem) || !isFileItem(targetItem)) {
    return null;
  }

  const normalizedUrl = nextUrl.trim();

  if (!normalizedUrl) {
    return null;
  }

  targetItem.url = normalizedUrl;

  return targetItem;
};
