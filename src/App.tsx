import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import TradePage from './pages/TradePage';
import PositionsPage from './pages/PositionsPage';
import PortfolioPage from './pages/PortfolioPage';
import AdminPage from './pages/AdminPage';
import { useAccount } from 'wagmi';
import { useContractOwner } from './hooks/useContract';

function App() {
  const { address } = useAccount();
  const { data: contractOwner } = useContractOwner();
  const isAdmin = address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase();

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Router>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/trade" replace />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/positions" element={<PositionsPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            {isAdmin && <Route path="/admin" element={<AdminPage />} />}
            <Route path="*" element={<Navigate to="/trade" replace />} />
          </Routes>
        </main>
      </Router>
      
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E1E1E',
            color: '#FFFFFF',
            border: '1px solid #3A2B47',
          },
          success: {
            iconTheme: {
              primary: '#00C853',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#D50000',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </div>
  );
}

export default App;