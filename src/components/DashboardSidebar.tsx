'use client';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  vaultCount: number;
  escrowVaultCount: number;
}

export default function DashboardSidebar({ 
  activeTab, 
  onTabChange, 
  vaultCount, 
  escrowVaultCount 
}: DashboardSidebarProps) {
  // Event handlers
  const handleTabChange = (tabId: string) => () => onTabChange(tabId);
  
  const menuItems = [
    {
      id: 'vaults',
      label: 'My Vaults',
      icon: '🔒',
      count: vaultCount,
      description: 'View & manage vaults'
    },
    {
      id: 'escrow',
      label: 'My Escrows',
      icon: '🤝',
      count: escrowVaultCount,
      description: 'Active escrow contracts'
    },
    {
      id: 'create-escrow',
      label: 'Create Escrow',
      icon: '➕',
      description: 'New escrow transaction'
    },
    {
      id: 'unlock-escrow',
      label: 'Unlock Vault',
      icon: '🔓',
      description: 'Release locked funds'
    },
    {
      id: 'swap-escrow',
      label: 'Swap Vault',
      icon: '🔄',
      description: 'Exchange assets'
    },
    {
      id: 'create-seller-escrow',
      label: 'Seller Escrow',
      icon: '🏪',
      description: 'Marketplace transactions'
    },
    {
      id: 'return-escrow',
      label: 'Return Escrow',
      icon: '↩️',
      description: 'Return to sender'
    },
    {
      id: 'history',
      label: 'Transaction History',
      icon: '📊',
      description: 'View stats & history'
    }
  ];

  return (
    <div className="w-64 bg-white shadow-lg rounded-lg p-6 h-fit">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-sm text-gray-600">Manage your escrow vaults</p>
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 Use the navigation below to access all vault functions
          </p>
        </div>
      </div>

      <nav className="space-y-1">
        {/* Overview Section */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Overview</h3>
          {menuItems.slice(0, 2).map((item) => (
            <button
              key={item.id}
              onClick={handleTabChange(item.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors mb-1 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs ${
                      activeTab === item.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </div>
                {item.count !== undefined && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    activeTab === item.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {item.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Actions Section */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Actions</h3>
          {menuItems.slice(2, 7).map((item) => (
            <button
              key={item.id}
              onClick={handleTabChange(item.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors mb-1 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs ${
                      activeTab === item.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Reports Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reports</h3>
          {menuItems.slice(7).map((item) => (
            <button
              key={item.id}
              onClick={handleTabChange(item.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors mb-1 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs ${
                      activeTab === item.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <a
            href="/create"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors inline-block text-center"
          >
            + Create New Vault
          </a>
          <a
            href="/"
            className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors inline-block text-center"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}