export function EarnScreen() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pb-20 items-center justify-center px-8">
      <div className="text-center space-y-6">
        <div className="text-8xl mb-4">💰</div>
        <h2 className="text-3xl font-bold text-amber-400">Earn & Tasks</h2>
        <p className="text-xl text-gray-300 leading-relaxed">
          Complete tasks and challenges to earn rewards, EXP, and special items.
        </p>
        <div className="bg-gray-800 rounded-lg p-6 border-2 border-amber-900">
          <p className="text-gray-400">
            This feature is coming soon! Check back later for exciting tasks and missions.
          </p>
        </div>
      </div>
    </div>
  );
}
