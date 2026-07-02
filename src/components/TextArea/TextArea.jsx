import React, { useEffect, useRef, forwardRef } from "react";
import "./style.scss";

const TextArea = forwardRef(({ value, onChangeText, disabled = false }, ref) => {
  const textAreaRef = ref || useRef(); // use passed ref or create fallback

  const resizeTextArea = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "120px";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + 12 + "px";
    }
  };

  useEffect(() => {
    resizeTextArea();
  }, [value]);

  return (
    <textarea
      ref={textAreaRef}
      value={value}
      onInput={(e) => {
        if (!disabled) {
          onChangeText(e.target.value)
        }
      }}
      className='text-area min-h-74'
      placeholder='Type Something here...'
      disabled={disabled}
    />
  );
});

export default TextArea;
