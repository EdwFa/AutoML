import React from "react";
import Aside from "../components/Sidebar";
import { Link } from "react-router-dom";

// Логотип
import Logo1 from "../assets/images/ml.datamed.pro - logotype.svg";

// Изображения
import Bud from "../assets/images/doc/doc1/bud.webp";

const Help = () => {
  return (
    <>
      <div className="flex h-screen overflow">
        <Aside />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <header className="bg-white px-4 lg:px-6 py-1 dark:bg-gray-800 border-b border-gray-200">
            <nav class="flex" aria-label="Breadcrumb">
              <ol class="inline-flex items-center space-x-1 md:space-x-3">
                <li class="inline-flex items-center">
                  <Link
                    to="/"
                    className="p-2 rounded-lg inline-flex items-center text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                  >
                    <svg
                      class="w-3 h-3 mr-2.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                    </svg>
                    Главная
                  </Link>
                </li>
                <Link to="/help">
                  <li>
                    <div class="flex items-center">
                      <svg
                        class="w-3 h-3 text-gray-400 mx-1"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 6 10"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m1 9 4-4-4-4"
                        />
                      </svg>
                      <a
                        href="#"
                        class="p-2 rounded-lg ml-1 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white"
                      >
                        Датасеты
                      </a>
                    </div>
                  </li>
                </Link>
              </ol>
            </nav>
          </header>
          <div className="flex flex-col bg-white dark:bg-gray-800">
            <div className="m-4">
              <div className="bg-white shadow-lg py-10 px-10 border border-gray-200">
                <span className="text-bold px-5 font-semibold">
                  A-Я Краткое руководство по эксплуатации
                </span>
                <div className="mt-2 border-b-4 border-gray-800"></div>
                <div className="mx-20">
                  <div className="flex justify-center my-24">
                    <img
                      src={Logo1}
                      className="h-32 grayscale"
                      alt="Sechenov University"
                    />
                  </div>
                  <h1 className="text-2xl font-bold mb-10">Наборы датасетов</h1>
                  <p className="mb-5">Для тестирования возможностей системы</p>
                  <p className="mb-5">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                    Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
                    natoque penatibus et magnis dis parturient montes, nascetur
                    ridiculus mus. Donec quam felis, ultricies nec, pellentesque
                    eu, pretium quis, sem. Nulla consequat massa quis enim.
                    Donec pede justo, fringilla vel, aliquet nec, vulputate
                    eget, arcu. In enim justo, rhoncus ut, imperdiet a,
                    venenatis vitae, justo. Nullam dictum felis eu pede mollis
                    pretium. Integer tincidunt. Cras dapibus. Vivamus elementum
                    semper nisi. Aenean vulputate eleifend tellus. Aenean leo
                    ligula, porttitor eu, consequat vitae, eleifend ac, enim.
                    Aliquam lorem ante, dapibus in, viverra quis, feugiat a,
                    tellus. Phasellus viverra nulla ut metus varius laoreet.
                    Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel
                    augue. Curabitur ullamcorper ultricies nisi. Nam eget dui.
                    Etiam rhoncus. Maecenas tempus, tellus eget condimentum
                    rhoncus, sem quam semper libero, sit amet adipiscing sem
                    neque sed ipsum. Nam quam nunc, blandit vel, luctus
                    pulvinar, hendrerit id, lorem. Maecenas nec odio et ante
                    tincidunt tempus. Donec vitae sapien ut libero venenatis
                    faucibus. Nullam quis ante. Etiam sit amet orci eget eros
                    faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet
                    nibh. Donec sodales sagittis magna. Sed consequat, leo eget
                    bibendum sodales, augue velit cursus nunc, quis gravida
                    magna mi a libero. Fusce vulputate eleifend sapien.
                    Vestibulum purus quam, scelerisque ut, mollis sed, nonummy
                    id, metus.
                  </p>
                  <ul class="list-decimal mb-24">
                    <p className="mb-2 font-semibold">Датасеты:</p>
                    <Link to="/doc1">
                      <li className="mb-2 ml-10 text-blue-700">
                        Прогнозирование камней в почках по анализу мочи;
                      </li>
                    </Link>
                    <Link to="/doc2">
                      <li className="mb-2 ml-10 text-blue-700">
                        Прогноз развития рака легких
                      </li>
                    </Link>
                  </ul>
                </div>
                <div className="mb-2 border-b-4 border-gray-800"></div>
                <div className="flex justify-between px-5 ">
                  <span className="text-sm">
                    Краткое руководство по эксплуатации.pdf
                  </span>
                  <span className="text-sm"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Help;
