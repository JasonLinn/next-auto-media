import LoginButton from "@/components/auth/LoginButton";
import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Next Auto Media
          </h1>
          <LoginButton />
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {session ? (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-gray-900">
                歡迎回來，{session.user?.name}
              </h2>
              <p className="mt-2 text-gray-600">
                您已成功登入。您的電子郵件是：{session.user?.email}
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-gray-900">
                歡迎來到 Next Auto Media
              </h2>
              <p className="mt-2 text-gray-600">
                請登入以訪問您的儀表板和管理您的媒體內容。
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 