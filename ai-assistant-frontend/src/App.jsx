import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import { Toaster } from 'react-hot-toast';
import Dashboard from "./pages/Dashboard.jsx";
export const Serverurl = "http://localhost:5000";


export default function App() {
    return (
        <div>
            <Toaster
                position="top-center"
                reverseOrder={true}
                gutter={8}
                toastOptions={{
                    duration: 3000,
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* <Route path="/about" element={<About />}/> */}


            </Routes>
        </div>
    );
}