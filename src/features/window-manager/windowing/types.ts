import type { DirectoryItem } from "@entities/filesystem/model";
import type { WindowRect } from "../Window";

export type FileExplorerWindow = {
  id: number;
  directory: DirectoryItem;
  rect: WindowRect;
};
