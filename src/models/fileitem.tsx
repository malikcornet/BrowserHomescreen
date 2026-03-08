import { FileSystemItemBase } from "./filesystemitem";
import fileQuestionIcon from "../assets/icons/file_question.1.avif";

export class FileItem extends FileSystemItemBase {
  public url: string;

  constructor(name: string, url: string, icon = fileQuestionIcon) {
    super(icon, name);
    this.url = url;
  }
}
