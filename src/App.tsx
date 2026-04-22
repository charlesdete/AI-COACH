import { BrowserRouter as Router, Routes, Route } from "react-router";
import Login from "./features/auth/pages/Login"
import SignUp from "./features/auth/pages/Signup";


export default function App(){
    return(
        <Router>
            <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<SignUp/>}/>

            </Routes>
    </Router>
    )

}