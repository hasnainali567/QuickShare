import React, { useState } from "react";
import File from "../File/File.jsx";
import Dropzone from "../Dropzone/Dropzone.jsx";
import './style.scss'

const FileList = ({ files, isSelecting, downloadFun }) => {
  return (
    <div className="flex flex-wrap ">
        {files.map((file, i) => <File file={file} key={i} isSelecting={isSelecting} downloadFun={downloadFun} />)}
    </div>
  )
};

export default FileList;
