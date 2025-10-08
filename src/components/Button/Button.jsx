import React from 'react';
import './style.scss'

const Button = ({ onClick, children = "Save", type = "button", disable }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disable}
      className='btn p-2 md:py-3 px-10 md:px-15 rounded-lg text-xl md:text-2xl font-semibold cursor-pointer'
    >
      {children}
    </button>
  );
};

export default Button;
