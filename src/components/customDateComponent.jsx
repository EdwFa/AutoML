import React, {
  Component,
  forwardRef,
  useEffect,
  useState,
  useRef,
  useImperativeHandle
} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from  "react-datepicker";
import ru from 'date-fns/locale/ru';


const CustomDateComponent = forwardRef((props, ref) => {
  const [date, setDate] = useState(null);
  const [picker, setPicker] = useState(null);
  const refDatePicker = useRef();
  const refInput = useRef();

  const onDateChanged = selectedDate => {
    setDate(selectedDate);
    props.onDateChanged();
  };

  useImperativeHandle(ref, () => ({
    getDate() {
      return date;
    },

    setDate(date) {
      setDate(date);
    }
  }));

  return (
    <div ref={refInput} className="ag-input-wrapper">
      <DatePicker
        ref={refDatePicker}
        portalId="root"
        dateFormat="dd/MM/yyyy"
        locale="ru"
        popperClassName="ag-custom-component-popup"
        selected={date}
        onChange={onDateChanged}
      />
    </div>
  );
});

export default CustomDateComponent;