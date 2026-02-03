import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const loading = document.getElementById('loading-bundle');
if (loading) {
	loading.remove();
}

createRoot(document.getElementById('root')!).render(<App />);
