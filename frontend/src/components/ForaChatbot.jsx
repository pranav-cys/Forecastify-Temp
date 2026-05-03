import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore, useForecastStore, useHistoryStore } from '../store';
import { 
  X, 
  Minus, 
  Maximize2, 
  Send, 
  Paperclip,
  Bot,
  User,
  PanelRightOpen,
  Loader2,
  FileText,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

// A beautifully styled Chatbot component that supports Floating (PiP) and Side-Panel modes
export default function ForaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidePanel, setIsSidePanel] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello! I'm Fora, your Forecastify Business Data Analyst. How can I assist you with your analytics today?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeFileId, setActiveFileId] = useState(null);
  const [activeFileName, setActiveFileName] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  
  // App Context
  const { user } = useAuthStore();
  const { forecastData, fileName, forecastDays } = useForecastStore();
  const { history } = useHistoryStore();

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  const handleClearChat = () => {
    setMessages([
      { role: 'bot', content: "Hello! I'm Fora, your Forecastify Business Data Analyst. How can I assist you with your analytics today?" }
    ]);
    setSelectedFile(null);
    setActiveFileId(null);
    setActiveFileName(null);
    toast.success("Chat cleared");
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() && !selectedFile) return;

    const userMessage = inputMessage;
    const fileToUpload = selectedFile;

    // Add user message to UI
    const newMessages = [...messages, { 
      role: 'user', 
      content: userMessage,
      file: fileToUpload ? fileToUpload.name : null
    }];
    
    setMessages(newMessages);
    setInputMessage('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', userMessage);
      if (fileToUpload) {
        formData.append('file', fileToUpload);
      }
      
      // Append app context with raw dataset arrays
      const appContext = {
        currentPage: location.pathname,
        user: user ? { name: user.name, email: user.email, role: user.role } : null,
        currentForecast: forecastData ? {
          fileName,
          forecastDays,
          bestModel: forecastData.best_model,
          metrics: forecastData.dashboard_metrics,
          dataSummary: forecastData.data_summary,
          actualDates: forecastData.actualDates,
          actualValues: forecastData.actualValues,
          forecastDates: forecastData.forecastDates,
          forecastValues: forecastData.forecastValues
        } : null,
        historyLength: history.length
      };
      formData.append('app_context', JSON.stringify(appContext));
      formData.append('chat_history', JSON.stringify(messages));
      if (activeFileId && !fileToUpload) {
        formData.append('active_file_id', activeFileId);
      }

      // We assume backend is running on port 8000
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.new_file_id) {
        setActiveFileId(data.new_file_id);
        setActiveFileName(fileToUpload.name);
      }

      setMessages([...newMessages, { role: 'bot', content: data.response }]);
      
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get a response from Fora.");
      setMessages([...newMessages, { role: 'bot', content: "I'm sorry, I encountered an error connecting to my servers. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check size (e.g., max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Please select a file under 10MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  // If not open, just show the floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
        <Bot className="w-5 h-5 relative z-10" />
        <span className="font-semibold relative z-10 font-sans tracking-wide">Ask Fora</span>
      </button>
    );
  }

  // Styles based on mode
  const containerClasses = isSidePanel
    ? "fixed top-0 right-0 h-screen w-[400px] border-l border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl z-[60] flex flex-col transition-all duration-300 translate-x-0"
    : `fixed ${isMinimized ? 'bottom-6 right-6 w-[300px] h-[60px]' : 'bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh]'} bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-[60] flex flex-col transition-all duration-300`;

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Fora</h3>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <button 
            onClick={handleClearChat}
            className="p-1.5 hover:bg-slate-100 hover:text-red-500 rounded-md transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {!isSidePanel && (
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => {
              setIsSidePanel(!isSidePanel);
              setIsMinimized(false);
            }}
            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors hidden sm:block"
            title={isSidePanel ? "Switch to Floating Mode" : "Dock to Side"}
          >
            {isSidePanel ? <Maximize2 className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body - Hide if minimized floating */}
      {(!isMinimized || isSidePanel) && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-slate-50/50">
            {location.pathname === '/analysis' && messages.length === 1 && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 mb-4 flex items-start gap-2 shadow-sm">
                <Bot className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                <p>I see you are on the Analysis page. Feel free to ask me questions about your charts, trends, or forecasting results!</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                }`}>
                  {msg.file && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-white/10 rounded-lg text-xs font-medium border border-white/20 text-white">
                      <FileText className="w-3 h-3" />
                      Attached: {msg.file}
                    </div>
                  )}
                  {msg.role === 'bot' ? (
                    <div className="prose prose-sm prose-slate max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-white border border-slate-200 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                  <span className="text-sm text-slate-500">Fora is analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-100 bg-white">
            {activeFileName && !selectedFile && (
              <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs border border-emerald-100">
                <span className="flex items-center gap-1 truncate">
                  <FileText className="w-3 h-3" />
                  Active: {activeFileName}
                </span>
                <button onClick={() => { setActiveFileId(null); setActiveFileName(null); }} className="hover:text-emerald-900" title="Remove active document">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {selectedFile && (
              <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs border border-emerald-100">
                <span className="flex items-center gap-1 truncate">
                  <FileText className="w-3 h-3" />
                  {selectedFile.name}
                </span>
                <button onClick={() => setSelectedFile(null)} className="hover:text-emerald-900">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all shadow-inner overflow-hidden flex items-end">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Ask Fora..."
                  className="flex-1 max-h-32 min-h-[44px] py-3 px-1 bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-700 placeholder-slate-400"
                  rows={1}
                />
              </div>
              <button
                type="submit"
                disabled={(!inputMessage.trim() && !selectedFile) || isLoading}
                className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-400">Fora can make mistakes. Check important info.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
