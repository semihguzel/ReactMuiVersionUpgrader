import React from 'react';
import Paper from '@material-ui/core/Paper';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  DayView,
  Appointments,
} from '@devexpress/dx-react-scheduler-material-ui';

const schedulerData = [
  { startDate: '2024-01-01T09:45', endDate: '2024-01-01T11:00', title: 'Meeting' },
  { startDate: '2024-01-01T12:00', endDate: '2024-01-01T13:30', title: 'Lunch' },
];

function SchedulerView() {
  return (
    <Paper>
      <Scheduler data={schedulerData}>
        <ViewState currentDate="2024-01-01" />
        <DayView startDayHour={9} endDayHour={14} />
        <Appointments />
      </Scheduler>
    </Paper>
  );
}

export default SchedulerView;
