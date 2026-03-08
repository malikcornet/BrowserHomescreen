import { DirectoryItem, FileItem } from "@entities/filesystem/model";

const quickLinks = [
  new FileItem("youtube", "www.youtube.com"),
  ...Array.from({ length: 10 }, () => new FileItem("google", "www.google.com")),
];

const workDirectory = new DirectoryItem("Work", [
  new FileItem("Project1", "www.project1.com"),
  new FileItem("Project2", "www.project2.com"),
]);

export const rootDirectory = new DirectoryItem("/", [...quickLinks, workDirectory]);
