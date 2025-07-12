import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            The 7th Dimension
          </h2>
          <p className="text-gray-600">
            ログインしてコンテンツをお楽しみください
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn 
            routing="hash"
            signUpUrl={null}
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-blue-600 hover:bg-blue-700 text-white",
                card: "shadow-lg",
                footerActionLink: { display: "none" },
                footerAction: { display: "none" },
                footerActionText: { display: "none" },
                footer: { display: "none" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}