import { useCallback, useMemo, useState } from "react";
import type { DirectoryItem } from "@entities/filesystem/model";

type NavigationState = {
  history: DirectoryItem[];
  index: number;
};

type UseDirectoryNavigationArgs = {
  currentDirectory: DirectoryItem;
  onNavigate?: (directory: DirectoryItem) => void;
};

const createInitialState = (directory: DirectoryItem): NavigationState => {
  return {
    history: [directory],
    index: 0,
  };
};

const resolveState = (state: NavigationState, currentDirectory: DirectoryItem): NavigationState => {
  const currentHistoryItem = state.history[state.index];

  if (currentHistoryItem === currentDirectory) {
    return state;
  }

  const existingIndex = state.history.findIndex((directory) => directory === currentDirectory);

  if (existingIndex >= 0) {
    return {
      history: state.history,
      index: existingIndex,
    };
  }

  return createInitialState(currentDirectory);
};

export function useDirectoryNavigation({ currentDirectory, onNavigate }: UseDirectoryNavigationArgs) {
  const [state, setState] = useState<NavigationState>(() => createInitialState(currentDirectory));

  const resolvedState = useMemo(() => {
    return resolveState(state, currentDirectory);
  }, [currentDirectory, state]);

  const canGoBack = resolvedState.index > 0;
  const canGoForward = resolvedState.index < resolvedState.history.length - 1;

  const navigateToDirectory = useCallback((nextDirectory: DirectoryItem, pushToHistory = true) => {
    if (nextDirectory === currentDirectory) {
      return;
    }

    if (pushToHistory) {
      setState((previousState) => {
        const baseState = resolveState(previousState, currentDirectory);
        const nextHistory = baseState.history.slice(0, baseState.index + 1);
        nextHistory.push(nextDirectory);

        return {
          history: nextHistory,
          index: nextHistory.length - 1,
        };
      });
    }

    onNavigate?.(nextDirectory);
  }, [currentDirectory, onNavigate]);

  const goBack = useCallback(() => {
    if (!canGoBack) {
      return;
    }

    const previousDirectory = resolvedState.history[resolvedState.index - 1];

    if (!previousDirectory) {
      return;
    }

    setState((previousState) => {
      const baseState = resolveState(previousState, currentDirectory);

      return {
        history: baseState.history,
        index: Math.max(0, baseState.index - 1),
      };
    });
    onNavigate?.(previousDirectory);
  }, [canGoBack, currentDirectory, onNavigate, resolvedState.history, resolvedState.index]);

  const goForward = useCallback(() => {
    if (!canGoForward) {
      return;
    }

    const nextDirectory = resolvedState.history[resolvedState.index + 1];

    if (!nextDirectory) {
      return;
    }

    setState((previousState) => {
      const baseState = resolveState(previousState, currentDirectory);

      return {
        history: baseState.history,
        index: Math.min(baseState.history.length - 1, baseState.index + 1),
      };
    });
    onNavigate?.(nextDirectory);
  }, [canGoForward, currentDirectory, onNavigate, resolvedState.history, resolvedState.index]);

  return {
    canGoBack,
    canGoForward,
    navigateToDirectory,
    goBack,
    goForward,
  };
}