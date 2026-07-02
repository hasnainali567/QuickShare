import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import './style.scss'

function Dropzone({ title, onDrop, className, disabled = false }) {

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: disabled ? undefined : onDrop,
    noClick: disabled,
    noDrag: disabled,
  })

  return (
    <div className={className} {...getRootProps({ onClick: disabled ? (event) => event.preventDefault() : undefined })}>
      <input {...getInputProps()} />
      <div>
        {title}
      </div>
    </div>
  )
}

export default Dropzone;
