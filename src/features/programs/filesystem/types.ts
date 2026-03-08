import type { FileSystemItemKind } from "@entities/filesystem";

export type FilesystemMenuTargetContext = {
  isIcon: boolean;
  itemName: string | null;
  itemKind: FileSystemItemKind | null;
};
