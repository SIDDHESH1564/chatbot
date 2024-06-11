import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ImageLoadWithAnim(props: any) {
  const [isLoading, setisLoading] = useState(true);
  useEffect(() => {
    const img = new Image();
    img.src = props.src;
    img.onload = () => {
      setisLoading(false);
    };
  }, [props]);
  if (props.dtype === "image") {
    return (
      <span className="message-img-loader-outer" aria-hidden="true" style={{ display: "inline-block" }}>
        {isLoading ? (
          <span className="message-img-loader"></span>
        ) : (
          <>
            <motion.img initial={{ opacity: 0, filter: "blur(5px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} {...props} draggable={false} />
          </>
        )}
      </span>
    );
  } else {
    return (
      <span className="message-img-loader-outer" aria-hidden="true" style={{ display: "inline-block" }}>
        <motion.img initial={{ opacity: 0, filter: "blur(5px)" }} animate={{ opacity: 0.6, filter: "blur(0px) drop-shadow(0px 0px 1.5px rgba(99, 99, 99, 1))" }} className="video-icon" src={"/video-icon.png"} loading="lazy" alt="video-icon" draggable={false} onClick={props.onClick} />
      </span>
    );
  }
}
