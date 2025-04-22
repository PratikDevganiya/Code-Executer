import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaUserCircle, FaPaperPlane } from 'react-icons/fa';
import Editor from '@monaco-editor/react';

const CollaborativeEditor = ({ roomId, initialCode, language }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [code, setCode] = useState(initialCode || '');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  useEffect(() => {
    // Use environment variable for socket URL
    const socketUrl = import.meta.env.VITE_SOCKET_URL || '';
    console.log('Connecting to socket URL:', socketUrl);
    
    const newSocket = io(socketUrl, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('code-update', ({ code: newCode, userId }) => {
      if (userId !== newSocket.id) {
        setCode(newCode);
      }
    });

    newSocket.on('cursor-update', ({ position, userId, username }) => {
      if (userId !== newSocket.id) {
        setCursors(prev => ({
          ...prev,
          [userId]: { position, username }
        }));
      }
    });

    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user-joined', ({ userId, timestamp }) => {
      setActiveUsers(prev => [...prev, { userId, timestamp }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId]);

  const handleEditorChange = (value) => {
    setCode(value);
    if (socket) {
      socket.emit('code-change', {
        roomId,
        code: value
      });
    }
  };

  const handleCursorMove = (event) => {
    if (socket) {
      socket.emit('cursor-move', {
        roomId,
        position: event.position,
        username: user.username
      });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('chat-message', {
        roomId,
        message: newMessage,
        username: user.username
      });
      setNewMessage('');
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition(handleCursorMove);
  };

  useEffect(() => {
    if (editorRef.current) {
      // Update cursor decorations
      const newDecorations = Object.entries(cursors).map(([userId, { position, username }]) => ({
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column + 1
        },
        options: {
          className: 'cursor-other-user',
          hoverMessage: { value: username },
          beforeContentClassName: 'cursor-other-user-before'
        }
      }));

      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        newDecorations
      );
    }
  }, [cursors]);

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center gap-2">
            <FaUsers className="text-[#88BDBC]" />
            <span className="text-[#254E58] font-medium">
              {activeUsers.length + 1} users online
            </span>
          </div>
        </div>
        
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyond: false,
              automaticLayout: true
            }}
          />
        </div>
      </div>

      <div className="w-80 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-[#254E58] font-medium">Chat</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className="flex items-start gap-2">
              <FaUserCircle className="text-[#88BDBC] text-xl mt-1" />
              <div>
                <div className="text-sm font-medium text-[#254E58]">{msg.username}</div>
                <div className="text-sm text-[#112D32]">{msg.message}</div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#88BDBC]"
            />
            <button
              type="submit"
              className="p-2 bg-[#88BDBC] text-white rounded-lg hover:bg-[#254E58] transition-colors"
            >
              <FaPaperPlane />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollaborativeEditor; 