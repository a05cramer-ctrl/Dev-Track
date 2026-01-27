import { useState, useEffect } from 'react';
import Radar from './components/Radar';
import './App.css';

type Status = 'safe' | 'moving' | 'risk';

interface Transaction {
  id: string;
  type: 'in' | 'out';
  amount: string;
  time: string;
}

interface Wallet {
  id: string;
  address: string;
  status: Status;
  transactions: Transaction[];
}

// Generate random demo transactions
const generateDemoTransactions = (): Transaction[] => {
  const amounts = ['0.1 SOL', '0.5 SOL', '1.2 SOL', '2.5 SOL', '0.8 SOL', '3.0 SOL'];
  const times = ['2m ago', '15m ago', '1h ago', '3h ago', '5h ago', '1d ago'];
  const count = Math.floor(Math.random() * 3) + 2; // 2-4 transactions
  
  return Array.from({ length: count }, (_, i) => ({
    id: `tx-${Date.now()}-${i}`,
    type: Math.random() > 0.5 ? 'in' : 'out',
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    time: times[Math.floor(Math.random() * times.length)],
  }));
};

// Generate random wallet address
const generateWalletAddress = (): string => {
  const chars = '0123456789ABCDEF';
  const prefix = '0x';
  const suffix = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}${suffix}…${Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
};

