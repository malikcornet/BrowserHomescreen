import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DirectoryItem } from "@entities/filesystem/model";
import type { FileExplorerWindow } from "@features/window-manager/windowing";
import { createDefaultRootDirectory } from "@data";
import {
  deserializeDirectoryTree,
  getPersistedFileExplorerWindows,
  hydrateFileExplorerWindows,
  loadPersistedDesktopState,
  savePersistedDesktopState,
  serializeDirectoryTree,
  serializeFileExplorerWindows,
} from "../desktop-state";
import { DESKTOP_STATE_VERSION, FILE_EXPLORER_PROGRAM_ID, type PersistedProgramState } from "../types";

const SAVE_DEBOUNCE_MS = 250;

export function useDesktopPersistence() {
  const [rootDirectory, setRootDirectory] = useState<DirectoryItem | null>(null);
  const [initialWindows, setInitialWindows] = useState<FileExplorerWindow[] | undefined>(undefined);
  const [filesystemVersion, setFilesystemVersion] = useState(0);
  const [windowsSnapshot, setWindowsSnapshot] = useState<FileExplorerWindow[] | null>(null);
  const [isReady, setIsReady] = useState(false);
  const programsRef = useRef<Record<string, PersistedProgramState>>({});

  useEffect(() => {
    let didCancel = false;

    const hydrate = async () => {
      try {
        const persistedState = await loadPersistedDesktopState();

        if (didCancel) {
          return;
        }

        if (!persistedState || persistedState.version !== DESKTOP_STATE_VERSION) {
          setRootDirectory(createDefaultRootDirectory());
          setInitialWindows(undefined);
          programsRef.current = {};
          setIsReady(true);

          return;
        }

        const hydratedRootDirectory = deserializeDirectoryTree(persistedState.filesystem);
        const persistedExplorerWindows = getPersistedFileExplorerWindows(persistedState);

        setRootDirectory(hydratedRootDirectory);
        setInitialWindows(hydrateFileExplorerWindows(persistedExplorerWindows, hydratedRootDirectory));
        programsRef.current = persistedState.programs;
        setIsReady(true);
      } catch {
        if (didCancel) {
          return;
        }

        setRootDirectory(createDefaultRootDirectory());
        setInitialWindows(undefined);
        programsRef.current = {};
        setIsReady(true);
      }
    };

    void hydrate();

    return () => {
      didCancel = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady || !rootDirectory || !windowsSnapshot) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextPrograms = {
        ...programsRef.current,
        [FILE_EXPLORER_PROGRAM_ID]: {
          ...(programsRef.current[FILE_EXPLORER_PROGRAM_ID] ?? {}),
          windows: serializeFileExplorerWindows(windowsSnapshot, rootDirectory),
        },
      };

      const nextState = {
        version: DESKTOP_STATE_VERSION,
        filesystem: serializeDirectoryTree(rootDirectory),
        programs: nextPrograms,
      };

      programsRef.current = nextPrograms;
      void savePersistedDesktopState(nextState);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filesystemVersion, isReady, rootDirectory, windowsSnapshot]);

  const handleFilesystemChange = useCallback(() => {
    setFilesystemVersion((version) => version + 1);
  }, []);

  const handleWindowsChange = useCallback((windows: FileExplorerWindow[]) => {
    setWindowsSnapshot(windows);
  }, []);

  return useMemo(() => ({
    isReady,
    rootDirectory,
    initialWindows,
    handleFilesystemChange,
    handleWindowsChange,
  }), [handleFilesystemChange, handleWindowsChange, initialWindows, isReady, rootDirectory]);
}
