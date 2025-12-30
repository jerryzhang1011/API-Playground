"use client";

import { Sidebar } from "@/components/Sidebar";
import { RequestBuilder } from "@/components/RequestBuilder";
import { ResponseViewer } from "@/components/ResponseViewer";
import { UrlBar } from "@/components/UrlBar";
import { useRequestStore } from "@/store/requestStore";

export default function Home() {
  const { response, isLoading } = useRequestStore();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* URL Bar */}
        <UrlBar />

        {/* Split Pane: Request / Response */}
        <div className="flex-1 flex overflow-hidden">
          {/* Request Builder */}
          <div className="w-1/2 border-r border-border overflow-hidden flex flex-col">
            <RequestBuilder />
          </div>

          {/* Response Viewer */}
          <div className="w-1/2 overflow-hidden flex flex-col">
            <ResponseViewer response={response} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}


