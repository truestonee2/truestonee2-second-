
import React from 'react';

interface FooterProps {
  T: {
    footer: {
      credit: string;
    };
  };
}

export const Footer: React.FC<FooterProps> = ({ T }) => {
  return (
    <footer className="text-center py-8">
      <p className="text-sm text-gray-500">{T.footer.credit}</p>
    </footer>
  );
};
