import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Transition } from "@headlessui/react";
import { Disclosure } from "@headlessui/react";

// Логотипы
import Logo1 from "../assets/images/ml.datamed.pro - logotype.svg";
import Logo2 from "../assets/images/ml.datamed.pro - logotype_shrink.svg";

// Иконки
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import { LifebuoyIcon } from "@heroicons/react/24/outline";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { ChartPieIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { ArrowSmallLeftIcon } from "@heroicons/react/24/outline";
import { ShareIcon } from "@heroicons/react/24/outline";
import { ListBulletIcon } from "@heroicons/react/24/outline";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

//Dark Mode
import Switcher from "../components/Switcher";

export default function Aside() {
  const [isShowing, setIsShowing] = useState(true);
  const [open, setOpen] = useState(true);

  return (
    <aside
      id="separator-sidebar"
      aria-label="Sidebar"
      className={`flex flex-col h-screen justify-between z-40 transition-transform -translate-x-full sm:translate-x-0 border-r border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-indigo-50 relative ${
        open ? " w-96" : "w-16"
      } duration-500`}
    >
      <div class="px-3 py-4 w-full">
        <a class="w-full my-4">
          {/*Логотип широкий*/}
          <img
            src={Logo1}
            className={`h-14 ${open ? "w-full" : "hidden"} duration-100`}
            alt="Sechenov University"
          />
          {/*Логотип без текста*/}
          <img
            src={Logo2}
            className={`h-14 ${open ? "hidden" : "w-full"} duration-100`}
            alt="Sechenov University"
          />
        </a>
        {/*Верхнее меню*/}
        <ul className="py-4 space-y-1 font-medium">
          <Link to="/">
            <li
              className={`flex items-center p-2 text-gray-900 rounded-lg text-sm dark:text-white dark:hover:bg-gray-700 group hover:bg-gray-100 ${
                !open && "hover:!bg-blue-100"
              }`}
            >
              <ChartPieIcon className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span
                className={`ml-3 duration-100 ${
                  !open && "opacity-0 translate-x-28 overflow-hidden"
                }`}
              >
                AutoML
              </span>
            </li>
          </Link>
          <Link to="/models">
            <li
              className={`flex items-center p-2 text-gray-900 rounded-lg text-sm dark:text-white dark:hover:bg-gray-700 group hover:bg-gray-100 ${
                !open && "hover:!bg-blue-100"
              }`}
            >
              <DocumentTextIcon className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span
                className={`ml-3 duration-100 ${
                  !open && "opacity-0 translate-x-28 overflow-hidden"
                }`}
              >
                Сохраненные модели
              </span>
            </li>
          </Link>
          <Link to="/help"></Link>
          <Disclosure>
            <>
              <Disclosure.Button className="flex w-full justify-between">
                <li
                  className={`flex items-center p-2 text-gray-900 rounded-lg text-sm dark:text-white dark:hover:bg-gray-700 group hover:bg-gray-100 ${
                    !open && "hover:!bg-blue-100"
                  }`}
                >
                  <ListBulletIcon className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                  <span
                    className={`ml-3 duration-100 ${
                      !open && "opacity-0 translate-x-28 overflow-hidden"
                    }`}
                  >
                    Примеры датасетов
                  </span>
                </li>
              </Disclosure.Button>
              <Disclosure.Panel className="text-gray-500">
                {/*Подраздел алгоритмы автообучения*/}
                <ul
                  className={`ml-6 duration-100 ${
                    !open && "hidden opacity-0 translate-x-28 overflow-hidden"
                  }`}
                >
                  <Link to="/doc2">
                    <li
                      className={`flex items-center p-1 text-gray-900 rounded-lg text-sm dark:text-white dark:hover:bg-gray-700 group hover:bg-gray-100 ${
                        !open && "hover:!bg-blue-100"
                      }`}
                    >
                      <span
                        className={`ml-3 duration-100 ${
                          !open &&
                          "hidden opacity-0 translate-x-28 overflow-hidden"
                        }`}
                      >
                        Прогнозироване рака легких
                      </span>
                    </li>
                  </Link>
                  <Link to="/doc3">
                    <li
                      className={`flex items-center p-1 text-gray-900 rounded-lg text-sm dark:text-white dark:hover:bg-gray-700 group hover:bg-gray-100 ${
                        !open && "hover:!bg-blue-100"
                      }`}
                    >
                      <span
                        className={`ml-3 duration-100 ${
                          !open &&
                          "hidden opacity-0 translate-x-28 overflow-hidden"
                        }`}
                      >
                        Биомаркер рака поджелудочной железы
                      </span>
                    </li>
                  </Link>
                  <Link to="/doc4">
                    <li
                      className={`flex items-center p-1 text-gray-900 rounded-lg text-sm dark:text-white dark:hover:bg-gray-700 group hover:bg-gray-100 ${
                        !open && "hover:!bg-blue-100"
                      }`}
                    >
                      <span
                        className={`ml-3 duration-100 ${
                          !open &&
                          "hidden opacity-0 translate-x-28 overflow-hidden"
                        }`}
                      >
                        Сердечная недостаточность
                      </span>
                    </li>
                  </Link>
                  <Link to="/doc1">
                    <li
                      className={`flex items-center p-1 text-gray-900 rounded-lg text-sm dark:text-white dark:hover:bg-gray-700 group hover:bg-gray-100 ${
                        !open && "hover:!bg-blue-100"
                      }`}
                    >
                      <span
                        className={`ml-3 duration-100 ${
                          !open &&
                          "hidden opacity-0 translate-x-28 overflow-hidden"
                        }`}
                      >
                        Прогнозирование камней в почках
                      </span>
                    </li>
                  </Link>
                </ul>
              </Disclosure.Panel>
            </>
          </Disclosure>
        </ul>
        {/*Информационная панель*/}
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
            id="dropdown-cta"
            className={`p-4 mt-6 rounded-lg bg-blue-100 dark:bg-blue-900 duration-100 ${
              !open && "opacity-0 translate-x-28 overflow-hidden"
            }`}
            role="alert"
          >
            <div class="flex items-center mb-2">
              <span class="text-orange-800 text-sm font-semibold mr-2 py-0,5 px-1 bg-orange-100 rounded dark:bg-orange-200 dark:text-orange-900">
                AutoML
              </span>
              <button
                type="button"
                class="ml-auto -mx-1.5 -my-1.5 bg-blue-50 inline-flex justify-center items-center w-6 h-6 text-blue-900 rounded-lg focus:ring-2 focus:ring-blue-400 p-1 hover:bg-blue-200 h-6 w-6 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800"
                data-dismiss-target="#dropdown-cta"
                aria-label="Close"
                onClick={() => setIsShowing((isShowing) => !isShowing)}
              >
                <span class="sr-only">Close</span>
                <svg
                  class="w-2.5 h-2.5"
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
            <p class="mb-3 text-sm text-blue-800 dark:text-blue-400">
              Самообучающаяся система аналитики биомедицинских данных. Позволяет
              строить предиктивные модели на основе сведений из датасетов.
            </p>
          </div>
        </Transition>
      </div>
      {/*Нижнее меню*/}
      <div class="w-full self-end">
        <ul class="px-3 py-4 space-y-1 font-medium">
          <li className="hidden">
            <Switcher />
          </li>
          <Link to="/doc1">
            <li
              className={`flex items-center p-2 text-gray-900 rounded-lg text-sm dark:text-white dark:hover:bg-gray-700 group hover:bg-gray-100 ${
                !open && "hover:!bg-blue-100"
              }`}
            >
              <BookOpenIcon className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span
                className={`ml-3 duration-100 ${
                  !open && "opacity-0 translate-x-28 overflow-hidden"
                }`}
              >
                Документация
              </span>
            </li>
          </Link>
          <Link to="/help">
            <li
              className={`flex items-center p-2 text-gray-900 rounded-lg text-sm dark:text-white dark:hover:bg-gray-700 group hover:bg-gray-100 ${
                !open && "hover:!bg-blue-100"
              }`}
            >
              <LifebuoyIcon className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span
                className={`ml-3 duration-100 ${
                  !open && "opacity-0 translate-x-28 overflow-hidden"
                }`}
              >
                Помощь
              </span>
            </li>
          </Link>
          <Link to="#">
            <li
              className={`flex items-center p-2 text-gray-900 rounded-lg text-sm dark:text-white dark:hover:bg-gray-700 group hover:bg-gray-100 ${
                !open && "hover:!bg-blue-100"
              }`}
            >
              <UserCircleIcon className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span
                className={`ml-3 duration-100 ${
                  !open && "opacity-0 translate-x-28 overflow-hidden"
                }`}
              >
                Аккаунт
              </span>
            </li>
          </Link>
        </ul>
        {/*Кнопка сужающая меню*/}
        <div
          onClick={() => setOpen(!open)}
          className={`flex justify-center border-t border-gray-200 items-center p-2 text-gray-900 dark:text-white dark:hover:bg-gray-700 group hover:bg-gray-100 ${
            !open && "hover:!bg-blue-100 rotate-180"
          }`}
        >
          <ArrowSmallLeftIcon className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
        </div>
      </div>
    </aside>
  );
}
