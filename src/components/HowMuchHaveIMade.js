"use client";

import React, { useState, useEffect } from 'react';
import { PlayCircle, PauseCircle, RotateCcw, Moon, Sun, Keyboard, Settings, Coffee, Share2, History } from 'lucide-react';

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
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Custom work schedule
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [weeksPerYear, setWeeksPerYear] = useState(52);
  const [showSettings, setShowSettings] = useState(false);

  // Break tracking
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [totalBreakTime, setTotalBreakTime] = useState(0);

  // Session history
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Share feature
  const [showShare, setShowShare] = useState(false);

  // Error handling
  const [errorMessage, setErrorMessage] = useState('');

  // Wake Lock API for preventing screen sleep
  const [wakeLock, setWakeLock] = useState(null);

  // Load all settings from localStorage on mount
  useEffect(() => {
    const savedSalary = localStorage.getItem('annualSalary');
    if (savedSalary) setSalary(savedSalary);

    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const savedGoal = localStorage.getItem('earningsGoal');
    if (savedGoal) setGoal(savedGoal);

    const savedInputMode = localStorage.getItem('inputMode');
    if (savedInputMode) setInputMode(savedInputMode);

    const savedHoursPerDay = localStorage.getItem('hoursPerDay');
    if (savedHoursPerDay) setHoursPerDay(Number(savedHoursPerDay));

    const savedDaysPerWeek = localStorage.getItem('daysPerWeek');
    if (savedDaysPerWeek) setDaysPerWeek(Number(savedDaysPerWeek));

    const savedWeeksPerYear = localStorage.getItem('weeksPerYear');
    if (savedWeeksPerYear) setWeeksPerYear(Number(savedWeeksPerYear));

    const savedSessions = localStorage.getItem('sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error('Failed to parse sessions', e);
      }
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

  // Save work schedule settings
  useEffect(() => {
    localStorage.setItem('hoursPerDay', hoursPerDay.toString());
  }, [hoursPerDay]);

  useEffect(() => {
    localStorage.setItem('daysPerWeek', daysPerWeek.toString());
  }, [daysPerWeek]);

  useEffect(() => {
    localStorage.setItem('weeksPerYear', weeksPerYear.toString());
  }, [weeksPerYear]);

  // Save sessions
  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

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
      // Convert hourly to annual using custom schedule
      const hoursPerYear = hoursPerDay * daysPerWeek * weeksPerYear;
      return salaryNum * hoursPerYear;
    }
    return salaryNum;
  };

  const calculateEarningsPerMinute = (annualSalary) => {
    const minutesPerYear = hoursPerDay * daysPerWeek * weeksPerYear * 60;
    return annualSalary / minutesPerYear;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calculateHourlyRate = (annualSalary) => {
    const hoursPerYear = hoursPerDay * daysPerWeek * weeksPerYear;
    return annualSalary / hoursPerYear;
  };

  const calculateDailyTarget = (annualSalary) => {
    const daysPerYear = daysPerWeek * weeksPerYear;
    return annualSalary / daysPerYear;
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

  const validateSalary = () => {
    const salaryNum = Number(salary);
    if (!salary) {
      setErrorMessage('Please enter a salary');
      return false;
    }
    if (isNaN(salaryNum)) {
      setErrorMessage('Salary must be a valid number');
      return false;
    }
    if (salaryNum < 1) {
      setErrorMessage('Salary must be at least $1');
      return false;
    }
    if (salaryNum > 10000000) {
      setErrorMessage('Salary cannot exceed $10,000,000');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleStart = async () => {
    if (!validateSalary()) return;

    setIsRunning(true);
    setStartTime(Date.now());

    // Request wake lock to prevent screen sleep
    if ('wakeLock' in navigator) {
      try {
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);

        // Re-acquire wake lock when visibility changes
        lock.addEventListener('release', () => {
          setWakeLock(null);
        });
      } catch (err) {
        // Wake lock failed, but continue anyway
        console.warn('Wake Lock failed:', err);
      }
    }
  };

  const handlePause = () => {
    if (startTime) {
      const currentSessionTime = Date.now() - startTime;
      setElapsedTime(elapsedTime + currentSessionTime);
    }
    setIsRunning(false);
    setStartTime(null);

    // Release wake lock when paused
    if (wakeLock) {
      wakeLock.release();
      setWakeLock(null);
    }
  };

  const handleReset = () => {
    // Confirm if there are significant earnings
    if (earnings > 10 && isRunning) {
      if (!confirm(`You have $${formatCurrency(earnings)} tracked. Reset and save session?`)) {
        return;
      }
    }

    // Save session to history if there were any earnings
    if (earnings > 0 || elapsedTime > 0) {
      const currentSessionTime = startTime ? Date.now() - startTime : 0;
      const totalTime = elapsedTime + currentSessionTime;

      const newSession = {
        id: Date.now(),
        date: new Date().toISOString(),
        earnings: earnings,
        workTime: totalTime - totalBreakTime,
        breakTime: totalBreakTime,
        totalTime: totalTime,
        salary: Number(salary),
        inputMode: inputMode
      };

      setSessions([newSession, ...sessions]);

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
    setTotalBreakTime(0);
    setIsOnBreak(false);
    setBreakStartTime(null);
    setLastCelebratedAmount(0);
    document.title = originalTitle;

    // Release wake lock when reset
    if (wakeLock) {
      wakeLock.release();
      setWakeLock(null);
    }
  };

  const closeSummary = () => {
    setShowSummary(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleBreakToggle = () => {
    if (isOnBreak) {
      // End break
      if (breakStartTime) {
        const breakDuration = Date.now() - breakStartTime;
        setTotalBreakTime(totalBreakTime + breakDuration);
      }
      setIsOnBreak(false);
      setBreakStartTime(null);
    } else {
      // Start break
      setIsOnBreak(true);
      setBreakStartTime(Date.now());
    }
  };

  const applySchedulePreset = (preset) => {
    switch(preset) {
      case 'fulltime':
        setHoursPerDay(8);
        setDaysPerWeek(5);
        setWeeksPerYear(52);
        break;
      case 'parttime':
        setHoursPerDay(4);
        setDaysPerWeek(5);
        setWeeksPerYear(52);
        break;
      case 'contractor':
        setHoursPerDay(6);
        setDaysPerWeek(4);
        setWeeksPerYear(50);
        break;
      default:
        break;
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all session history?')) {
      setSessions([]);
      setShowHistory(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Earnings', 'Work Time', 'Break Time', 'Total Time', 'Salary', 'Mode'];
    const rows = sessions.map(s => [
      new Date(s.date).toLocaleString(),
      s.earnings.toFixed(2),
      formatTime(s.workTime),
      formatTime(s.breakTime),
      formatTime(s.totalTime),
      s.salary,
      s.inputMode
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareText = `💰 I earned $${formatCurrency(earnings)} in ${formatTime(elapsedTime + (startTime ? Date.now() - startTime : 0))}!\n\nTrack your earnings at howmuchhaveimade.com`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'How Much Have I Made?',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback to copy to clipboard
          navigator.clipboard.writeText(shareText);
          alert('Copied to clipboard!');
        }
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    }
  };

  return (
    <>
      <div className={`w-full max-w-md mx-auto rounded-lg shadow-lg p-4 sm:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>How Much Have I Made?</h2>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-label="Work schedule settings"
              title="Work schedule settings"
            >
              <Settings className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-label="Session history"
              title="Session history"
            >
              <History className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
            >
              <Keyboard className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
            </button>
          </div>
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-black'
            }`}
            disabled={isRunning}
            aria-label={inputMode === 'annual' ? 'Annual Salary' : 'Hourly Rate'}
            aria-invalid={errorMessage ? 'true' : 'false'}
            aria-describedby={errorMessage ? 'salary-error' : undefined}
          />
          {errorMessage && (
            <div id="salary-error" className="text-red-500 text-sm mt-1" role="alert">
              {errorMessage}
            </div>
          )}
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
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
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap justify-center gap-2">
            {!isRunning ? (
              <button
                onClick={handleStart}
                disabled={!salary || isNaN(Number(salary))}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                aria-label="Start timer"
              >
                <PlayCircle className="w-5 h-5" aria-hidden="true" />
                <span>Start</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ring-2 ring-blue-300 ring-opacity-50 animate-pulse min-h-[44px]"
                aria-label="Pause timer"
              >
                <PauseCircle className="w-4 h-4" aria-hidden="true" />
                <span>Pause</span>
              </button>
            )}
            {isRunning && (
              <button
                onClick={handleBreakToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-md min-h-[44px] ${
                  isOnBreak
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
                aria-label={isOnBreak ? 'End break' : 'Start break'}
              >
                <Coffee className="w-4 h-4" aria-hidden="true" />
                <span>{isOnBreak ? 'End Break' : 'Break'}</span>
              </button>
            )}
            <button
              onClick={handleReset}
              className={`flex items-center gap-2 px-4 py-2 border rounded-md min-h-[44px] ${
                darkMode
                  ? 'border-gray-600 hover:bg-gray-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-black'
              }`}
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
          {(earnings > 0 || elapsedTime > 0) && (
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 min-h-[44px]"
              aria-label="Share earnings statistics"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
              <span>Share Stats</span>
            </button>
          )}
        </div>
        <div className="text-center space-y-2">
          <div className={`text-2xl sm:text-3xl font-bold transition-all ${
            isRunning ? 'animate-pulse-glow text-green-600 dark:text-green-400' : darkMode ? 'text-white' : 'text-black'
          }`}>
            ${formatCurrency(displayedEarnings)}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-black'}`}>
            {isRunning ? (
              <span className="inline-flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                earning now...
              </span>
            ) : (
              'earned since starting timer'
            )}
          </div>
          {(isRunning || elapsedTime > 0) && (
            <div className={`text-lg font-medium mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div>⏱️ Working: {formatTime(elapsedTime + (startTime ? Date.now() - startTime : 0) - totalBreakTime - (isOnBreak && breakStartTime ? Date.now() - breakStartTime : 0))}</div>
              {(totalBreakTime > 0 || isOnBreak) && (
                <div className="text-sm">☕ Break: {formatTime(totalBreakTime + (isOnBreak && breakStartTime ? Date.now() - breakStartTime : 0))}</div>
              )}
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
        <div
          className={`rounded-lg shadow-xl p-6 max-w-sm w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-summary-title"
        >
          <div className="text-center">
            <h3 id="session-summary-title" className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Session Complete! 🎉</h3>
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
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium min-h-[44px]"
              aria-label="Close session summary"
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

    {/* Keyboard Shortcuts Modal */}
    {showShortcuts && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowShortcuts(false)}>
        <div
          className={`rounded-lg shadow-xl p-6 max-w-sm w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
        >
          <div className="text-center mb-4">
            <h3 id="shortcuts-title" className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>⌨️ Keyboard Shortcuts</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <kbd className={`px-3 py-1 rounded text-sm font-mono ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>Space</kbd>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Start / Pause</span>
            </div>
            <div className="flex justify-between items-center">
              <kbd className={`px-3 py-1 rounded text-sm font-mono ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>R</kbd>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Reset</span>
            </div>
            <div className="flex justify-between items-center">
              <kbd className={`px-3 py-1 rounded text-sm font-mono ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>Esc</kbd>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pause</span>
            </div>
          </div>
          <button
            onClick={() => setShowShortcuts(false)}
            className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium min-h-[44px]"
            aria-label="Close keyboard shortcuts"
          >
            Got it!
          </button>
        </div>
      </div>
    )}

    {/* Settings Modal */}
    {showSettings && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowSettings(false)}>
        <div
          className={`rounded-lg shadow-xl p-6 max-w-md w-full my-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <h3 id="settings-title" className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>⚙️ Work Schedule</h3>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button onClick={() => applySchedulePreset('fulltime')} className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 min-h-[44px]" aria-label="Apply full-time schedule preset">Full-time (40h)</button>
              <button onClick={() => applySchedulePreset('parttime')} className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 min-h-[44px]" aria-label="Apply part-time schedule preset">Part-time (20h)</button>
              <button onClick={() => applySchedulePreset('contractor')} className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 min-h-[44px]" aria-label="Apply contractor schedule preset">Contractor</button>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-black'}`}>Hours per Day</label>
              <input
                type="number"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                min="1"
                max="24"
                className={`w-full px-3 py-2 border rounded-md text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-black'}`}>Days per Week</label>
              <input
                type="number"
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                min="1"
                max="7"
                className={`w-full px-3 py-2 border rounded-md text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-black'}`}>Weeks per Year</label>
              <input
                type="number"
                value={weeksPerYear}
                onChange={(e) => setWeeksPerYear(Number(e.target.value))}
                min="1"
                max="52"
                className={`w-full px-3 py-2 border rounded-md text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
              />
            </div>

            <div className={`text-sm p-3 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              Total: {hoursPerDay * daysPerWeek * weeksPerYear} hours/year ({hoursPerDay * daysPerWeek} hours/week)
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium min-h-[44px]"
            aria-label="Save work schedule settings"
          >
            Save
          </button>
        </div>
      </div>
    )}

    {/* History Modal */}
    {showHistory && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowHistory(false)}>
        <div
          className={`rounded-lg shadow-xl p-6 max-w-2xl w-full my-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-title"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 id="history-title" className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>📊 Session History</h3>
            <div className="flex gap-2">
              {sessions.length > 0 && (
                <>
                  <button
                    onClick={exportToCSV}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 min-h-[44px]"
                    aria-label="Export session history to CSV"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={clearHistory}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 min-h-[44px]"
                    aria-label="Clear all session history"
                  >
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No sessions yet. Start tracking to build your history!
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                    ${formatCurrency(sessions.reduce((sum, s) => sum + s.earnings, 0))}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Earnings</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                    {sessions.length}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sessions</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                    {formatTime(sessions.reduce((sum, s) => sum + s.workTime, 0))}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Work Time</div>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                          ${formatCurrency(session.earnings)}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(session.date).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          ⏱️ {formatTime(session.workTime)}
                        </div>
                        {session.breakTime > 0 && (
                          <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                            ☕ {formatTime(session.breakTime)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            onClick={() => setShowHistory(false)}
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium min-h-[44px]"
            aria-label="Close session history"
          >
            Close
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default HowMuchHaveIMade;