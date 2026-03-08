import { DirectoryItem } from "./directory-item";
import type { FileSystemItemBase, FileSystemItemKind } from "./filesystem-item";

export const NEW_FOLDER_BASE_NAME = "New Folder";

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
