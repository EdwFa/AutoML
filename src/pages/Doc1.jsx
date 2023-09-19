import React from "react";

import Aside from "../components/Sidebar";

import Bud from "../assets/images/doc/doc1/bud.webp";

const Doc1 = () => {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Aside />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <div className="h-dvh flex flex-col bg-white dark:bg-gray-800">
            <div className="p-4">
              <h1 className="text-2xl mb-10">
                Датасет для прогнозирования образования камней в почках на
                основе анализа мочи
              </h1>
              <div className=" mb-10">
                <a className="text-xl font-semibold"> Камни_в_почках.csv</a>
                <button
                  className="bg-zinc-400 hover:bg-zinc-500 text-white text-xs py-1 px-2 rounded-xl ml-2"
                  href="#"
                >
                  Скачать файл
                </button>
              </div>

              <p className="text-xl mb-5">
                Этот набор данных можно использовать для прогнозирования наличия
                камней в почках на основе анализа мочи.
              </p>
              <img class="float-right h-56 my-2 ml-2" src={Bud} />
              <p className="text-xl mb-5">
                79 образцов мочи были проанализированы с целью определить, могут
                ли определенные физические характеристики мочи быть связаны с
                образованием кристаллов оксалата кальция.
              </p>
              <ol class="list-decimal text-xl mb-5">
                <p className="mb-2">
                  Шестью физическими характеристиками мочи являются:
                </p>

                <li className="text-xl mb-2 ml-20">
                  удельный вес, плотность мочи по отношению к воде; 
                </li>
                <li className="text-xl mb-2  ml-20">
                  pH, отрицательный логарифм иона водорода; 
                </li>
                <li className="text-xl mb-2  ml-20">
                  осмолярность (мосм), единица измерения, используемая в
                  биологии и медицине, но не в физической химии. Осмолярность
                  пропорциональна концентрации молекул в растворе; 
                </li>
                <li className="text-xl mb-2  ml-20">
                  проводимость (мМхо, миллиМхо). Один Мхо равен одному обратному
                  Ому.
                  <a className="bg-green-200">
                    Проводимость пропорциональна концентрации заряженных ионов в
                    растворе
                  </a>
                  ;
                </li>
                <li className="text-xl mb-2  ml-20">
                  концентрация мочевины в миллимоль на литр;
                </li>
                <li className="text-xl mb-2  ml-20">
                  кальций концентрация (CALC) в миллимоль/литр.
                </li>
              </ol>
              <p className="text-xl mb-5">
                Данные получены из «Физических характеристик мочи с кристаллами
                и без них», главы из серии Springer Series в статистике.{" "}
                <a
                  className="text-blue-700 underline underline-offset-4 hover:text-blue-500"
                  href="https://link.springer.com/chapter/10.1007/978-1-4612-5098-2_45"
                >
                  https://link.springer.com/chapter/10.1007/978-1-4612-5098-2_45
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Doc1;
