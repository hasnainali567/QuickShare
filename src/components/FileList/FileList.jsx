import React from "react";
import File from "../File/File.jsx";
import Dropzone from "../Dropzone/Dropzone.jsx";
import './style.scss'

const FileList = ({ files }) => {
  console.log(files);
  
  return (
    <div className="flex flex-wrap ">
        {files.map((file, i) => <File file={file} key={i}/>)}
    </div>
  )
};

export default FileList;
