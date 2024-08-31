const Footer = () => {
    return (
      <footer className="bg-gray-800 shadow-md mt-auto">
        <div className="container max-w-[1400px] mx-auto p-4 flex items-center justify-center">
          <p className="text-white text-sm">
            &copy; {new Date().getFullYear()} BlueTown. All rights reserved.
          </p>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  