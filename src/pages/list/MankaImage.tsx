import { useEffect } from 'react';
import errorImg from '../../assets/images/404.png';
import loadImg from '../../assets/images/anime_loading.gif';
import type { MankaArchive } from '../../types';

export interface MankaImageProps {
  mankaData: MankaArchive[];

  //onMankaClick?:(event:React.MouseEvent<HTMLTableRowElement, MouseEvent>,manka:MankaArchive) => void

  //onTitleMouseEnter?: (event:React.MouseEvent<HTMLElement>,manka:MankaArchive) => void

  //onTitleMouseLeave?:(event:React.MouseEvent<HTMLElement>,manka:MankaArchive) => void

  imageUrl: string;
  setImageSrc: (imageSrcUrl: string) => void;
}

export default function MankaImage(props: MankaImageProps) {
  const { imageUrl, setImageSrc } = props;

  useEffect(() => {
    console.log('load image');
    setImageSrc(loadImg);
    const img = new Image();
    img.src = imageUrl;

    // loaded的钩子
    img.onload = () => {
      setImageSrc(imageUrl);
    };

    img.onerror = () => {
      // Setting to an actual image so CSS styling works consistently
      setImageSrc(errorImg);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);
}
