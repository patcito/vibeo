import React from "react";

interface SplitterContainerProps {
  direction: "horizontal" | "vertical";
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const SplitterContainer: React.FC<SplitterContainerProps> = ({
  direction,
  style,
  children,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction === "horizontal" ? "row" : "column",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
