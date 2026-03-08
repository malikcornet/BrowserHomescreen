import fileQuestionIcon from "../../../assets/icons/file_question.1.avif";
import { FileSystemItemBase } from "./filesystem-item";

export class FileItem extends FileSystemItemBase {
  public url: string;

  constructor(name: string, url: string, icon = fileQuestionIcon) {
    super("file", icon, name);
    this.url = url;
  }
}
