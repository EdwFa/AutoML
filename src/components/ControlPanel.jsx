import { Transition } from "@headlessui/react";
import { useState } from "react";

export default function ControlPanel(props) {
  const [isShowing, setIsShowing] = useState(true);

  return (
    <>
      <Transition
        show={isShowing}
        enter="transition-opacity duration-700"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-700"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          id="alert-1"
          class="p-4 mb-4 rounded-lg text-yellow-800 bg-yellow-50 dark:bg-gray-800 dark:text-blue-400"
          role="alert"
        >
          <div className="flex items-center justify-between mb-4">
            <div>Настройки моделей</div>
            <div>
              <button
                type="button"
                class="ml-auto -mx-1.5 -my-1.5 bg-yellow-50 text-yellow-500 rounded-lg focus:ring-2 focus:ring-yellow-400 p-1.5 hover:bg-yellow-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-yellow-300 dark:hover:bg-gray-700"
                data-dismiss-target="#alert-1"
                aria-label="Close"
                onClick={() => setIsShowing((isShowing) => !isShowing)}
              >
                <span class="sr-only">Закрыть</span>
                <svg
                  class="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </div>
          </div>
          {props.children}
        </div>
      </Transition>
    </>
  );
}
