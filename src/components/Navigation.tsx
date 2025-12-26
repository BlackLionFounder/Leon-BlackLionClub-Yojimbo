import { GameTab } from '../types/game';

interface NavigationProps {
  activeTab: GameTab;
  onTabChange: (tab: GameTab) => void;
  unspentPoints?: number;
}

export function Navigation({ activeTab, onTabChange, unspentPoints = 0 }: NavigationProps) {
  const tabs: Array<{ id: GameTab; label: string; icon: string }> = [
    { id: 'main', label: 'Home', icon: '🏠' },
    { id: 'abilities', label: 'Abilities', icon: '💪' },
    { id: 'earn', label: 'Earn', icon: '💰' },
    { id: 'friends', label: 'Whitelist', icon: '👥' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-40">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const showPoints = tab.id === 'abilities' && unspentPoints > 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive
                  ? 'text-amber-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="text-2xl mb-1 relative">
                {tab.icon}
              </span>
              <span className="text-xs font-medium">
                {tab.label}
                {showPoints && <span className="text-amber-400"> ({unspentPoints})</span>}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
