from bs4 import BeautifulSoup as bs
import re


overviewTable = [
    'Количество переменных',
    'Количество наблюдений',
    'Отсутствующие ячейки',
    'Отсутствующие ячейки (%)',
    'Повторяющиеся строки',
    'Повторяющиеся строки (%)',
    'Общий размер в памяти',
    'Средний размер записи в памяти',
    # 'Числовые столбцы',
    # 'Категориальные столбы'
]

reproductionTable = [
    'Начало анализа',
    'Конец анализа',
    'Продолжительность',
    ['Версия ПО', 'ml.datamed.pro'],
    'Скачать конфигурацию',
]

def cat_or_real(x):
    if x == "Real number (ℝ)":
        return "Вещественное число (ℝ)"
    if x == """Categorical""":
        return "Категориальный"
    if x == "Text":
        return "Текст"
    if x == "Boolean":
        return "Логический"
    return x

tableNum1 = [
    'Уникальных',
    "Уникальных (%)",
    'Пропущенных',
    'Пропушенных (%)',
    'Бесконечных',
    'Бесконечных (%)',
    'Среднее',
]

tableNum2 = [
    'Минимум',
    'Максимум',
    'Нулей',
    'Нулей (%)',
    'Отрицательных',
    'Отрицательных (%)',
    'В памяти',
]

tableNum3 = [
    'Минимум',
    '5-ый процентиль',
    'Q1',
    'Медиана',
    'Q3',
    '95-ый процентиль',
    'Максимум',
    'Размах выборки',
    "Межквартильный размах (IQR)",
]

tableNum4 = [
    "Стандартное отклонение",
    "Коофициент вариации (CV)",
    "Куртозис",
    "Среднее",
    "Медианное абсолютное отклонение (MAD)",
    "Асимметрия",
    "Сумма",
    "Дисперсия",
    "Монотонность"
]

tableNavsNums = [
    'Статистика',
    "Гистограмма",
    "Частота значения",
    "Крайние значения",
    "10 минимальных",
    "10 максимальных"
]

tableCars1 = [
    'Уникальных',
    "Уникальных (%)",
    'Пропущенных',
    'Пропушенных (%)',
    'В памяти',
]

tableCars2 = [
    'Макс. длина',
    "Медианая длина",
    "Средняя длина",
    "Мин. длина",
]

tableCars3 = [
    'Всего символов',
    "Уникальные символы",
    "Уникальные категории",
    "Уникальные скрипты",
    "Уникальные блоки",
]

tableCars4 = [
    'Уникальные',
    "Уникальные (%)",
]

tableCars5 = [
    '1-я строка',
    '2-я строка',
    '3-я строка',
    '4-я строка',
    '5-я строка',
]

tablesCars = [
    tableCars2,
    tableCars3,
    tableCars4,
    tableCars5
]

tableNavCarsOver = [
    'Длина',
    "Символы и Unicode",
    "Уникальные",
    "Примеры"
]

tableNavCars = [
    'Отчет',
    "Категории",
    "Слова",
    "Символы",
    "Символы",
    "Категории",
    "Скрипты",
    "Блоки"
]

tableH4 = [
    'Все значения',
    "Длина",
    "Все значения(График)",
    "Самые встречающиеся символы",
    "Самые встречаемые категории",
    "Самый частый символ в каждой категории",
    "Самые встречаемые скрипты",
    "Самый частый скрипт в каждой категории",
    "Самые встречаемые блоки",
    "Самый частый блок в каждой категории",
]

tableNavBool = [
    'Встречаемые значения(Таблица)',
    'Встречаемые значения(График)'
]

