import React from "react";
import "./style.scss";
import { FaFacebookSquare, FaTwitter  } from "react-icons/fa";

const Footer = () => {
  return <div className="footer text-center flex flex-col justify-center items-center">
    <p className="w-58 mb-10 text-md font-light"  >© 2024-2025 Locknsend.netlify.app Made By <strong>Hasnain Ali Ansari</strong> with ❤️</p>
    <div className="flex gap-10">
        <FaFacebookSquare size={35} />
        <FaTwitter size={35}/>
    </div>
  </div>;
};

export default Footer;
