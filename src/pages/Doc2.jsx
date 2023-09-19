import React from "react";

import Aside from "../components/Sidebar";

import Bud from "../assets/images/doc/doc1/bud.webp";
import Lungs from "../assets/images/doc/doc1/lungs.webp";
import Pancreas from "../assets/images/doc/doc1/pancreas.webp";
import Pancreas2 from "../assets/images/doc/doc1/pancreas2.webp";
import Heart from "../assets/images/doc/doc1/heart.webp";

const Doc1 = () => {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Aside />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <div className="h-dvh flex flex-col bg-white dark:bg-gray-800">
            <div className="p-4">
              <h1 className="text-2xl mb-10 mt-20">
                Прогноз развития рака легких
              </h1>

              <div className=" mb-10">
                <a className="text-xl font-semibold">
                  Прогноз_развития_рака_легких.csv
                </a>
                <button
                  className="bg-zinc-400 hover:bg-zinc-500 text-white text-xs py-1 px-2 rounded-xl ml-2"
                  href="#"
                >
                  Скачать файл
                </button>
              </div>
              <img class="float-right h-56 my-2 ml-2" src={Lungs} />
              <p className="text-xl mb-5">
                Этот набор данных содержит информацию о пациентах с раком
                легких, включая их возраст, пол, воздействие загрязнения
                воздуха, употребление алкоголя, аллергию на пыль,
                профессиональные вредности, генетический риск, хронические
                заболевания легких, сбалансированное питание, ожирение, курение,
                пассивный курильщик, боль в груди, кашель. крови, утомляемость,
                потеря веса, одышка, хрипы, затруднения при глотании,
                скручивание ногтей и храп.
              </p>
              <p className="text-xl mb-5">
                Рак легких является основной причиной смертности от рака во всем
                мире: в 2018 году на его долю пришлось 1,59 миллиона смертей.
                Большинство случаев рака легких связано с курением, но
                воздействие загрязнения воздуха также является фактором риска.
                Новое исследование показало, что загрязнение воздуха может быть
                связано с повышенным риском рака легких даже у некурящих.
              </p>
              <p className="text-xl mb-5">
                В исследовании, опубликованном в журнале Nature Medicine,
                рассматривались данные более 462 000 человек в Китае, за
                которыми наблюдали в среднем в течение шести лет. Участники были
                разделены на две группы: те, кто проживал в районах с высоким
                уровнем загрязнения воздуха, и те, кто проживал в районах с
                низким уровнем загрязнения воздуха.
              </p>
              <p className="text-xl mb-5">
                Исследователи обнаружили, что люди из группы с высоким уровнем
                загрязнения чаще заболевали раком легких, чем люди из группы с
                низким уровнем загрязнения. Они также обнаружили, что риск выше
                у некурящих, чем у курильщиков, и что риск увеличивается с
                возрастом.
              </p>
              <p className="text-xl mb-5">
                Хотя это исследование не доказывает, что загрязнение воздуха
                вызывает рак легких, оно предполагает, что между ними может
                существовать связь. Необходимы дополнительные исследования,
                чтобы подтвердить эти выводы и определить, какое влияние
                различные типы и уровни загрязнения воздуха могут оказывать на
                риск рака легких.
              </p>
              <ul class="list-disc text-xl mb-5">
                <p className="mb-2">Возможные задачи для решения:</p>
                <li className="text-xl mb-2 ml-20">
                  прогнозирование вероятности развития у пациента рака легкихж;
                </li>
                <li className="text-xl mb-2  ml-20">
                  выявление факторов риска рака легких;  
                </li>
                <li className="text-xl mb-2  ml-20">
                  определение наиболее эффективного лечения пациента с раком
                  легких.
                </li>
              </ul>
              <table class="table-auto my-10">
                <thead>
                  <tr>
                    <th className="text-xl text-center border border-sky-500 px-2">
                      Имя столбца
                    </th>
                    <th className="text-xl text-center border border-sky-500 px-2">
                      Описание
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Возраст
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Возраст пациента (числовой)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">Пол</td>
                    <td className="text-xl border border-sky-500 px-2">
                      Пол пациента (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Загрязнение воздуха
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень воздействия загрязнения воздуха на
                      пациента (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Употребление алкоголя
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень употребления алкоголя пациентом (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Аллергия на пыль
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень пылевой аллергии пациента (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Профессиональные вредности
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень профессиональных вредностей
                      пациента (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Генетический риск
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень генетического риска пациента (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Хроническое заболевание легких
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень хронической болезни легких пациента (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Сбалансированная диета
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень сбалансированности питания больного (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Ожирение
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень ожирения пациента (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Курение
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      <a className="bg-green-200">Уровень курения пациента</a>
                       (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Пассивный курильщик
                    </td>
                    <td className="text-xl border border-green-500 px-2">
                      Уровень пассивного курения пациента (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Боль в груди
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень боли в груди больного (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Кашель с кровью
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень кашля крови больного (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Усталость
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень утомляемости пациента (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Потеря веса
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень потери веса пациента (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Одышка
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень одышки больного (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Хрипы
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень хрипов у пациента (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Трудности с глотанием
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень затруднения глотания у пациента (категорийный)
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xl border border-sky-500 px-2">
                      Клубни ногтей
                    </td>
                    <td className="text-xl border border-sky-500 px-2">
                      Уровень стертости ногтей больного (категорийный)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Doc1;
