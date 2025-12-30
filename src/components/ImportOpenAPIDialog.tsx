"use client";

import { useState } from "react";
import { Loader2, Link, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOpenAPIStore } from "@/store/openApiStore";
import { MonacoEditor } from "./MonacoEditor";

interface ImportOpenAPIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportOpenAPIDialog({
  open,
  onOpenChange,
}: ImportOpenAPIDialogProps) {
  const [url, setUrl] = useState("");
  const [specText, setSpecText] = useState("");
  const [activeTab, setActiveTab] = useState("url");

  const { importFromUrl, importFromText, isImporting, importError } =
    useOpenAPIStore();

  const handleImportFromUrl = async () => {
    await importFromUrl(url);
    if (!importError) {
      setUrl("");
      onOpenChange(false);
    }
  };

  const handleImportFromText = async () => {
    await importFromText(specText);
    if (!importError) {
      setSpecText("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import OpenAPI Specification</DialogTitle>
          <DialogDescription>
            Import an OpenAPI/Swagger specification from a URL or paste the content directly.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="url" className="flex-1">
              <Link className="w-4 h-4 mr-2" />
              From URL
            </TabsTrigger>
            <TabsTrigger value="text" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Paste Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-4">
            <div className="space-y-4">
              <Input
                placeholder="https://api.example.com/openapi.json"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                Enter the URL of an OpenAPI specification (JSON or YAML format).
              </p>
            </div>
          </TabsContent>

          <TabsContent value="text" className="mt-4">
            <div className="space-y-4">
              <div className="h-64 border rounded-md overflow-hidden">
                <MonacoEditor
                  value={specText}
                  onChange={setSpecText}
                  language="json"
                  readOnly={false}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Paste your OpenAPI specification content (JSON or YAML format).
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {importError && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {importError}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={activeTab === "url" ? handleImportFromUrl : handleImportFromText}
            disabled={isImporting || (activeTab === "url" ? !url : !specText)}
          >
            {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


