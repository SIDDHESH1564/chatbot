"use client";

import { ChatLayout } from "@/components/chat/chat-layout";
import { getSelectedModel } from "@/lib/model-helper";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { ChatRequestOptions } from "ai";
import { Message, useChat } from "ai/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function Page({ params }: { params: { id: string } }) {
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
    if (params.id) {
      const item = localStorage.getItem(`chat_${params.id}`);
      if (item) {
        setMessages(JSON.parse(item));
      }
    }
  }, [setMessages]);

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
      formData.append("query", input);
      formData.append("isNewSession", "0");

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
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

  // When starting a new chat, append the messages to the local storage
  React.useEffect(() => {
    if (!isLoading && !error && messages.length > 0) {
      localStorage.setItem(`chat_${params.id}`, JSON.stringify(messages));
      // Trigger the storage event to update the sidebar component
      window.dispatchEvent(new Event("storage"));
    }
  }, [messages, chatId, isLoading, error]);

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center">
      <ChatLayout chatId={params.id} setSelectedModel={setSelectedModel} messages={messages} input={input} handleInputChange={handleInputChange} handleSubmit={onSubmit} isLoading={isLoading} loadingSubmit={loadingSubmit} error={error} stop={stop} navCollapsedSize={100} defaultLayout={[30, 160]} />
    </main>
  );
}
