import React from 'react';
import { BannerImageInput, BannerPreset } from './BannerImageInput';

interface ShowroomImageUploadProps {
  image?: string;
  imageUrl?: string;
  onChange?: (image: string) => void;
  onImageChange?: (image: string) => void;
  label?: string;
}

const SHOWROOM_PRESETS: BannerPreset[] = [
  {
    name: 'Indiranagar Flagship',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Lower Parel Experience Suite',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'MG Road Studio Gallery',
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Jubilee Hills Master Pavilion',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
  }
];

export const ShowroomImageUpload: React.FC<ShowroomImageUploadProps> = ({
  image,
  imageUrl,
  onChange,
  onImageChange,
  label = 'Showroom Experience Center Photograph'
}) => {
  const currentImage = imageUrl ?? image ?? '';
  const handleChange = (newUrl: string) => {
    if (onImageChange) {
      onImageChange(newUrl);
    }
    if (onChange) {
      onChange(newUrl);
    }
  };

  return (
    <BannerImageInput
      value={currentImage}
      onChange={handleChange}
      label={label}
      recommendedDimensions="1200 × 800 pixels for landscape showcase banners / 800 × 800 pixels for square cards"
      aspectRatioHint="Landscape 3:2 / 16:9 Showcase"
      aspectRatioClass="aspect-[16/10]"
      presets={SHOWROOM_PRESETS}
      helperNotes="Crisp high-resolution photography for flagship architectural galleries"
      idPrefix="showroom-img"
    />
  );
};