class TranslateStat:
    def __init__(self, file_):
        """"""
        with open(file_, 'r') as f:
            self.page = bs(f.read(), 'html.parser')
            self.body = self.page.find('body')
            self.sections = dict()


    def reload_changes(self, file_):
        with open(file_, 'w', encoding='utf-8') as f:
            f.write(str(self.page.prettify()))
        return

    def change_raw_file(self, file_):
        with open(file_, 'r', encoding='utf-8') as f:
            text = f.read()
            text = re.sub(r'Histogram of lengths of the category', r'Гистограмма частот по категориям', text)
            text = re.sub(r'Histogram with fixed size bins', r"Гистограмма с интервалами фиксированного размера интервалов", text)
            text = re.sub(r'\(bins', "(инттервалов", text)
        with open(file_, 'w', encoding='utf-8') as f:
            f.write(text)
        return

    def translate(self):
        self.translate_main()
        self.translate_overview()
        self.translate_variables()
        self.translate_correlations()
        self.translate_missing()
        self.translate_samples()
        self.translate_duplicates()

        f = self.body.find('footer')
        if f is not None:
            f.find('p').string = "Выполнен расчет статистических характеристик"
        for table in self.body.find_all('table', class_="freq table table-hover table-striped table-0"):
            for cell, text in zip(table.thead.tr.find_all('td'), ('Значение', 'Кол-во', 'Частота (%)')):
                cell.string = text
        for tr in self.body.find_all('tr', class_='other'):
            td = tr.find('td')
            td.string = td.string.replace('Other values', 'Другие значения')
        return

    def translate_main(self):
        navTexts = ['Общие сведения', 'Переменные', 'Взаимодействия', 'Корреляции', 'Пропущенные значения', 'Датасет', 'Повторяющиеся строки']
        log = self.body.find("a", class_="navbar-brand anchor",href="#top")
        log.string = "Статистика"
        navBar = self.body.find('div', id='navbar', class_="navbar-collapse collapse")
        for navLi, text in zip(navBar.find_all('li'), navTexts):
            navLi.a.string = text

        for hLi, cLi, text in zip(self.body.find_all('div', class_="row header"), self.body.find_all('div', class_="section-items"),navTexts):
            hLi.h1.string = text
            self.sections[hLi.a['id']] = cLi
        return

    def translate_overview(self):
        overview = self.sections['overview']
        for li, text in zip(overview.find_all('li'), ('Обзор', 'Предупреждения', 'Служебная информация')):
            li.a.string = text
        overview_o = overview.find('div', id="overview-dataset_overview")
        for h4, text in zip(overview_o.find_all('p', class_='h4'), ('Статистика датасета', 'Типы переменных')):
            h4.string = text

        for row, text in zip(overview_o.find_all('tr'), overviewTable):
            row.th.string = text

        overview_a = overview.find('div', id="overview-alerts")
        overview_a.find('p', class_='h4').string = "Предупреждения"

        overview_r = overview.find('div', id="overview-reproduction")
        overview_r.find('p', class_='h4').string = "Служебная информация"
        for row, text in zip(overview_r.find_all('tr'), reproductionTable):
            if isinstance(text, list):
                row.td.string = text[1]
                row.th.string = text[0]
            else:
                row.th.string = text
        return

    def translate_variables(self):
        variables = self.sections['variables-dropdown']
        variables.find('select').find('option').string = 'Выбрать Столбец'

        for column in variables.find_all('div', class_="row spacing")[1:]:
            info = column.find('div', class_='variable')
            if info is None:
                continue
            type_val = cat_or_real(info.find('div', class_="col-sm-12").find('small').string)
            info.find('div', class_="col-sm-12").find('small').string = type_val

            if type_val == 'Unsupported':
                continue

            if type_val == 'Вещественное число (ℝ)':
                for table, translateTable in zip(info.find_all('div', class_="col-sm-4", limit=2), (tableNum1, tableNum2)):
                    self.translate_table(table, translateTable)
                for table, translateTable, tableName in zip(info.find_all('div', class_="col-sm-6", limit=2), (tableNum3, tableNum4), ('Квантильная статистика', 'Описательная статистика')):
                    table.p.string = tableName
                    self.translate_table(table, translateTable)
                for li, text in zip(info.find_all('li'), tableNavsNums):
                    li.a.string = text

                a = info.find('g', id="matplotlib.axis_2")
                try:
                    a.find_all('g')[-1].decompose()
                except:
                    pass

            elif type_val == 'Категориальный' or type_val == 'Текст':
                self.translate_table(info.find('div', class_="col-sm-6"), tableCars1)
                for li, text in zip(info.find_all('li'), tableNavCars):
                    li.a.string = text
                for table, name, translateTable in zip(info.find('div', class_="tab-content").find('div', class_="tab-pane col-sm-12 active").find_all('div', class_='col-sm-3'), tableNavCarsOver, tablesCars):
                    table.p.string = name
                    self.translate_table(table, translateTable)
                info.find('div', class_="tab-content").find('div', class_="caption text-center text-muted").string = "Стандарт Unicode присваивает каждой кодовой точке свойства символов, которые можно использовать для анализа текстовых переменных."
                for h4, text in zip(info.find('div', class_="tab-content").find_all('h4'), tableH4):
                    h4.string = text

                a = info.find('g', id="matplotlib.axis_2")
                try:
                    a.find_all('g')[-1].decompose()
                except:
                    pass

            elif type_val == 'Логический':
                self.translate_table(info.find('div', class_="col-sm-6"), tableCars1)
                for li, text in zip(info.find_all('li'), tableNavBool):
                    li.a.string = text
            else:
                pass

            try:
                info.find('div', class_="col-sm-12 text-right").button.string = "Подробнее"
            except:
                print(info.find('div', class_="col-sm-12 text-right"))

        return

    def translate_table(self, htmlTable: [], translateTable: [], *args):
        for row, text in zip(htmlTable.find_all('tr'), translateTable):
            row.th.string = text
        return

    def translate_correlations(self):
        variables = self.sections.get('correlations_tab', None)
        if variables is None:
            return
        for li, text in zip(variables.find_all('li'), ('Автоматически', 'Heatmap', 'Таблица')):
            li.a.string = text
        return

    def translate_missing(self):
        variables = self.sections.get('missing', None)
        if variables is None:
            return
        for li, text in zip(variables.find_all('li'), ('Кол-во', 'Таблица', 'Heatmap')):
            li.a.string = text
        return

    def translate_samples(self):
        variables = self.sections.get('sample', None)
        if variables is None:
            return
        for li, text in zip(variables.find_all('li'), ('Первые строки', 'Последние строки')):
            li.a.string = text
        return

    def translate_duplicates(self):
        variables = self.sections.get('duplicate', None)
        if variables is None:
            return
        variables.find('h4').string = "Чаще всего встречается"
        return
