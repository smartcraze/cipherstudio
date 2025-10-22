import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FileNode, FileSystemContextType } from "@/types/file-system";
import { toast } from "@/hooks/use-toast";

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

const defaultFiles: FileNode[] = [
  {
    id: "1",
    name: "src",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: "2",
        name: "App.tsx",
        type: "file",
        content: `import React from 'react';\n\nfunction App() {\n  return (\n    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">\n      <div className="text-center text-white">\n        <h1 className="text-5xl font-bold mb-4">Welcome to CipherStudio</h1>\n        <p className="text-xl">Start coding your React app here!</p>\n      </div>\n    </div>\n  );\n}\n\nexport default App;`,
      },
      {
        id: "3",
        name: "index.tsx",
        type: "file",
        content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`,
      },
      {
        id: "4",
        name: "index.css",
        type: "file",
        content: `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;\n}`,
      },
    ],
  },
];

export function FileSystemProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileNode[]>(() => {
    const saved = localStorage.getItem("cipherstudio-files");
    return saved ? JSON.parse(saved) : defaultFiles;
  });
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  useEffect(() => {
    localStorage.setItem("cipherstudio-files", JSON.stringify(files));
  }, [files]);

  const findNodeById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const openFile = (file: FileNode) => {
    if (file.type === "file") {
      setSelectedFile(file);
    }
  };

  const createFile = (parentId: string | null, name: string) => {
    const newFile: FileNode = {
      id: Date.now().toString(),
      name,
      type: "file",
      content: "",
    };

    if (!parentId) {
      setFiles([...files, newFile]);
    } else {
      const addToParent = (nodes: FileNode[]): FileNode[] =>
        nodes.map((node) => {
          if (node.id === parentId && node.type === "folder") {
            return {
              ...node,
              children: [...(node.children || []), newFile],
              isOpen: true,
            };
          }
          if (node.children) {
            return { ...node, children: addToParent(node.children) };
          }
          return node;
        });
      setFiles(addToParent(files));
    }
    toast({ title: "File created", description: `${name} has been created.` });
  };

  const createFolder = (parentId: string | null, name: string) => {
    const newFolder: FileNode = {
      id: Date.now().toString(),
      name,
      type: "folder",
      children: [],
      isOpen: false,
    };

    if (!parentId) {
      setFiles([...files, newFolder]);
    } else {
      const addToParent = (nodes: FileNode[]): FileNode[] =>
        nodes.map((node) => {
          if (node.id === parentId && node.type === "folder") {
            return {
              ...node,
              children: [...(node.children || []), newFolder],
              isOpen: true,
            };
          }
          if (node.children) {
            return { ...node, children: addToParent(node.children) };
          }
          return node;
        });
      setFiles(addToParent(files));
    }
    toast({ title: "Folder created", description: `${name} has been created.` });
  };

  const deleteNode = (id: string) => {
    const removeNode = (nodes: FileNode[]): FileNode[] =>
      nodes.filter((node) => {
        if (node.id === id) return false;
        if (node.children) {
          node.children = removeNode(node.children);
        }
        return true;
      });
    
    if (selectedFile?.id === id) {
      setSelectedFile(null);
    }
    setFiles(removeNode(files));
    toast({ title: "Deleted", description: "Item has been deleted." });
  };

  const updateFileContent = (id: string, content: string) => {
    const updateContent = (nodes: FileNode[]): FileNode[] =>
      nodes.map((node) => {
        if (node.id === id && node.type === "file") {
          return { ...node, content };
        }
        if (node.children) {
          return { ...node, children: updateContent(node.children) };
        }
        return node;
      });
    setFiles(updateContent(files));
    
    if (selectedFile?.id === id) {
      setSelectedFile({ ...selectedFile, content });
    }
  };

  const toggleFolder = (id: string) => {
    const toggle = (nodes: FileNode[]): FileNode[] =>
      nodes.map((node) => {
        if (node.id === id && node.type === "folder") {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: toggle(node.children) };
        }
        return node;
      });
    setFiles(toggle(files));
  };

  const exportProject = () => {
    const dataStr = JSON.stringify(files, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cipherstudio-project.json";
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Project exported successfully." });
  };

  const importProject = (fileList: FileList) => {
    const file = fileList[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setFiles(imported);
        setSelectedFile(null);
        toast({ title: "Imported", description: "Project imported successfully." });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import project.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <FileSystemContext.Provider
      value={{
        files,
        selectedFile,
        openFile,
        createFile,
        createFolder,
        deleteNode,
        updateFileContent,
        toggleFolder,
        exportProject,
        importProject,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error("useFileSystem must be used within FileSystemProvider");
  }
  return context;
};
