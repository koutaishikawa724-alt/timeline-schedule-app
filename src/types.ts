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

export type DiaryEntry = {
  text: string;
  /** 気分（0 = 最高 〜 4 = つらい）。未選択なら undefined */
  mood?: number;
  /** 最後に書いた時刻（ミリ秒） */
  updatedAt: number;
};

export type DiaryMap = Record<string, DiaryEntry>;
