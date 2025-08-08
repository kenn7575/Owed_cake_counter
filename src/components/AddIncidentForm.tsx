import React, { useState, useEffect, useRef } from 'react';
import { X, Cake } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddIncidentFormProps {
  onAdd: (personName: string, notes?: string) => void;
  onClose: () => void;
}

export const AddIncidentForm: React.FC<AddIncidentFormProps> = ({ onAdd, onClose }) => {
  const [personName, setPersonName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; total: number }>>([]);
  const [isFocused, setIsFocused] = useState(false);
  const focusRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      const query = personName.trim();
      if (!query || !focusRef.current) {
        setSuggestions([]);
        return;
      }

      const { data, error } = await supabase
        .from('cake_incidents')
        .select('person_name')
        .ilike('person_name', `%${query}%`);

      if (error || !data || !focusRef.current) {
        if (error) console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        return;
      }

      const counts: Record<string, number> = {};
      data.forEach((row) => {
        const name = row.person_name as string;
        counts[name] = (counts[name] || 0) + 1;
      });

      const results = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, total]) => ({ name, total }));
      if (focusRef.current) setSuggestions(results);
    }, 500);

    return () => clearTimeout(handler);
  }, [personName, isFocused]);

  const handleSelect = (name: string) => {
    setPersonName(name);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const checkForTroll = async (name: string, description: string) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return false;
    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'omni-moderation-latest',
          input: `${name}\n${description}`,
        }),
      });
      const data = await response.json();
      return data.results?.[0]?.flagged || false;
    } catch (error) {
      console.error('Error checking for troll:', error);
      return false;
    }
  };


  const validateIncident = async (
    name: string,
    description: string
  ): Promise<{ validName: boolean; relevant: boolean }> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return { validName: true, relevant: true };
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You validate cake incident reports. Return JSON {"validName": boolean, "relevant": boolean}. "validName" is false if the name is not a plausible person name. "relevant" is true only if the description relates to cake or leaving a computer unlocked. Only return JSON.',
            },
            {
              role: 'user',
              content: `Name: ${name}\nDescription: ${description}`,
            },
          ],
          max_tokens: 20,
        }),
      });
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) return { validName: true, relevant: true };
      return JSON.parse(text);
    } catch (error) {
      console.error('Error validating incident:', error);
      return { validName: true, relevant: true };
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    setIsSubmitting(true);
    try {
      const isTroll = await checkForTroll(personName.trim(), notes.trim());
      if (isTroll) {
        window.alert('Your incident was flagged as a troll post and was not submitted.');
        return;
      }

      const validation = await validateIncident(personName.trim(), notes.trim());
      if (!validation.validName || !validation.relevant) {
        window.alert(
          'Please provide a valid name and ensure the notes are about cake or leaving your computer unlocked.'
        );
        return;
      }

      await onAdd(personName.trim(), notes.trim() || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Cake className="h-6 w-6 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-800">Report Incident</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div className="relative">
              <label htmlFor="personName" className="block text-sm font-semibold text-gray-700 mb-2">
                Who forgot to lock their computer? *
              </label>
              <input
                type="text"
                id="personName"
                ref={inputRef}
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                onFocus={() => {
                  focusRef.current = true;
                  setIsFocused(true);
                }}
                onBlur={() => {
                  focusRef.current = false;
                  setIsFocused(false);
                  setTimeout(() => setSuggestions([]), 100);
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 outline-none"
                placeholder="Enter person's name"
                required
                disabled={isSubmitting}
                autoComplete="off"
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((s) => (
                    <li key={s.name}>
                      <button
                        type="button"
                        onMouseDown={() => handleSelect(s.name)}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 flex justify-between items-center"
                      >
                        <span>{s.name}</span>
                        <span className="text-sm text-gray-500">
                          {s.total} incident{s.total !== 1 ? 's' : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 outline-none resize-none"
                placeholder="Any additional details..."
                rows={3}
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !personName.trim()}
              >
                {isSubmitting ? 'Adding...' : 'Add Incident'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
