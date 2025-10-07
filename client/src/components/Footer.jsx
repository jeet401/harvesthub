import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">FB</span>
              </div>
              <span className="font-bold text-xl text-green-400">FarmByte</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 transition-colors duration-300">Connecting buyers with farmers for fresh, local produce.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Quick Links</h3>
            <div className="grid gap-2 mt-3">
              <Link to="/" className="text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors duration-200">Home</Link>
              <a href="#how-it-works" className="text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors duration-200">How it works</a>
              <Link to="/auth/login" className="text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors duration-200">Sign in</Link>
              <Link to="/auth/sign-up" className="text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors duration-200">Sign up</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Contact</h3>
            <div className="text-gray-400 dark:text-gray-500 mt-3 transition-colors duration-300">
              <p>support@farmbyte.com</p>
              <p>+91 12345 67890</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Follow us</h3>
            <p className="text-gray-400 dark:text-gray-500 mt-3 transition-colors duration-300">Coming soon...</p>
          </div>
        </div>
        <div className="border-t border-gray-800 dark:border-gray-700 mt-12 pt-6 text-center text-gray-400 dark:text-gray-500 transition-colors duration-300">
          <p>© {new Date().getFullYear()} FarmByte. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


