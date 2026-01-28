import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Listing from './pages/Listing'
import Admin from './pages/Admin'
import './App.css'

function App() {
    return (
        <Router>
            <div className="app">
                <Header />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Listing />} />
                        <Route path="/admin" element={<Admin />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    )
}

export default App

