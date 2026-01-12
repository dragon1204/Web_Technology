import "./index.css"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // <div className="app">
      // <main className="auth">{children}</main>
    // </div>
    <div className="auth">
      {children}
    </div>
  );
}
