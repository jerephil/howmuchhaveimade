"use client";

import React, { useState, useEffect } from 'react';
import { PlayCircle, PauseCircle, RotateCcw, Moon, Sun } from 'lucide-react';

const HowMuchHaveIMade = () => {
  const [salary, setSalary] = useState('');
  const [earnings, setEarnings] = useState(0);
  const [displayedEarnings, setDisplayedEarnings] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // Track accumulated time in milliseconds
  const [originalTitle] = useState("How Much Have I Made?");
  const [showSummary, setShowSummary] = useState(false);
  const [sessionSummary, setSessionSummary] = useState({ earnings: 0, time: 0 });
  const [darkMode, setDarkMode] = useState(false);
  const [goal, setGoal] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCelebratedAmount, setLastCelebratedAmount] = useState(0);
  const [inputMode, setInputMode] = useState('annual'); // 'annual' or 'hourly'

  // Load salary, dark mode, goal, and input mode from localStorage on mount
  useEffect(() => {
    const savedSalary = localStorage.getItem('annualSalary');
    if (savedSalary) {
      setSalary(savedSalary);
    }

    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const savedGoal = localStorage.getItem('earningsGoal');
    if (savedGoal) {
      setGoal(savedGoal);
    }

    const savedInputMode = localStorage.getItem('inputMode');
    if (savedInputMode) {
      setInputMode(savedInputMode);
    }
  }, []);

  // Save salary to localStorage when it changes
  useEffect(() => {
    if (salary) {
      localStorage.setItem('annualSalary', salary);
    }
  }, [salary]);

  // Save dark mode preference and apply to document
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save goal
  useEffect(() => {
    if (goal) {
      localStorage.setItem('earningsGoal', goal);
    }
  }, [goal]);

  // Save input mode
  useEffect(() => {
    localStorage.setItem('inputMode', inputMode);
  }, [inputMode]);

  // Check if goal reached and celebrate milestones
  useEffect(() => {
    if (!goal || !isRunning) return;

    const goalAmount = Number(goal);
    if (isNaN(goalAmount) || goalAmount <= 0) return;

    // Check for milestone celebrations (every $10, $25, $50, $100, etc.)
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    const currentMilestone = milestones.find(m =>
      earnings >= m && lastCelebratedAmount < m
    );

    if (currentMilestone) {
      setShowCelebration(true);
      setLastCelebratedAmount(currentMilestone);
      setTimeout(() => setShowCelebration(false), 3000);
    }

    // Check if goal reached
    if (earnings >= goalAmount && lastCelebratedAmount < goalAmount) {
      setShowCelebration(true);
      setLastCelebratedAmount(goalAmount);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [earnings, goal, isRunning, lastCelebratedAmount]);

  // Smooth counter animation
  useEffect(() => {
    if (!isRunning) return;

    const animationInterval = setInterval(() => {
      setDisplayedEarnings((prev) => {
        const diff = earnings - prev;
        // Smooth interpolation - move 20% of the distance each frame
        if (Math.abs(diff) < 0.01) {
          return earnings;
        }
        return prev + diff * 0.2;
      });
    }, 50); // Update animation 20 times per second for smoothness

    return () => clearInterval(animationInterval);
  }, [earnings, isRunning]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in input field
      if (e.target.tagName === 'INPUT') return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          if (!salary || isNaN(Number(salary))) return;
          if (isRunning) {
            handlePause();
          } else {
            handleStart();
          }
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleReset();
          break;
        case 'Escape':
          if (isRunning) {
            handlePause();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, salary]);

  const getAnnualSalary = () => {
    const salaryNum = Number(salary);
    if (inputMode === 'hourly') {
      // Convert hourly to annual: hourly * 8 hours * 260 days
      return salaryNum * 8 * 260;
    }
    return salaryNum;
  };

  const calculateEarningsPerMinute = (annualSalary) => {
    const workingDaysPerYear = 260;
    const workingHoursPerDay = 8;
    const minutesPerYear = workingDaysPerYear * workingHoursPerDay * 60;
    return annualSalary / minutesPerYear;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calculateHourlyRate = (annualSalary) => {
    const workingDaysPerYear = 260;
    const workingHoursPerDay = 8;
    const hoursPerYear = workingDaysPerYear * workingHoursPerDay;
    return annualSalary / hoursPerYear;
  };

  const calculateDailyTarget = (annualSalary) => {
    const workingDaysPerYear = 260;
    return annualSalary / workingDaysPerYear;
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  useEffect(() => {
    let intervalId;
    if (isRunning && startTime) {
      intervalId = setInterval(() => {
        const currentSessionTime = Date.now() - startTime;
        const totalElapsedTime = elapsedTime + currentSessionTime;
        const minutesElapsed = totalElapsedTime / 60000;
        const annualSalary = getAnnualSalary();
        const earningsPerMinute = calculateEarningsPerMinute(annualSalary);
        const currentEarnings = minutesElapsed * earningsPerMinute;
        setEarnings(currentEarnings);
        document.title = `$${formatCurrency(currentEarnings)} - How Much Have I Made?`;
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, startTime, salary, elapsedTime, inputMode]);

  useEffect(() => {
    document.title = originalTitle;
    return () => {
      document.title = originalTitle;
    };
  }, [originalTitle]);

  const handleStart = () => {
    if (!salary || isNaN(Number(salary))) return;
    setIsRunning(true);
    setStartTime(Date.now());
  };

  const handlePause = () => {
    if (startTime) {
      const currentSessionTime = Date.now() - startTime;
      setElapsedTime(elapsedTime + currentSessionTime);
    }
    setIsRunning(false);
    setStartTime(null);
  };

  const handleReset = () => {
    // Show summary if there were any earnings
    if (earnings > 0 || elapsedTime > 0) {
      const currentSessionTime = startTime ? Date.now() - startTime : 0;
      const totalTime = elapsedTime + currentSessionTime;
      setSessionSummary({
        earnings: earnings,
        time: totalTime
      });
      setShowSummary(true);
    }

    setIsRunning(false);
    setEarnings(0);
    setDisplayedEarnings(0);
    setStartTime(null);
    setElapsedTime(0);
    setLastCelebratedAmount(0);
    document.title = originalTitle;
  };

  const closeSummary = () => {
    setShowSummary(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <>
      <div className={`w-full max-w-md mx-auto rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-6 flex items-center justify-center gap-3">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>How Much Have I Made?</h2>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
          </button>
        </div>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-black'}`}>
              {inputMode === 'annual' ? 'Annual Salary ($)' : 'Hourly Rate ($)'}
            </label>
            <button
              onClick={() => setInputMode(inputMode === 'annual' ? 'hourly' : 'annual')}
              disabled={isRunning}
              className={`text-xs px-2 py-1 rounded ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              Switch to {inputMode === 'annual' ? 'Hourly' : 'Annual'}
            </button>
          </div>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder={inputMode === 'annual' ? 'Enter your annual salary' : 'Enter your hourly rate'}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-black'
            }`}
            disabled={isRunning}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-black'}`}>
            Earnings Goal ($ optional)
          </label>
          <input
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Set a goal (e.g., 100)"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-black'
            }`}
            disabled={isRunning}
          />
        </div>
        {goal && !isNaN(Number(goal)) && Number(goal) > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Progress to Goal
              </span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                {Math.min(100, Math.round((earnings / Number(goal)) * 100))}%
              </span>
            </div>
            <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (earnings / Number(goal)) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {salary && !isNaN(Number(salary)) && Number(salary) > 0 && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className={`rounded-md p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Per Minute</div>
              <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                ${formatCurrency(calculateEarningsPerMinute(getAnnualSalary()))}
              </div>
            </div>
            <div className={`rounded-md p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hourly</div>
              <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                ${formatCurrency(calculateHourlyRate(getAnnualSalary()))}
              </div>
            </div>
            <div className={`rounded-md p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Daily Target</div>
              <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                ${formatCurrency(calculateDailyTarget(getAnnualSalary()))}
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <button 
              onClick={handleStart}
              disabled={!salary || isNaN(Number(salary))}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start</span>
            </button>
          ) : (
            <button 
              onClick={handlePause}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Pause</span>
            </button>
          )}
          <button
            onClick={handleReset}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-md ${
              darkMode
                ? 'border-gray-600 hover:bg-gray-700 text-white'
                : 'border-gray-300 hover:bg-gray-50 text-black'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
        <div className="text-center space-y-2">
          <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
            ${formatCurrency(displayedEarnings)}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-black'}`}>
            earned since starting timer
          </div>
          {(isRunning || elapsedTime > 0) && (
            <div className={`text-lg font-medium mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ⏱️ {formatTime(elapsedTime + (startTime ? Date.now() - startTime : 0))}
            </div>
          )}
        </div>
        <div className={`text-center text-sm mt-6 ${darkMode ? 'text-gray-400' : 'text-black'}`}>
          Made by <a href="https://alchemyrisen.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">Alchemy Risen</a> | Follow us on <a href="https://x.com/AlchemyRisen" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">X</a>
        </div>
      </div>
    </div>

    {/* Session Summary Modal */}
    {showSummary && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeSummary}>
        <div className={`rounded-lg shadow-xl p-6 max-w-sm w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Session Complete! 🎉</h3>
            <div className="space-y-3 mb-6">
              <div className={`rounded-lg p-4 ${darkMode ? 'bg-green-900 bg-opacity-30' : 'bg-green-50'}`}>
                <div className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>You Earned</div>
                <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ${formatCurrency(sessionSummary.earnings)}
                </div>
              </div>
              <div className={`rounded-lg p-4 ${darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50'}`}>
                <div className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Time Worked</div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {formatTime(sessionSummary.time)}
                </div>
              </div>
            </div>
            <button
              onClick={closeSummary}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Celebration Modal */}
    {showCelebration && (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
        <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-lg shadow-2xl p-8 animate-bounce">
          <div className="text-center">
            <div className="text-6xl mb-2">🎉</div>
            <div className="text-2xl font-bold text-white">
              ${formatCurrency(lastCelebratedAmount)}!
            </div>
            <div className="text-white font-medium">Milestone Reached!</div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default HowMuchHaveIMade;