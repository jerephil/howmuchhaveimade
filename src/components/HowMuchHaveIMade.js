"use client";

import React, { useState, useEffect } from 'react';
import { PlayCircle, PauseCircle, RotateCcw } from 'lucide-react';

const HowMuchHaveIMade = () => {
  const [salary, setSalary] = useState('');
  const [earnings, setEarnings] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [originalTitle] = useState("How Much Have I Made?");

  const calculateEarningsPerMinute = (annualSalary) => {
    const workingDaysPerYear = 260;
    const workingHoursPerDay = 8;
    const minutesPerYear = workingDaysPerYear * workingHoursPerDay * 60;
    return annualSalary / minutesPerYear;
  };

  useEffect(() => {
    let intervalId;
    if (isRunning && startTime) {
      intervalId = setInterval(() => {
        const minutesElapsed = (Date.now() - startTime) / 60000;
        const earningsPerMinute = calculateEarningsPerMinute(Number(salary));
        const currentEarnings = minutesElapsed * earningsPerMinute;
        setEarnings(currentEarnings);
        document.title = `$${currentEarnings.toFixed(2)} - How Much Have I Made?`;
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime, salary]);

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
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setEarnings(0);
    setStartTime(null);
    document.title = originalTitle;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black">How Much Have I Made?</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-black">Annual Salary ($)</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Enter your annual salary"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            disabled={isRunning}
          />
        </div>
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
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-black"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-black">
            ${earnings.toFixed(2)}
          </div>
          <div className="text-sm text-black">
            earned since starting timer
          </div>
        </div>
        <div className="text-center text-sm mt-6">
          a <a href="https://rytavi.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">rytāvi corp</a> service
        </div>
      </div>
    </div>
  );
};

export default HowMuchHaveIMade;