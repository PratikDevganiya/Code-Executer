// client/src/pages/CodeEditor.jsx
import { useState, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import SaveCodeButton from "../components/SaveCodeButton";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { FaUsers, FaCopy, FaCheck, FaComments, FaPaperPlane, FaSignInAlt } from "react-icons/fa";
import { io } from 'socket.io-client';

// Debug mode flag - set to false to reduce console output
const DEBUG_MODE = false;

const CodeEditor = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams();
  const submissionData = location.state?.submissionData;
  const submissionId = location.state?.submissionId;

  const [code, setCode] = useState(() => {
    // For collaborative mode, try to get code from localStorage using roomId
    if (urlRoomId) {
      const savedCode = localStorage.getItem(`code_${urlRoomId}`);
      if (savedCode) return savedCode;
    }
    
    // For normal mode, try to get code from localStorage
    const savedCode = localStorage.getItem('code');
    if (savedCode) return savedCode;
    
    // Fall back to submission data or default
    return submissionData?.code || "// Start coding here...";
  });
  
  const [language, setLanguage] = useState(() => {
    // For collaborative mode, try to get language from localStorage using roomId
    if (urlRoomId) {
      const savedLanguage = localStorage.getItem(`language_${urlRoomId}`);
      if (savedLanguage) return savedLanguage;
    }
    
    // For normal mode, try to get language from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) return savedLanguage;
    
    // Fall back to submission data or default
    return submissionData?.language || "javascript";
  });
  
  const [input, setInput] = useState(() => {
    // For collaborative mode, try to get input from localStorage using roomId
    if (urlRoomId) {
      const savedInput = localStorage.getItem(`input_${urlRoomId}`);
      if (savedInput) return savedInput;
    }
    
    // For normal mode, try to get input from localStorage
    const savedInput = localStorage.getItem('input');
    if (savedInput) return savedInput;
    
    // Fall back to submission data or default
    return submissionData?.input || "";
  });
  
  const [output, setOutput] = useState(submissionData?.output || "");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("vs-dark");
  
  // Collaboration state
  const [isCollaborative, setIsCollaborative] = useState(!!urlRoomId);
  const [roomId, setRoomId] = useState(urlRoomId || null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [manualRoomId, setManualRoomId] = useState('');
  const [roomIdError, setRoomIdError] = useState('');
  const [justJoined, setJustJoined] = useState(false);
  const [displayRoomId, setDisplayRoomId] = useState('');
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [userCount, setUserCount] = useState(1);
  const [roomParticipants, setRoomParticipants] = useState([]);

  const monaco = useMonaco();

  // If roomId is in URL, enable collaborative mode
  useEffect(() => {
    if (urlRoomId) {
      setIsCollaborative(true);
      setRoomId(urlRoomId);
      
      // Check if this is a refresh of a room we joined
      const joinedRoomId = localStorage.getItem('joinedRoomId');
      
      // If we have evidence of joining this room
      if (joinedRoomId === urlRoomId) {
        setHasJoinedRoom(true);
        setDisplayRoomId(urlRoomId);
      }
    }
  }, [urlRoomId]);

  // Socket connection for collaboration
  useEffect(() => {
    if (isCollaborative && roomId) {
      if (DEBUG_MODE) {
        console.log('Setting up socket connection for room:', roomId);
      }
      
      const newSocket = io('http://localhost:5001', {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        if (DEBUG_MODE) {
          console.log('Connected to WebSocket with ID:', newSocket.id);
        }
        // Make sure we're sending the correct data format to the server
        newSocket.emit('join-room', {
          roomId,
          username: user?.username || user?.email || 'Anonymous'
        });
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      newSocket.on('disconnect', (reason) => {
        if (DEBUG_MODE) {
          console.log('Socket disconnected:', reason);
        }
      });

      newSocket.on('code-update', (data) => {
        if (DEBUG_MODE) {
          console.log('Received code update:', data);
        }
        if (data.userId !== newSocket.id) {
          if (DEBUG_MODE) {
            console.log('Setting code from another user');
          }
          setCode(data.code);
        }
      });

      newSocket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('user-joined', ({ userId, username, timestamp }) => {
        setActiveUsers(prev => [...prev, { userId, username, timestamp }]);
        // Add to participants list if not already there
        setRoomParticipants(prev => {
          if (!prev.includes(username)) {
            return [...prev, username];
          }
          return prev;
        });
      });
      
      newSocket.on('user-left', ({ userId, username }) => {
        setActiveUsers(prev => prev.filter(user => user.userId !== userId));
        // We don't remove from participants list to keep history
      });
      
      newSocket.on('user-list-update', ({ users, count }) => {
        if (DEBUG_MODE) {
          console.log('User list update received:', users);
        }
        // Update the user count state
        setUserCount(count);
        
        // Update active users with the full list from server
        setActiveUsers(users.filter(u => u.userId !== newSocket.id));
        
        // Update participants list with usernames
        const usernames = users.map(u => u.username).filter(Boolean);
        setRoomParticipants(prev => {
          const uniqueUsernames = new Set([...prev, ...usernames]);
          return Array.from(uniqueUsernames);
        });
      });

      newSocket.on('input-update', (data) => {
        if (DEBUG_MODE) {
          console.log('Received input update:', data);
        }
        if (data.userId !== newSocket.id) {
          setInput(data.input);
        }
      });

      newSocket.on('output-update', (data) => {
        if (DEBUG_MODE) {
          console.log('Received output update:', data);
        }
        if (data.userId !== newSocket.id) {
          setOutput(data.output);
        }
      });

      setSocket(newSocket);

      // Clean up on unmount or when changing rooms
      return () => {
        if (DEBUG_MODE) {
          console.log('Leaving room:', roomId);
        }
        newSocket.emit('leave-room', {
          roomId,
          userId: newSocket.id
        });
        newSocket.close();
      };
    }
  }, [isCollaborative, roomId, user]);

  // Define custom themes
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("monokai", {
        base: "vs-dark",
        inherit: true,
        rules: [{ background: "272822" }],
        colors: {
          "editor.background": "#272822",
          "editor.foreground": "#F8F8F2",
        },
      });

      monaco.editor.defineTheme("dracula", {
        base: "vs-dark",
        inherit: true,
        rules: [{ background: "282A36" }],
        colors: {
          "editor.background": "#282A36",
          "editor.foreground": "#F8F8F2",
        },
      });

      monaco.editor.defineTheme("github-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [{ background: "0D1117" }],
        colors: {
          "editor.background": "#0D1117",
          "editor.foreground": "#C9D1D9",
          "editorCursor.foreground": "#F78166",
          "editor.lineHighlightBackground": "#363B46",
          "editorLineNumber.foreground": "#8B949E",
          "editor.selectionBackground": "#264F78",
          "editor.inactiveSelectionBackground": "#1C2B3A",
        },
      });

      monaco.editor.defineTheme("github-light", {
        base: "vs",
        inherit: true,
        rules: [{ background: "FFFFFF" }],
        colors: {
          "editor.background": "#FFFFFF",
          "editor.foreground": "#24292E",
          "editorCursor.foreground": "#0969DA",
          "editor.lineHighlightBackground": "#F6F8FA",
          "editorLineNumber.foreground": "#6E7781",
          "editor.selectionBackground": "#B4D6FC",
          "editor.inactiveSelectionBackground": "#D0E5FF",
        },
      });

      monaco.editor.defineTheme("solarized-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [{ background: "002B36" }],
        colors: {
          "editor.background": "#002B36",
          "editor.foreground": "#839496",
        },
      });

      monaco.editor.defineTheme("solarized-light", {
        base: "vs",
        inherit: true,
        rules: [{ background: "FDF6E3" }],
        colors: {
          "editor.background": "#FDF6E3",
          "editor.foreground": "#657B83",
        },
      });

      monaco.editor.setTheme(theme); // Apply selected theme
    }
  }, [monaco, theme]);

  // Save code to localStorage when it changes
  useEffect(() => {
    if (isCollaborative && roomId) {
      localStorage.setItem(`code_${roomId}`, code);
    } else {
      localStorage.setItem('code', code);
    }
  }, [code, isCollaborative, roomId]);
  
  // Save language to localStorage when it changes
  useEffect(() => {
    if (isCollaborative && roomId) {
      localStorage.setItem(`language_${roomId}`, language);
    } else {
      localStorage.setItem('language', language);
    }
  }, [language, isCollaborative, roomId]);
  
  // Save input to localStorage when it changes
  useEffect(() => {
    if (isCollaborative && roomId) {
      localStorage.setItem(`input_${roomId}`, input);
    } else {
      localStorage.setItem('input', input);
    }
  }, [input, isCollaborative, roomId]);

  const handleSubmit = async () => {
    if (!user) {
      setOutput("⚠ Please login to execute code");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5001/execute",
        { code, language, input },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const outputResult = response.data.output;
      setOutput(outputResult);
      
      // Emit output to all connected users if in collaborative mode
      if (isCollaborative && socket && socket.connected) {
        if (DEBUG_MODE) {
          console.log('Emitting output update to room:', roomId);
        }
        socket.emit('output-update', {
          roomId,
          output: outputResult,
          userId: socket.id
        });
      }
    } catch (error) {
      const errorOutput = error.response?.data?.message || "⚠ Error executing code";
      setOutput(errorOutput);
      
      // Emit error output to all connected users if in collaborative mode
      if (isCollaborative && socket && socket.connected) {
        if (DEBUG_MODE) {
          console.log('Emitting error output update to room:', roomId);
        }
        socket.emit('output-update', {
          roomId,
          output: errorOutput,
          userId: socket.id
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleCollaborativeMode = async () => {
    if (!isCollaborative) {
      // Generate a room ID when enabling collaborative mode
      const newRoomId = uuidv4();
      setRoomId(newRoomId);
      
      // Save the current session to collaboration history
      await saveCollaborationSession(newRoomId);
      
      // Navigate to the collaboration URL
      navigate(`/collaborate/${newRoomId}`);
    } else {
      // If exiting collaborative mode from a URL-based room, navigate to regular editor
      if (urlRoomId) {
        navigate('/editor');
      }
      // Close socket connection
      if (socket) {
        if (DEBUG_MODE) {
          console.log('Leaving room from toggleCollaborativeMode:', roomId);
        }
        socket.emit('leave-room', {
          roomId,
          userId: socket.id
        });
        socket.close();
        setSocket(null);
      }
      // Reset states
      setActiveUsers([]);
      setUserCount(1);
      setHasJoinedRoom(false);
      setDisplayRoomId('');
      
      // Clear localStorage
      localStorage.removeItem('joinedRoomId');
    }
    setIsCollaborative(!isCollaborative);
    setShowChat(false); // Reset chat visibility when toggling collaboration mode
  };

  const joinExistingRoom = () => {
    if (!manualRoomId || manualRoomId.trim() === '') {
      setRoomIdError('Please enter a valid room ID');
      return;
    }
    
    setRoomIdError('');
    const trimmedRoomId = manualRoomId.trim();
    
    // Set states to show "Joined" confirmation
    setJustJoined(true);
    setHasJoinedRoom(true);
    setDisplayRoomId(trimmedRoomId);
    
    // Store joined room ID in localStorage for persistence
    localStorage.setItem('joinedRoomId', trimmedRoomId);
    
    // Reset the "Joined" state after 2 seconds
    setTimeout(() => {
      setJustJoined(false);
    }, 2000);
    
    navigate(`/collaborate/${trimmedRoomId}`);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const saveCollaborationSession = async (sessionId) => {
    try {
      if (!user) return;
      
      // Get current user's name
      const currentUser = user?.username || user?.email || 'Anonymous';
      
      // Create a list of participants including the current user and all room participants
      const participantsList = [...new Set([currentUser, ...roomParticipants])];
      
      try {
        const response = await axios.post(
          "http://localhost:5001/api/code/collaborations",
          {
            roomId: sessionId,
            code: code,
            language,
            documentName: `${language.charAt(0).toUpperCase() + language.slice(1)} Collaboration`,
            editor: currentUser,
            participants: participantsList,
            timestamp: new Date().toISOString()
          },
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (DEBUG_MODE) {
          console.log("Collaboration saved:", response.data);
        }
        return response.data;
      } catch (collabError) {
        console.error("Error in saveCollaborationSession:", collabError);
        
        // If it's a server error but not a duplicate key error, log it but don't throw
        // We don't want to prevent the user from collaborating just because saving failed
        if (DEBUG_MODE) {
          console.log("Continuing despite collaboration save error");
        }
        
        // Return null to indicate saving failed, but don't throw an error
        return null;
      }
    } catch (error) {
      console.error("Failed to save collaboration session:", error);
      return null;
    }
  };

  const copyRoomLink = () => {
    if (!roomId) return;
    
    // Copy just the room ID instead of the full link
    navigator.clipboard.writeText(roomId);
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  const handleEditorChange = (value) => {
    setCode(value);
    if (isCollaborative && socket && socket.connected) {
      if (DEBUG_MODE) {
        console.log('Emitting code update to room:', roomId, 'with socket ID:', socket.id);
      }
      socket.emit('code-update', {
        roomId,
        code: value,
        userId: socket.id
      });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && socket.connected) {
      if (DEBUG_MODE) {
        console.log('Sending chat message to room:', roomId);
      }
      socket.emit('chat-message', {
        roomId,
        message: newMessage,
        username: user?.username || user?.email || 'Anonymous'
      });
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-[#88BDBC] p-3 flex flex-col items-center font-['Poppins']">
      {/* Language & Theme Selectors */}
      <div className="w-[65%] macbook-width flex justify-between mb-3">
        <div className="flex gap-2">
          <select
            className="w-44 px-2 py-1.5 bg-[#254E58] text-white font-semibold rounded-md 
               shadow-md focus:outline-none focus:ring-1 focus:ring-[#88BDBC] 
               transition cursor-pointer hover:bg-[#112D32] text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="c++">C++</option>
            <option value="c#">C#</option>
            <option value="php">PHP</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="ruby">Ruby</option>
          </select>

          <select
            className="w-44 px-2 py-1.5 bg-[#254E58] text-white font-semibold rounded-md 
               shadow-md focus:outline-none focus:ring-1 focus:ring-[#88BDBC] 
               transition cursor-pointer hover:bg-[#112D32] text-sm"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="vs-dark">Dark</option>
            <option value="light">Light</option>
            <option value="hc-black">High Contrast Black</option>
            <option value="hc-light">High Contrast Light</option>
            <option value="monokai">Monokai</option>
            <option value="dracula">Dracula</option>
            <option value="github-dark">GitHub Dark</option>
            <option value="github-light">GitHub Light</option>
            <option value="solarized-dark">Solarized Dark</option>
            <option value="solarized-light">Solarized Light</option>
          </select>
        </div>

        {isCollaborative ? (
          <div className="flex items-center gap-2">
            {showCopiedMessage ? (
              <span className="text-xs text-white bg-[#254E58] px-2 py-1 rounded-md">ID Copied!</span>
            ) : (
              <button
                onClick={copyRoomLink}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-white text-[#254E58] rounded-md hover:bg-[#254E58] hover:text-white transition-colors text-sm"
                title="Copy room ID to clipboard"
              >
                <FaCopy />
                Copy Room ID
              </button>
            )}
            <div className="h-6 border-r border-[#254E58]/30 mx-1"></div>
            
            {justJoined ? (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-green-500 text-white rounded-md text-sm">
                <FaCheck />
                Joined
              </div>
            ) : hasJoinedRoom && displayRoomId ? (
              <div className="flex items-center gap-2">
                <div className="px-2 py-1.5 bg-white text-[#254E58] rounded-md border border-[#254E58]/30 text-sm">
                  Room ID: {displayRoomId.substring(0, 8)}...
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={manualRoomId}
                  onChange={(e) => setManualRoomId(e.target.value)}
                  placeholder="Enter Room ID"
                  className="px-2 py-1.5 bg-white text-[#254E58] rounded-md border border-[#254E58]/30 focus:outline-none focus:ring-1 focus:ring-[#88BDBC] text-sm w-40"
                />
                {roomIdError && (
                  <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                    {roomIdError}
                  </div>
                )}
              </div>
            )}
            
            {!hasJoinedRoom && (
              <button
                onClick={joinExistingRoom}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-white text-[#254E58] rounded-md hover:bg-[#254E58] hover:text-white transition-colors text-sm"
                title="Join existing collaboration room"
              >
                <FaSignInAlt />
                Join Room
              </button>
            )}
            
            <button
              onClick={toggleChat}
              className={`flex items-center gap-1.5 px-2 py-1.5 ${showChat ? 'bg-[#254E58] text-white' : 'bg-white text-[#254E58]'} rounded-md hover:bg-[#254E58] hover:text-white transition-colors text-sm`}
            >
              <FaComments />
              Chat
            </button>
            <button
              onClick={toggleCollaborativeMode}
              className="flex items-center gap-1.5 px-2 py-1.5 bg-white text-[#254E58] rounded-md hover:bg-[#254E58] hover:text-white transition-colors text-sm"
            >
              <FaUsers />
              Exit Collaboration
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollaborativeMode}
              className="flex items-center gap-1.5 px-2 py-1.5 bg-white text-[#254E58] rounded-md hover:bg-[#254E58] hover:text-white transition-colors text-sm"
            >
              <FaUsers />
              Collaborate
            </button>
          </div>
        )}
      </div>

      {/* Main Container - Editor (Left) | Input & Output (Right) */}
      <div className="w-[65%] macbook-width grid grid-cols-1 lg:grid-cols-10 gap-3">
        {/* Code Editor - Left Side */}
        <div className="lg:col-span-7 border border-[#88BDBC] rounded-lg overflow-hidden shadow-md flex flex-col">
          {isCollaborative && (
            <div className="flex items-center px-2 py-1 bg-[#254E58] text-white text-xs border-b border-[#88BDBC]/30">
              <div className="flex items-center gap-2">
                <FaUsers className="text-xs" />
                <span>
                  {userCount} users online
                </span>
              </div>
            </div>
          )}
          
          <Editor
            height={isCollaborative ? "75vh" : "78vh"}
            language={language}
            value={code}
            onChange={handleEditorChange}
            theme={theme}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'Fira Code', monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 6, bottom: 6 },
            }}
          />
        </div>

        {/* Right Side - Output on Top, Input Below */}
        <div className="lg:col-span-3 flex flex-col h-[78vh] gap-3">
          {/* Output Box */}
          <div className="h-[48%] border border-[#254E58]/30 rounded-lg bg-[#254E58] 
                       text-white overflow-auto shadow-md">
            <div className="px-2 py-1.5 border-b border-[#88BDBC]/30 text-sm">
              📝 Output
            </div>
            <div className="p-2">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <pre className="whitespace-pre-wrap text-xs font-['Fira Code']">
                  {output || "Output will appear here..."}
                </pre>
              )}
            </div>
          </div>

          {/* Input Box */}
          <div className="h-[38%] border border-[#254E58]/30 rounded-lg bg-[#112D32] 
                       text-white shadow-md overflow-hidden">
            <div className="px-2 py-1.5 border-b border-[#88BDBC]/30 text-sm">
              🔹 Custom Input (Optional)
            </div>
            <textarea
              className="w-full h-[calc(100%-32px)] p-2 bg-transparent text-white 
                      placeholder-[#88BDBC]/70 focus:outline-none resize-none 
                      text-xs font-['Fira Code']"
              value={input}
              onChange={(e) => {
                const newInput = e.target.value;
                setInput(newInput);
                if (isCollaborative && socket && socket.connected) {
                  if (DEBUG_MODE) {
                    console.log('Emitting input update to room:', roomId);
                  }
                  socket.emit('input-update', {
                    roomId,
                    input: newInput,
                    userId: socket.id
                  });
                }
              }}
              placeholder="Enter your input here..."
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <button
              className="w-full py-2 bg-[#254E58] text-white font-semibold rounded-lg 
                      shadow-md hover:bg-[#112D32] transition-colors disabled:opacity-50 
                      disabled:cursor-not-allowed text-sm"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="small" />
                  Executing...
                </span>
              ) : (
                "Run Code"
              )}
            </button>

            <SaveCodeButton 
              code={code} 
              language={language} 
              input={input} 
              output={output}
              submissionId={submissionId}
              isCollaborative={isCollaborative}
              roomId={roomId}
              roomParticipants={roomParticipants}
            />
          </div>
        </div>
      </div>

      {/* Chat Panel - Fixed Position */}
      {isCollaborative && showChat && (
        <div className="fixed top-[135px] right-[2%] w-[280px] h-[42vh] border border-[#254E58]/30 rounded-lg shadow-md flex flex-col overflow-hidden z-10">
          <div className="px-2 py-1.5 bg-[#254E58] border-b border-[#88BDBC]/30 text-white text-sm flex justify-between items-center">
            <span>Chat ({userCount} users)</span>
            <button 
              onClick={toggleChat}
              className="text-white hover:text-[#88BDBC] transition-colors text-xs"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto bg-white">
            <div className="p-2 space-y-2">
              {messages.map((msg, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-[#88BDBC] rounded-full flex items-center justify-center text-white text-xs">
                    {msg.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#254E58]">{msg.username}</div>
                    <div className="text-xs text-[#112D32]">{msg.message}</div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-3 text-xs">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>
          </div>
          
          <div className="p-1.5 bg-white border-t border-[#254E58]/10">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-2 py-1 bg-[#F5F5F5] border-0 rounded focus:outline-none focus:ring-1 focus:ring-[#88BDBC] text-xs"
              />
              <button
                type="submit"
                className="p-1 bg-[#88BDBC] text-white rounded hover:bg-[#254E58] transition-colors"
              >
                <FaPaperPlane className="text-xs" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
