import { format } from "date-fns";
import { ru } from "date-fns/locale";

export function showDate(dateString) {
  console.log(dateString)
  if(dateString === null || dateString === undefined)
    return null;
  let NewDate = new Date(dateString);
  NewDate = format(NewDate, "dd/MM/yyyy, HH:mm", { locale: ru });
  return NewDate;
}

export const variables = {
  API_URL: "",
  token: null,
  user: null,
  uploaded_file: null,
};

export function GetDatasetParams(dataset) {
  console.log(dataset);
  if (dataset === null || dataset === "0") {
    return null;
  }
  dataset = dataset.split(".");
  if (dataset.length === 1) {
    alert('Error of file name use postfix "xlsx" or "csv"');
    return null;
  }
  console.log(dataset);
  let datasetName = dataset.slice(0, -1).join(".");
  let datasetType = dataset[dataset.length - 1];
  let datasetParams = [datasetName, datasetType];
  return datasetParams;
}

export const AG_GRID_LOCALE_RU = {
  // Set Filter
  selectAll: "(Выбрать все)",
  selectAllSearchResults: "(Выбрать все выбранные совпадения)",
  searchOoo: "Поиск...",
  blanks: "(Пустые)",
  noMatches: "Нет сопадений",

  // Number Filter & Text Filter
  filterOoo: "Фильтр...",
  equals: "Равен",
  notEqual: "Не равен",
  blank: "Пусто",
  notBlank: "Не пусто",
  empty: "Выберите один",

  // Number Filter
  lessThan: "Меньше чем",
  greaterThan: "Больше чем",
  lessThanOrEqual: "Меньше чем или равен",
  greaterThanOrEqual: "Больше чем или равен",
  inRange: "В промежутке",
  inRangeStart: "От",
  inRangeEnd: "До",

  // Text Filter
  contains: "Содержится",
  notContains: "Не содержится",
  startsWith: "Начинается с",
  endsWith: "Заканчивается",

  // Date Filter
  dateFormatOoo: "yyyy-mm-dd",

  // Filter Conditions
  andCondition: "И",
  orCondition: "Или",

  // Filter Buttons
  applyFilter: "Применить",
  resetFilter: "Отменить",
  clearFilter: "Очистить",
  cancelFilter: "Закрыть",

  // Filter Titles
  textFilter: "Фильтр по тексту",
  numberFilter: "Фильтр по числам",
  dateFilter: "Фильтр по датам",
  setFilter: "Фильтр по набору",

  // Group Column Filter
  groupFilterSelect: "Выберите поле:",

  // Side Bar
  columns: "Столбцы",
  filters: "Фильтры",

  // columns tool panel
  pivotMode: "Режим поворота",
  groups: "Группировка столбцов",
  rowGroupColumnsEmptyMessage: "Перетащите сюда для группировки строк",
  values: "Значения",
  valueColumnsEmptyMessage: "Перетащите сюда для объединения",
  pivots: "Название столбцов",
  pivotColumnsEmptyMessage: "Перетащите сюда для объединения столбцов",

  // Header of the Default Group Column
  group: "Группа столбцов",

  // Row Drag
  rowDragRow: "строка",
  rowDragRows: "строки",

  // Other
  loadingOoo: "Загрузка...",
  loadingError: "ОШИБКА",
  noRowsToShow: "Нет данных для отображения",
  enabled: "Недоступно",

  // Menu
  pinColumn: "Зафиксировать столбец",
  pinLeft: "Переместить вправо",
  pinRight: "Переместить влево",
  noPin: "Не фиксировать",
  valueAggregation: "Совокупность значений",
  noAggregation: "Пусто",
  autosizeThiscolumn: "Автоматическая ширина столбца",
  autosizeAllColumns: "Автоматическая ширина всех столбцов",
  groupBy: "Группировать",
  ungroupBy: "Загрупировать",
  addToValues: "Добавить ${variable} в значения",
  removeFromValues: "Убрать ${variable} из значений",
  addToLabels: "Добавить ${variable} в названия",
  removeFromLabels: "Убрать ${variable} из значений",
  resetColumns: "Заново выбрать столбцы",
  expandAll: "Добавить все",
  collapseAll: "Закрыть все",
  copy: "Копировать",
  ctrlC: "Ctrl+C",
  ctrlX: "Ctrl+X",
  copyWithHeaders: "Копировать с заголовками",
  copyWithGroupHeaders: "Копировать с заголовком группы",
  cut: "Вырезать",
  paste: "Вставить",
  ctrlV: "Ctrl+V",
  export: "Экспортировать",
  csvExport: "CSV Export",
  excelExport: "Excel Export",

  // Enterprise Menu Aggregation and Status Bar
  sum: "Сумма",
  first: "Первый",
  last: "Последний",
  min: "Минимальное",
  max: "Максимальное",
  none: "Пусто",
  count: "Кол-во",
  avg: "Среднее",
  filteredRows: "Фильтрованные",
  selectedRows: "Выбранные",
  totalRows: "Все строк",
  totalAndFilteredRows: "Строки",
  more: "Больше",
  to: "по",
  of: "из",
  page: "Страница",
  pageLastRowUnknown: "?",
  nextPage: "Следующая страницы",
  lastPage: "Последняя страница",
  firstPage: "Первая страницы",
  previousPage: "Предыдущая страница",

  // Pivoting
  pivotColumnGroupTotals: "Всего",

  // Enterprise Menu (Charts)
  pivotChartAndPivotMode: "Pivot Chart & Pivot Mode",
  pivotChart: "Pivot Chart",
  chartRange: "Chart Range",

  columnChart: "Column",
  groupedColumn: "Grouped",
  stackedColumn: "Stacked",
  normalizedColumn: "100% Stacked",

  barChart: "Bar",
  groupedBar: "Grouped",
  stackedBar: "Stacked",
  normalizedBar: "100% Stacked",

  pieChart: "Pie",
  pie: "Pie",
  doughnut: "Doughnut",

  line: "Line",

  xyChart: "X Y (Scatter)",
  scatter: "Scatter",
  bubble: "Bubble",

  areaChart: "Area",
  area: "Area",
  stackedArea: "Stacked",
  normalizedArea: "100% Stacked",

  histogramChart: "Histogram",
  histogramFrequency: "Frequency",

  combinationChart: "Combination",
  columnLineCombo: "Column & Line",
  AreaColumnCombo: "Area & Column",

  // Charts
  pivotChartTitle: "Pivot Chart",
  rangeChartTitle: "Range Chart",
  settings: "Settings",
  data: "Data",
  format: "Format",
  categories: "Categories",
  defaultCategory: "(None)",
  series: "Series",
  xyValues: "X Y Values",
  paired: "Paired Mode",
  axis: "Axis",
  navigator: "Navigator",
  color: "Color",
  thickness: "Thickness",
  xType: "X Type",
  automatic: "Automatic",
  category: "Category",
  number: "Number",
  time: "Time",
  autoRotate: "Auto Rotate",
  xRotation: "X Rotation",
  yRotation: "Y Rotation",
  ticks: "Ticks",
  width: "Width",
  height: "Height",
  length: "Length",
  padding: "Padding",
  spacing: "Spacing",
  chart: "Chart",
  title: "Title",
  titlePlaceholder: "Chart title - double click to edit",
  background: "Background",
  font: "Font",
  top: "Top",
  right: "Right",
  bottom: "Bottom",
  left: "Left",
  labels: "Labels",
  size: "Size",
  minSize: "Minimum Size",
  maxSize: "Maximum Size",
  legend: "Legend",
  position: "Position",
  markerSize: "Marker Size",
  markerStroke: "Marker Stroke",
  markerPadding: "Marker Padding",
  itemSpacing: "Item Spacing",
  itemPaddingX: "Item Padding X",
  itemPaddingY: "Item Padding Y",
  layoutHorizontalSpacing: "Horizontal Spacing",
  layoutVerticalSpacing: "Vertical Spacing",
  strokeWidth: "Stroke Width",
  lineDash: "Line Dash",
  offset: "Offset",
  offsets: "Offsets",
  tooltips: "Tooltips",
  callout: "Callout",
  markers: "Markers",
  shadow: "Shadow",
  blur: "Blur",
  xOffset: "X Offset",
  yOffset: "Y Offset",
  lineWidth: "Line Width",
  normal: "Normal",
  bold: "Bold",
  italic: "Italic",
  boldItalic: "Bold Italic",
  predefined: "Predefined",
  fillOpacity: "Fill Opacity",
  strokeOpacity: "Line Opacity",
  histogramBinCount: "Bin count",
  columnGroup: "Column",
  barGroup: "Bar",
  pieGroup: "Pie",
  lineGroup: "Line",
  scatterGroup: "X Y (Scatter)",
  areaGroup: "Area",
  histogramGroup: "Histogram",
  combinationGroup: "Combination",
  groupedColumnTooltip: "Grouped",
  stackedColumnTooltip: "Stacked",
  normalizedColumnTooltip: "100% Stacked",
  groupedBarTooltip: "Grouped",
  stackedBarTooltip: "Stacked",
  normalizedBarTooltip: "100% Stacked",
  pieTooltip: "Pie",
  doughnutTooltip: "Doughnut",
  lineTooltip: "Line",
  groupedAreaTooltip: "Area",
  stackedAreaTooltip: "Stacked",
  normalizedAreaTooltip: "100% Stacked",
  scatterTooltip: "Scatter",
  bubbleTooltip: "Bubble",
  histogramTooltip: "Histogram",
  columnLineComboTooltip: "Column & Line",
  areaColumnComboTooltip: "Area & Column",
  customComboTooltip: "Custom Combination",
  noDataToChart: "No data available to be charted.",
  pivotChartRequiresPivotMode: "Pivot Chart requires Pivot Mode enabled.",
  chartSettingsToolbarTooltip: "Menu",
  chartLinkToolbarTooltip: "Linked to Grid",
  chartUnlinkToolbarTooltip: "Unlinked from Grid",
  chartDownloadToolbarTooltip: "Download Chart",
  seriesChartType: "Series Chart Type",
  seriesType: "Series Type",
  secondaryAxis: "Secondary Axis",

  // ARIA
  ariaChecked: "checked",
  ariaColumn: "Column",
  ariaColumnGroup: "Column Group",
  ariaColumnList: "Column List",
  ariaColumnSelectAll: "Toggle Select All Columns",
  ariaDateFilterInput: "Date Filter Input",
  ariaDefaultListName: "List",
  ariaFilterColumnsInput: "Filter Columns Input",
  ariaFilterFromValue: "Filter from value",
  ariaFilterInput: "Filter Input",
  ariaFilterList: "Filter List",
  ariaFilterToValue: "Filter to value",
  ariaFilterValue: "Filter Value",
  ariaFilteringOperator: "Filtering Operator",
  ariaHidden: "hidden",
  ariaIndeterminate: "indeterminate",
  ariaInputEditor: "Input Editor",
  ariaMenuColumn: "Press CTRL ENTER to open column menu.",
  ariaRowDeselect: "Press SPACE to deselect this row",
  ariaRowSelectAll: "Press Space to toggle all rows selection",
  ariaRowToggleSelection: "Press Space to toggle row selection",
  ariaRowSelect: "Press SPACE to select this row",
  ariaSearch: "Search",
  ariaSortableColumn: "Press ENTER to sort",
  ariaToggleVisibility: "Press SPACE to toggle visibility",
  ariaUnchecked: "unchecked",
  ariaVisible: "visible",
  ariaSearchFilterValues: "Search filter values",

  // ARIA Labels for Drop Zones

  ariaRowGroupDropZonePanelLabel: "Row Groups",
  ariaValuesDropZonePanelLabel: "Values",
  ariaPivotDropZonePanelLabel: "Column Labels",
  ariaDropZoneColumnComponentDescription: "Press DELETE to remove",
  ariaDropZoneColumnValueItemDescription:
    "Press ENTER to change the aggregation type",
  ariaDropZoneColumnGroupItemDescription: "Press ENTER to sort",
  // used for aggregate drop zone, format: {aggregation}{ariaDropZoneColumnComponentAggFuncSeperator}{column name}
  ariaDropZoneColumnComponentAggFuncSeperator: " of ",
  ariaDropZoneColumnComponentSortAscending: "ascending",
  ariaDropZoneColumnComponentSortDescending: "descending",

  // ARIA Labels for Dialogs
  ariaLabelColumnMenu: "Column Menu",
  ariaLabelCellEditor: "Cell Editor",
  ariaLabelDialog: "Dialog",
  ariaLabelSelectField: "Select Field",
  ariaLabelTooltip: "Tooltip",
  ariaLabelContextMenu: "Context Menu",
  ariaLabelSubMenu: "SubMenu",
  ariaLabelAggregationFunction: "Aggregation Function",

  // Number Format (Status Bar, Pagination Panel)
  thousandSeparator: ",",
  decimalSeparator: ".",
};
