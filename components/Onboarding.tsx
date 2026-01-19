import React, { useState } from 'react';
import { ChildProfile, Gender } from '../types';
import { Button } from './Button';

interface OnboardingProps {
  onComplete: (profile: ChildProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.BOY);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && birthDate) {
      onComplete({ name, birthDate, gender });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-teal-50 to-white">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-teal-50">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🌱
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to LittleSprout</h1>
          <p className="text-gray-500 mt-2">Let's set up your child's profile to start tracking their growth.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Child's Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-teal-500 focus:bg-white transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-teal-500 focus:bg-white transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGender(Gender.BOY)}
                className={`p-4 rounded-xl border-2 font-medium transition-all ${
                  gender === Gender.BOY
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-teal-200'
                }`}
              >
                👦 Boy
              </button>
              <button
                type="button"
                onClick={() => setGender(Gender.GIRL)}
                className={`p-4 rounded-xl border-2 font-medium transition-all ${
                  gender === Gender.GIRL
                    ? 'border-pink-400 bg-pink-50 text-pink-700'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-pink-200'
                }`}
              >
                👧 Girl
              </button>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full text-lg">
              Start Tracking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
