import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SectorPage from './pages/Sector';
import DocD from './pages/DocD';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sectors/:slug" element={<SectorPage />} />
        <Route path="/doc-d" element={<DocD />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
