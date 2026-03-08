export abstract class FileSystemItemBase {
	public icon: string;
	public name: string;

	protected constructor(icon: string, name: string) {
		this.icon = icon;
		this.name = name;
	}
}

