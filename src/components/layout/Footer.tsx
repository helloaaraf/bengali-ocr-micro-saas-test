import React from 'react';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background border-t py-3 z-40">
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