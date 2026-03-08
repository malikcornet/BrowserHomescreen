export type FileSystemItemKind = "directory" | "file";

export abstract class FileSystemItemBase {
	public readonly kind: FileSystemItemKind;
	public readonly icon: string;
	public name: string;

	protected constructor(kind: FileSystemItemKind, icon: string, name: string) {
		this.kind = kind;
		this.icon = icon;
		this.name = name;
	}
}

