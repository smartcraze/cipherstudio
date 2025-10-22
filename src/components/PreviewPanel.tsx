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
  const [blobUrl, setBlobUrl] = useState<string>("");
  const hasInitialized = useRef(false);

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

  // Force initial render
  useEffect(() => {
    if (!hasInitialized.current && files.length > 0) {
      hasInitialized.current = true;
      setTimeout(() => setKey(1), 100);
    }
  }, [files]);

  useEffect(() => {
    // Clean up previous blob URL
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }

    const allFiles = getAllFiles(files);
    const appFile = allFiles.find((f) => f.name === "App.tsx");
    const cssFile = allFiles.find((f) => f.name === "index.css");

    if (!appFile) {
      setError("Missing App.tsx file");
      return;
    }

    if (!appFile.content || appFile.content.trim() === "") {
      setError("App.tsx is empty - click on App.tsx to view the default code");
      return;
    }

    try {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    #root { min-height: 100vh; }
    ${cssFile?.content || ""}
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext } = React;
    
    ${appFile.content}
    
    try {
      const container = document.getElementById('root');
      const root = ReactDOM.createRoot(container);
      root.render(React.createElement(App));
    } catch (error) {
      console.error('Render error:', error);
      document.getElementById('root').innerHTML = \`
        <div style="padding: 20px; color: #ef4444; font-family: monospace; background: #fee2e2; min-height: 100vh;">
          <h2 style="margin-bottom: 10px;">⚠️ Render Error</h2>
          <pre style="white-space: pre-wrap; word-wrap: break-word;">\${error.message}</pre>
        </div>
      \`;
    }
  </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      
      if (iframeRef.current) {
        iframeRef.current.src = url;
        setError(null);
      }
    } catch (err) {
      console.error("Preview error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }

    // Cleanup function
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
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
          title="Refresh Preview"
        >
          <RotateCw className="w-3 h-3" />
        </Button>
      </div>
      
      {error ? (
        <div className="flex-1 flex items-center justify-center p-4 bg-white">
          <div className="text-center text-destructive max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p className="font-semibold mb-2">Preview Error</p>
            <p className="text-sm mb-4">{error}</p>
            <Button onClick={refresh} size="sm">
              Refresh
            </Button>
          </div>
        </div>
      ) : (
        <iframe
          key={key}
          ref={iframeRef}
          className="flex-1 w-full border-0 bg-white"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      )}
    </div>
  );
}
