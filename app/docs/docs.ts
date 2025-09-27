import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faMoneyBillWave,
  faScrewdriverWrench,
  faSitemap,
  faFlag,
} from '@fortawesome/free-solid-svg-icons'

export interface Doc {
  id: string
  title: string
  description: string
  filePath: string
  icon: IconDefinition
  category?: string
}

export const docs: Doc[] = [
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

export const getDocById = (id: string): Doc | undefined => {
  return docs.find((doc) => doc.id === id)
}

export const getDocsByCategory = (category?: string): Doc[] => {
  if (!category) return docs
  return docs.filter((doc) => doc.category === category)
}
