import { useEffect, useRef, useState } from "react";
import { useFileSystem } from "@/contexts/FileSystemContext";
import { FileNode } from "@/types/file-system";
import { Eye, AlertCircle, RotateCw, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreviewPanel() {
  const { files } = useFileSystem();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedFiles, setDebouncedFiles] = useState(files);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPending, setIsPending] = useState(false);

  /**
   * Debounces file changes to prevent excessive preview reloads
   *
   * Waits 800ms after the last file change before updating the preview.
   * This improves performance by avoiding constant re-renders while typing.
   */
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsPending(true);

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedFiles(files);
      setIsPending(false);
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [files]);

  /**
   * Recursively flattens the file tree structure into a single array
   *
   * Traverses the nested folder structure and collects all file nodes,
   * excluding folders from the result.
   *
   * @param nodes - Array of file/folder nodes to traverse
   * @returns Flattened array containing only file nodes
   */
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
    setIsLoading(true);
    setIsPending(false);
    setDebouncedFiles(files);
  };

  useEffect(() => {
    setIsLoading(true);

    const allFiles = getAllFiles(debouncedFiles);
    const appFile = allFiles.find((f) => f.name === "App.tsx");
    const cssFile = allFiles.find((f) => f.name === "index.css");

    console.log(
      "Preview Panel - Files:",
      allFiles.map((f) => f.name),
    );
    console.log("Preview Panel - App File:", appFile);
    console.log("Preview Panel - App Content:", appFile?.content);

    if (!appFile) {
      setError(
        "Missing App.tsx file - Create an App.tsx file to see the preview",
      );
      setIsLoading(false);
      return;
    }

    if (!appFile.content || appFile.content.trim() === "") {
      setError(
        "App.tsx is empty - Click on App.tsx in the file explorer to load the default code",
      );
      setIsLoading(false);
      return;
    }

    try {
      /**
       * Transform ES6 module exports for browser execution
       *
       * Converts various export patterns to browser-compatible code:
       * 1. 'export default App' -> 'const AppComponent = App'
       * 2. 'export default function App()' -> 'function App()'
       * 3. 'export default () => {}' -> 'const AppComponent = () => {}'
       * 4. Removes all named exports (export const/let/var/function/class)
       */
      let transformedCode = appFile.content;

      transformedCode = transformedCode.replace(
        /export\s+default\s+(\w+);?\s*$/m,
        "const AppComponent = $1;",
      );
      transformedCode = transformedCode.replace(
        /export\s+default\s+function\s+(\w+)/g,
        "function $1",
      );

      if (transformedCode.includes("export default")) {
        transformedCode = transformedCode.replace(
          /export\s+default\s+/,
          "const AppComponent = ",
        );
      }

      transformedCode = transformedCode.replace(
        /export\s+(?:const|let|var|function|class)\s+/g,
        "",
      );

      console.log("Transformed Code:", transformedCode);

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
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
    const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext, Fragment } = React;
    
    ${transformedCode}
    
    try {
      const container = document.getElementById('root');
      const root = ReactDOM.createRoot(container);
      
      // Try to find the App component
      let ComponentToRender;
      if (typeof AppComponent !== 'undefined') {
        ComponentToRender = AppComponent;
      } else if (typeof App !== 'undefined') {
        ComponentToRender = App;
      } else {
        throw new Error('No App or AppComponent found. Make sure to export a default component named App.');
      }
      
      console.log('Rendering component:', ComponentToRender);
      root.render(React.createElement(ComponentToRender));
    } catch (error) {
      console.error('Render error:', error);
      document.getElementById('root').innerHTML = \`
        <div style="padding: 20px; color: #ef4444; font-family: monospace; background: #fee2e2; min-height: 100vh;">
          <h2 style="margin-bottom: 10px;">⚠️ Render Error</h2>
          <pre style="white-space: pre-wrap; word-wrap: break-word;">\${error.message}</pre>
          <div style="margin-top: 20px; padding: 10px; background: white; border-radius: 4px;">
            <strong>Tips:</strong>
            <ul style="margin-top: 10px; padding-left: 20px;">
              <li>Make sure your component is named 'App'</li>
              <li>Check for syntax errors in your code</li>
              <li>Ensure all JSX elements are properly closed</li>
            </ul>
          </div>
        </div>
      \`;
    }
  </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      if (iframeRef.current) {
        iframeRef.current.src = url;
        setError(null);

        iframeRef.current.onload = () => {
          setIsLoading(false);
        };
      }

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error("Preview error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setIsLoading(false);
    }
  }, [debouncedFiles, key]);

  return (
    <div className="h-full bg-editor-bg flex flex-col">
      <div className="h-10 flex items-center justify-between px-4 border-b border-panel-border bg-titlebar-bg">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Preview</span>
          {isPending && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3 animate-pulse" />
              <span>Updating...</span>
            </span>
          )}
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
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading preview...
                </p>
              </div>
            </div>
          )}
          <iframe
            key={key}
            ref={iframeRef}
            className="w-full h-full border-0 bg-white"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
    </div>
  );
}
