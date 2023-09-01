import { format } from 'date-fns';
import { ru } from 'date-fns/locale'

export function showDate(dateString) {
    let NewDate = new Date(dateString);
    NewDate = format(NewDate, 'dd/MM/yyyy, HH:mm', {locale: ru});
    return NewDate
}

export const variables = {
    API_URL: "",
    token: "",
    user: null,
    uploaded_file: null,
}

export function GetDatasetParams(dataset) {
    console.log(dataset);
    if (dataset === null || dataset === '0') {
            return null;
    }
    dataset = dataset.split('.')
    if (dataset.length === 1) {
        alert('Error of file name use postfix "xlsx" or "csv"')
        return null;
    }
    console.log(dataset)
    let datasetName = dataset.slice(0, -1).join('.');
    let datasetType = dataset[dataset.length - 1]
    let datasetParams = [datasetName, datasetType]
    return datasetParams
}