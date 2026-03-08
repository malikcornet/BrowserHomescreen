import { DirectoryItem } from "@entities/filesystem/model";
import { FileSystemItemGrid } from "@features/desktop";
import ProgramSurface, { type ProgramContextMenuRequest } from "../ProgramSurface";
import { CONTEXT_MENU_LABEL } from "../context-menu.constants";
import { getFilesystemIconContext } from "../context-menu-targets";
import type { ContextMenuItem } from "@shared/ui";
import programStyles from "../Program.module.css";
import styles from "./FileExplorer.module.css";

type FileExplorerProps = {
  directoryItem: DirectoryItem;
  onDirectoryChange?: (directory: DirectoryItem) => void;
};

const FILE_EXPLORER_MENU_ID = {
  refresh: "explorer-refresh",
  separatorPrimary: "explorer-separator-1",
  deleteItem: "explorer-delete-item",
  newFolder: "explorer-new-folder",
  separatorSecondary: "explorer-separator-2",
  properties: "explorer-properties",
} as const;

function FileExplorer({ directoryItem, onDirectoryChange }: FileExplorerProps) {
  const getFileExplorerMenuItems = (context: ProgramContextMenuRequest): ContextMenuItem[] => {
    const { isIcon, itemName } = getFilesystemIconContext(context.targetElement);

    return [
      {
        id: FILE_EXPLORER_MENU_ID.refresh,
        label: CONTEXT_MENU_LABEL.refresh,
        onSelect: () => {
          // Placeholder action; data is static for now.
        },
      },
      { id: FILE_EXPLORER_MENU_ID.separatorPrimary, type: "separator" },
      ...(isIcon
        ? [
            {
              id: FILE_EXPLORER_MENU_ID.deleteItem,
              label: `${CONTEXT_MENU_LABEL.delete}${itemName ? ` ${itemName}` : ""}`,
              onSelect: () => {
                // Future action once filesystem mutability is implemented.
              },
              danger: true,
              disabled: true,
            },
          ]
        : [
            {
              id: FILE_EXPLORER_MENU_ID.newFolder,
              label: CONTEXT_MENU_LABEL.newFolder,
              onSelect: () => {
                // Future action once filesystem mutability is implemented.
              },
              disabled: true,
            },
          ]),
      { id: FILE_EXPLORER_MENU_ID.separatorSecondary, type: "separator" },
      {
        id: FILE_EXPLORER_MENU_ID.properties,
        label: `${CONTEXT_MENU_LABEL.properties} (${directoryItem.name})`,
        onSelect: () => {
          // Future action once explorer metadata view exists.
        },
        disabled: true,
      },
    ];
  };

  return (
    <ProgramSurface className={programStyles.programParent} getContextMenuItems={getFileExplorerMenuItems}>
      <div className={styles.childrenGrid}>
        <FileSystemItemGrid items={directoryItem.children} onDirectoryOpen={onDirectoryChange} />
      </div>
    </ProgramSurface>
  );
}

export default FileExplorer;