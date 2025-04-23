import React, { useState, useEffect } from "react";
import Sentiment from "sentiment";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, BarChart2, Home, Settings, BookOpen, PenTool, Save, RefreshCw } from "lucide-react";

const sentiment = new Sentiment();

// Sample historic data to demonstrate trends
const initialHistoryData = [
  { date: "Apr 19", score: 3, entries: 4 },
  { date: "Apr 20", score: 1, entries: 2 },
  { date: "Apr 21", score: -2, entries: 3 },
  { date: "Apr 22", score: 4, entries: 5 },
  { date: "Apr 23", score: 2, entries: 3 }
];

const journalPrompts = [
  "What was the highlight of your day?",
  "What are you grateful for today?",
  "What emotions are you feeling right now?",
  "What challenged you today?",
  "What's one thing you'd like to improve tomorrow?"
];

const App = () => {
  const [screen, setScreen] = useState("welcome");
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [journal, setJournal] = useState([]);
  const [journalEntry, setJournalEntry] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [historyData, setHistoryData] = useState(initialHistoryData);
  const [savedEntries, setSavedEntries] = useState([]);
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set a random prompt when journal page loads
    if (screen === "journal") {
      const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
      setCurrentPrompt(randomPrompt);
    }
  }, [screen]);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    
    setLoading(true);
    
    // Simulate an API delay
    setTimeout(() => {
      const result = sentiment.analyze(text);
      setAnalysis(result);
      setScreen("result");
      setLoading(false);
      
      // Add to history
      const today = new Date();
      const dateString = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Update history data
      const existingDateIndex = historyData.findIndex(item => item.date === dateString);
      if (existingDateIndex >= 0) {
        const newHistoryData = [...historyData];
        newHistoryData[existingDateIndex] = {
          ...newHistoryData[existingDateIndex],
          score: (newHistoryData[existingDateIndex].score * newHistoryData[existingDateIndex].entries + result.score) / 
                 (newHistoryData[existingDateIndex].entries + 1),
          entries: newHistoryData[existingDateIndex].entries + 1
        };
        setHistoryData(newHistoryData);
      } else {
        setHistoryData([...historyData, { date: dateString, score: result.score, entries: 1 }]);
      }
      
      // Save this entry
      setSavedEntries(prev => [...prev, {
        id: Date.now(),
        text,
        score: result.score,
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }]);
    }, 1000);
  };

  const saveJournalEntry = () => {
    if (!journalEntry.trim()) return;
    
    setLoading(true);
    
    setTimeout(() => {
      // Analyze and save journal entry
      const result = sentiment.analyze(journalEntry);
      
      setJournal([...journal, {
        id: Date.now(),
        text: journalEntry,
        sentiment: result.score,
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }]);
      
      setJournalEntry("");
      setCurrentPrompt(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
      setLoading(false);
    }, 800);
  };

  const getMoodColor = (score) => {
    if (score > 2) return "text-green-600";
    if (score < -2) return "text-red-600";
    if (score > 0) return "text-green-400";
    if (score < 0) return "text-red-400";
    return "text-yellow-500";
  };

  const getMoodText = (score) => {
    if (score > 3) return "Very Positive";
    if (score > 1) return "Positive";
    if (score > -1) return "Neutral";
    if (score > -3) return "Negative";
    return "Very Negative";
  };

  const getEmoji = (score) => {
    if (score > 3) return "😁";
    if (score > 1) return "🙂";
    if (score > -1) return "😐";
    if (score > -3) return "🙁";
    return "😞";
  };

  const getSuggestion = (score) => {
    if (score < -2) {
      return "This content appears quite negative. Consider taking a break or engaging with more positive content.";
    } else if (score < 0) {
      return "This has some negative elements. Be mindful of how it affects your mood.";
    } else if (score > 2) {
      return "This content is positive! It can help maintain a good emotional state.";
    } else {
      return "This content is fairly neutral in emotional tone.";
    }
  };

  const NavBar = () => {
    if (screen === "welcome") return null;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2">
        <button onClick={() => setScreen("dashboard")} className={`p-2 rounded-full ${screen === "dashboard" ? "bg-blue-100" : ""}`}>
          <Home size={24} className={screen === "dashboard" ? "text-blue-600" : "text-white-600"} />
        </button>
        <button onClick={() => setScreen("history")} className={`p-2 rounded-full ${screen === "history" ? "bg-blue-100" : ""}`}>
          <BarChart2 size={24} className={screen === "history" ? "text-blue-600" : "text-white-600"} />
        </button>
        <button onClick={() => setScreen("journal")} className={`p-2 rounded-full ${screen === "journal" ? "bg-blue-100" : ""}`}>
          <PenTool size={24} className={screen === "journal" ? "text-blue-600" : "text-white-600"} />
        </button>
        <button onClick={() => setScreen("library")} className={`p-2 rounded-full ${screen === "library" ? "bg-blue-100" : ""}`}>
          <BookOpen size={24} className={screen === "library" ? "text-blue-600" : "text-white-600"} />
        </button>
        <button onClick={() => setScreen("settings")} className={`p-2 rounded-full ${screen === "settings" ? "bg-blue-100" : ""}`}>
          <Settings size={24} className={screen === "settings" ? "text-blue-600" : "text-white-600"} />
        </button>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100"} flex flex-col items-center justify-center p-6 pb-20`}>
      <NavBar />
      
      {screen === "welcome" && (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to MindGuard</h1>
          <p className="mb-6 text-gray-600">Your emotionally intelligent social companion</p>
          <div className="mb-8">
            <img src="/logo.png" alt="MindGuard Logo" className="mx-auto rounded-lg shadow-lg" />
          </div>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
            onClick={() => setScreen("consent")}
          >
            Get Started
          </button>
        </div>
      )}
      
      {screen === "consent" && (
        <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-md w-full max-w-md`}>
          <h2 className="text-2xl font-semibold mb-4">Consent & Preferences</h2>
          <p className={`mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            We respect your privacy. Choose what you'd like to share.
          </p>
          
          <div className="space-y-3 mb-6">
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
              <span>Emotion tracking and analysis</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
              <span>Personalized well-being suggestions</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
              <span>Safe content filtering</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
              <span>Usage analytics to improve the app</span>
            </label>
          </div>
          
          <div className="flex space-x-4">
            <button
              className="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              onClick={() => setScreen("welcome")}
            >
              Back
            </button>
            <button
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => setScreen("dashboard")}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      
      {screen === "dashboard" && (
        <div className={`w-full max-w-md ${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-md`}>
          <h2 className="text-2xl font-bold mb-4">Your Emotional Dashboard</h2>
          <p className={`mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Enter content you'd like to analyze emotionally:
          </p>
          
          <textarea
            className={`w-full p-3 border ${theme === "dark" ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={4}
            placeholder="Paste or type social media text, messages, or any content..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <button
            className={`mt-4 w-full px-6 py-2 ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-lg flex items-center justify-center`}
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              "Analyze Emotion"
            )}
          </button>
          
          {savedEntries.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Recent Analyses</h3>
              <div className="space-y-2">
                {savedEntries.slice(-3).map(entry => (
                  <div 
                    key={entry.id}
                    className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} flex justify-between items-center`}
                  >
                    <div className="flex-1 truncate mr-2">
                      {entry.text.substring(0, 40)}{entry.text.length > 40 ? "..." : ""}
                    </div>
                    <div className="flex items-center">
                      <span className={`text-lg ${getMoodColor(entry.score)}`}>
                        {getEmoji(entry.score)}
                      </span>
                      <span className="text-xs ml-2 text-gray-500">{entry.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {screen === "result" && analysis && (
        <div className={`w-full max-w-md ${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-md`}>
          <h2 className="text-xl font-semibold mb-4">Emotional Analysis</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-lg font-bold ${getMoodColor(analysis.score)}`}>
                {getMoodText(analysis.score)}
              </p>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} text-sm`}>
                Score: {analysis.score}
              </p>
            </div>
            <div className={`text-5xl ${getMoodColor(analysis.score)}`}>
              {getEmoji(analysis.score)}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} mb-4`}>
            <h3 className="font-medium mb-1">Suggestion</h3>
            <p className="text-sm">{getSuggestion(analysis.score)}</p>
          </div>
          
          {analysis.words && analysis.words.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Key Words Analyzed</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.words.slice(0, 10).map((word, idx) => (
                  <span 
                    key={idx} 
                    className={`px-2 py-1 text-xs rounded-full ${
                      analysis.positive.includes(word) 
                        ? "bg-green-100 text-green-800" 
                        : analysis.negative.includes(word) 
                          ? "bg-red-100 text-red-800" 
                          : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center justify-center"
              onClick={() => setScreen("dashboard")}
            >
              <RefreshCw size={16} className="mr-1" />
              Analyze Another
            </button>
            <button
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              onClick={() => setScreen("history")}
            >
              <BarChart2 size={16} className="mr-1" />
              View History
            </button>
          </div>
        </div>
      )}
      
      {screen === "history" && (
        <div className={`w-full max-w-md ${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-md`}>
          <h2 className="text-2xl font-bold mb-4">Your Emotion History</h2>
          
          <div className="mb-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[-5, 5]} />
                <Tooltip />
                <Bar 
                  dataKey="score" 
                  fill="#3B82F6" 
                  name="Average Mood Score"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">Recent Analysis History</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {savedEntries.slice().reverse().map(entry => (
              <div 
                key={entry.id} 
                className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} border-l-4 ${getMoodColor(entry.score)} border-${getMoodColor(entry.score).split('-')[1]}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-medium ${getMoodColor(entry.score)}`}>
                    {getMoodText(entry.score)} {getEmoji(entry.score)}
                  </span>
                  <span className="text-xs text-gray-500">{entry.date}</span>
                </div>
                <p className="text-sm">
                  {entry.text.length > 100 ? entry.text.substring(0, 100) + "..." : entry.text}
                </p>
              </div>
            ))}
            
            {savedEntries.length === 0 && (
              <div className="text-center py-6">
                <AlertCircle size={40} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">No analysis history yet</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {screen === "journal" && (
        <div className={`w-full max-w-md ${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-md`}>
          <h2 className="text-2xl font-bold mb-4">Emotional Journal</h2>
          
          <div className={`p-4 mb-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-blue-50"} border-l-4 border-blue-500`}>
            <h3 className="font-medium mb-1">Today's Prompt</h3>
            <p className="text-sm">{currentPrompt}</p>
          </div>
          
          <textarea
            className={`w-full p-3 border ${theme === "dark" ? "border-gray-700 bg-gray-700 text-white" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={4}
            placeholder="Write your thoughts here..."
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
          />
          
          <button
            className={`mt-4 w-full px-6 py-2 ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-lg flex items-center justify-center`}
            onClick={saveJournalEntry}
            disabled={loading || !journalEntry.trim()}
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Save Entry
              </>
            )}
          </button>
          
          {journal.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Previous Entries</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {journal.slice().reverse().map(entry => (
                  <div 
                    key={entry.id} 
                    className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`${getMoodColor(entry.sentiment)}`}>
                        {getEmoji(entry.sentiment)}
                      </span>
                      <span className="text-xs text-gray-500">{entry.date}</span>
                    </div>
                    <p className="text-sm">
                      {entry.text.length > 100 ? entry.text.substring(0, 100) + "..." : entry.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {screen === "library" && (
        <div className={`w-full max-w-md ${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-md`}>
          <h2 className="text-2xl font-bold mb-4">Resource Library</h2>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-blue-50"} border-l-4 border-blue-500`}>
              <h3 className="font-medium">Understanding Your Emotions</h3>
              <p className="text-sm mt-1">
                Learn how to identify and process your emotional responses.
              </p>
              <button className="mt-2 text-blue-500 text-sm font-medium">Read More</button>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-green-50"} border-l-4 border-green-500`}>
              <h3 className="font-medium">Mental Wellness Practices</h3>
              <p className="text-sm mt-1">
                Daily habits to improve your emotional resilience.
              </p>
              <button className="mt-2 text-green-500 text-sm font-medium">Read More</button>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-purple-50"} border-l-4 border-purple-500`}>
              <h3 className="font-medium">Mindfulness Techniques</h3>
              <p className="text-sm mt-1">
                Simple exercises to stay present and reduce anxiety.
              </p>
              <button className="mt-2 text-purple-500 text-sm font-medium">Read More</button>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-orange-50"} border-l-4 border-orange-500`}>
              <h3 className="font-medium">Digital Wellness Guide</h3>
              <p className="text-sm mt-1">
                How to have a healthier relationship with social media.
              </p>
              <button className="mt-2 text-orange-500 text-sm font-medium">Read More</button>
            </div>
          </div>
        </div>
      )}
      
      {screen === "settings" && (
        <div className={`w-full max-w-md ${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-md`}>
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={theme === "dark"}
                  onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-2">Privacy Options</h3>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
                  <span className="text-sm">Allow anonymous data collection</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
                  <span className="text-sm">Store data locally only</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
                  <span className="text-sm">Send helpful notifications</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Account</h3>
              <button className="text-blue-600 text-sm">Export My Data</button>
              <div className="mt-2">
                <button className="text-red-600 text-sm">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;