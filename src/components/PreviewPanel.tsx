import { useEffect, useRef, useState } from "react";
import { useFileSystem } from "@/contexts/FileSystemContext";
import { FileNode } from "@/types/file-system";
import { Eye, AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreviewPanel() {
  const { files } = useFileSystem();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  const getAllFiles = (nodes: FileNode[]): FileNode[] => {
    let result: FileNode[] = [];
    nodes.forEach((node) => {
      if (node.type === "file") {
        result.push(node);
      }
      if (node.children) {
        result = [...result, ...getAllFiles(node.children)];
      }
    });
    return result;
  };

  const refresh = () => {
    setKey((prev) => prev + 1);
    setError(null);
  };

  useEffect(() => {
    const allFiles = getAllFiles(files);
    const appFile = allFiles.find((f) => f.name === "App.tsx");
    const indexFile = allFiles.find((f) => f.name === "index.tsx");
    const cssFile = allFiles.find((f) => f.name === "index.css");

    if (!appFile || !indexFile) {
      setError("Missing required files (App.tsx or index.tsx)");
      return;
    }

    try {
      const code = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              ${cssFile?.content || ""}
              body { margin: 0; padding: 0; }
              #root { min-height: 100vh; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              const { useState, useEffect, useRef, useMemo, useCallback } = React;
              
              ${appFile.content}
              
              const container = document.getElementById('root');
              const root = ReactDOM.createRoot(container);
              
              try {
                root.render(React.createElement(App));
              } catch (error) {
                container.innerHTML = '<div style="padding: 20px; color: red; font-family: monospace;">Error: ' + error.message + '</div>';
              }
            </script>
          </body>
        </html>
      `;

      const iframe = iframeRef.current;
      if (iframe) {
        const blob = new Blob([code], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        iframe.src = url;
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [files, key]);

  return (
    <div className="h-full bg-editor-bg flex flex-col">
      <div className="h-10 flex items-center justify-between px-4 border-b border-panel-border bg-titlebar-bg">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Preview</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={refresh}
        >
          <RotateCw className="w-3 h-3" />
        </Button>
      </div>
      
      {error ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-destructive">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p className="font-semibold mb-2">Preview Error</p>
            <p className="text-sm">{error}</p>
            <Button onClick={refresh} className="mt-4" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <iframe
          key={key}
          ref={iframeRef}
          className="flex-1 w-full border-0 bg-white"
          title="Preview"
          sandbox="allow-scripts"
        />
      )}
    </div>
  );
}
