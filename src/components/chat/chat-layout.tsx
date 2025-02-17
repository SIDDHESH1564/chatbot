"use client";

import React, { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Sidebar } from "../sidebar";
import { useChat } from "ai/react";
import Chat, { ChatProps } from "./chat";
import ChatList from "./chat-list";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";

interface ChatLayoutProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
  chatId: string;
}

type MergedProps = ChatLayoutProps & ChatProps;

export function ChatLayout({ defaultLayout = [30, 160], defaultCollapsed = false, navCollapsedSize, messages, input, handleInputChange, handleSubmit, isLoading, error, stop, chatId, setSelectedModel, loadingSubmit }: MergedProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth <= 1023);
    };

    // Initial check
    checkScreenWidth();

    // Event listener for screen width changes
    window.addEventListener("resize", checkScreenWidth);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
      }}
      className="h-screen items-stretch">
      <ResizablePanel defaultSize={40} collapsible={false} className={cn("min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out")}>
        <Sidebar isCollapsed={false} messages={messages} isMobile={false} chatId={chatId} />
      </ResizablePanel>
      <ResizableHandle className={cn("hidden md:flex")} withHandle />
      <ResizablePanel className="h-full" defaultSize={defaultLayout[1]}>
        <Chat chatId={chatId} setSelectedModel={setSelectedModel} messages={messages} input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit} isLoading={isLoading} loadingSubmit={loadingSubmit} error={error} stop={stop} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
