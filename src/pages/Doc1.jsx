import React from "react";
import Aside from "../components/Sidebar";
import { Link } from "react-router-dom";

import Dataset1 from "../assets/datasets/Прогнозирование_камней_в_почках_по_анализу_мочи.xlsx";

// Логотип
import Logo1 from "../assets/images/ml.datamed.pro - logotype.svg";

// Изображения
import Bud from "../assets/images/doc/doc1/bud.webp";

const Doc1 = () => {
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
                      Датасет для прогнозирования образования камней в почках на
                      основе анализа мочи
                    </a>
                  </div>
                </li>
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
                  <h1 className="text-2xl font-bold mb-10">
                    Датасет для прогнозирования образования камней в почках на
                    основе анализа мочи
                  </h1>
                  <img
                    class="float-right h-64 rounded-lg my-2 ml-2 grayscale"
                    src={Bud}
                  />
                  <p className="mb-5">
                    Этот набор данных можно использовать для прогнозирования
                    наличия камней в почках на основе анализа мочи.
                  </p>
                  <p className="mb-5">
                    79 образцов мочи были проанализированы с целью определить,
                    могут ли определенные физические характеристики мочи быть
                    связаны с образованием кристаллов оксалата кальция.
                  </p>
                  <ul class="list-decimal mb-5">
                    <p className="mb-2 font-semibold">
                      Шестью физическими характеристиками мочи являются:
                    </p>

                    <li className="mb-2 ml-10">
                      Удельный вес, плотность мочи по отношению к воде;
                    </li>
                    <li className="mb-2 ml-10">
                      PH, отрицательный логарифм иона водорода;
                    </li>
                    <li className="mb-2 ml-10">
                      Осмолярность (мосм), единица измерения, используемая в
                      биологии и медицине, но не в физической химии.
                      Осмолярность пропорциональна концентрации молекул в
                      растворе;
                    </li>
                    <li className="mb-2 ml-10">
                      Проводимость (мМхо, миллиМхо). Один Мхо равен одному
                      обратному Ому.{" "}
                      <a className="bg-gray-300">
                        Проводимость пропорциональна концентрации заряженных
                        ионов в растворе
                      </a>
                      ;
                    </li>
                    <li className="mb-2 ml-10">
                      концентрация мочевины в миллимоль на литр;
                    </li>
                    <li className="mb-2 ml-10">
                      кальций концентрация (CALC) в миллимоль/литр.
                    </li>
                  </ul>
                  <p className="font-semibold">
                    Данные получены из «Физических характеристик мочи с
                    кристаллами и без них», главы из серии Springer Series в
                    статистике:{" "}
                  </p>
                  <a
                    className="mb-5 text-blue-700 underline underline-offset-4 hover:text-blue-500"
                    href="https://link.springer.com/chapter/10.1007/978-1-4612-5098-2_45"
                  >
                    https://link.springer.com/chapter/10.1007/978-1-4612-5098-2_45
                  </a>
                  <div className="my-10 mb-24">
                    <a className="font-semibold"> Камни_в_почках.csv</a>
                    <a
                      className="bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded-lg ml-2"
                      href={Dataset1}
                      target="_blank"
                    >
                      Скачать датасет
                    </a>
                  </div>
                </div>
                <div className="mb-2 border-b-4 border-gray-800"></div>
                <div className="flex justify-between px-5 ">
                  <span className="text-sm">
                    Датасет для прогнозирования образования камней в почках на
                    основе анализа мочи.pdf
                  </span>
                  <span className="text-sm">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Doc1;
