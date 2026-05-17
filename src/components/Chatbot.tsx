import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { chatbotService, type ChatMessage } from '../services/chatbotService';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Chào bạn! Mình là trợ lý ảo của rạp chiếu phim. Bạn cần hỏi thông tin gì về phim, suất chiếu hay vé không?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [systemContext, setSystemContext] = useState('');

  useEffect(() => {
    // Tải ngữ cảnh AI từ service
    chatbotService.getSystemContext().then(setSystemContext);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const aiReply = await chatbotService.sendMessage(userMessage, messages, systemContext);
      setMessages(prev => [...prev, { role: 'model', text: aiReply }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: error.message || 'Xin lỗi, hệ thống AI đang gặp lỗi. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      {/* Nút mở Chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-110 active:scale-95"
          title="Chat với Trợ lý AI"
        >
          <span className="material-symbols-outlined text-3xl">smart_toy</span>
        </button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex justify-between items-center text-white">
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined bg-white/20 p-1.5 rounded-full text-[20px]">smart_toy</span>
                <div>
                    <h3 className="font-bold text-sm">Trợ lý ảo</h3>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
             </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
             {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                   }`}>
                      {/* Xử lý hiển thị xuống dòng */}
                      {msg.text.split('\n').map((line, i) => (
                          <span key={i}>
                             {line}
                             {i !== msg.text.split('\n').length - 1 && <br />}
                          </span>
                      ))}
                   </div>
                </div>
             ))}
             {isLoading && (
                 <div className="flex justify-start">
                     <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                     </div>
                 </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-100 bg-white">
             <div className="flex items-center gap-2 relative">
                <input 
                   type="text" 
                   placeholder="Hỏi về phim, vé..." 
                   className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                   value={input}
                   onChange={e => setInput(e.target.value)}
                   onKeyDown={handleKeyDown}
                   disabled={isLoading}
                />
                <button 
                   onClick={sendMessage}
                   disabled={!input.trim() || isLoading}
                   className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:hover:bg-primary"
                >
                   <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
