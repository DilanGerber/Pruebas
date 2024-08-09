"use client"

import React from 'react';
// import './index.css';
import { DatePicker, Flex } from 'antd';
import dayjs from 'dayjs';
const onChange = (date, dateString) => {
  console.log(date, dateString);
};
const defaultValue = [dayjs('2000-01-01'), dayjs('2000-01-03'), dayjs('2000-01-05')];
const App = () => (
  <Flex vertical gap="small">
    <DatePicker
      multiple
      onChange={onChange}
      maxTagCount="responsive"
      defaultValue={defaultValue}
      size="small"
    />
    <DatePicker multiple onChange={onChange} maxTagCount="responsive" defaultValue={defaultValue} />
    <DatePicker
      multiple
      onChange={onChange}
      maxTagCount="responsive"
      defaultValue={defaultValue}
      size="large"
    />
  </Flex>
);
export default App;