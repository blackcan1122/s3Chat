import logo from '../logo.svg';
import { useAuth } from "../contexts/AuthContext";
import '../style/App.css';
import ChatApp from './ChatApp';
import LoginPage from './login_page'
function App() 
{
  const { user } = useAuth();

  return(
    <>
          {user ? <ChatApp /> : <LoginPage />}
    </>
  )
}

export default App;
