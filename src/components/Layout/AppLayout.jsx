import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import { ThemeProvider } from "../../context/ThemeContext.jsx";
import { SavingProvider } from "../../context/SavingContext.jsx";

const AppLayout = ({ children }) => {
  return (
    <ThemeProvider>
      <SavingProvider>
        <div className='flex flex-col max-w-6xl w-full mx-auto px-4 md:px-6 py-0 pb-10'>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </SavingProvider>
    </ThemeProvider>
  );
};

export default AppLayout;
