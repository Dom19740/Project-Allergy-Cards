import React from 'react';

interface FixedHeaderProps {
  children?: React.ReactNode;
}

const FixedHeader: React.FC<FixedHeaderProps> = ({ children }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        {children}
      </div>
    </header>
  );
};

export default FixedHeader;