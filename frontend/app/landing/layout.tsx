// frontend/app/landing/layout.tsx
export default function LandingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>; // Ensures no extra layout like Sidebar or Header
  }
  
