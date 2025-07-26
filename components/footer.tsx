export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <p className="text-center text-gray-500 text-sm">
            This example application demonstrates Usagey integration with Next.js App Router
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <a 
              href="https://www.npmjs.com/package/usagey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary text-sm font-medium"
            >
              NPM Package
            </a>
            <a 
              href="https://github.com/8thwanda/usagey-nextjs-approuter-example" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary text-sm font-medium"
            >
              GitHub Repository
            </a>
            <a 
              href="https://usagey.com/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary text-sm font-medium"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}