"use client";

import { Message, useChat } from "ai/react";
import React, { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChatProps } from "./chat";
import Image from "next/image";
import CodeDisplayBlock from "../code-display-block";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ImageCarouselModal from "./ImageCarouselModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import ImageLoadWithAnim from "./ImageLoadWithAnim";
import "./Chatbot-v2.css";
import Script from "next/script";

export default function ChatList({ messages, input, handleInputChange, handleSubmit, isLoading, error, stop, loadingSubmit, chatId }: ChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [name, setName] = React.useState<string>("");
  const [localStorageIsLoading, setLocalStorageIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CurrentImageId, setCurrentImageId] = useState(0);
  const [AllowImageFrame, setAllowImageFrame] = useState(true);
  const [ShouldHideLeftScroll, setShouldHideLeftScroll] = useState(false);
  const [ShouldHideRightScroll, setShouldHideRightScroll] = useState(false);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const username = localStorage.getItem("ollama_user");
    if (username) {
      setName(username);
      setLocalStorageIsLoading(false);
    }
  }, []);

  if (messages.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="flex flex-col gap-4 items-center">
          <Image src="/yozu.png" alt="AI" width={60} height={60} className="h-20 w-14 object-contain" />
          <p className="text-center text-lg text-muted-foreground">How can I help you today?</p>
        </div>
      </div>
    );
  }

  // ------------------------------ YoZu specific functions -----------------------------------------
  // Make images full screen on click
  const handleImgClick = (key: number, ridata: any) => {
    console.log("make img fullscreen - ", { key, ridata });
    setCurrentImageId((prev) => key);
    setTimeout(() => {
      setIsModalOpen(true);
    }, 500);
  };

  // Close image modal
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Images horizontal scroll button handler
  const scroll = (direction: number, indexa: number) => {
    let far: any = ($(".message-images").width() as any) * direction;
    let pos: any = $(`.message-images[indexa="${indexa}"]`).scrollLeft() + far;
    $(`.message-images[indexa="${indexa}"`).animate({ scrollLeft: pos }, 10);
  };

  // Hides the buttons when carousel is scrolled to either end
  const handleScrollBtnVisibility = (indexa: number) => {
    let tolerance = 2;
    let containerScrollIndex = indexa;
    let messageImagesWidth = document.querySelector(`.message-images[indexa="${containerScrollIndex}"]`)?.scrollWidth as number;
    let messageImagesScrollLeft = document.querySelector(`.message-images[indexa="${containerScrollIndex}"]`)?.scrollLeft as number;
    let messageImagesClientWidth = document.querySelector(`.message-images[indexa="${containerScrollIndex}"]`)?.clientWidth as number;
    setShouldHideLeftScroll(messageImagesScrollLeft <= tolerance);
    setShouldHideRightScroll(messageImagesScrollLeft >= messageImagesWidth - messageImagesClientWidth - tolerance);
  };

  return (
    <div id="scroller" className="w-full overflow-y-scroll overflow-x-hidden h-full justify-end">
      <div className="w-full flex flex-col overflow-x-hidden overflow-y-hidden min-h-full justify-end">
        {messages.map((message, index) => {
          const ridata = JSON.parse(message.content).related_image_data;
          return (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, scale: 1, y: 20, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 20, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: "spring",
                  bounce: 0.3,
                  duration: messages.indexOf(message) * 0.05 + 0.2,
                },
              }}
              className={cn("flex flex-col gap-2 p-4 whitespace-pre-wrap", message.role === "user" ? "items-end" : "items-start")}>
              <div className="flex gap-3 items-center">
                {message.role === "user" && (
                  <div className="flex items-end gap-3">
                    <span className="bg-accent p-3 rounded-md max-w-xs sm:max-w-2xl overflow-x-auto">{`${JSON.parse(message.content).content}`}</span>
                    <Avatar className="flex justify-start items-center overflow-hidden">
                      <AvatarImage src="/" alt="user" width={6} height={6} className="object-contain" />
                      <AvatarFallback>{name && name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                {message.role === "assistant" && (
                  <div className="flex items-end gap-2">
                    <Avatar className="flex justify-start items-center">
                      <AvatarImage src="/yozu.png" alt="AI" width={6} height={6} className="object-contain" />
                    </Avatar>
                    <span className="bg-accent p-3 rounded-md max-w-xs sm:max-w-2xl overflow-x-auto">
                      {/* Check if the message content contains a code block */}
                      {JSON.parse(message.content)
                        .content.split("```")
                        .map((part: string, index: number) => {
                          if (index % 2 === 0) {
                            return (
                              <Markdown key={index} remarkPlugins={[remarkGfm]}>
                                {part}
                              </Markdown>
                            );
                          } else {
                            return (
                              <pre className="whitespace-pre-wrap" key={index}>
                                <CodeDisplayBlock code={part} lang="" />
                              </pre>
                            );
                          }
                        })}
                      {isLoading && messages.indexOf(message) === messages.length - 1 && (
                        <span className="animate-pulse" aria-label="Typing">
                          ...
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
              {/* --------------------- YoZu Audio/Video Component -------------------- */}
              <AnimatePresence>{isModalOpen && ridata !== null && CurrentImageId !== 0 && <ImageCarouselModal key={message.id} handleModalClose={handleModalClose} currImageId={CurrentImageId} convId={index} related_image_data={ridata} />}</AnimatePresence>
              {message.role === "assistant" && AllowImageFrame ? (
                <>
                  <div className="message-images-frame">
                    <div
                      className="message-images-prev"
                      onClick={() => {
                        scroll(-1, index);
                      }}
                      style={ShouldHideLeftScroll ? { display: "none" } : {}}>
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </div>
                    <div
                      className="message-images-next"
                      onClick={() => {
                        scroll(1, index);
                      }}
                      style={ShouldHideRightScroll ? { display: "none" } : {}}>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </div>
                    <div
                      className="message-images"
                      onScroll={() => {
                        handleScrollBtnVisibility(index);
                      }}
                      indexa={index}>
                      {ridata.map((image: any) => (
                        <ImageLoadWithAnim
                          key={image.image_id}
                          className="message-img"
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${image.image_url ? image.image_url : image.thumbnail}`}
                          loading="lazy"
                          alt="image"
                          onClick={() => {
                            handleImgClick(image.image_id, ridata);
                          }}
                          dtype={image.image_url.includes(".mp4") ? "video" : "image"}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </motion.div>
          );
        })}
        {loadingSubmit && (
          <div className="flex pl-4 pb-4 gap-2 items-center">
            <Avatar className="flex justify-start items-center">
              <AvatarImage src="/yozu.png" alt="AI" width={6} height={6} className="object-contain" />
            </Avatar>
            <div className="bg-accent p-3 rounded-md max-w-xs sm:max-w-2xl overflow-x-auto">
              <div className="flex gap-1">
                <span className="size-1.5 rounded-full bg-slate-700 motion-safe:animate-[bounce_1s_ease-in-out_infinite] dark:bg-slate-300"></span>
                <span className="size-1.5 rounded-full bg-slate-700 motion-safe:animate-[bounce_0.5s_ease-in-out_infinite] dark:bg-slate-300"></span>
                <span className="size-1.5 rounded-full bg-slate-700 motion-safe:animate-[bounce_1s_ease-in-out_infinite] dark:bg-slate-300"></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div id="anchor" ref={bottomRef}></div>
    </div>
  );
}
