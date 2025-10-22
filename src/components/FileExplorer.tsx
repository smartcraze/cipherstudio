import { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  FolderPlus,
  Trash2,
} from "lucide-react";
import { FileNode } from "@/types/file-system";
import { useFileSystem } from "@/contexts/FileSystemContext";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";

export function FileExplorer() {
  const {
    files,
    selectedFile,
    openFile,
    createFile,
    createFolder,
    deleteNode,
    toggleFolder,
  } = useFileSystem();

  const [creatingType, setCreatingType] = useState<"file" | "folder" | null>(null);
  const [creatingParentId, setCreatingParentId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startCreating = (type: "file" | "folder", parentId: string | null) => {
    setCreatingType(type);
    setCreatingParentId(parentId);
    setNewName("");
  };

  const handleCreate = () => {
    if (!newName.trim()) {
      cancelCreating();
      return;
    }
    if (creatingType === "file") {
      createFile(creatingParentId, newName);
    } else if (creatingType === "folder") {
      createFolder(creatingParentId, newName);
    }
    cancelCreating();
  };

  const cancelCreating = () => {
    setCreatingType(null);
    setCreatingParentId(null);
    setNewName("");
  };

  /**
   * Handles blur event when creating a new file/folder
   * 
   * Adds a 150ms delay to allow click events to register before finalizing
   * the file/folder creation. This prevents premature cancellation when
   * clicking UI elements.
   */
  const handleBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      if (creatingType) {
        handleCreate();
      }
    }, 150);
  };

  useEffect(() => {
    if (creatingType && inputRef.current) {
      inputRef.current.focus();
    }
  }, [creatingType]);

  /**
   * Recursively renders a file tree node with proper indentation
   * 
   * Handles both files and folders, with support for:
   * - Collapsible folder navigation
   * - File selection highlighting
   * - Context menu operations
   * - Inline file/folder creation
   * 
   * @param node - File or folder node to render
   * @param depth - Current nesting level for indentation calculation
   */
  const FileTreeNode = ({ node, depth = 0 }: { node: FileNode; depth?: number }) => {
    const isFolder = node.type === "folder";
    const isSelected = selectedFile?.id === node.id;
    const showCreatingHere = isFolder && node.isOpen && creatingParentId === node.id;

    return (
      <div>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={`
                flex items-center gap-1 px-2 py-1 cursor-pointer
                hover:bg-sidebar-hover transition-colors
                ${isSelected ? "bg-sidebar-active" : ""}
              `}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onClick={() => {
                if (isFolder) {
                  toggleFolder(node.id);
                } else {
                  openFile(node);
                }
              }}
            >
              {isFolder && (
                <span className="w-4 h-4 flex items-center justify-center">
                  {node.isOpen ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </span>
              )}
              {!isFolder && <span className="w-4" />}
              
              {isFolder ? (
                node.isOpen ? (
                  <FolderOpen className="w-4 h-4 text-primary" />
                ) : (
                  <Folder className="w-4 h-4 text-primary" />
                )
              ) : (
                <File className="w-4 h-4 text-muted-foreground" />
              )}
              
              <span className="text-sm truncate">{node.name}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {isFolder && (
              <>
                <ContextMenuItem onClick={() => startCreating("file", node.id)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New File
                </ContextMenuItem>
                <ContextMenuItem onClick={() => startCreating("folder", node.id)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </ContextMenuItem>
              </>
            )}
            <ContextMenuItem
              onClick={() => deleteNode(node.id)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {isFolder && node.isOpen && (
          <div>
            {showCreatingHere && (
              <div
                className="flex items-center gap-1 px-2 py-1 bg-sidebar-hover"
                style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
              >
                <span className="w-4" />
                {creatingType === "folder" ? (
                  <Folder className="w-4 h-4 text-primary" />
                ) : (
                  <File className="w-4 h-4 text-muted-foreground" />
                )}
                <Input
                  ref={inputRef}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") cancelCreating();
                  }}
                  onBlur={handleBlur}
                  className="h-6 text-sm bg-editor-bg border-primary"
                  placeholder={creatingType === "file" ? "filename.tsx" : "foldername"}
                  autoFocus
                />
              </div>
            )}
            {node.children?.map((child) => (
              <FileTreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-sidebar-bg flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-panel-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Explorer
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => startCreating("file", null)}
            title="New File"
          >
            <Plus className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => startCreating("folder", null)}
            title="New Folder"
          >
            <FolderPlus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {creatingParentId === null && creatingType && (
          <div className="flex items-center gap-1 px-2 py-1 bg-sidebar-hover">
            <span className="w-4" />
            {creatingType === "folder" ? (
              <Folder className="w-4 h-4 text-primary" />
            ) : (
              <File className="w-4 h-4 text-muted-foreground" />
            )}
            <Input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") cancelCreating();
              }}
              onBlur={handleBlur}
              className="h-6 text-sm bg-editor-bg border-primary"
              placeholder={creatingType === "file" ? "filename.tsx" : "foldername"}
              autoFocus
            />
          </div>
        )}
        {files.map((node) => (
          <FileTreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
