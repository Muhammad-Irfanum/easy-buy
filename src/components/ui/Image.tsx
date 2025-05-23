import React from 'react';

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

const Image: React.FC<ImageProps> = (props) => {
  return <img {...props} loading="lazy" />;
};

export default Image;