import ProviderWrapper from './ProviderWrapper';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <ProviderWrapper>
          {children}
        </ProviderWrapper>
      </body>
    </html>
  );
}


