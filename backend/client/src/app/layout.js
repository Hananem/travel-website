import ProviderWrapper from './ProviderWrapper';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '@/components/Footer';
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ProviderWrapper>
        <Navbar />

          {children}
        <Footer />

        </ProviderWrapper>
      </body>
    </html>
  );
}


