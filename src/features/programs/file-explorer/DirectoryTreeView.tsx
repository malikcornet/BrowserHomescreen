import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  isDirectoryItem,
  isFileItem,
  type DirectoryItem,
  type FileItem,
  type FileSystemItemBase,
} from "@entities/filesystem/model";
import {
  CONTEXT_MENU_TARGET_ATTR,
  CONTEXT_MENU_TARGETS,
  FILESYSTEM_ITEM_KIND_ATTR,
  FILESYSTEM_ITEM_NAME_ATTR,
  FILESYSTEM_ITEM_PATH_ATTR,
} from "@features/programs";
import styles from "./DirectoryTreeView.module.css";

type DirectoryTreeViewProps = {
  rootDirectory: DirectoryItem;
  currentDirectory: DirectoryItem;
  onDirectorySelect: (directory: DirectoryItem) => void;
  initialCollapsedPaths?: string[][];
  onCollapsedPathsChange?: (paths: string[][]) => void;
  editingItem?: FileSystemItemBase | null;
  onEditingSubmit?: (nextName: string, item: FileSystemItemBase) => void;
  onEditingCancel?: (item: FileSystemItemBase) => void;
};

type TreeEditInputProps = {
  item: FileSystemItemBase;
  onSubmit?: (nextName: string, item: FileSystemItemBase) => void;
  onCancel?: (item: FileSystemItemBase) => void;
};

function TreeEditInput({ item, onSubmit, onCancel }: TreeEditInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, []);

  const submit = () => {
    onSubmit?.(inputRef.current?.value ?? item.name, item);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onCancel?.(item);
    }
  };

  return (
    <input
      ref={inputRef}
      className={styles.treeEditInput}
      defaultValue={item.name}
      onBlur={submit}
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => event.stopPropagation()}
      aria-label={`Rename ${item.name}`}
    />
  );
}

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

const collectDirectories = (rootDirectory: DirectoryItem): DirectoryItem[] => {
  const result: DirectoryItem[] = [rootDirectory];

  for (const child of rootDirectory.children) {
    if (!isDirectoryItem(child)) {
      continue;
    }

    result.push(...collectDirectories(child));
  }

  return result;
};

const createInitialCollapsedSet = (
  rootDirectory: DirectoryItem,
  currentDirectory: DirectoryItem,
): Set<DirectoryItem> => {
  const path = new Set(findDirectoryPath(rootDirectory, currentDirectory) ?? [currentDirectory]);

  return new Set(
    collectDirectories(rootDirectory).filter(
      (directory) => directory !== rootDirectory && !path.has(directory),
    ),
  );
};

const getDirectoryLabel = (directory: DirectoryItem): string => {
  return directory.name === "/" ? "Desktop" : directory.name;
};

const getFileLabel = (file: FileItem): string => {
  return file.name;
};

const getDirectoryPath = (
  rootDirectory: DirectoryItem,
  targetDirectory: DirectoryItem,
): string[] | null => {
  if (rootDirectory === targetDirectory) {
    return [];
  }

  for (const child of rootDirectory.children) {
    if (!isDirectoryItem(child)) {
      continue;
    }

    const childPath = getDirectoryPath(child, targetDirectory);

    if (childPath) {
      return [child.name, ...childPath];
    }
  }

  return null;
};

const getDirectoryByPath = (rootDirectory: DirectoryItem, pathSegments: string[]): DirectoryItem | null => {
  let currentDirectory = rootDirectory;

  for (const pathSegment of pathSegments) {
    const nextDirectory = currentDirectory.children.find((child) => {
      return isDirectoryItem(child) && child.name === pathSegment;
    });

    if (!nextDirectory || !isDirectoryItem(nextDirectory)) {
      return null;
    }

    currentDirectory = nextDirectory;
  }

  return currentDirectory;
};

const getCollapsedPaths = (rootDirectory: DirectoryItem, directories: Set<DirectoryItem>): string[][] => {
  const paths: string[][] = [];

  for (const directory of directories) {
    const path = getDirectoryPath(rootDirectory, directory);

    if (path) {
      paths.push(path);
    }
  }

  return paths;
};

const createCollapsedSetFromPaths = (
  rootDirectory: DirectoryItem,
  initialCollapsedPaths: string[][],
): Set<DirectoryItem> => {
  const collapsedDirectories = new Set<DirectoryItem>();

  for (const pathSegments of initialCollapsedPaths) {
    const directory = getDirectoryByPath(rootDirectory, pathSegments);

    if (directory && directory !== rootDirectory) {
      collapsedDirectories.add(directory);
    }
  }

  return collapsedDirectories;
};

const findDirectoryChainToItem = (
  rootDirectory: DirectoryItem,
  targetItem: FileSystemItemBase,
): DirectoryItem[] | null => {
  if (rootDirectory === targetItem) {
    return [rootDirectory];
  }

  if (rootDirectory.children.includes(targetItem)) {
    return [rootDirectory];
  }

  for (const child of rootDirectory.children) {
    if (!isDirectoryItem(child)) {
      continue;
    }

    const childChain = findDirectoryChainToItem(child, targetItem);

    if (childChain) {
      return [rootDirectory, ...childChain];
    }
  }

  return null;
};

