import React from "react";
import { IconSvgProps } from "../../types/index";

export const ThreeHueLogo: React.FC<IconSvgProps> = ({ size, width = 216, height, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 696 664" width={size || width} height={size || height} {...props}>
    <g>
      {/* Main 3 logo, dark gray for theme compatibility */}
      <path d="M184 152 Q204 132 244 152 Q284 172 244 212 Q204 252 184 212 Q164 172 184 152 Z" fill="#333" />
      <text x="200" y="320" fontFamily="Arial, Helvetica, sans-serif" fontSize="400" fontWeight="bold" fill="#333">3</text>
    </g>
  </svg>
);
