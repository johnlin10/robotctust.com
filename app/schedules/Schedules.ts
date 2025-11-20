import { ScheduleEvent } from '../types/Schedule'

/**
 * 課程行事曆資料範例
 * 用於開發測試和初始資料
 */
export const schedules: ScheduleEvent[] = [
  //* 114 學年度上學期
  // 校務行事曆
  {
    id: 'school-event-2025-09-05',
    title: '開學日',
    description: '',
    type: 'school-event',
    startDateTime: {
      date: '2025-09-05',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-09-05',
      time: '20:30',
    },
    location: '',
    instructor: '',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-23',
      time: '13:00',
    },
    updatedAt: {
      date: '2025-09-23',
      time: '13:00',
    },
  },

  // 社團行程
  {
    id: 'club-event-2025-09-05-01',
    title: '社團博覽會',
    description: '',
    type: 'event',
    startDateTime: {
      date: '2025-09-24',
      time: '13:00',
    },
    endDateTime: {
      date: '2025-09-24',
      time: '16:00',
    },
    location: '天機大樓廣場',
    instructor: '',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-23',
      time: '13:00',
    },
    updatedAt: {
      date: '2025-09-23',
      time: '13:00',
    },
  },
  {
    id: 'club-event-2025-09-05-02',
    title: '社團幹部會議',
    description: '',
    type: 'event',
    startDateTime: {
      date: '2025-09-24',
      time: '13:00',
    },
    endDateTime: {
      date: '2025-09-24',
      time: '16:00',
    },
    location: '天機大樓廣場',
    instructor: '',
    priority: 1,
    published: false,
    createdAt: {
      date: '2025-09-23',
      time: '13:00',
    },
    updatedAt: {
      date: '2025-09-23',
      time: '13:00',
    },
  },
  {
    id: 'club-event-2025-11-05',
    title: '社團幹部會議',
    description: '',
    type: 'event',
    startDateTime: {
      date: '2025-11-05',
      time: '14:00',
    },
    endDateTime: {
      date: '2025-11-05',
      time: '15:00',
    },
    location: '天機大樓 2323',
    instructor: '',
    priority: 1,
    published: false,
    createdAt: {
      date: '2025-09-23',
      time: '13:00',
    },
    updatedAt: {
      date: '2025-09-23',
      time: '13:00',
    },
  },
  {
    id: 'club-event-2025-12-10',
    title: '社團幹部會議',
    description: '',
    type: 'event',
    startDateTime: {
      date: '2025-12-10',
      time: '14:00',
    },
    endDateTime: {
      date: '2025-12-10',
      time: '15:00',
    },
    location: '天機大樓 2323',
    instructor: '',
    priority: 1,
    published: false,
    createdAt: {
      date: '2025-09-23',
      time: '13:00',
    },
    updatedAt: {
      date: '2025-09-23',
      time: '13:00',
    },
  },

  // 社團活動
  {
    id: 'club-activity-2025-10-15',
    title: '自走車 DIY',
    description: '',
    type: 'activity',
    startDateTime: {
      date: '2025-10-15',
      time: '14:00',
    },
    endDateTime: {
      date: '2025-10-15',
      time: '16:00',
    },
    location: '天機大樓 2314',
    instructor: '',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-23',
      time: '13:00',
    },
    updatedAt: {
      date: '2025-09-23',
      time: '13:00',
    },
  },

  // 上課時間
  {
    id: 'regular-class-2025-10-08',
    title: '社團課程一（社員大會）',
    description: '',
    type: 'class',
    startDateTime: {
      date: '2025-10-08',
      time: '14:00',
    },
    endDateTime: {
      date: '2025-10-08',
      time: '16:00',
    },
    location: '天機大樓 2314',
    instructor: '',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-23',
      time: '13:00',
    },
    updatedAt: {
      date: '2025-09-23',
      time: '13:00',
    },
  },
  {
    id: 'regular-class-2025-10-29',
    title: '社團課程二',
    description: '',
    type: 'class',
    startDateTime: {
      date: '2025-10-29',
      time: '14:00',
    },
    endDateTime: {
      date: '2025-10-29',
      time: '16:00',
    },
    location: '天機大樓 2314',
    instructor: '',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-23',
      time: '13:00',
    },
    updatedAt: {
      date: '2025-09-23',
      time: '13:00',
    },
  },
  {
    id: 'regular-class-2025-12-03',
    title: '社團課程三',
    description: '',
    type: 'class',
    startDateTime: {
      date: '2025-12-03',
      time: '14:00',
    },
    endDateTime: {
      date: '2025-12-03',
      time: '16:00',
    },
    location: '天機大樓 2314',
    instructor: '',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-23',
      time: '13:00',
    },
    updatedAt: {
      date: '2025-11-14',
      time: '10:46',
    },
  },
  {
    id: 'regular-class-2025-12-17',
    title: '社團課程四',
    description: '',
    type: 'class',
    startDateTime: {
      date: '2025-12-17',
      time: '14:00',
    },
    endDateTime: {
      date: '2025-12-17',
      time: '16:00',
    },
    location: '天機大樓 2314',
    instructor: '',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-23',
      time: '13:00',
    },
    updatedAt: {
      date: '2025-09-23',
      time: '13:00',
    },
  },
  {
    id: 'regular-class-2026-01-07',
    title: '期末同樂會',
    description: '',
    type: 'class',
    startDateTime: {
      date: '2026-01-07',
      time: '14:00',
    },
    endDateTime: {
      date: '2026-01-07',
      time: '16:00',
    },
    location: '天機大樓 2314',
    instructor: '',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-23',
      time: '13:00',
    },
    updatedAt: {
      date: '2025-09-23',
      time: '13:00',
    },
  },
]

