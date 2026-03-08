import type { FileSystemItemKind } from "@entities/filesystem";

export const CONTEXT_MENU_TARGET_ATTR = "data-context-menu-target";
export const FILESYSTEM_ITEM_KIND_ATTR = "data-filesystem-item-kind";
export const FILESYSTEM_ITEM_NAME_ATTR = "data-filesystem-item-name";

export const CONTEXT_MENU_TARGETS = {
  filesystemIcon: "filesystem-icon",
} as const;

export const FILESYSTEM_ICON_SELECTOR = `[${CONTEXT_MENU_TARGET_ATTR}='${CONTEXT_MENU_TARGETS.filesystemIcon}']`;

type FilesystemIconContext = {
  element: HTMLElement | null;
  isIcon: boolean;
  itemName: string | null;
  itemKind: FileSystemItemKind | null;
};

const parseFilesystemItemKind = (rawKind: string | null): FileSystemItemKind | null => {
  if (rawKind === "directory" || rawKind === "file") {
    return rawKind;
  }

  return null;
};

export const getFilesystemIconContext = (targetElement: HTMLElement | null): FilesystemIconContext => {
  const element = targetElement?.closest(FILESYSTEM_ICON_SELECTOR) as HTMLElement | null;

  return {
    element,
    isIcon: Boolean(element),
    itemName: element?.getAttribute(FILESYSTEM_ITEM_NAME_ATTR) ?? null,
    itemKind: parseFilesystemItemKind(element?.getAttribute(FILESYSTEM_ITEM_KIND_ATTR) ?? null),
  };
};
