import { SignUp } from '../api/SignUp';

function Auth() {
  return (
    <div className='flex items-start'>
      <main className="overflow-y-auto relative w-full h-full dark:bg-gray-900">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            SECHENOV_DATAMED_ML
          </a>
          <div class="w-full bg-slate-50 rounded-lg drop-shadow-md dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
              <SignUp />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Auth;