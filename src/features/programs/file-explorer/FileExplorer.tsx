import { useEffect, useMemo, useState } from "react";
import { isDirectoryItem, type DirectoryItem } from "@entities/filesystem/model";
import { FileSystemItemGrid } from "@features/desktop";
import ProgramSurface from "../ProgramSurface";
import programStyles from "../Program.module.css";
import styles from "./FileExplorer.module.css";
import { useFileExplorerController } from "./hooks/useFileExplorerController";

type FileExplorerProps = {
  directoryItem: DirectoryItem;
  rootDirectory?: DirectoryItem;
  onDirectoryChange?: (directory: DirectoryItem) => void;
  onFilesystemChange?: () => void;
};

const DEFAULT_ROOT_LABEL = "Desktop";

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
}: FileExplorerProps) {
  const {
    editingItem,
    buildFileExplorerMenuItems,
    handleEditingSubmit,
    handleEditingCancel,
  } = useFileExplorerController({
    directoryItem,
    onFilesystemChange,
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<DirectoryItem[]>([directoryItem]);
  const [navigationIndex, setNavigationIndex] = useState(0);

  useEffect(() => {
    const current = navigationHistory[navigationIndex];

    if (current === directoryItem) {
      return;
    }

    const existingIndex = navigationHistory.findIndex((directory) => directory === directoryItem);

    if (existingIndex >= 0) {
      setNavigationIndex(existingIndex);
      return;
    }

    setNavigationHistory([directoryItem]);
    setNavigationIndex(0);
  }, [directoryItem, navigationHistory, navigationIndex]);

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

  const childDirectories = useMemo(() => {
    return directoryItem.children.filter(isDirectoryItem);
  }, [directoryItem]);
  const canGoBack = navigationIndex > 0;
  const canGoForward = navigationIndex < navigationHistory.length - 1;

  const navigateToDirectory = (nextDirectory: DirectoryItem, pushToHistory: boolean) => {
    if (nextDirectory === directoryItem) {
      return;
    }

    if (pushToHistory) {
      setNavigationHistory((previousHistory) => {
        const nextHistory = previousHistory.slice(0, navigationIndex + 1);
        nextHistory.push(nextDirectory);
        return nextHistory;
      });
      setNavigationIndex((previousIndex) => previousIndex + 1);
    }

    onDirectoryChange?.(nextDirectory);
  };

  const handleBack = () => {
    if (!canGoBack) {
      return;
    }

    const previousIndex = navigationIndex - 1;
    const previousDirectory = navigationHistory[previousIndex];

    if (!previousDirectory) {
      return;
    }

    setNavigationIndex(previousIndex);
    onDirectoryChange?.(previousDirectory);
  };

  const handleForward = () => {
    if (!canGoForward) {
      return;
    }

    const nextIndex = navigationIndex + 1;
    const nextDirectory = navigationHistory[nextIndex];

    if (!nextDirectory) {
      return;
    }

    setNavigationIndex(nextIndex);
    onDirectoryChange?.(nextDirectory);
  };

  return (
    <ProgramSurface className={programStyles.programParent} getContextMenuItems={buildFileExplorerMenuItems}>
      <div className={styles.explorerRoot}>
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            aria-label={isSidebarCollapsed ? "Expand navigation pane" : "Collapse navigation pane"}
          >
            {isSidebarCollapsed ? ">>" : "<<"}
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={handleBack}
            disabled={!canGoBack}
            aria-label="Back"
          >
            &lt;
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={handleForward}
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
              <h3 className={styles.sidebarSectionTitle}>Tasks</h3>
              <button
                type="button"
                className={styles.sidebarLink}
                onClick={() => rootDirectory && navigateToDirectory(rootDirectory, true)}
                disabled={!rootDirectory || rootDirectory === directoryItem}
              >
                Desktop
              </button>

              <h3 className={styles.sidebarSectionTitle}>Folders</h3>
              {childDirectories.length === 0 ? (
                <div className={styles.sidebarEmptyText}>No subfolders in this directory.</div>
              ) : (
                <div className={styles.sidebarLinksList}>
                  {childDirectories.map((childDirectory, index) => (
                    <button
                      key={`${childDirectory.name}-${index}`}
                      type="button"
                      className={styles.sidebarLink}
                      onClick={() => navigateToDirectory(childDirectory, true)}
                    >
                      {childDirectory.name}
                    </button>
                  ))}
                </div>
              )}
            </aside>
          ) : null}

          <div className={styles.childrenGrid}>
            <FileSystemItemGrid
              items={directoryItem.children}
              onDirectoryOpen={(nextDirectory) => navigateToDirectory(nextDirectory, true)}
              editingItem={editingItem}
              onEditingSubmit={handleEditingSubmit}
              onEditingCancel={handleEditingCancel}
            />
          </div>
        </div>
      </div>
    </ProgramSurface>
  );
}

export default FileExplorer;