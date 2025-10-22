export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

export interface FileSystemContextType {
  files: FileNode[];
  selectedFile: FileNode | null;
  openFile: (file: FileNode) => void;
  createFile: (parentId: string | null, name: string) => void;
  createFolder: (parentId: string | null, name: string) => void;
  deleteNode: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  toggleFolder: (id: string) => void;
  exportProject: () => void;
  importProject: (files: FileList) => void;
}
