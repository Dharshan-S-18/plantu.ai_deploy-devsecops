import { useEffect } from 'react';
import { gsap } from 'gsap';
import Box from '@mui/material/Box';
import Image from 'next/image';
import plantoLogo from '../post/image/plantoLogo2.png'; // Adjust the path to your logo

export default function RotatingLogoWithGSAP() {
  useEffect(() => {
    gsap.to(".logo", {
      rotation: 360,                // Full rotation
      duration: 3.5,                  // Duration of each rotation cycle
      repeat: -2,                   // Infinite repeats
      ease: "bounce.out",                 // Linear easing for smooth continuous rotation
      transformOrigin: "center",    // Rotate around the center of the element
    });
  }, []);

  return (
    <Box
      className="logo"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        top: 0,
        left: 0,
        position: 'fixed',        // Ensure relative positioning for transform origin to work correctly
      }}
    >
<Box
        sx={{
          position: 'relative',
          width: 120,               // Adjust the logo size as needed
          height: 200,              // Adjust the logo size as needed
        }}
      >
        <Image src={plantoLogo} alt="Logo" layout="fill" objectFit="contain" />
      </Box>    </Box>
  );
}