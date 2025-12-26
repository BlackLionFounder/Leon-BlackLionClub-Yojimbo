import { Player } from '../types/game';
import { MAX_REFERRAL_BONUSES, REFERRAL_BONUS_AP } from '../data/constants';

interface FriendsScreenProps {
  player: Player;
}

export function FriendsScreen({ player }: FriendsScreenProps) {
  const referralBonusProgress = Math.min(player.referral_count, MAX_REFERRAL_BONUSES);
  const bonusesRemaining = MAX_REFERRAL_BONUSES - referralBonusProgress;
  const hasMaxBonuses = player.referral_count >= MAX_REFERRAL_BONUSES;

  const referralLink = `https://t.me/your_bot?start=${player.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pb-20 overflow-y-auto">
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-amber-400 text-center mb-2">Whitelist & Referrals</h1>
        <p className="text-center text-gray-300">
          Invite friends to earn permanent bonuses
        </p>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-gradient-to-br from-amber-900 to-orange-900 rounded-lg p-6 border-2 border-amber-500">
          <h2 className="text-xl font-bold text-white mb-4">🎁 Referral Rewards</h2>

          <div className="space-y-3">
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">First 5 Friends</span>
                <span className="text-amber-400 font-bold">+{REFERRAL_BONUS_AP} AP each</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                  style={{ width: `${(referralBonusProgress / MAX_REFERRAL_BONUSES) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-300 mt-2">
                {referralBonusProgress} / {MAX_REFERRAL_BONUSES} completed
                {bonusesRemaining > 0 && (
                  <span className="text-amber-400"> ({bonusesRemaining} remaining)</span>
                )}
              </div>
            </div>

            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">6+ Friends</span>
                <span className="text-blue-400 font-bold">🧪 Rejuvenation Potion</span>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                Full HP/Stamina/Energy + 2x recovery rate
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">📊 Your Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Referrals</span>
              <span className="text-2xl font-bold text-amber-400">{player.referral_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Bonus AP Earned</span>
              <span className="text-2xl font-bold text-green-400">+{player.referral_bonus_points}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Rejuvenation Potions</span>
              <span className="text-2xl font-bold text-blue-400">{player.rejuvenation_potions}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">🔗 Your Referral Link</h3>
          <div className="bg-gray-900 rounded-lg p-3 mb-3 break-all text-sm text-gray-300 font-mono">
            {referralLink}
          </div>
          <button
            onClick={handleCopyLink}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all active:scale-95"
          >
            📋 Copy Link
          </button>
        </div>

        {hasMaxBonuses && (
          <div className="bg-green-900 bg-opacity-30 border-2 border-green-600 rounded-lg p-4 text-center">
            <p className="text-green-300 font-semibold">
              ✅ You've earned all referral bonuses! Keep inviting for rejuvenation potions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
