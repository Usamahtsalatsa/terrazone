import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#091321]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="w-full flex-1 overflow-auto p-4 sm:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
