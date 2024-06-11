import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ImageCarouselModal(props: { handleModalClose: any; currImageId: any; convId: any; related_image_data: any }) {
  // State variables
  const [imageArray, setImageArray] = useState(props.related_image_data);
  const [currImageIndex, setCurrImageIndex] = useState(props.related_image_data.findIndex((image: any) => image.image_id === props.currImageId));
  const [currImageId, setcurrImageId] = useState(props.currImageId);


  // Handle next carousel button
  const handleImgNext = () => {
    let currimgindex = null;
    if (currImageIndex === imageArray.length - 1) {
      currimgindex = 0;
    } else {
      currimgindex = currImageIndex + 1;
    }

    const currimgid = imageArray[currimgindex].image_id;
    const convId = props.convId + "conv";

    setCurrImageIndex(currimgindex);
    setcurrImageId(currimgid);

    // console.log("currimgid carousel ", currimgid);
  };

  // Handle previous carousel button
  const handleImgPrev = () => {
    let currimgindex = null;
    if (currImageIndex === 0) {
      currimgindex = imageArray.length - 1;
    } else {
      currimgindex = currImageIndex - 1;
    }

    const currimgid = imageArray[currimgindex].image_id;
    const convId = props.convId + "conv";

    setCurrImageIndex(currimgindex);
    setcurrImageId(currimgid);

    // console.log("currimgid carousel ", currimgid);
  };

  // Close modal when clicked outside of modal
  const handleOutsideClick = (e: any) => {
    // if (!e.target.closest(".message-carousel-next")) {
    //     props.handleModalClose();
    // }
  };

  // Pre manipulation of the data
  useEffect(() => {
    setcurrImageId(props.currImageId);
    setImageArray(props.related_image_data);
    setCurrImageIndex(props.related_image_data.findIndex((image: any) => image.image_id === props.currImageId || image.video_id === props.currImageId));
    // console.log("usereffect currImageId ", props.currImageId);
  }, []);

  // Return null if no image id or related image data is passed
  if (props.related_image_data === null || !props.currImageId) {
    return null;
  } else {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="image-carousel-modal" onMouseDown={handleOutsideClick}>
        <div className="message-carousel-indicator">
          <div
            className="message-carousel-prev"
            onClick={() => {
              handleImgPrev();
            }}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </div>
          <div
            className="message-carousel-next"
            onClick={() => {
              handleImgNext();
            }}>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
          {currImageIndex + 1 + " / " + imageArray.length}
        </div>
        <motion.div initial={{ opacity: 0, zoom: 0.97 }} animate={{ opacity: 1, zoom: 1 }} exit={{ opacity: 0, zoom: 0.97 }} transition={{ duration: 0.1 }} className="image-carousel-modal-content">
          {/* Change component based on the image or video or youtube video */}
          {props.related_image_data[currImageIndex]?.image_url && imageArray[currImageIndex].image_url.includes(".mp4") ? (
            <video className="image-carousel-modal-content-image" controls>
              <source src={process.env.NEXT_PUBLIC_BACKEND_URL + imageArray[currImageIndex].image_url} type="video/mp4"></source>
            </video>
          ) : (
            <div className="image-carousel-modal-content-image" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BACKEND_URL}${props.related_image_data[currImageIndex]?.image_url})` }}></div>
          )}
          <div className="image-carousel-modal-content-close-button image-carousel-modal-buttons" onClick={props.handleModalClose}>
            <img src={"/close_FILL0_wght400_GRAD200_opsz48.svg"} alt="close" />
          </div>
        </motion.div>
      </motion.div>
    );
  }
}
