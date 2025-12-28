import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import { ToastContainer } from 'react-toastify';
import Dashboard from "./pages/Dashboard.jsx";
export const Serverurl = "http://localhost:5000";


export default function App() {
    return (
        <div>
            <ToastContainer />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* <Route path="/about" element={<About />}/> */}


            </Routes>
            <ToastContainer />
        </div>
    );
}