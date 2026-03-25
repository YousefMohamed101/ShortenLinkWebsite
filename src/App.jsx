import {useContext} from 'react'
import './App.css'
import {AuthedContext} from "./AuthenticatorGlobal.jsx";
import LoginPage from "./loginPage.jsx";
import UserPage from "./UserPage.jsx";

function App() {

  const{loggedIn} = useContext(AuthedContext);

  return (
    <>
      {!loggedIn &&(<LoginPage />)}
      {loggedIn &&(<UserPage />)}

    </>
  )
}

export default App
