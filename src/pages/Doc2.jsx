import React from "react";
import Aside from "../components/Sidebar";
import { Link } from "react-router-dom";

// Датасет
import Dataset2 from "../../src/assets/datasets/doc2.xlsx";

// Логотип
import Logo1 from "../assets/images/ml.datamed.pro - logotype.svg";

// Изображения
import Lungs from "../assets/images/doc/doc1/lungs.webp";

const Doc2 = () => {
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
                      Прогнозирование развития рака легких
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
                    Прогнозирование развития рака легких
                  </h1>

                  {/*  <img
                    class="float-right h-56 my-2 ml-2 rounded-lg grayscale"
                    src={Lungs}
  /> */}
                  <p className=" mb-5">
                    Этот набор данных содержит информацию о пациентах с раком
                    легких, включая их возраст, пол, воздействие загрязнения
                    воздуха, употребление алкоголя, аллергию на пыль,
                    профессиональные вредности, генетический риск, хронические
                    заболевания легких, сбалансированное питание, ожирение,
                    курение, пассивный курильщик, боль в груди, кашель. крови,
                    утомляемость, потеря веса, одышка, хрипы, затруднения при
                    глотании, скручивание ногтей и храп.
                  </p>
                  <p className=" mb-5">
                    Рак легких является основной причиной смертности от рака во
                    всем мире: в 2018 году на его долю пришлось 1,59 миллиона
                    смертей. Большинство случаев рака легких связано с курением,
                    но воздействие загрязнения воздуха также является фактором
                    риска. Новое исследование показало, что загрязнение воздуха
                    может быть связано с повышенным риском рака легких даже у
                    некурящих.
                  </p>
                  <p className=" mb-5">
                    В исследовании, опубликованном в журнале Nature Medicine,
                    рассматривались данные более 462 000 человек в Китае, за
                    которыми наблюдали в среднем в течение шести лет. Участники
                    были разделены на две группы: те, кто проживал в районах с
                    высоким уровнем загрязнения воздуха, и те, кто проживал в
                    районах с низким уровнем загрязнения воздуха.
                  </p>
                  <p className=" mb-5">
                    Исследователи обнаружили, что люди из группы с высоким
                    уровнем загрязнения чаще заболевали раком легких, чем люди
                    из группы с низким уровнем загрязнения. Они также
                    обнаружили, что риск выше у некурящих, чем у курильщиков, и
                    что риск увеличивается с возрастом.
                  </p>
                  <p className=" mb-5">
                    Хотя это исследование не доказывает, что загрязнение воздуха
                    вызывает рак легких, оно предполагает, что между ними может
                    существовать связь. Необходимы дополнительные исследования,
                    чтобы подтвердить эти выводы и определить, какое влияние
                    различные типы и уровни загрязнения воздуха могут оказывать
                    на риск рака легких.
                  </p>
                  <ul class="list-disc  mb-5">
                    <p className="mb-2">Возможные задачи для решения:</p>
                    <li className=" mb-2 ml-20">
                      прогнозирование вероятности развития у пациента рака
                      легкихж;
                    </li>
                    <li className=" mb-2  ml-20">
                      выявление факторов риска рака легких;  
                    </li>
                    <li className=" mb-2  ml-20">
                      определение наиболее эффективного лечения пациента с раком
                      легких.
                    </li>
                  </ul>
                  <table class="table-auto my-10">
                    <thead>
                      <tr>
                        <th className=" text-center border border-gray-400 px-2">
                          Имя столбца
                        </th>
                        <th className=" text-center border border-gray-400 px-2">
                          Описание
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Возраст
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Возраст пациента (числовой)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">Пол</td>
                        <td className=" border border-gray-400 px-2">
                          Пол пациента (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Загрязнение воздуха
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень воздействия загрязнения воздуха на
                          пациента (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Употребление алкоголя
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень употребления алкоголя пациентом (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Аллергия на пыль
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень пылевой аллергии пациента (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Профессиональные вредности
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень профессиональных вредностей
                          пациента (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Генетический риск
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень генетического риска пациента (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Хроническое заболевание легких
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень хронической болезни легких
                          пациента (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Сбалансированная диета
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень сбалансированности питания
                          больного (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Ожирение
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень ожирения пациента (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Курение
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень курения пациента  (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Пассивный курильщик
                        </td>
                        <td className=" border border-green-500 px-2">
                          Уровень пассивного курения пациента (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Боль в груди
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень боли в груди больного (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Кашель с кровью
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень кашля крови больного (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Усталость
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень утомляемости пациента (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Потеря веса
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень потери веса пациента (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">Одышка</td>
                        <td className=" border border-gray-400 px-2">
                          Уровень одышки больного (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">Хрипы</td>
                        <td className=" border border-gray-400 px-2">
                          Уровень хрипов у пациента (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Трудности с глотанием
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень затруднения глотания у пациента (категорийный)
                        </td>
                      </tr>
                      <tr>
                        <td className=" border border-gray-400 px-2">
                          Клубни ногтей
                        </td>
                        <td className=" border border-gray-400 px-2">
                          Уровень стертости ногтей больного (категорийный)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="my-10 mb-24">
                    <a className="font-semibold"> Рак_легких.xlsx</a>
                    <a
                      className="bg-gray-400 hover:bg-gray-400 text-white text-sm py-1 px-2 rounded-lg ml-2"
                      href={Dataset2}
                      target="_blank">
                      Скачать датасет
                    </a>
                  </div>
                </div>
                <div className="mb-2 border-b-4 border-gray-800"></div>
                <div className="flex justify-between px-5 ">
                  <span className="text-sm">
                    Прогнозирование развития рака легких
                  </span>
                  <span className="text-sm">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Doc2;
