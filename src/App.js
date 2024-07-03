import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const chatBodyRef = useRef(null);

  const handleSend = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { sender: 'user', text: input }];
      setMessages(newMessages);
      setInput('');
      setLoading(true);

      const data = {
        messages: [
          {
            content: input,
            role: 'user'
          }
        ],
        model: document.getElementById('modelID').value
      };

      try {
        const response = await axios.post('https://inf.cl.uni-trier.de/chat/', data, {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json'
          }
        });
        const botMessage = response.data.response;
        animateBotMessage(botMessage, newMessages);
      } catch (error) {
        console.error('Error fetching response:', error);
        setMessages([...newMessages, { sender: 'bot', text: 'Error fetching response from API' }]);
        setLoading(false);
      }
    }
  };

  const animateBotMessage = (botMessage, newMessages) => {
    let displayedMessage = '';
    const chars = botMessage.split('');
    let index = 0;

    const id = setInterval(() => {
      if (index < chars.length) {
        displayedMessage += chars[index];
        setMessages([...newMessages, { sender: 'bot', text: displayedMessage }]);
        index++;
      } else {
        clearInterval(id);
        setLoading(false);
      }
    }, 20); // Adjust typing speed here

    setIntervalId(id);
  };

  const handleStop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessageText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <b key={index}>{part.slice(2, -2)}</b>;
      }
      return part;
    });
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <div className="chat-header">
          <h2>
            Chatbot 
            <select name="model" id="modelID" defaultValue="mixtral:8x7b-instruct-v0.1-q6_K" className="custom-select">
              <option value="">--Please choose an option--</option>
              <option value="falcon:40b-instruct-q5_1">falcon:40b-instruct-q5_1</option>
              <option value="gemma:7b-instruct-q6_K">gemma:7b-instruct-q6_K</option>
              <option value="llama2:70b-chat-q6_K">llama2:70b-chat-q6_K</option>
              <option value="llama3:70b-instruct-q6_K">llama3:70b-instruct-q6_K</option>
              <option value="mistral:7b-instruct-v0.2-q6_K">mistral:7b-instruct-v0.2-q6_K</option>
              <option value="mixtral:8x7b-instruct-v0.1-q6_K">mixtral:8x7b-instruct-v0.1-q6_K</option>
              <option value="mixtral:8x22b-instruct-v0.1-q6_K">mixtral:8x22b-instruct-v0.1-q6_K</option>
              <option value="qwen:72b-chat-v1.5-q6_K">qwen:72b-chat-v1.5-q6_K</option>
            </select>
          </h2>
          <div className="header-icons">
            <i className="fas fa-cog"></i>
            <i className="fas fa-user"></i>
          </div>
        </div>
        <div className="chat-body" ref={chatBodyRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              {renderMessageText(msg.text)}
            </div>
          ))}
          {loading && <div className="chat-message bot loading"><div className="dot-flashing"></div></div>}
        </div>
        <div className="chat-footer">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>
            Send
            <i className="fas fa-paper-plane"></i>
          </button>
          <button onClick={handleStop}>
            Stop
            <i className="fas fa-stop"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
