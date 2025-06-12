'use client'; // This tells Next.js: this file is a Client Component

import { Provider } from 'react-redux';
import { store } from '../store/store';

export default function ProviderWrapper({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
