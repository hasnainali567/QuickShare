import React, { useState } from "react";
import { Popover } from "antd";
import Lottie from "lottie-react";
import CheckedAnimation from "../../assets/lottie/Animation - 1751637267782.json";
import "./style.scss";
import { message } from "antd";

const SharedUrl = ({ shareableUrl, popoverContent, copyUrl }) => {
  const [clicked, setClicked] = useState("not clicked");
  const [messageApi, contextHolder] = message.useMessage();

  const onclick = () => {
    copyUrl();
    setClicked("clicked");
    setTimeout(() => {
      setClicked("not clicked");
    }, 2000);
    messageApi.open({
      type: "success",
      content: "Copied",
    });
  };
  return (
    <div className='url-container w-full p-2.5 my-3 rounded-xl flex justify-between items-center gap-2 shadow-md shadow-blue-200'>
      {contextHolder}
      <p
        onClick={onclick}
        className='url  md:text-xl ps-4 overflow-auto text-blue-500 text-nowrap hover:underline cursor-pointer'
      >
        {shareableUrl}
      </p>

      {clicked === "clicked" ? (
        <div className='px-6'>
          <Lottie
            animationData={CheckedAnimation}
            loop={false}
            style={{ width: "50px" }}
          />
        </div>
      ) : (
        <button
          onClick={onclick}
          className='p-1.5 md:p-2.5 px-5 md:text-xl font-medium bg-blue-500 text-white rounded-lg cursor-pointer'
        >
          Copy
        </button>
      )}
    </div>
  );
};

export default SharedUrl;
