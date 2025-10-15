import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faMoneyBillWave,
  faScrewdriverWrench,
  faSitemap,
  faFlag,
} from '@fortawesome/free-solid-svg-icons'

export interface MainDoc {
  id: string
  title: string
  description: string
  filePath: string
  icon: IconDefinition
  category?: string
}

interface SubDoc {
  id: string
  title: string
  docs: {
    id: string
    title: string
    type: string
    filePath: string
  }[]
}

interface SubDocs {
  id: string
  title: string
  docs: SubDoc[]
}

export const mainDocs: MainDoc[] = [
  {
    id: 'org-charter',
    title: '組織章程',
    description: '中臺機器人研究社的組織章程',
    filePath: '/assets/docs/org-charter.md',
    icon: faSitemap,
    category: '社團文件',
  },
  {
    id: 'financial-management',
    title: '經費管理辦法',
    description: '社團經費管理的相關辦法和規定',
    filePath: '/assets/docs/financial-management.md',
    icon: faMoneyBillWave,
    category: '社團文件',
  },
  {
    id: 'equipment-borrowing-guidelines',
    title: '器材借用須知',
    description: '社團器材借用的須知和規定',
    filePath: '/assets/docs/equipment-borrowing-guidelines.md',
    icon: faScrewdriverWrench,
    category: '社團文件',
  },
  {
    id: 'future-plans',
    title: '未來規劃',
    description: '中臺機器人研究社的發展規劃',
    filePath: '/assets/docs/future-plans.md',
    icon: faFlag,
    category: '社團文件',
  },
]

export const subDocs: SubDocs[] = [
  {
    id: 'course-materials',
    title: '課程資料',
    docs: [
      {
        id: 'self-driving-car-diy',
        title: '自走車 DIY',
        docs: [
          {
            id: 'robot-assembly-circuit-diagram-1',
            title: '社團機器人組裝指南',
            type: 'PDF',
            filePath:
              'https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/docs%2Frobot-assembly-circuit-diagram%2F%E6%A9%9F%E5%99%A8%E4%BA%BA%E6%8E%A5%E7%B7%9A%E5%9C%96.pdf?alt=media&token=cf1bace6-5ed8-4e51-8f38-91d2dfefe49d',
          },
          {
            id: 'robot-assembly-circuit-diagram-2',
            title: '社團機器人組裝指南',
            type: 'Google Drive',
            filePath:
              'https://drive.google.com/file/d/12cWAfX7NYqm5dSxTtXfwliN7BkqgN4ua/view?usp=sharing',
          },
        ],
      },
    ],
  },
]

export const getDocById = (id: string): MainDoc | undefined => {
  return mainDocs.find((doc) => doc.id === id)
}

export const getDocsByCategory = (category?: string): MainDoc[] => {
  if (!category) return mainDocs
  return mainDocs.filter((doc) => doc.category === category)
}
