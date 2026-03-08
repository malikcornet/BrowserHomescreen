import type { FileItem } from "../../models/fileitem";
import FileSystemIcon from "./FileSystemIcon";

type FileIconProps = {
  fileItem: FileItem;
};

function FileIcon({ fileItem }: FileIconProps) {
  const resolveUrl = (url: string) => {
    const trimmedUrl = url.trim();
    const hasScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedUrl);

    return hasScheme ? trimmedUrl : `https://${trimmedUrl}`;
  };

  const handleDoubleClick = () => {
    window.location.href = resolveUrl(fileItem.url);
  };

  const handleScrollWheelClick = () => {
    window.open(resolveUrl(fileItem.url), "_blank", "noopener,noreferrer");
  };

  return (
    <FileSystemIcon
      fileSystemItem={fileItem}
      onDoubleClick={handleDoubleClick}
      onScrollWheelClick={handleScrollWheelClick}
    />
  );
}
  
export default FileIcon;