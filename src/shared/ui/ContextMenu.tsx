import { useMemo, useRef } from "react";
import styles from "./ContextMenu.module.css";

export type ContextMenuItem =
  | {
      id: string;
      label: string;
      onSelect: () => void;
      disabled?: boolean;
      danger?: boolean;
    }
  | {
      id: string;
      type: "separator";
    };

type ContextMenuProps = {
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
};

const MENU_GUTTER = 8;
const ESTIMATED_MENU_WIDTH = 220;

function ContextMenu({ position, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  const clampedPosition = useMemo(() => {
    const maxX = Math.max(MENU_GUTTER, window.innerWidth - ESTIMATED_MENU_WIDTH - MENU_GUTTER);
    const x = Math.min(position.x, maxX);
    const y = Math.min(position.y, window.innerHeight - MENU_GUTTER);

    return { x, y };
  }, [position.x, position.y]);

  const handleItemClick = (item: ContextMenuItem) => {
    if ("type" in item || item.disabled) {
      return;
    }

    item.onSelect();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className={styles.contextMenu}
      role="menu"
      style={{ left: clampedPosition.x, top: clampedPosition.y }}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      {items.map((item) => {
        if ("type" in item) {
          return <div key={item.id} className={styles.separator} role="separator" />;
        }

        return (
          <button
            key={item.id}
            type="button"
            className={[styles.menuItem, item.danger ? styles.menuItemDanger : ""].join(" ")}
            role="menuitem"
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default ContextMenu;
