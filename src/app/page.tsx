"use client";

import { ChatLayout } from "@/components/chat/chat-layout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UsernameForm from "@/components/username-form";
import { getSelectedModel } from "@/lib/model-helper";
import { ChatRequestOptions } from "ai";
import { useChat } from "ai/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, stop, setMessages, setInput } = useChat({
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onError: (error) => {
      setLoadingSubmit(false);
      toast.error("An error occurred. Please try again.");
    },
  });
  const [chatId, setChatId] = React.useState<string>("");
  const [selectedModel, setSelectedModel] = React.useState<string>(getSelectedModel());
  const [open, setOpen] = React.useState(false);
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !error && chatId && messages.length > 0) {
      // Save messages to local storage
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
      // Trigger the storage event to update the sidebar component
      window.dispatchEvent(new Event("storage"));
    }
  }, [messages, chatId, isLoading, error]);

  useEffect(() => {
    if (!localStorage.getItem("ollama_user")) {
      setOpen(true);
    }
  }, []);

  const addMessage = (Message: any) => {
    messages.push(Message);
    window.dispatchEvent(new Event("storage"));
    setMessages([...messages]);
  };

  // Function to handle chatting with Ollama in production (client side)
  const handleSubmitProduction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    addMessage({ role: "user", content: JSON.stringify({ content: input, related_image_data: null }), id: chatId });
    setInput("");

    try {
      const formData = new FormData();
      formData.append("assistant_id", "asst_JLC7XTONNE4jzcaV1splSTvj");
      formData.append("file_id", "file-HaHqL0ppcFON5QGifywjel1o");
      formData.append("message", input);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/send`, {
        method: "POST",
        body: formData,
      });
      let responseJson = await response.json();

      setMessages([...messages, { role: "assistant", content: JSON.stringify({ content: responseJson.response, related_image_data: responseJson.related_image_data }), id: responseJson.conv_id }]);
      setLoadingSubmit(false);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setLoadingSubmit(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(true);

    if (messages.length === 0) {
      // Generate a random id for the chat
      const id = uuidv4();
      setChatId(id);
    }

    setMessages([...messages]);

    handleSubmitProduction(e);
  };

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center ">
      <Dialog open={open} onOpenChange={setOpen}>
        <ChatLayout chatId="" setSelectedModel={setSelectedModel} messages={messages} input={input} handleInputChange={handleInputChange} handleSubmit={onSubmit} isLoading={isLoading} loadingSubmit={loadingSubmit} error={error} stop={stop} navCollapsedSize={100} defaultLayout={[30, 160]} />
        <DialogContent className="flex flex-col space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle>Welcome to YoZu!</DialogTitle>
            <DialogDescription>Enter your name to get started. This is just to personalize your experience.</DialogDescription>
            <UsernameForm setOpen={setOpen} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
}
