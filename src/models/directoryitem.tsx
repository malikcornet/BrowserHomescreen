import { FileSystemItemBase } from "./filesystemitem";
import directoryClosedIcon from "../assets/icons/directory_closed.avif";

export class DirectoryItem extends FileSystemItemBase {
  public Children: FileSystemItemBase[];

  constructor(name: string, children: FileSystemItemBase[], icon = directoryClosedIcon) {
    super(icon, name);
    this.Children = children;
  }
}
