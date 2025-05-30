'use client';

import React from 'react';
import { getImageProps } from 'next/image';

interface OptimizedBackgroundImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function getBackgroundImage(srcSet = '') {
  const imageSet = srcSet
    .split(', ')
    .map((str) => {
      const [url, dpi] = str.split(' ');
      return `url("${url}") ${dpi}`;
    })
    .join(', ');
  return `image-set(${imageSet})`;
}

export function OptimizedBackgroundImage({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  children,
}: OptimizedBackgroundImageProps) {
  const {
    props: { srcSet },
  } = getImageProps({ alt, width, height, src });
  
  const backgroundImage = getBackgroundImage(srcSet);
  const combinedStyle = { ...style, backgroundImage };

  return (
    <div className={className} style={combinedStyle}>
      {children}
    </div>
  );
} 