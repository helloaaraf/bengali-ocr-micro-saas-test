import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-background py-4">
      <div className="container flex items-center justify-between px-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bengali OCR
        </p>
        <nav className="flex items-center gap-4">
          <a href="#" className="text-sm text-muted-foreground hover:text-primary">
            Terms
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary">
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;