const App = () => {
  const [wallets, setWallets] = useState<Wallet[]>([
    {
      id: '1',
      address: '0xA3F…92B',
      status: 'safe',
      transactions: [
        { id: '1', type: 'in', amount: '0.5 SOL', time: '2m ago' },
        { id: '2', type: 'out', amount: '1.2 SOL', time: '15m ago' },
        { id: '3', type: 'in', amount: '0.8 SOL', time: '1h ago' },
      ],
    },
  ]);
  const [newWalletAddress, setNewWalletAddress] = useState('');

  // Rotate status for each wallet independently
  useEffect(() => {
    const interval = setInterval(() => {
      setWallets((prevWallets) =>
        prevWallets.map((wallet) => {
          const statuses: Status[] = ['safe', 'moving', 'risk'];
          const currentIndex = statuses.indexOf(wallet.status);
          const nextIndex = (currentIndex + 1) % statuses.length;
          return {
            ...wallet,
            status: statuses[nextIndex],
          };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddWallet = () => {
    if (!newWalletAddress.trim()) {
      // Generate random address if empty
      const address = generateWalletAddress();
      const newWallet: Wallet = {
        id: Date.now().toString(),
        address: address,
        status: 'safe',
        transactions: generateDemoTransactions(),
      };
      setWallets([...wallets, newWallet]);
      setNewWalletAddress('');
    } else {
      // Use provided address (format it)
      const formattedAddress = newWalletAddress.trim();
      const displayAddress = formattedAddress.length > 10 
        ? `${formattedAddress.slice(0, 6)}…${formattedAddress.slice(-3)}`
        : formattedAddress;
      
      const newWallet: Wallet = {
        id: Date.now().toString(),
        address: displayAddress,
        status: 'safe',
        transactions: generateDemoTransactions(),
      };
      setWallets([...wallets, newWallet]);
      setNewWalletAddress('');
    }
  };

  const handleRemoveWallet = (id: string) => {
    setWallets(wallets.filter((wallet) => wallet.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddWallet();
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'safe':
        return '#00ff64';
      case 'moving':
        return '#ffd700';
      case 'risk':
        return '#ff4444';
      default:
        return '#00ff64';
    }
  };

  const getStatusText = (status: Status) => {
    switch (status) {
      case 'safe':
        return 'Safe';
      case 'moving':
        return 'Moving';
      case 'risk':
        return 'Dump Risk';
      default:
        return 'Safe';
    }
  };

  return (
    <div className="app">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <Radar />
          <h1 className="hero-title">
            Track the Dev.<br />
            Protect the Community.
          </h1>
          <p className="hero-subtitle">
            DevTrack is a utility memecoin that monitors developer wallet activity in real time.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary">Launch App</button>
            <a href="https://solscan.io/token/GcLyHDibArZk79BdeztQ4rvY881vFpZmmrRzsS4kpump" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">View Contract</a>
          </div>
        </div>
      </section>

      {/* Live Tracker Section */}
      <section className="section tracker-section">
        <div className="container">
          <h2 className="section-title">Live Tracker</h2>
          <p className="section-subtitle">Demo Data - Not Real Monitoring</p>
          
          {/* Add Wallet Form */}
          <div className="add-wallet-form">
            <div className="wallet-input-group">
              <input
                type="text"
                className="wallet-input"
                placeholder="Enter wallet address (or leave empty for random)"
                value={newWalletAddress}
                onChange={(e) => setNewWalletAddress(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="btn btn-add" onClick={handleAddWallet}>
                + Add Wallet
              </button>
            </div>
          </div>

          {/* Wallets Grid */}
          <div className="tracker-dashboard">
            {wallets.length === 0 ? (
              <div className="empty-state">
                <p>No wallets tracked yet. Add a wallet to get started.</p>
              </div>
            ) : (
              wallets.map((wallet) => (
                <div key={wallet.id} className="tracker-card">
                  <div className="tracker-header">
                    <div className="wallet-info">
                      <span className="wallet-label">Dev Wallet</span>
                      <span className="wallet-address">{wallet.address}</span>
                    </div>
                    <div className="wallet-actions">
                      <div
                        className="status-indicator"
                        style={{ backgroundColor: getStatusColor(wallet.status) }}
                      >
                        <span className="status-dot"></span>
                        <span className="status-text">{getStatusText(wallet.status)}</span>
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveWallet(wallet.id)}
                        aria-label="Remove wallet"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="transactions-list">
                    <div className="transactions-header">Recent Activity</div>
                    {wallet.transactions.length === 0 ? (
                      <div className="no-transactions">No recent transactions</div>
                    ) : (
                      wallet.transactions.map((tx) => (
                        <div key={tx.id} className="transaction-item">
                          <div className={`transaction-arrow ${tx.type}`}>
                            {tx.type === 'in' ? '→' : '←'}
                          </div>
                          <div className="transaction-details">
                            <span className="transaction-amount">{tx.amount}</span>
                            <span className="transaction-time">{tx.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">📡</div>
              <h3 className="step-title">1. Detect Dev Wallets</h3>
              <p className="step-description">
                Identify and tag developer wallets associated with the project.
              </p>
            </div>
            <div className="step-card">
              <div className="step-icon">💼</div>
              <h3 className="step-title">2. Monitor Transactions</h3>
              <p className="step-description">
                Track all incoming and outgoing transactions in real time.
              </p>
            </div>
            <div className="step-card">
              <div className="step-icon">🚨</div>
              <h3 className="step-title">3. Alert the Community</h3>
              <p className="step-description">
                Instant notifications when suspicious activity is detected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why DevTrack */}
      <section className="section why-section">
        <div className="container">
          <h2 className="section-title">Why DevTrack</h2>
          <div className="why-grid">
            <div className="why-item">
              <div className="why-icon">🛡️</div>
              <h3 className="why-title">Prevent Stealth Rugs</h3>
              <p className="why-description">
                Catch devs before they disappear with your funds. Transparency is the best defense.
              </p>
            </div>
            <div className="why-item">
              <div className="why-icon">👁️</div>
              <h3 className="why-title">Transparent Dev Activity</h3>
              <p className="why-description">
                See exactly what developers are doing with their tokens. No secrets, no surprises.
              </p>
            </div>
            <div className="why-item">
              <div className="why-icon">🤝</div>
              <h3 className="why-title">Community-First Utility</h3>
              <p className="why-description">
                Built by degens, for degens. We watch the watchers so you can focus on the gains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Token Info */}
      <section className="section token-section">
        <div className="container">
          <h2 className="section-title">Token Info</h2>
          <div className="token-grid">
            <div className="token-item">
              <span className="token-label">Token Name</span>
              <span className="token-value">DevTrack</span>
            </div>
            <div className="token-item">
              <span className="token-label">Symbol</span>
              <span className="token-value">DEVTRACK</span>
            </div>
            <div className="token-item">
              <span className="token-label">Chain</span>
              <span className="token-value">Solana</span>
            </div>
            <div className="token-item">
              <span className="token-label">Contract Address</span>
              <span className="token-value" style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
                <a href="https://solscan.io/token/GcLyHDibArZk79BdeztQ4rvY881vFpZmmrRzsS4kpump" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-green)', textDecoration: 'none' }}>
                  GcLyHDibArZk79BdeztQ4rvY881vFpZmmrRzsS4kpump
                </a>
              </span>
            </div>
            <div className="token-item">
              <span className="token-label">Contract Address 2</span>
              <span className="token-value" style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
                <a href="https://solscan.io/token/BdSa7s3STALir6LaW5hzvx39hJNio7DXk8ofCgQBbonk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-green)', textDecoration: 'none' }}>
                  BdSa7s3STALir6LaW5hzvx39hJNio7DXk8ofCgQBbonk
                </a>
              </span>
            </div>
          </div>
          <p className="disclaimer">
            No promises, just transparency.
          </p>
        </div>
      </section>

      {/* Roadmap */}
      <section className="section roadmap-section">
        <div className="container">
          <h2 className="section-title">Roadmap</h2>
          <div className="roadmap-timeline">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3 className="timeline-title">Launch</h3>
                <p className="timeline-description">Token launch and initial community building</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3 className="timeline-title">Tracker Demo</h3>
                <p className="timeline-description">Public demo of wallet tracking system</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3 className="timeline-title">Real Wallet Tracking</h3>
                <p className="timeline-description">Live monitoring of actual developer wallets</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3 className="timeline-title">Alerts + API</h3>
                <p className="timeline-description">Automated alerts and public API for developers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-social">
            <a href="https://x.com/DevTrack97316" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
          </div>
          <p className="footer-text">DevTrack watches so you don't have to.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
