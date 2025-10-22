import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"file" | "folder">("file");
  const [dialogParentId, setDialogParentId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    if (dialogType === "file") {
      createFile(dialogParentId, newName);
    } else {
      createFolder(dialogParentId, newName);
    }
    setDialogOpen(false);
    setNewName("");
  };

  const openDialog = (type: "file" | "folder", parentId: string | null) => {
    setDialogType(type);
    setDialogParentId(parentId);
    setDialogOpen(true);
  };

  const FileTreeNode = ({ node, depth = 0 }: { node: FileNode; depth?: number }) => {
    const isFolder = node.type === "folder";
    const isSelected = selectedFile?.id === node.id;

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
                <ContextMenuItem onClick={() => openDialog("file", node.id)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New File
                </ContextMenuItem>
                <ContextMenuItem onClick={() => openDialog("folder", node.id)}>
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

        {isFolder && node.isOpen && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
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
              onClick={() => openDialog("file", null)}
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => openDialog("folder", null)}
            >
              <FolderPlus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {files.map((node) => (
            <FileTreeNode key={node.id} node={node} />
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New {dialogType === "file" ? "File" : "Folder"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={dialogType === "file" ? "file.tsx" : "folder-name"}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
