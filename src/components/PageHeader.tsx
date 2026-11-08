import type { ReactNode } from "react";
import "./PageHeader.css";

interface PageHeaderProps {
  index: string;
  label: string;
  title: string;
  children?: ReactNode;
}

function PageHeader({ index, label, title, children }: PageHeaderProps) {
  return (
    <header className="page-header">
      <span className="hud-label">{`${index} // ${label}`}</span>
      <h1 className="glow-text">{title}</h1>
      {children && <p className="page-intro">{children}</p>}
    </header>
  );
}

export default PageHeader;
