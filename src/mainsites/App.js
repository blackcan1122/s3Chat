import { useBackend } from '../contexts/BackendContext';
import '../style/App.css';
import ChatApp from './ChatApp';
import Impressum from './impressum';
import LoginPage from './login_page';
import Footer from '../components/footer';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
function App() 
{
  const {connected} =useBackend();

  return (
    <>
    <Router>
      <Routes>
        <Route path="/login" element={
          connected ? <Navigate to="/chat" /> : <LoginPage />
        } />
        <Route
          path="/chat"
          element={connected ? <ChatApp /> : <Navigate to="/login" />}
        />
        {/* Redirect root to /chat or /login based on connection */}
        <Route
          path="/"
          element={
            connected ? <Navigate to="/chat" /> : <Navigate to="/login" />
          }
        />
        <Route
          path='/impressum'
          element={<Impressum />}
          />
      </Routes>
    </Router>
    <Footer />
    </>
  );
}

export default App;
