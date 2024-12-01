import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const interestingFacts = [
  "Did you know? Honey never spoils.",
  "Fun Fact: A day on Venus is longer than a year on Venus.",
  "Did you know? Octopuses have three hearts.",
  "Interesting Fact: Bananas are berries, but strawberries are not.",
  "Fun Fact: Humans share about 60% of their DNA with bananas.",
];

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [factIndex, setFactIndex] = useState(0);

  // Rotate facts every 5 seconds
  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % interestingFacts.length);
    }, 5000);
    return () => clearInterval(factInterval);
  }, []);

  useEffect(() => {
    if (token) {
      socket.auth = { token };
      socket.connect();

      socket.on("chatHistory", (data) => setMessages(data));
      socket.on("receiveMessage", (data) => {
        setMessages((prev) => [...prev, data]);
      });
    }

    return () => socket.off();
  }, [token]);

  const register = async () => {
    try {
      await axios.post("http://localhost:5000/api/register", { username, password });
      alert("Registration successful! Please log in.");
    } catch (err) {
      alert("Registration failed. Try again.");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", { username, password });
      setToken(res.data.token);
    } catch (err) {
      alert("Login failed. Check your credentials.");
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { username, message });
      setMessages((prev) => [...prev, { username, message }]);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <div className="absolute top-4 left-4 text-white italic text-lg">
        {interestingFacts[factIndex]}
      </div>
      {!token ? (
        <div className="p-6 bg-white rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Welcome to Chat</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border rounded w-full px-3 py-2 mb-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded w-full px-3 py-2 mb-3"
          />
          <div className="flex justify-between">
            <button
              onClick={register}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Register
            </button>
            <button
              onClick={login}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Login
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg">
          <div className="bg-white rounded shadow-md flex flex-col h-[80vh]">
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
              {messages.length ? (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 ${
                      msg.username === username ? "text-right" : "text-left"
                    }`}
                  >
                    <span
                      className={`inline-block px-4 py-2 rounded-lg ${
                        msg.username === username
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300"
                      }`}
                    >
                      <strong>{msg.username}: </strong>
                      {msg.message}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No messages yet</p>
              )}
            </div>
            <div className="flex items-center p-3 bg-white border-t">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
              />
              <button
                onClick={sendMessage}
                className="ml-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;




