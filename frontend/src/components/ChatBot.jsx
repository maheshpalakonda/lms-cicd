import React, { useState, useRef, useEffect } from 'react';
import { FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { serverUrl } from '../App';

const ChatBot = ({ isStudent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isStudent) {
    return null;
  }

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    // Add a placeholder for the bot's response
    const botMessagePlaceholder = { sender: 'bot', text: '' };
    setMessages(prev => [...prev, botMessagePlaceholder]);

    try {
      const response = await fetch(`${serverUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage.text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: !done });

        // Process server-sent events
        const eventLines = chunk.split('\n\n').filter(line => line.trim());
        for (const line of eventLines) {
          if (line.startsWith('data:')) {
            const jsonData = line.substring(5);
            try {
              const parsedData = JSON.parse(jsonData);
              if (parsedData.error) {
                // Handle error sent from the stream
                setError(parsedData.error);
                setMessages(prev => prev.slice(0, -1)); // Remove placeholder
                const errorMessage = { sender: 'bot', text: parsedData.error };
                setMessages(prev => [...prev, errorMessage]);
                return; // Stop processing on error
              }
              if (parsedData.reply) {
                // Append the new chunk to the last message
                setMessages(prev =>
                  prev.map((msg, index) =>
                    index === prev.length - 1 ? { ...msg, text: msg.text + parsedData.reply } : msg
                  )
                );
              }
            } catch (e) {
              console.error('Failed to parse stream data:', jsonData, e);
              setError('Failed to parse stream data.');
            }
          }
        }
      }
    } catch (err) {
      setError('Error: ' + err.message);
      const errorMessage = { sender: 'bot', text: 'Sorry, there was an error processing your request.' };
      setMessages(prev => prev.slice(0, -1).concat(errorMessage)); // Replace placeholder with error
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => toast.success('Copied to clipboard!'))
        .catch(err => toast.error('Failed to copy!'));
    } else {
      toast.warn('Clipboard access is not available.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleChat}
          aria-label="Open ChatBot"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            border: 'none',
            color: '#fff',
            fontSize: '30px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          💬
        </button>
      )}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '320px',
          height: '400px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            padding: '10px',
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold',
            fontSize: '16px',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            ChatBot
            <button
              onClick={toggleChat}
              aria-label="Close ChatBot"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              ×
            </button>
          </div>
          <div style={{
            flex: 1,
            padding: '10px',
            overflowY: 'auto',
            backgroundColor: '#fafafa'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', maxWidth: '90%' }}>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '16px',
                    backgroundColor: msg.sender === 'user' ? '#007bff' : '#e5e5ea',
                    color: msg.sender === 'user' ? '#fff' : '#000',
                    wordWrap: 'break-word',
                    order: msg.sender === 'user' ? 2 : 1,
                  }}>
                    {msg.text}
                  </div>
                  {msg.sender === 'bot' && msg.text && (
                    <button
                      onClick={() => handleCopy(msg.text)}
                      aria-label="Copy message"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6c757d',
                        order: 2,
                      }}
                    >
                      <FaCopy />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: '10px', borderTop: '1px solid #ddd' }}>
            <textarea
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              style={{
                width: '100%',
                resize: 'none',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '8px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
