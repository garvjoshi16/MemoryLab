import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-navy text-white py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-cyan">MemoryLab</span>
          <span className="text-lg">Interactive Virtual Memory Simulator</span>
        </div>
        <span className="text-sm text-blue-light opacity-80">Operating Systems Project</span>
      </div>
    </header>
  );
};

export default Header;