import React from 'react'
import { FaCloudMoon , FaSun } from "react-icons/fa";
import { IoSunnyOutline,IoMoonOutline  } from "react-icons/io5";
import './style.scss'
import { useTheme } from '../../context/ThemeContext.jsx';


const ThemeBtn = ({ theme, themeToggle }) => {
  const { isDark } = useTheme();
  return (
    <div className='theme-btn p-2 rounded-full text-xl flex text-white cursor-pointer' onClick={themeToggle}>
        {isDark ? <FaSun /> : <FaCloudMoon />}
    </div>  
  )
}

export default ThemeBtn;