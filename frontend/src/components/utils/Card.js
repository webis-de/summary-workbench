import React from "react";

const Card = ({ children, full }) => (
  <div
    className={`${
      full ? "w-full" : "max-w-sm"
    } flex flex-col maw-w-sm divide-y bg-slate-50 rounded-lg border border-gray-200 shadow-md`}
  >
    {children}
  </div>
);

const CardHead = ({ children }) => (
  <div className="px-6 py-4 min-h-[80px] w-full flex justify-between items-center">{children}</div>
);

const CardContent = ({ children }) => <div className="p-6 space-y-5 flex-grow">{children}</div>;

const CardFoot = ({ children }) => <div className="p-6">{children}</div>;

export { Card, CardHead, CardContent, CardFoot };