export const testSchedules: ScheduleEvent[] = [
  // 114學年度上學期 - 定期上課時間
  {
    id: 'regular-class-2025-09-05',
    title: '機器人程式設計基礎',
    description: '學習Arduino程式設計與感測器應用',
    type: 'class',
    startDateTime: {
      date: '2025-09-05',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-09-05',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '王教授',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-09-05-2',
    title: '機器人程式設計基礎',
    description: '學習Arduino程式設計與感測器應用',
    type: 'class',
    startDateTime: {
      date: '2025-09-05',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-09-05',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '王教授',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-09-05-3',
    title: '機器人程式設計基礎',
    description: '學習Arduino程式設計與感測器應用',
    type: 'class',
    startDateTime: {
      date: '2025-09-05',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-09-05',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '王教授',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2026-09-05-3',
    title: '機器人程式設計基礎',
    description: '學習Arduino程式設計與感測器應用',
    type: 'class',
    startDateTime: {
      date: '2026-09-05',
      time: '18:30',
    },
    endDateTime: {
      date: '2026-09-05',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '王教授',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-09-12',
    title: '機器人程式設計基礎',
    description: '馬達控制與PWM訊號',
    type: 'class',
    startDateTime: {
      date: '2025-09-12',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-09-12',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '王教授',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-09-19',
    title: '機器人程式設計基礎',
    description: '感測器整合與資料處理',
    type: 'class',
    startDateTime: {
      date: '2025-09-19',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-09-19',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '王教授',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-09-26',
    title: '機器人程式設計基礎',
    description: '無線通訊與IoT應用',
    type: 'class',
    startDateTime: {
      date: '2025-09-26',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-09-26',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '王教授',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },

  // 10月課程
  {
    id: 'regular-class-2025-10-03',
    title: '機器人硬體實作',
    description: '機械結構設計與組裝',
    type: 'class',
    startDateTime: {
      date: '2025-10-03',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-10-03',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '李老師',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-10-10',
    title: '機器人硬體實作',
    description: '電路設計與焊接技術',
    type: 'class',
    startDateTime: {
      date: '2025-10-10',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-10-10',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '李老師',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-10-17',
    title: '機器人硬體實作',
    description: '3D列印與快速原型製作',
    type: 'class',
    startDateTime: {
      date: '2025-10-17',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-10-17',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '李老師',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-10-24',
    title: '機器人硬體實作',
    description: '整合測試與除錯',
    type: 'class',
    startDateTime: {
      date: '2025-10-24',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-10-24',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '李老師',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-10-31',
    title: '機器人硬體實作',
    description: '期中專題發表',
    type: 'class',
    startDateTime: {
      date: '2025-10-31',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-10-31',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '李老師',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },

  // 11月課程
  {
    id: 'regular-class-2025-11-07',
    title: '人工智慧與機器學習',
    description: '機器學習基礎概念',
    type: 'class',
    startDateTime: {
      date: '2025-11-07',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-11-07',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '陳教授',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-11-14',
    title: '人工智慧與機器學習',
    description: '電腦視覺與影像處理',
    type: 'class',
    startDateTime: {
      date: '2025-11-14',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-11-14',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '陳教授',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-11-21',
    title: '人工智慧與機器學習',
    description: '深度學習與神經網路',
    type: 'class',
    startDateTime: {
      date: '2025-11-21',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-11-21',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '陳教授',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-11-28',
    title: '人工智慧與機器學習',
    description: '機器人導航與路徑規劃',
    type: 'class',
    startDateTime: {
      date: '2025-11-28',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-11-28',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '陳教授',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },

  // 12月課程
  {
    id: 'regular-class-2025-12-05',
    title: '專題製作',
    description: '期末專題規劃與分組',
    type: 'class',
    startDateTime: {
      date: '2025-12-05',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-12-05',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '全體老師',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-12-12',
    title: '專題製作',
    description: '專題進度報告與指導',
    type: 'class',
    startDateTime: {
      date: '2025-12-12',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-12-12',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '全體老師',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'regular-class-2025-12-19',
    title: '專題製作',
    description: '專題實作與測試',
    type: 'class',
    startDateTime: {
      date: '2025-12-19',
      time: '18:30',
    },
    endDateTime: {
      date: '2025-12-19',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '全體老師',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },

  // 1月課程（期末）
  {
    id: 'final-presentation-2026-01-09',
    title: '期末專題發表',
    description: '學期成果發表與評分',
    type: 'activity',
    startDateTime: {
      date: '2026-01-09',
      time: '18:30',
    },
    endDateTime: {
      date: '2026-01-09',
      time: '21:00',
    },
    location: '國際會議廳',
    instructor: '全體老師',
    color: '#10B981',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
  {
    id: 'semester-party-2026-01-16',
    title: '學期慶祝聚餐',
    description: '慶祝學期結束，增進社團感情',
    type: 'activity',
    startDateTime: {
      date: '2026-01-16',
      time: '18:00',
    },
    endDateTime: {
      date: '2026-01-16',
      time: '20:00',
    },
    location: '校外餐廳',
    color: '#10B981',
    priority: 2,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },

  // 特殊活動
  {
    id: 'workshop-2025-10-15',
    title: 'ROS機器人作業系統工作坊',
    description: '外聘講師分享ROS開發經驗',
    type: 'activity',
    startDateTime: {
      date: '2025-10-15',
      time: '14:00',
    },
    endDateTime: {
      date: '2025-10-15',
      time: '17:00',
    },
    location: '資訊大樓 B501',
    instructor: '業界專家',
    color: '#10B981',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },

  // 116學年度測試資料（用於測試學年度選擇器）
  {
    id: 'future-class-2027-09-10',
    title: '未來課程測試',
    description: '測試學年度選擇器功能',
    type: 'class',
    startDateTime: {
      date: '2027-09-10',
      time: '18:30',
    },
    endDateTime: {
      date: '2027-09-10',
      time: '20:30',
    },
    location: '資訊大樓 B501',
    instructor: '測試老師',
    priority: 1,
    published: true,
    createdAt: {
      date: '2025-09-01',
      time: '10:00',
    },
    updatedAt: {
      date: '2025-09-01',
      time: '10:00',
    },
  },
]
