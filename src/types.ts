export type ScheduleEvent = {
  id: string;
  title: string;
  /** 0:00 からの分数 */
  start: number;
  /** 0:00 からの分数（最大 1440） */
  end: number;
  color: string;
};

export type ScheduleMap = Record<string, ScheduleEvent[]>;
