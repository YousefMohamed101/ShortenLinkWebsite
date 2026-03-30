import {useContext} from 'react'
import './App.css'
import LoginPage from "./LoginPage/loginPage.jsx";
import UserPage from "./UserPage/UserPage.jsx";
import {AuthedContext} from "./AuthedContext.jsx";

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
