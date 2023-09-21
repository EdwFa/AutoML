import React from "react";
import Aside from "../components/Sidebar";
import { Link } from "react-router-dom";

// Датасет
import Dataset3 from "../../src/assets/datasets/doc3.xlsx";

// Логотип
import Logo1 from "../assets/images/ml.datamed.pro - logotype.svg";

// Изображения
import Pancreas from "../assets/images/doc/doc1/pancreas.webp";
import Pancreas2 from "../assets/images/doc/doc1/pancreas2.webp";

const Doc3 = () => {
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
                    className="p-2 rounded-lg inline-flex items-center text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                    <svg
                      class="w-3 h-3 mr-2.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20">
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
                        viewBox="0 0 6 10">
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
                        class="p-2 rounded-lg ml-1 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white">
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
                      viewBox="0 0 6 10">
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
                      class="p-2 rounded-lg ml-1 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white">
                      Мочевые биомаркеры рака поджелудочной железы
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
                  Инструкция по работе с датасетами в системе «Sechenov_AutoML»
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
                    Мочевые биомаркеры рака поджелудочной железы
                  </h1>

                  <p className=" mb-5">
                    Рак поджелудочной железы – чрезвычайно смертельный тип
                    рака. После постановки диагноза пятилетняя выживаемость
                    составляет менее 10%. Однако если рак поджелудочной железы
                    обнаружить на ранней стадии, шансы на выживание намного
                    выше.
                  </p>
                  {/* <img class="float-left h-56 my-2 mr-2" src={Pancreas} /> */}
                  <p className=" mb-5">
                    К сожалению, во многих случаях рака поджелудочной железы
                    симптомы не проявляются до тех пор, пока рак не
                    распространится по всему организму. Диагностический тест для
                    выявления людей с раком поджелудочной железы может оказаться
                    чрезвычайно полезным.
                  </p>
                  {/*  <img class="float-right h-56 my-2 ml-2" src={Pancreas2} /> */}
                  <p className=" mb-5">
                    В{" "}
                    <a
                      className="underline underline-offset-3 hover:text-zinc-500"
                      href="https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1003489">
                      статье
                    </a>{" "}
                    Сильваны Дебернарди и ее коллег многонациональная группа
                    исследователей стремилась разработать точный диагностический
                    тест для наиболее распространенного типа рака поджелудочной
                    железы, называемого аденокарциномой протоков поджелудочной
                    железы или PDAC. Они собрали серию биомаркеров из мочи трех
                    групп пациентов:
                  </p>
                  <ul class="list-disc  mb-5">
                    <li className=" mb-2 ml-20">Здоровые пациенты;</li>
                    <li className=" mb-2  ml-20">
                      Пациенты с нераковыми заболеваниями поджелудочной железы,
                      такими как хронический панкреатит;  
                    </li>
                    <li className=" mb-2  ml-20">
                      Пациенты с аденокарциномой протоков поджелудочной железы.
                    </li>
                  </ul>
                  <p className=" mb-5">
                    Когда это было возможно, эти пациенты были сопоставимы по
                    возрасту и полу. Целью было разработать точный способ
                    выявления пациентов с раком поджелудочной железы.
                  </p>
                  <h2 className="mb-5 mt-10 font-semibold">Описание данных</h2>

                  <p className=" mb-5">
                    Ключевыми особенностями являются четыре биомаркера мочи:
                    креатинин, LYVE1, REG1B и TFF1.
                  </p>
                  <ul class="list-disc  mb-5">
                    <li className=" mb-2 ml-20">
                      <a className="font-semibold">Креатинин</a> — это белок,
                      который часто используется в качестве индикатора функции
                      почек.
                    </li>
                    <li className=" mb-2 ml-20">
                      <a className="font-semibold">YVLE1</a> представляет собой
                      гиалуронановый рецептор 1 эндотелия лимфатических сосудов,
                      белок, который может играть роль в метастазировании
                      опухоли.  
                    </li>
                    <li className=" mb-2  ml-20">
                      <a className="font-semibold">REG1B</a> — белок, который
                      может быть связан с регенерацией поджелудочной железы.
                    </li>
                    <li className=" mb-2  ml-20">
                      <a className="font-semibold">TFF1</a> представляет собой
                      фактор трилистника 1, который может быть связан с
                      регенерацией и восстановлением мочевыводящих путей.
                    </li>
                  </ul>
                  <p className=" mb-5">
                    <a className="font-semibold">Возраст</a> и 
                    <a className="font-semibold">пол</a> , включенные в набор
                    данных, также могут играть роль в том, кто заболевает раком
                    поджелудочной железы. Набор данных также включает в себя
                    несколько других биомаркеров, но они не были измерены у всех
                    пациентов (они были собраны частично для измерения того, как
                    различные биомаркеры крови сравниваются с биомаркерами
                    мочи).
                  </p>
                  <h2 className="mb-5 mt-10 font-semibold">
                    Задача прогнозирования
                  </h2>
                  <p className=" mb-5">
                    Целью этого набора данных является прогнозирование поля{" "}
                    <a className="font-semibold">diagnosis</a>, а точнее,
                    дифференциация между 3 (рак поджелудочной железы) и 2
                    (нераковым состоянием поджелудочной железы) и 1 (здоровым). 
                  </p>
                  <div className="my-10 mb-24">
                    <a className="font-semibold">
                      {" "}
                      Биомаркеры_рака_поджелудочной_железы.xlsx
                    </a>
                    <a
                      className="bg-gray-400 hover:bg-gray-500 text-white text-sm py-1 px-2 rounded-lg ml-2"
                      href={Dataset3}
                      target="_blank">
                      Скачать датасет
                    </a>
                  </div>
                </div>
                <div className="mb-2 border-b-4 border-gray-800"></div>
                <div className="flex justify-between px-5 ">
                  <span className="text-sm">
                    Прогнозирование образования камней в почках на основе
                    анализа мочи
                  </span>
                  <span className="text-sm">4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Doc3;
