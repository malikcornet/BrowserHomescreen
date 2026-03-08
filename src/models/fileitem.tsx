import { FileSystemItemBase } from "./filesystemitem";

export class FileItem extends FileSystemItemBase {
  public url: string;

  constructor(name: string, url: string, icon = "src/assets/icons/file_question.1.avif") {
    super(icon, name);
    this.url = url;
  }
}
