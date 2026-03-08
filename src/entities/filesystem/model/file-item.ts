import fileQuestionIcon from "../../../assets/icons/file_question.1.avif";
import { FileSystemItemBase } from "./filesystem-item";

export const DEFAULT_FILE_ICON = fileQuestionIcon;

export class FileItem extends FileSystemItemBase {
  public url: string;

  constructor(name: string, url: string, icon = DEFAULT_FILE_ICON) {
    super("file", icon, name);
    this.url = url;
  }
}
