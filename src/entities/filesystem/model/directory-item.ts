import directoryClosedIcon from "../../../assets/icons/directory_closed.avif";
import { FileSystemItemBase } from "./filesystem-item";

export class DirectoryItem extends FileSystemItemBase {
  public readonly children: FileSystemItemBase[];

  constructor(name: string, children: FileSystemItemBase[], icon = directoryClosedIcon) {
    super("directory", icon, name);
    this.children = children;
  }

  // Backward-compatible alias while the rest of the app moves to camelCase.
  public get Children(): FileSystemItemBase[] {
    return this.children;
  }
}
