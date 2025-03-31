import React from "react";

interface DashboardTopRightNavProps {
  buttons?: React.ReactNode[];
}

function DashboardTopRightNav({ buttons = [] }: DashboardTopRightNavProps) {
  return (
    <div className="absolute flex flex-col h-12 top-0 right-0 z-50 pt-4 ">
      <div className="flex h-full items-center justify-end gap-2 px-4 relative ">
        {buttons.map((button, index) => (
          <React.Fragment key={index}>{button}</React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default DashboardTopRightNav;
