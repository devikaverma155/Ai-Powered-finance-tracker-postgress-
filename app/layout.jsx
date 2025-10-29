import "./globals.css";
import { AuthProvider } from '../lib/auth-context';

export const metadata = {
  title: "AI Finance Planner",
  description: "AI-powered personal finance planner"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider>
          <main className="max-w-4xl mx-auto p-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
