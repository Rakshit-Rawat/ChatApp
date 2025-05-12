import React from 'react'

const EmptyConvo = ({selectedChat}) => {
  return (
      <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 bg-white/50 p-6 rounded-xl max-w-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No Messages Yet
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Start a conversation with {selectedChat.name}. Be the
                      first to send a message!
                    </p>
                  </div>
                </div>
  )
}

export default EmptyConvo