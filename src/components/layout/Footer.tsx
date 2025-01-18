import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container flex h-14 items-center justify-between py-4 md:h-16">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bengali OCR. All rights reserved.
        </p>
        <nav className="flex items-center space-x-4 text-sm text-muted-foreground">
          <a href="#" className="hover:underline">
            Terms
          </a>
          <a href="#" className="hover:underline">
            Privacy
          </a>
          <a href="#" className="hover:underline">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;