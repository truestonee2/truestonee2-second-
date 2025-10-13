
import React from 'react';

interface HeaderProps {
  T: {
    header: {
      title: string;
      subtitle: string;
    };
  };
}

export const Header: React.FC<HeaderProps> = ({ T }) => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
        {T.header.title}
      </h1>
      <p className="mt-2 text-lg text-gray-400">
        {T.header.subtitle}
      </p>
    </header>
  );
};
