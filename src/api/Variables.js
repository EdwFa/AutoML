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
    is_admin: false,
    is_staff: false,
    username: "",
    email: "",
    epicCount: 0,
}