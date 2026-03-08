import { FileSystemItemBase } from "./filesystemitem";

export class DirectoryItem extends FileSystemItemBase {
  public Children: FileSystemItemBase[];

  constructor(name: string, children: FileSystemItemBase[], icon = "src/assets/icons/directory_closed.avif") {
    super(icon, name);
    this.Children = children;
  }
}
