import { useEffect, useRef } from "react";
import styles from "./EditFileUrlDialog.module.css";

type EditFileUrlDialogProps = {
  isOpen: boolean;
  fileName: string;
  initialUrl: string;
  onSubmit: (nextUrl: string) => void;
  onCancel: () => void;
};

function EditFileUrlDialog({ isOpen, fileName, initialUrl, onSubmit, onCancel }: EditFileUrlDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    queueMicrotask(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    onSubmit(inputRef.current?.value ?? initialUrl);
  };

  const handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <div className={styles.overlay} onMouseDown={onCancel}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit URL for ${fileName}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.titleBar}>
          <span className={styles.titleText}>Edit URL</span>
        </div>

        <div className={styles.body}>
          <label className={styles.label} htmlFor="file-url-input">
            Address for "{fileName}"
          </label>
          <input
            id="file-url-input"
            ref={inputRef}
            className={styles.urlInput}
            defaultValue={initialUrl}
            onKeyDown={handleInputKeyDown}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.dialogButton} onClick={handleSubmit}>
            OK
          </button>
          <button type="button" className={styles.dialogButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditFileUrlDialog;