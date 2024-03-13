import React, { useState, useEffect, useRef } from 'react';
import './ReactChatBox.css'; // import your CSS file
import { TbMessageChatbot } from "react-icons/tb";

const ReactChatBox = () => {
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const chatContainerRef = useRef(null);

  const toggleChat = () => {
    setShowChat(prevState => !prevState);
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    // Add user message to chat history
    setChatHistory(prev => [...prev, { message: inputText, sender: 'user' }]);
    setInputText('');

    try {
      // Make a POST request to the chatbot API
      const response = await fetch('http://localhost:5000/api/nlp/naturallanguaugae', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: inputText // Send the user's message as the query
        })
      });

      // Parse the response JSON
      const data = await response.json();

      // Add bot response to chat history
      setChatHistory(prev => [...prev, { message: data.data, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      // Scroll chat container to the bottom
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    // Send initial message to chatbot API when component mounts
    const sendInitialMessage = async () => {
     
       

        const data ={
          data:"Hey I am Meera chatbot, How can i help you ?"
        };

        // Add initial bot response to chat history
        setChatHistory(prev => [...prev, { message: data.data, sender: 'bot' }]);
      
    };

    if (showChat) {
      sendInitialMessage();
    }
  }, [showChat]);

  return (
    <div>
      {!showChat && (
        <div className="chat-icon" onClick={toggleChat}>
          <TbMessageChatbot/>
        </div>
      )}
      {showChat && (
        <div className="chatbot-container">
          <div className="chat-header">
            <div className="chat-title">Chat with Meera</div>
            <div className="close-icon" onClick={toggleChat}>
              X
            </div>
          </div>
          <div className="chatbot-messages" ref={chatContainerRef}>
            {chatHistory.map((chat, index) => (
              <div key={index} className={`message ${chat.sender === 'user' ? 'user' : 'bot'}`}>
                {chat.message}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') sendMessage();
              }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactChatBox;
