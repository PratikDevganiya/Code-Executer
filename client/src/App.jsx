import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import CodeEditor from './pages/CodeEditor';
import Login from './pages/Login';
import Register from './pages/Register';
import LanguageAdmin from './pages/LanguageAdmin';
import SubmissionDetail from './pages/SubmissionDetail';
import SharedCodeView from './pages/SharedCodeView';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user || !user.isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#88BDBC]">
        <Navbar />
        <main className="bg-[#88BDBC]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/editor" 
              element={
                <ProtectedRoute>
                  <CodeEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/languages" 
              element={
                <AdminRoute>
                  <LanguageAdmin />
                </AdminRoute>
              } 
            />
            <Route path="/submissions/:id" element={
              <ProtectedRoute>
                <SubmissionDetail />
              </ProtectedRoute>
            } />
            <Route path="/collaborate/:roomId" element={
              <ProtectedRoute>
                <CodeEditor />
              </ProtectedRoute>
            } />
            {/* Public route for shared code */}
            <Route path="/share/:shareId" element={<SharedCodeView />} />
          </Routes>
        </main>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App; 