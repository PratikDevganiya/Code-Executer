import { useState, useEffect } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaJs, FaPython, FaJava, FaHtml5, FaCss3, FaPlus, FaEllipsisV, FaTimes, FaBars } from 'react-icons/fa';
import { BiCodeCurly } from 'react-icons/bi';
import fileService from '../services/fileService';
import { toast } from 'react-toastify';

// File icon mapper based on file extension
const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'js':
    case 'jsx':
      return <FaJs className="text-yellow-400" />;
    case 'py':
      return <FaPython className="text-blue-500" />;
    case 'java':
      return <FaJava className="text-red-500" />;
    case 'html':
      return <FaHtml5 className="text-orange-500" />;
    case 'css':
      return <FaCss3 className="text-blue-400" />;
    case 'json':
      return <BiCodeCurly className="text-gray-400" />;
    default:
      return <FaFile className="text-gray-400" />;
  }
};

// File or folder item component
const FileTreeItem = ({ item, level = 0, onSelectFile, activeFile, onContextMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = item.type === 'folder';
  const isActive = activeFile && activeFile._id === item._id;
  
  const handleItemClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(item);
    }
  };
  
  const handleContextMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, item);
  };
  
  return (
    <div>
      <div 
        className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-[#88BDBC]/20 ${isActive ? 'bg-[#88BDBC]/30 text-[#254E58] font-medium' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleItemClick}
        onContextMenu={handleContextMenuClick}
      >
        <div className="mr-2">
          {isFolder ? (
            isOpen ? <FaFolderOpen className="text-[#88BDBC]" /> : <FaFolder className="text-[#88BDBC]" />
          ) : (
            getFileIcon(item.name)
          )}
        </div>
        <div className="flex-grow truncate">{item.name}</div>
        <div className="opacity-0 hover:opacity-100 cursor-pointer" onClick={(e) => { e.stopPropagation(); onContextMenu(e, item); }}>
          <FaEllipsisV className="text-xs text-gray-500" />
        </div>
      </div>
      
      {isFolder && isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeItem 
              key={child._id} 
              item={child} 
              level={level + 1}
              onSelectFile={onSelectFile}
              activeFile={activeFile}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = ({ onFileSelect, isVisible = true, onToggleVisibility }) => {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuItem, setContextMenuItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewFileForm, setShowNewFileForm] = useState(false);
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  
  // Load files from backend
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        const fileTree = await fileService.getFileTree();
        setFiles(fileTree);
        setError(null);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load files. Please try again.');
        toast.error('Failed to load files');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFiles();
  }, []);
  
  const refreshFiles = async () => {
    try {
      setIsLoading(true);
      const fileTree = await fileService.getFileTree();
      setFiles(fileTree);
      setError(null);
    } catch (err) {
      console.error('Error refreshing files:', err);
      setError('Failed to refresh files');
      toast.error('Failed to refresh files');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileSelect = async (file) => {
    try {
      // If it's already the active file, no need to reload
      if (activeFile && activeFile._id === file._id) return;
      
      // For files, fetch the content first
      if (file.type === 'file') {
        // Get full file details including content
        const fileDetails = await fileService.getFileById(file._id);
        setActiveFile(fileDetails);
        
        if (onFileSelect) {
          onFileSelect(fileDetails);
        }
      }
    } catch (err) {
      console.error('Error loading file:', err);
      toast.error('Failed to load file content');
    }
  };
  
  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuItem(item);
    setShowContextMenu(true);
  };
  
  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  // Handle creating a new file
  const handleNewFile = async () => {
    setShowNewFileForm(true);
    setShowContextMenu(false);
  };
  
  const submitNewFile = async () => {
    if (!newItemName) {
      toast.error('Please enter a file name');
      return;
    }

    // Validate file name format
    const validFileNameRegex = /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/;
    if (!validFileNameRegex.test(newItemName)) {
      toast.error('Invalid file name. Use format: filename.extension (e.g., hello.js)');
      return;
    }

    setIsLoading(true);

    try {
      // Create new file with the parent ID from context menu if present
      const parentId = contextMenuItem && contextMenuItem.type === 'folder' 
        ? contextMenuItem._id 
        : null;
      
      const response = await fileService.createFile({
        name: newItemName,
        type: 'file',
        content: '',
        parentId
      });

      // If we got a success response
      if (response.success) {
        // Reset form state
        setNewItemName('');
        setShowNewFileForm(false);
        
        // Refresh the file list
        await refreshFiles();
        
        // Show success message
        toast.success(`File ${newItemName} created successfully`);
      }
    } catch (err) {
      console.error('Error creating file:', err);
      
      // Attempt to verify file creation one more time
      try {
        const fileTree = await fileService.getFileTree();
        
        // Recursive function to find file in tree
        const findFile = (files, fileName, parentId) => {
          for (const file of files) {
            if (file.name === fileName && file.parentId === parentId) {
              return true;
            }
            if (file.children && file.children.length > 0) {
              if (findFile(file.children, fileName, parentId)) {
                return true;
              }
            }
          }
          return false;
        };
        
        const parentId = contextMenuItem?.type === 'folder' ? contextMenuItem._id : null;
        const fileExists = findFile(fileTree, newItemName, parentId);
        
        if (fileExists) {
          // File exists, update UI
          setNewItemName('');
          setShowNewFileForm(false);
          setFiles(fileTree);
          toast.success(`File ${newItemName} created successfully`);
        } else {
          // Real error occurred
          const errorMessage = err.response?.data?.message || 
                             err.response?.data?.error || 
                             err.message || 
                             'Failed to create file';
          toast.error(errorMessage);
        }
      } catch (verifyError) {
        console.error('Error verifying file creation:', verifyError);
        toast.error('Failed to verify file creation');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle creating a new folder
  const handleNewFolder = () => {
    setShowNewFolderForm(true);
    setShowContextMenu(false);
  };
  
  const submitNewFolder = async () => {
    if (!newItemName) {
      toast.error('Please enter a folder name');
      return;
    }
    
    try {
      // Create new folder with the parent ID from context menu if present
      const parentId = contextMenuItem && contextMenuItem.type === 'folder' 
        ? contextMenuItem._id 
        : null;
      
      await fileService.createFile({
        name: newItemName,
        type: 'folder',
        parentId
      });
      
      toast.success(`Folder ${newItemName} created successfully`);
      setNewItemName('');
      setShowNewFolderForm(false);
      refreshFiles();
    } catch (err) {
      console.error('Error creating folder:', err);
      toast.error(err.response?.data?.message || 'Failed to create folder');
    }
  };
  
  // Handle deleting a file or folder
  const handleDelete = async () => {
    if (!contextMenuItem) return;
    
    try {
      setIsLoading(true);
      
      // Delete the file from the database
      await fileService.deleteFile(contextMenuItem._id);
      
      // If the deleted file was active, clear it
      if (activeFile && activeFile._id === contextMenuItem._id) {
        setActiveFile(null);
        if (onFileSelect) {
          onFileSelect(null);
        }
      }
      
      // Refresh the file list
      await refreshFiles();
      
      // Show success message
      toast.success(`${contextMenuItem.type === 'folder' ? 'Folder' : 'File'} ${contextMenuItem.name} deleted successfully`);
      
      // Close context menu
      setShowContextMenu(false);
      setContextMenuItem(null);
      
    } catch (err) {
      console.error('Error deleting file:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to delete file';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isVisible) {
    return (
      <button
        className="absolute left-4 top-4 z-10 p-2 rounded-full bg-white shadow-md text-[#254E58] hover:bg-[#88BDBC]/20 transition-colors"
        onClick={onToggleVisibility}
        title="Show Explorer"
      >
        <FaBars size={16} />
      </button>
    );
  }
  
  return (
    <div className="h-full bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-[#88BDBC]/30">
      {/* Header */}
      <div className="p-3 border-b border-[#88BDBC]/20 flex justify-between items-center bg-[#F5F5F5]">
        <h3 className="text-base font-medium text-[#254E58]">Files</h3>
        <div className="flex items-center gap-2">
          <button 
            className="p-1.5 rounded hover:bg-[#88BDBC]/20 text-[#254E58] transition-colors"
            onClick={handleNewFile}
            title="New File"
          >
            <FaPlus size={14} />
          </button>
          <button
            className="p-1.5 rounded hover:bg-[#88BDBC]/20 text-[#254E58] transition-colors"
            onClick={() => {
              if (onToggleVisibility) {
                onToggleVisibility();
              }
            }}
            title="Close Explorer"
          >
            <FaTimes size={14} />
          </button>
        </div>
      </div>
      
      {/* New File Form */}
      {showNewFileForm && (
        <div className="p-3 border-b border-[#88BDBC]/20 bg-[#F5F5F5]/80">
          <div className="text-sm font-medium mb-2 text-[#254E58]">New File</div>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="filename.ext"
              className="w-full text-sm px-3 py-1.5 border border-[#88BDBC]/30 rounded focus:outline-none focus:border-[#88BDBC] bg-white"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={submitNewFile}
                className="flex-1 px-3 py-1.5 bg-[#254E58] text-white text-sm rounded hover:bg-[#112D32] transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => { setShowNewFileForm(false); setNewItemName(''); }}
                className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* New Folder Form */}
      {showNewFolderForm && (
        <div className="p-3 border-b border-[#88BDBC]/20 bg-[#F5F5F5]/80">
          <div className="text-xs font-medium mb-1 text-[#254E58]">New Folder</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="folder name"
              className="flex-grow text-sm px-2 py-1 border border-[#88BDBC]/30 rounded focus:outline-none focus:border-[#88BDBC]"
              autoFocus
            />
            <button
              onClick={submitNewFolder}
              className="px-2 py-1 bg-[#254E58] text-white text-xs rounded hover:bg-[#112D32]"
            >
              Create
            </button>
            <button
              onClick={() => { setShowNewFolderForm(false); setNewItemName(''); }}
              className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading files...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : files.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="mb-2">No files yet</p>
            <button 
              className="px-3 py-1.5 bg-[#254E58] text-white text-sm rounded hover:bg-[#112D32] transition-colors"
              onClick={handleNewFile}
            >
              Create a file
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((item) => (
              <FileTreeItem 
                key={item._id} 
                item={item} 
                onSelectFile={handleFileSelect}
                activeFile={activeFile}
                onContextMenu={handleContextMenu}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Context Menu */}
      {showContextMenu && (
        <div 
          className="fixed bg-white shadow-lg rounded-md overflow-hidden z-50 border border-[#88BDBC]/20 w-48"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <ul className="py-1">
            <li 
              className="px-4 py-2 hover:bg-[#88BDBC]/10 cursor-pointer text-sm"
              onClick={handleNewFile}
            >
              New File
            </li>
            <li 
              className="px-4 py-2 hover:bg-[#88BDBC]/10 cursor-pointer text-sm"
              onClick={handleNewFolder}
            >
              New Folder
            </li>
            {contextMenuItem && (
              <>
                <li className="border-t border-[#88BDBC]/10"></li>
                <li 
                  className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer text-sm"
                  onClick={handleDelete}
                >
                  Delete {contextMenuItem.name}
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileExplorer; 