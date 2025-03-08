import React from "react";
import "./styles/AsymCallout.css";

const AsymmetricCallout = ({ children, className, variant = "default" }) => {
  return (
    <div className={`asym-wrapper ${variant} ${className || ""}`}>
      <div className="asym-content">
        {children}
      </div>
    </div>
  );
};

export default AsymmetricCallout;
