import { useState, useEffect } from 'react'

interface PlayerState {
  vp: number
  cp: number
}

interface GameState {
  round: number
  player1: PlayerState
  player2: PlayerState
}

function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('wh40k-game')
    return saved ? JSON.parse(saved) : {
      round: 1,
      player1: { vp: 0, cp: 0 },
      player2: { vp: 0, cp: 0 },
    }
  })

  useEffect(() => {
    localStorage.setItem('wh40k-game', JSON.stringify(gameState))
  }, [gameState])

  const updatePlayer = (player: 'player1' | 'player2', stat: 'vp' | 'cp', delta: number) => {
    setGameState(prev => ({
      ...prev,
      [player]: {
        ...prev[player],
        [stat]: Math.max(0, prev[player][stat] + delta)
      }
    }))
  }

  const nextRound = () => {
    setGameState(prev => ({
      ...prev,
      round: prev.round + 1,
      player1: { ...prev.player1, cp: prev.player1.cp + 1 },
      player2: { ...prev.player2, cp: prev.player2.cp + 1 },
    }))
  }

  const newGame = () => {
    if (confirm('Start a new game? Current progress will be lost.')) {
      setGameState({
        round: 1,
        player1: { vp: 0, cp: 0 },
        player2: { vp: 0, cp: 0 },
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">⚔️ Warhammer 40K Tracker</h1>
          <p className="text-gray-400">10th Edition Game Tracker</p>
        </div>

        {/* Round Counter */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 text-center">
          <div className="text-lg text-gray-400 mb-2">Battle Round</div>
          <div className="text-6xl font-bold text-red-500">{gameState.round}</div>
          <button 
            onClick={nextRound}
            className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
          >
            Next Round (+1 CP each)
          </button>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Player 1 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Player 1</h2>
            
            {/* VP */}
            <div className="mb-4">
              <div className="text-gray-400 mb-2">Victory Points</div>
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => updatePlayer('player1', 'vp', -1)}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl transition"
                >
                  -
                </button>
                <div className="text-4xl font-bold">{gameState.player1.vp}</div>
                <button 
                  onClick={() => updatePlayer('player1', 'vp', 1)}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* CP */}
            <div>
              <div className="text-gray-400 mb-2">Command Points</div>
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => updatePlayer('player1', 'cp', -1)}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl transition"
                >
                  -
                </button>
                <div className="text-4xl font-bold">{gameState.player1.cp}</div>
                <button 
                  onClick={() => updatePlayer('player1', 'cp', 1)}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-green-400">Player 2</h2>
            
            {/* VP */}
            <div className="mb-4">
              <div className="text-gray-400 mb-2">Victory Points</div>
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => updatePlayer('player2', 'vp', -1)}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl transition"
                >
                  -
                </button>
                <div className="text-4xl font-bold">{gameState.player2.vp}</div>
                <button 
                  onClick={() => updatePlayer('player2', 'vp', 1)}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* CP */}
            <div>
              <div className="text-gray-400 mb-2">Command Points</div>
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => updatePlayer('player2', 'cp', -1)}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl transition"
                >
                  -
                </button>
                <div className="text-4xl font-bold">{gameState.player2.cp}</div>
                <button 
                  onClick={() => updatePlayer('player2', 'cp', 1)}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center">
          <button 
            onClick={newGame}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
          >
            🔄 New Game
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
