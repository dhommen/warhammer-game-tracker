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

interface HistoryEntry {
  state: GameState
  action: string
  timestamp: number
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

const PHASE_ICONS: Record<Phase, string> = {
  command: '⚡',
  movement: '🏃',
  shooting: '🎯',
  charge: '⚔️',
  fight: '💀',
  morale: '🛡️'
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

  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    localStorage.setItem('wh40k-game', JSON.stringify(gameState))
  }, [gameState])

  const pushHistory = (action: string) => {
    setHistory(prev => [...prev.slice(-9), { state: gameState, action, timestamp: Date.now() }])
  }

  const undo = () => {
    if (history.length === 0) return
    const lastEntry = history[history.length - 1]
    setGameState(lastEntry.state)
    setHistory(prev => prev.slice(0, -1))
  }

  const updatePlayer = (player: 'player1' | 'player2', stat: 'vp' | 'cp', delta: number) => {
    pushHistory(`${player} ${stat} ${delta > 0 ? '+' : ''}${delta}`)
    setGameState(prev => ({
      ...prev,
      [player]: {
        ...prev[player],
        [stat]: Math.max(0, prev[player][stat] + delta)
      }
    }))
  }

  const quickVP = (player: 'player1' | 'player2', amount: number) => {
    pushHistory(`${player} VP +${amount}`)
    setGameState(prev => ({
      ...prev,
      [player]: {
        ...prev[player],
        vp: prev[player].vp + amount
      }
    }))
  }

  const nextPhase = () => {
    pushHistory('Next phase')
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
            player2: { ...prev.player2, cp: prev.player2.cp + 1 }
          }
        } else {
          // End of round, advance to next round, back to Player 1
          return {
            ...prev,
            round: prev.round + 1,
            currentPlayer: 1,
            currentPhase: 'command',
            player1: { ...prev.player1, cp: prev.player1.cp + 1 }
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
    pushHistory('Switch player')
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
      setHistory([])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black text-gray-100 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-6xl font-black mb-2 tracking-wider bg-gradient-to-r from-red-500 via-yellow-600 to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">
            ⚔️ WARHAMMER 40K ⚔️
          </h1>
          <p className="text-yellow-500 font-semibold tracking-widest text-sm sm:text-base uppercase">
            10th Edition Battle Tracker
          </p>
        </div>

        {/* Main Battle Info */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black border-4 border-yellow-600 rounded-2xl p-4 sm:p-8 mb-6 shadow-2xl shadow-red-900/50">
          
          {/* Round & Player */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/50 rounded-xl p-4 border-2 border-red-700 text-center">
              <div className="text-yellow-500 font-bold text-xs sm:text-sm mb-1 uppercase tracking-wider">Battle Round</div>
              <div className="text-6xl sm:text-8xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                {gameState.round}
              </div>
            </div>
            <div className="bg-black/50 rounded-xl p-4 border-2 border-yellow-600 text-center">
              <div className="text-yellow-500 font-bold text-xs sm:text-sm mb-1 uppercase tracking-wider">Active Player</div>
              <div className={`text-6xl sm:text-8xl font-black drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] ${
                gameState.currentPlayer === 1 ? 'text-blue-400' : 'text-green-400'
              }`}>
                {gameState.currentPlayer}
              </div>
            </div>
          </div>

          {/* Phase Tracker */}
          <div className="mb-6">
            <div className="text-yellow-500 font-bold text-xs sm:text-sm mb-3 text-center uppercase tracking-wider">
              Current Phase
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PHASES.map(phase => (
                <div
                  key={phase}
                  className={`p-3 sm:p-4 rounded-lg text-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                    phase === gameState.currentPhase
                      ? 'bg-gradient-to-br from-red-600 to-red-800 text-white border-2 border-yellow-500 scale-105 shadow-lg shadow-red-500/50'
                      : 'bg-gray-800/50 text-gray-500 border border-gray-700'
                  }`}
                >
                  <div className="text-xl sm:text-2xl mb-1">{PHASE_ICONS[phase]}</div>
                  <div className="hidden sm:block">{PHASE_DISPLAY[phase]}</div>
                  <div className="sm:hidden">{PHASE_DISPLAY[phase].slice(0, 3)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Phase Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button 
              onClick={nextPhase}
              className="flex-1 py-4 sm:py-5 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-black text-base sm:text-xl transition-all duration-200 border-2 border-red-400 shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95 uppercase tracking-wider"
            >
              ⚡ Next Phase
            </button>
            <button 
              onClick={switchPlayer}
              className="sm:w-auto py-4 sm:py-5 px-6 bg-gradient-to-r from-yellow-700 to-yellow-800 hover:from-yellow-600 hover:to-yellow-700 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 border-2 border-yellow-500 shadow-lg hover:shadow-yellow-500/50 hover:scale-105 active:scale-95"
            >
              🔄 Skip to P{gameState.currentPlayer === 1 ? '2' : '1'}
            </button>
            {history.length > 0 && (
              <button 
                onClick={undo}
                className="sm:w-auto py-4 sm:py-5 px-6 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 border-2 border-gray-500 shadow-lg hover:shadow-gray-500/50 hover:scale-105 active:scale-95"
              >
                ↩️ Undo
              </button>
            )}
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Player 1 */}
          <div className={`rounded-2xl p-6 transition-all duration-300 border-4 ${
            gameState.currentPlayer === 1 
              ? 'bg-gradient-to-br from-blue-900 via-blue-950 to-black border-blue-400 shadow-2xl shadow-blue-500/50 scale-105' 
              : 'bg-gradient-to-br from-gray-800 to-black border-gray-700'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl sm:text-4xl font-black text-blue-400 tracking-wider">
                PLAYER 1
              </h2>
              {gameState.currentPlayer === 1 && (
                <span className="px-4 py-2 bg-blue-500 text-white font-bold text-sm rounded-full animate-pulse">
                  ● ACTIVE
                </span>
              )}
            </div>

            {/* VP */}
            <div className="mb-6 bg-black/30 rounded-xl p-5 border-2 border-blue-800">
              <div className="text-yellow-500 font-bold mb-3 uppercase tracking-widest text-sm">Victory Points</div>
              <div className="flex items-center justify-between gap-3">
                <button 
                  onClick={() => updatePlayer('player1', 'vp', -1)}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-red-700 hover:bg-red-600 rounded-xl text-3xl sm:text-4xl font-bold transition-all active:scale-90 border-2 border-red-500"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <div className="text-6xl sm:text-8xl font-black text-blue-300 drop-shadow-[0_0_20px_rgba(147,197,253,0.8)]">
                    {gameState.player1.vp}
                  </div>
                  <div className="flex gap-2 mt-3 justify-center">
                    <button onClick={() => quickVP('player1', 3)} className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs font-bold transition">+3</button>
                    <button onClick={() => quickVP('player1', 5)} className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs font-bold transition">+5</button>
                  </div>
                </div>
                <button 
                  onClick={() => updatePlayer('player1', 'vp', 1)}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-green-700 hover:bg-green-600 rounded-xl text-3xl sm:text-4xl font-bold transition-all active:scale-90 border-2 border-green-500"
                >
                  +
                </button>
              </div>
            </div>

            {/* CP */}
            <div className="bg-black/30 rounded-xl p-5 border-2 border-blue-800">
              <div className="text-yellow-500 font-bold mb-3 uppercase tracking-widest text-sm">Command Points</div>
              <div className="flex items-center justify-between gap-3">
                <button 
                  onClick={() => updatePlayer('player1', 'cp', -1)}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-red-700 hover:bg-red-600 rounded-xl text-3xl sm:text-4xl font-bold transition-all active:scale-90 border-2 border-red-500"
                >
                  -
                </button>
                <div className="text-6xl sm:text-8xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]">
                  {gameState.player1.cp}
                </div>
                <button 
                  onClick={() => updatePlayer('player1', 'cp', 1)}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-green-700 hover:bg-green-600 rounded-xl text-3xl sm:text-4xl font-bold transition-all active:scale-90 border-2 border-green-500"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className={`rounded-2xl p-6 transition-all duration-300 border-4 ${
            gameState.currentPlayer === 2 
              ? 'bg-gradient-to-br from-green-900 via-green-950 to-black border-green-400 shadow-2xl shadow-green-500/50 scale-105' 
              : 'bg-gradient-to-br from-gray-800 to-black border-gray-700'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl sm:text-4xl font-black text-green-400 tracking-wider">
                PLAYER 2
              </h2>
              {gameState.currentPlayer === 2 && (
                <span className="px-4 py-2 bg-green-500 text-white font-bold text-sm rounded-full animate-pulse">
                  ● ACTIVE
                </span>
              )}
            </div>

            {/* VP */}
            <div className="mb-6 bg-black/30 rounded-xl p-5 border-2 border-green-800">
              <div className="text-yellow-500 font-bold mb-3 uppercase tracking-widest text-sm">Victory Points</div>
              <div className="flex items-center justify-between gap-3">
                <button 
                  onClick={() => updatePlayer('player2', 'vp', -1)}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-red-700 hover:bg-red-600 rounded-xl text-3xl sm:text-4xl font-bold transition-all active:scale-90 border-2 border-red-500"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <div className="text-6xl sm:text-8xl font-black text-green-300 drop-shadow-[0_0_20px_rgba(134,239,172,0.8)]">
                    {gameState.player2.vp}
                  </div>
                  <div className="flex gap-2 mt-3 justify-center">
                    <button onClick={() => quickVP('player2', 3)} className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-xs font-bold transition">+3</button>
                    <button onClick={() => quickVP('player2', 5)} className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-xs font-bold transition">+5</button>
                  </div>
                </div>
                <button 
                  onClick={() => updatePlayer('player2', 'vp', 1)}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-green-700 hover:bg-green-600 rounded-xl text-3xl sm:text-4xl font-bold transition-all active:scale-90 border-2 border-green-500"
                >
                  +
                </button>
              </div>
            </div>

            {/* CP */}
            <div className="bg-black/30 rounded-xl p-5 border-2 border-green-800">
              <div className="text-yellow-500 font-bold mb-3 uppercase tracking-widest text-sm">Command Points</div>
              <div className="flex items-center justify-between gap-3">
                <button 
                  onClick={() => updatePlayer('player2', 'cp', -1)}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-red-700 hover:bg-red-600 rounded-xl text-3xl sm:text-4xl font-bold transition-all active:scale-90 border-2 border-red-500"
                >
                  -
                </button>
                <div className="text-6xl sm:text-8xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]">
                  {gameState.player2.cp}
                </div>
                <button 
                  onClick={() => updatePlayer('player2', 'cp', 1)}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-green-700 hover:bg-green-600 rounded-xl text-3xl sm:text-4xl font-bold transition-all active:scale-90 border-2 border-green-500"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center">
          <button 
            onClick={newGame}
            className="px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl font-bold text-lg transition-all duration-200 border-2 border-gray-600 shadow-lg hover:shadow-gray-500/50 hover:scale-105 active:scale-95"
          >
            🔄 New Game
          </button>
        </div>

        {/* History Log */}
        {history.length > 0 && (
          <div className="mt-6 bg-black/50 border border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-500 font-mono">
              Last action: {history[history.length - 1].action}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
