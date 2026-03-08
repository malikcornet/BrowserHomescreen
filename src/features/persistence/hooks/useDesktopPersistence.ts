import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [programsState, setProgramsState] = useState<Record<string, PersistedProgramState>>({});
  const [isReady, setIsReady] = useState(false);

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
          setProgramsState({});
          setIsReady(true);

          return;
        }

        const hydratedRootDirectory = deserializeDirectoryTree(persistedState.filesystem);
        const persistedExplorerWindows = getPersistedFileExplorerWindows(persistedState);

        setRootDirectory(hydratedRootDirectory);
        setInitialWindows(hydrateFileExplorerWindows(persistedExplorerWindows, hydratedRootDirectory));
        setProgramsState(persistedState.programs);
        setIsReady(true);
      } catch {
        if (didCancel) {
          return;
        }

        setRootDirectory(createDefaultRootDirectory());
        setInitialWindows(undefined);
        setProgramsState({});
        setIsReady(true);
      }
    };

    void hydrate();

    return () => {
      didCancel = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady || !rootDirectory) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const fileExplorerWindows = windowsSnapshot ?? initialWindows ?? [];
      const nextPrograms = {
        ...programsState,
        [FILE_EXPLORER_PROGRAM_ID]: {
          ...(programsState[FILE_EXPLORER_PROGRAM_ID] ?? {}),
          windows: serializeFileExplorerWindows(fileExplorerWindows, rootDirectory),
        },
      };

      const nextState = {
        version: DESKTOP_STATE_VERSION,
        filesystem: serializeDirectoryTree(rootDirectory),
        programs: nextPrograms,
      };

      void savePersistedDesktopState(nextState);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filesystemVersion, initialWindows, isReady, programsState, rootDirectory, windowsSnapshot]);

  const handleFilesystemChange = useCallback(() => {
    setFilesystemVersion((version) => version + 1);
  }, []);

  const handleWindowsChange = useCallback((windows: FileExplorerWindow[]) => {
    setWindowsSnapshot(windows);
  }, []);

  const getProgramState = useCallback((programId: string): PersistedProgramState | undefined => {
    return programsState[programId];
  }, [programsState]);

  const setProgramState = useCallback((programId: string, nextState: PersistedProgramState) => {
    setProgramsState((previousProgramsState) => ({
      ...previousProgramsState,
      [programId]: nextState,
    }));
  }, []);

  return useMemo(() => ({
    isReady,
    rootDirectory,
    initialWindows,
    handleFilesystemChange,
    handleWindowsChange,
    getProgramState,
    setProgramState,
  }), [
    getProgramState,
    handleFilesystemChange,
    handleWindowsChange,
    initialWindows,
    isReady,
    rootDirectory,
    setProgramState,
  ]);
}
