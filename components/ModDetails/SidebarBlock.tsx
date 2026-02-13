
import React from 'react';

interface SidebarBlockProps {
  title: string;
  children: React.ReactNode;
}

const SidebarBlock: React.FC<SidebarBlockProps> = ({ title, children }) => {
  return (
    <div className="bg-[#24262b] rounded-2xl p-6 border border-white/[0.03] shadow-lg">
      <h3 className="text-white font-black text-[18px] uppercase tracking-tight mb-5">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default SidebarBlock;
