import React, { useState } from 'react';
import { dollarCoin } from '../images';

interface Friend {
  id: string;
  username: string;
  points: number;
  level: number;
  referralBonus: number;
  joinedAt: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  level: number;
  totalReferrals: number;
}

const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'leaderboard'>('friends');

  const referralCode = 'HAM12345';
  const totalFriends = 12;
  const totalEarned = 60000;

  const friends: Friend[] = [
    { id: '1', username: 'Alex_Trader', points: 150000, level: 5, referralBonus: 5000, joinedAt: '2 days ago' },
    { id: '2', username: 'CryptoKing99', points: 89000, level: 4, referralBonus: 5000, joinedAt: '5 days ago' },
    { id: '3', username: 'HamsterPro', points: 234000, level: 6, referralBonus: 5000, joinedAt: '1 week ago' },
    { id: '4', username: 'MoonShot', points: 45000, level: 3, referralBonus: 5000, joinedAt: '2 weeks ago' },
    { id: '5', username: 'DiamondHands', points: 178000, level: 5, referralBonus: 5000, joinedAt: '3 weeks ago' },
  ];

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, username: 'CryptoMaster2024', points: 50000000, level: 8, totalReferrals: 234 },
    { rank: 2, username: 'HamsterKing', points: 45000000, level: 8, totalReferrals: 189 },
    { rank: 3, username: 'MoonWalker', points: 38000000, level: 7, totalReferrals: 156 },
    { rank: 4, username: 'DiamondLegend', points: 32000000, level: 7, totalReferrals: 142 },
    { rank: 5, username: 'GoldenHamster', points: 28000000, level: 7, totalReferrals: 128 },
    { rank: 6, username: 'ProTrader', points: 25000000, level: 7, totalReferrals: 115 },
    { rank: 7, username: 'ElitePlayer', points: 22749365, level: 7, totalReferrals: 98 },
    { rank: 8, username: 'CoinCollector', points: 20000000, level: 6, totalReferrals: 87 },
    { rank: 9, username: 'MegaWhale', points: 18500000, level: 6, totalReferrals: 76 },
    { rank: 10, username: 'UltraHamster', points: 17200000, level: 6, totalReferrals: 65 },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const copyReferralLink = () => {
    const link = `https://t.me/hamster_kombat_bot?start=${referralCode}`;
    navigator.clipboard.writeText(link);
  };

  const shareReferralLink = () => {
    const link = `https://t.me/hamster_kombat_bot?start=${referralCode}`;
    const text = `Join me in Hamster Kombat! Use my referral link: ${link}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-3xl mb-2">Invite friends!</h1>
        <p className="text-[#85827d] text-sm">You and your friend will receive bonuses</p>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-[#272a2f] rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-[#85827d] text-xs">Total Friends</p>
                  <p className="text-2xl">{totalFriends}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#85827d] text-xs">Total Earned</p>
                  <div className="flex items-center justify-end gap-1">
                    <img src={dollarCoin} alt="coin" className="w-6 h-6" />
                    <p className="text-2xl">{formatNumber(totalEarned)}</p>
                  </div>
                </div>
              </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={copyReferralLink}
              className="flex-1 bg-[#5a60ff] hover:bg-[#4a50ef] transition-colors py-3 rounded-lg font-semibold"
            >
              Copy Link
            </button>
            <button
              onClick={shareReferralLink}
              className="flex-1 bg-[#5a60ff] hover:bg-[#4a50ef] transition-colors py-3 rounded-lg font-semibold"
            >
              Share Link
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex bg-[#272a2f] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              activeTab === 'friends'
                ? 'bg-[#5a60ff] text-white'
                : 'text-[#85827d]'
            }`}
          >
            Friends ({totalFriends})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-[#5a60ff] text-white'
                : 'text-[#85827d]'
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {activeTab === 'friends' ? (
        <div className="px-4">
          {friends.length === 0 ? (
            <div className="text-center text-[#85827d] py-12">
              <p>No friends invited yet</p>
              <p className="text-sm mt-2">Share your referral link to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div key={friend.id} className="bg-[#272a2f] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{friend.username}</p>
                      <p className="text-[#85827d] text-xs mt-1">Level {friend.level}</p>
                      <p className="text-[#85827d] text-xs">Joined {friend.joinedAt}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <img src={dollarCoin} alt="coin" className="w-5 h-5" />
                        <p className="text-sm">{formatNumber(friend.points)}</p>
                      </div>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <p className="text-xs text-green-400">+{formatNumber(friend.referralBonus)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="px-4">
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`rounded-lg p-4 ${
                  entry.rank === 7
                    ? 'bg-[#5a60ff]/20 border-2 border-[#5a60ff]'
                    : 'bg-[#272a2f]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    entry.rank === 1 ? 'bg-yellow-500 text-black' :
                    entry.rank === 2 ? 'bg-gray-300 text-black' :
                    entry.rank === 3 ? 'bg-orange-600 text-white' :
                    'bg-[#1d2025] text-[#85827d]'
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {entry.username}
                      {entry.rank === 7 && <span className="text-[#5a60ff] ml-2">(You)</span>}
                    </p>
                    <p className="text-[#85827d] text-xs">Level {entry.level} • {entry.totalReferrals} friends</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <img src={dollarCoin} alt="coin" className="w-5 h-5" />
                      <p className="text-sm font-semibold">{formatNumber(entry.points)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default FriendsPage;
