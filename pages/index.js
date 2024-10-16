// pages/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { SessionProvider } from 'next-auth/react';
import LogoAnimation from './animation/logoAnimation'; // Importing animation
import LoginPage from './login'; // Import the login page component

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // State to manage animation
  const [validSubdomain, setValidSubdomain] = useState(false); // State to manage subdomain validity

  useEffect(() => {
    // Extract the subdomain from the URL
    const portNumber = window.location.port;
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0]; // Get the subdomain

    const validateSubdomain = async () => {
      try {
        const response = await fetch(`/api/auth/signup?subdomain=${subdomain}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache', // Prevent caching
          },
        });

        if (response.status === 200) {
          // Subdomain is valid
          setValidSubdomain(true);
        } else {
          // Subdomain is invalid - redirect to /info
          const redirectUrl =
            process.env.NODE_ENV === 'development'
              ? `http://localhost:${portNumber}/info`
              : 'https://www.plantu.ai/info';
          router.replace(redirectUrl);
        }
      } catch (error) {
        console.error('Error validating subdomain:', error);
        // On error, redirect to /info
        const redirectUrl =
          process.env.NODE_ENV === 'development'
            ? `http://localhost:${portNumber}/info`
            : 'https://www.plantu.ai/info';

        router.replace(redirectUrl);
      } finally {
        setLoading(false); // Stop loading once the validation is complete
      }
    };

    // Handle reserved subdomains
    if (process.env.NODE_ENV === 'development') {
      if (subdomain === 'localhost' || subdomain === 'www') {
        setTimeout(() => {
          router.replace(`http://localhost:${portNumber}/info`);
          setLoading(false);
        }, 2000);
      } else {
        validateSubdomain();
      }
    } else {
      if (subdomain === 'www') {
        setTimeout(() => {
          router.replace('https://www.plantu.ai/info');
          setLoading(false);
        }, 2000);
      } else {
        validateSubdomain();
      }
    }
  }, [router]);

  // Show animation while validating the subdomain
  if (loading) {
    return <LogoAnimation />;
  }

  return (
    <div className={styles.container}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Plantu.AI</title>
        <link rel="icon" href="/plantoLogo2.png" />
      </Head>

      <SessionProvider>
        {/* Render the login page if subdomain is valid */}
        {validSubdomain && <LoginPage />}
      </SessionProvider>
    </div>
  );
}