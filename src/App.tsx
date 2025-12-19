import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import AuthPage from './pages/AuthPage'
import Homepage from './pages/Homepage'
import NotFound from './pages/NotFound'
import { Navbar } from './components/navbar'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import SearchPage from './pages/SearchPage'
import PrivateChatPage from './pages/PrivateChatPage'

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/auth' element={<AuthPage />} />
          <Route path='terms-of-service' element={<TermsOfService />} />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='/search' element={<SearchPage />} />
          <Route path='/private-chat/:recipientId' element={<PrivateChatPage />} />

          <Route path='*' element={<NotFound />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
