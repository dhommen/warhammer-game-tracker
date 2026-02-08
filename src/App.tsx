import { useState, useEffect } from 'react'

interface PlayerState {
  vp: number
  cp: number
}

type Phase = 'command' | 'movement' | 'shooting' | 'charge' | 'fight' | 'morale'

interface GameState {
  round: number
  currentPlayer: 1 | 2
  currentPhase: Phase
  player1: PlayerState
  player2: PlayerState
}

const PHASES: Phase[] = ['command', 'movement', 'shooting', 'charge', 'fight', 'morale']

const PHASE_DISPLAY: Record<Phase, string> = {
  command: 'Command',
  movement: 'Movement',
  shooting: 'Shooting',
  charge: 'Charge',
  fight: 'Fight',
  morale: 'Morale'
}

function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('wh40k-game')
    return saved ? JSON.parse(saved) : {
      round: 1,
      currentPlayer: 1,
      currentPhase: 'command',
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

  const nextPhase = () => {
    setGameState(prev => {
      const currentPhaseIndex = PHASES.indexOf(prev.currentPhase)
      
      // Last phase of turn - switch player or advance round
      if (currentPhaseIndex === PHASES.length - 1) {
        if (prev.currentPlayer === 1) {
          // Switch to Player 2
          return {
            ...prev,
            currentPlayer: 2,
            currentPhase: 'command',
            player2: { ...prev.player2, cp: prev.player2.cp + 1 } // Gain CP in Command
          }
        } else {
          // End of round, advance to next round, back to Player 1
          return {
            ...prev,
            round: prev.round + 1,
            currentPlayer: 1,
            currentPhase: 'command',
            player1: { ...prev.player1, cp: prev.player1.cp + 1 } // Gain CP in Command
          }
        }
      }
      
      // Move to next phase
      const nextPhase = PHASES[currentPhaseIndex + 1]
      return {
        ...prev,
        currentPhase: nextPhase
      }
    })
  }

  const switchPlayer = () => {
    setGameState(prev => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
      currentPhase: 'command',
      [prev.currentPlayer === 1 ? 'player2' : 'player1']: {
        ...prev[prev.currentPlayer === 1 ? 'player2' : 'player1'],
        cp: prev[prev.currentPlayer === 1 ? 'player2' : 'player1'].cp + 1
      }
    }))
  }

  const newGame = () => {
    if (confirm('Start a new game? Current progress will be lost.')) {
      setGameState({
        round: 1,
        currentPlayer: 1,
        currentPhase: 'command',
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

        {/* Round & Turn Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Battle Round</div>
              <div className="text-5xl font-bold text-red-500">{gameState.round}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Active Player</div>
              <div className={`text-5xl font-bold ${gameState.currentPlayer === 1 ? 'text-blue-400' : 'text-green-400'}`}>
                {gameState.currentPlayer}
              </div>
            </div>
          </div>

          {/* Phase Tracker */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-2 text-center">Current Phase</div>
            <div className="flex justify-center gap-2 flex-wrap">
              {PHASES.map(phase => (
                <div
                  key={phase}
                  className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    phase === gameState.currentPhase
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {PHASE_DISPLAY[phase]}
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            <button 
              onClick={nextPhase}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
            >
              Next Phase →
            </button>
            <button 
              onClick={switchPlayer}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
            >
              Skip to Player {gameState.currentPlayer === 1 ? '2' : '1'}
            </button>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Player 1 */}
          <div className={`rounded-lg p-6 transition ${
            gameState.currentPlayer === 1 
              ? 'bg-blue-900 border-2 border-blue-500' 
              : 'bg-gray-800'
          }`}>
            <h2 className="text-2xl font-bold mb-4 text-blue-400 flex items-center gap-2">
              Player 1
              {gameState.currentPlayer === 1 && <span className="text-sm">● ACTIVE</span>}
            </h2>
            
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
          <div className={`rounded-lg p-6 transition ${
            gameState.currentPlayer === 2 
              ? 'bg-green-900 border-2 border-green-500' 
              : 'bg-gray-800'
          }`}>
            <h2 className="text-2xl font-bold mb-4 text-green-400 flex items-center gap-2">
              Player 2
              {gameState.currentPlayer === 2 && <span className="text-sm">● ACTIVE</span>}
            </h2>
            
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
