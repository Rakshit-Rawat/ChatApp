const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
        <div className="relative z-10 w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-blue-500 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
      <div className="text-lg font-semibold text-gray-700">{message}</div>
      <div className="text-sm text-gray-500 mt-2">Fetching your conversations</div>
    </div>
  </div>
);

export default LoadingSpinner;
