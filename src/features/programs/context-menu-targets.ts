import type { FileSystemItemKind } from "@entities/filesystem";

export const CONTEXT_MENU_TARGET_ATTR = "data-context-menu-target";
export const FILESYSTEM_ITEM_KIND_ATTR = "data-filesystem-item-kind";
export const FILESYSTEM_ITEM_NAME_ATTR = "data-filesystem-item-name";
export const FILESYSTEM_ITEM_PATH_ATTR = "data-filesystem-item-path";

export const CONTEXT_MENU_TARGETS = {
  filesystemIcon: "filesystem-icon",
} as const;

export const FILESYSTEM_ICON_SELECTOR = `[${CONTEXT_MENU_TARGET_ATTR}='${CONTEXT_MENU_TARGETS.filesystemIcon}']`;

type FilesystemIconContext = {
  element: HTMLElement | null;
  isIcon: boolean;
  itemName: string | null;
  itemKind: FileSystemItemKind | null;
  itemPath: string[] | null;
};

const parseFilesystemItemKind = (rawKind: string | null): FileSystemItemKind | null => {
  if (rawKind === "directory" || rawKind === "file") {
    return rawKind;
  }

  return null;
};

const parseFilesystemItemPath = (rawPath: string | null): string[] | null => {
  if (!rawPath) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawPath);

    if (!Array.isArray(parsedValue)) {
      return null;
    }

    const pathSegments = parsedValue.filter((segment): segment is string => typeof segment === "string");

    return pathSegments.length === parsedValue.length ? pathSegments : null;
  } catch {
    return null;
  }
};

export const getFilesystemIconContext = (targetElement: HTMLElement | null): FilesystemIconContext => {
  const element = targetElement?.closest(FILESYSTEM_ICON_SELECTOR) as HTMLElement | null;

  return {
    element,
    isIcon: Boolean(element),
    itemName: element?.getAttribute(FILESYSTEM_ITEM_NAME_ATTR) ?? null,
    itemKind: parseFilesystemItemKind(element?.getAttribute(FILESYSTEM_ITEM_KIND_ATTR) ?? null),
    itemPath: parseFilesystemItemPath(element?.getAttribute(FILESYSTEM_ITEM_PATH_ATTR) ?? null),
  };
};
