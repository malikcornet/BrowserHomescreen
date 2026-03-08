import { useMemo, useState } from "react";
import { isDirectoryItem, type DirectoryItem } from "@entities/filesystem/model";
import { FileSystemItemGrid } from "@features/desktop";
import type { PersistedProgramState } from "@features/persistence";
import ProgramSurface from "../ProgramSurface";
import programStyles from "../Program.module.css";
import styles from "./FileExplorer.module.css";
import DirectoryTreeView from "./DirectoryTreeView";
import EditFileUrlDialog from "./EditFileUrlDialog";
import { useDirectoryNavigation } from "./hooks";
import { useFileExplorerController } from "./hooks/useFileExplorerController";

type FileExplorerProps = {
  directoryItem: DirectoryItem;
  rootDirectory?: DirectoryItem;
  onDirectoryChange?: (directory: DirectoryItem) => void;
  onFilesystemChange?: () => void;
  programState?: PersistedProgramState;
  onProgramStateChange?: (nextState: PersistedProgramState) => void;
};

const DEFAULT_ROOT_LABEL = "Desktop";
const TREE_COLLAPSED_PATHS_KEY = "treeCollapsedPaths";
const SIDEBAR_COLLAPSED_KEY = "sidebarCollapsed";

const findDirectoryPath = (
  rootDirectory: DirectoryItem,
  targetDirectory: DirectoryItem,
): DirectoryItem[] | null => {
  if (rootDirectory === targetDirectory) {
    return [rootDirectory];
  }

  for (const child of rootDirectory.children) {
    if (!isDirectoryItem(child)) {
      continue;
    }

    const childPath = findDirectoryPath(child, targetDirectory);

    if (childPath) {
      return [rootDirectory, ...childPath];
    }
  }

  return null;
};

function FileExplorer({
  directoryItem,
  rootDirectory,
  onDirectoryChange,
  onFilesystemChange,
  programState,
  onProgramStateChange,
}: FileExplorerProps) {
  const {
    editingItem,
    fileUrlEditingItem,
    buildFileExplorerMenuItems,
    handleEditingSubmit,
    handleEditingCancel,
    handleCancelFileUrlEditing,
    handleSubmitFileUrlEditing,
  } = useFileExplorerController({
    directoryItem,
    rootDirectory,
    onFilesystemChange,
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return programState?.[SIDEBAR_COLLAPSED_KEY] === true;
  });
  const {
    canGoBack,
    canGoForward,
    navigateToDirectory,
    goBack,
    goForward,
  } = useDirectoryNavigation({
    currentDirectory: directoryItem,
    onNavigate: onDirectoryChange,
  });

  const currentDirectoryPath = useMemo(() => {
    if (!rootDirectory) {
      return [directoryItem];
    }

    return findDirectoryPath(rootDirectory, directoryItem) ?? [directoryItem];
  }, [directoryItem, rootDirectory]);

  const windowsPath = useMemo(() => {
    const names = currentDirectoryPath
      .map((directory) => directory.name)
      .filter((name) => name !== "/");
    const rootLabel = rootDirectory?.name === "/" || !rootDirectory?.name
      ? DEFAULT_ROOT_LABEL
      : rootDirectory.name;

    return names.length > 0
      ? `${rootLabel}\\${names.join("\\")}`
      : rootLabel;
  }, [currentDirectoryPath, rootDirectory]);

  const initialCollapsedPaths = useMemo(() => {
    const persistedValue = programState?.[TREE_COLLAPSED_PATHS_KEY];

    if (!Array.isArray(persistedValue)) {
      return undefined;
    }

    return persistedValue
      .filter((path): path is unknown[] => Array.isArray(path))
      .map((path) => path.filter((segment): segment is string => typeof segment === "string"));
  }, [programState]);

  const handleCollapsedPathsChange = (paths: string[][]) => {
    onProgramStateChange?.({
      ...(programState ?? {}),
      [TREE_COLLAPSED_PATHS_KEY]: paths,
    });
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((current) => {
      const nextValue = !current;

      onProgramStateChange?.({
        ...(programState ?? {}),
        [SIDEBAR_COLLAPSED_KEY]: nextValue,
      });

      return nextValue;
    });
  };

  return (
    <ProgramSurface className={programStyles.programParent} getContextMenuItems={buildFileExplorerMenuItems}>
      <div className={styles.explorerRoot}>
        <div className={styles.toolbar} data-context-menu-disabled="true">
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={handleToggleSidebar}
            aria-label={isSidebarCollapsed ? "Expand navigation pane" : "Collapse navigation pane"}
          >
            {isSidebarCollapsed ? ">>" : "<<"}
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={goBack}
            disabled={!canGoBack}
            aria-label="Back"
          >
            &lt;
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={goForward}
            disabled={!canGoForward}
            aria-label="Forward"
          >
            &gt;
          </button>

          <div className={styles.pathBar} title={windowsPath}>
            {windowsPath}
          </div>
        </div>

        <div className={styles.mainArea}>
          {!isSidebarCollapsed ? (
            <aside className={styles.sidebar}>
              <DirectoryTreeView
                rootDirectory={rootDirectory ?? directoryItem}
                currentDirectory={directoryItem}
                onDirectorySelect={navigateToDirectory}
                initialCollapsedPaths={initialCollapsedPaths}
                onCollapsedPathsChange={handleCollapsedPathsChange}
                editingItem={editingItem}
                onEditingSubmit={handleEditingSubmit}
                onEditingCancel={handleEditingCancel}
              />
            </aside>
          ) : null}

          <div className={styles.childrenGrid}>
            <FileSystemItemGrid
              items={directoryItem.children}
              onDirectoryOpen={(nextDirectory) => navigateToDirectory(nextDirectory)}
              editingItem={editingItem}
              onEditingSubmit={handleEditingSubmit}
              onEditingCancel={handleEditingCancel}
            />
          </div>
        </div>
      </div>

      <EditFileUrlDialog
        isOpen={Boolean(fileUrlEditingItem)}
        fileName={fileUrlEditingItem?.name ?? ""}
        initialUrl={fileUrlEditingItem?.url ?? ""}
        onSubmit={handleSubmitFileUrlEditing}
        onCancel={handleCancelFileUrlEditing}
      />
    </ProgramSurface>
  );
}

export default FileExplorer;
