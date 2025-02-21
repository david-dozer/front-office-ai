// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Immediately redirect to the dashboard
  redirect('/landing');
  return null;
}
