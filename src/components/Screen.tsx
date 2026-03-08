import Desktop from "./Desktop";
import TaskBar from "./TaskBar";
import ComponentStyle from "./Screen.module.css";
import { DirectoryItem } from "../models/directoryitem";
import { FileItem } from "../models/fileitem";

const rootDirectory: DirectoryItem = new DirectoryItem("/", [
  new FileItem("youtube", "www.youtube.com"),
  new FileItem("google", "www.google.com"),
  new FileItem("google", "www.google.com"),
  new FileItem("google", "www.google.com"),
  new FileItem("google", "www.google.com"),
  new FileItem("google", "www.google.com"),
  new FileItem("google", "www.google.com"),
  new FileItem("google", "www.google.com"),
  new FileItem("google", "www.google.com"),
  new FileItem("google", "www.google.com"),
  new FileItem("google", "www.google.com"),
  new DirectoryItem("Work", [
    new FileItem("Project1", "www.project1.com"),
    new FileItem("Project2", "www.project2.com"),
  ]),
]);

function Screen() {
  return (
    <div className={ComponentStyle.screen}>
      <Desktop rootDirectory={rootDirectory} />
      <TaskBar />
    </div>
  );
}

export default Screen;