function DirectoryTreeView({
  rootDirectory,
  currentDirectory,
  onDirectorySelect,
  initialCollapsedPaths,
  onCollapsedPathsChange,
  editingItem,
  onEditingSubmit,
  onEditingCancel,
}: DirectoryTreeViewProps) {
  const [collapsedDirectories, setCollapsedDirectories] = useState<Set<DirectoryItem>>(() =>
    initialCollapsedPaths && initialCollapsedPaths.length > 0
      ? createCollapsedSetFromPaths(rootDirectory, initialCollapsedPaths)
      : createInitialCollapsedSet(rootDirectory, currentDirectory),
  );

  const editingDirectoryChain = useMemo(() => {
    if (!editingItem) {
      return [] as DirectoryItem[];
    }

    return findDirectoryChainToItem(rootDirectory, editingItem) ?? [];
  }, [editingItem, rootDirectory]);

  const effectiveCollapsedDirectories = useMemo(() => {
    if (editingDirectoryChain.length === 0) {
      return collapsedDirectories;
    }

    const nextSet = new Set(collapsedDirectories);

    for (const directory of editingDirectoryChain) {
      nextSet.delete(directory);
    }

    return nextSet;
  }, [collapsedDirectories, editingDirectoryChain]);

  const toggleDirectory = (directory: DirectoryItem) => {
    setCollapsedDirectories((previousSet) => {
      const nextSet = new Set(previousSet);

      if (nextSet.has(directory)) {
        nextSet.delete(directory);
      } else {
        nextSet.add(directory);
      }

      onCollapsedPathsChange?.(getCollapsedPaths(rootDirectory, nextSet));

      return nextSet;
    });
  };

  const renderNode = (
    directory: DirectoryItem,
    depth: number,
    keyPrefix: string,
    pathSegments: string[],
  ): React.ReactNode => {
    const childDirectories = directory.children.filter(isDirectoryItem);
    const childFiles = directory.children.filter(isFileItem);
    const hasChildren = childDirectories.length > 0 || childFiles.length > 0;
    const isCollapsed = effectiveCollapsedDirectories.has(directory);
    const isSelected = directory === currentDirectory;
    const isEditingDirectory = editingItem === directory;
    const rowStyle = { "--tree-depth": depth } as CSSProperties;

    return (
      <li key={`${keyPrefix}-${directory.name}`} className={styles.node}>
        <div className={styles.row} style={rowStyle}>
          {hasChildren ? (
            <button
              type="button"
              className={styles.expanderButton}
              aria-label={isCollapsed ? `Expand ${directory.name}` : `Collapse ${directory.name}`}
              onClick={() => toggleDirectory(directory)}
            >
              {isCollapsed ? "+" : "-"}
            </button>
          ) : (
            <span className={styles.expanderSpacer} />
          )}

          {isEditingDirectory ? (
            <TreeEditInput item={directory} onSubmit={onEditingSubmit} onCancel={onEditingCancel} />
          ) : (
            <button
              type="button"
              className={[styles.labelButton, isSelected ? styles.labelButtonActive : ""].join(" ")}
              {...{
                [CONTEXT_MENU_TARGET_ATTR]: CONTEXT_MENU_TARGETS.filesystemIcon,
                [FILESYSTEM_ITEM_KIND_ATTR]: "directory",
                [FILESYSTEM_ITEM_NAME_ATTR]: directory.name,
                [FILESYSTEM_ITEM_PATH_ATTR]: JSON.stringify(pathSegments),
              }}
              onClick={() => onDirectorySelect(directory)}
              title={getDirectoryLabel(directory)}
            >
              <span className={styles.labelContent}>
                <span className={styles.folderGlyph} aria-hidden="true" />
                <span className={styles.labelText}>{getDirectoryLabel(directory)}</span>
              </span>
            </button>
          )}
        </div>

        {hasChildren && !isCollapsed ? (
          <ul className={styles.childrenList}>
            {childDirectories.map((childDirectory, index) =>
              renderNode(
                childDirectory,
                depth + 1,
                `${keyPrefix}-${index}`,
                [...pathSegments, childDirectory.name],
              ),
            )}
            {childFiles.map((childFile, index) => (
              <li key={`${keyPrefix}-file-${index}-${childFile.name}`} className={styles.node}>
                <div className={styles.row} style={{ "--tree-depth": depth + 1 } as CSSProperties}>
                  <span className={styles.expanderSpacer} />
                  {editingItem === childFile ? (
                    <TreeEditInput item={childFile} onSubmit={onEditingSubmit} onCancel={onEditingCancel} />
                  ) : (
                    <span
                      className={styles.fileLabel}
                      {...{
                        [CONTEXT_MENU_TARGET_ATTR]: CONTEXT_MENU_TARGETS.filesystemIcon,
                        [FILESYSTEM_ITEM_KIND_ATTR]: "file",
                        [FILESYSTEM_ITEM_NAME_ATTR]: childFile.name,
                        [FILESYSTEM_ITEM_PATH_ATTR]: JSON.stringify([...pathSegments, childFile.name]),
                      }}
                      title={getFileLabel(childFile)}
                    >
                      <span className={styles.fileLabelContent}>
                        <span className={styles.fileGlyph} aria-hidden="true" />
                        <span className={styles.labelText}>{getFileLabel(childFile)}</span>
                      </span>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </li>
    );
  };

  return <ul className={styles.treeRoot}>{renderNode(rootDirectory, 0, "root", [])}</ul>;
}

export default DirectoryTreeView;
