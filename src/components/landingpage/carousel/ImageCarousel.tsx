import React, { useEffect, useState } from 'react';
import { Box } from "@mui/material";

interface ImageCarouselProps {
    images: string[];
    interval: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, interval }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, interval);

        return () => clearInterval(timer);
    }, [images.length, interval]);

    return (
        <Box>
            <img 
                src={images[currentImageIndex]} 
                alt="carousel" 
                style={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    borderRadius: '25px',
                }}
            />
        </Box>
    );
};

export default ImageCarousel;

