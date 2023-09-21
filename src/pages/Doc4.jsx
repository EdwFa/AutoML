import React from "react";
import Aside from "../components/Sidebar";
import { Link } from "react-router-dom";

// Датасет
import Dataset4 from "../../src/assets/datasets/doc4.xlsx";

// Логотип
import Logo1 from "../assets/images/ml.datamed.pro - logotype.svg";

// Изображения
import Heart from "../assets/images/doc/doc1/heart.webp";

const Doc4 = () => {
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
                      Прогноз сердечной недостаточности
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
                    Прогноз сердечной недостаточности
                  </h1>

                  <p className=" mb-5">
                    Сердечно-сосудистые заболевания (ССЗ) являются 
                    <a className="font-semibold">
                      причиной смертности номер 1 в мире
                    </a>
                    , унося примерно 
                    <a className="font-semibold">
                      17,9 миллиона жизней каждый год
                    </a>
                    , что составляет 
                    <a className="font-semibold">31% всех смертей в мире</a>.
                  </p>
                  {/*  <img class="float-right h-56 my-2 ml-2" src={Heart} /> */}
                  <p className=" mb-5">
                    Сердечная недостаточность является распространенным
                    явлением, вызванным сердечно-сосудистыми заболеваниями, и
                    этот набор данных содержит 12 признаков, которые можно
                    использовать для прогнозирования смертности от сердечной
                    недостаточности.
                  </p>
                  <p className=" mb-5">
                    Большинство сердечно-сосудистых заболеваний можно
                    предотвратить, устраняя поведенческие факторы риска, такие
                    как употребление табака, нездоровое питание и ожирение,
                    отсутствие физической активности и вредное употребление
                    алкоголя, используя стратегии, охватывающие все население.
                  </p>
                  <p className=" mb-5">
                    Люди с сердечно-сосудистыми заболеваниями или люди с высоким
                    сердечно-сосудистым риском (из-за наличия одного или
                    нескольких факторов риска, таких как гипертония, диабет,
                    гиперлипидемия или уже установленное заболевание) нуждаются
                    в раннем выявлении и лечении, в чем модель машинного
                    обучения может оказать большую помощь.
                  </p>
                  <ul class="list-disc  mb-5">
                    <p className="mb-2">Атрибуты датасета включают в себя:</p>
                    <li className=" mb-2 ml-20">
                      Возраст: возраст пациента [лет]
                    </li>
                    <li className=" mb-2  ml-20">
                      Пол: пол пациента [М: мужской, Ж: женский]
                    </li>
                    <li className=" mb-2  ml-20">
                      ChestPainType: тип боли в груди [TA: типичная стенокардия,
                      ATA: атипичная стенокардия, NAP: неангинальная боль , ASY:
                      бессимптомное]
                    </li>
                    <li className=" mb-2  ml-20">
                      АД в состоянии покоя: кровяное давление в состоянии покоя
                      [мм рт. ст.]
                    </li>
                    <li className=" mb-2  ml-20">
                      Холестерин: сывороточный холестерин [мм]
                    </li>
                    <li className=" mb-2  ml-20">
                      FastingBS: уровень сахара в крови натощак [1: если
                      FastingBS > 120 мг/дл, 0: в противном случае]
                    </li>
                    <li className=" mb-2  ml-20">
                      ЭКГ покоя: результаты электрокардиограммы покоя
                      [Нормальный: нормальный, ST: наличие аномалий ST-T
                      (инверсия зубца T и/или подъем или депрессия ST > 0,05
                      мВ), ГЛЖ: вероятная или определенная гипертрофия левого
                      желудочка по критериям Эстеса]
                    </li>
                    <li className=" mb-2  ml-20">
                      MaxHR: достигнутая максимальная частота пульса [числовое
                      значение от 60 до 202]
                    </li>
                    <li className=" mb-2  ml-20">
                      Стенокардия при физической нагрузке: стенокардия,
                      вызванная физической нагрузкой [Д: Да, Н: Нет]
                    </li>
                    <li className=" mb-2  ml-20">
                      Oldpeak: oldpeak = ST [Числовое значение, измеренное при
                      депрессии]
                    </li>
                    <li className=" mb-2  ml-20">
                      ST_Slope: наклон пикового сегмента ST при нагрузке [Вверх:
                      вверх, Плоский: плоский, Вниз: вниз]
                    </li>
                    <li className=" mb-2  ml-20">
                      HeartDisease: выходной класс [1: заболевание сердца, 0:
                      нормальное]{" "}
                    </li>
                  </ul>

                  <div className="my-10 mb-24">
                    <a className="font-semibold"> Камни_в_почках.xlsx</a>
                    <a
                      className="bg-gray-400 hover:bg-gray-500 text-white text-sm py-1 px-2 rounded-lg ml-2"
                      href={Dataset4}
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
                  <span className="text-sm">5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Doc4;
