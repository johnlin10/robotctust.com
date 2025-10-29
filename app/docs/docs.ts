import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faYoutube } from '@fortawesome/free-brands-svg-icons'
import {
  faMoneyBillWave,
  faScrewdriverWrench,
  faSitemap,
  faFlag,
  faFilePdf,
  faFileZipper,
} from '@fortawesome/free-solid-svg-icons'
import { faGoogleDrive } from '@fortawesome/free-brands-svg-icons'

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
  date: string
  docs: {
    id: string
    title: string
    type: string
    icon?: IconDefinition
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
        id: '',
        title: '社團課程二：自走車 DIY 程式',
        date: '2025-10-29',
        docs: [
          {
            id: 'course-files',
            title: '課程檔案',
            type: 'Google Drive',
            filePath:
              'https://drive.google.com/file/d/160gQWxHVaPKHgnUntrqarZjABug6BFP6/view',
            icon: faGoogleDrive,
          },
          {
            id: 'course-files-backup',
            title: '課程檔案 - 備用',
            type: 'zip',
            filePath:
              'https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/docs%2Fcourse-2%2F%E4%B8%AD%E8%87%BA%E7%A7%91%E6%8A%80%E5%A4%A7%E5%AD%B8%E6%A9%9F%E5%99%A8%E4%BA%BA%E7%A0%94%E7%A9%B6%E7%A4%BE.zip?alt=media&token=3a485f28-4c74-4c3d-bc44-04d45d4d220b',
            icon: faFileZipper,
          },
          {
            id: 'arduino-ide-installation-and-usage-youtube',
            title: 'Arduino IDE 安裝及使用 - 影片',
            type: 'YouTube',
            filePath: 'https://youtu.be/8ex5UKQ1Ycc',
            icon: faYoutube,
          },
          {
            id: 'arduino-ide-installation-and-usage-google-drive',
            title: 'Arduino IDE 安裝及使用 - 簡報',
            type: 'Google Drive',
            filePath:
              'https://drive.google.com/file/d/1E9K2VmNAzUmeRdLW2MdOmULmKpawgEBK/view?usp=sharing',
            icon: faGoogleDrive,
          },
        ],
      },
      {
        id: 'self-driving-car-diy',
        title: '活動一：自走車 DIY',
        date: '2025-10-15',
        docs: [
          {
            id: 'robot-assembly-video',
            title: '組裝教學 - 影片（操作輔助）',
            type: 'YouTube',
            icon: faYoutube,
            filePath: 'https://youtu.be/HhG5myv6M7U?si=HgfGJer5YGahbAPB',
          },
          {
            id: 'robot-assembly-presentation',
            title: '組裝教學 - 簡報（較為詳細）',
            type: 'Google Drive',
            icon: faGoogleDrive,
            filePath:
              'https://drive.google.com/file/d/12ga_JdiZKvN7JBrb-lCwNumennulMLgp/view?usp=sharing',
          },
          {
            id: 'robot-assembly-circuit-diagram-1',
            title: '機器人電路組裝指南',
            type: 'PDF',
            icon: faFilePdf,
            filePath:
              'https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/docs%2Frobot-assembly-circuit-diagram%2F%E6%A9%9F%E5%99%A8%E4%BA%BA%E6%8E%A5%E7%B7%9A%E5%9C%96.pdf?alt=media&token=cf1bace6-5ed8-4e51-8f38-91d2dfefe49d',
          },
          {
            id: 'robot-assembly-kit-list',
            title: '社團機器人套件清單',
            type: 'Google Drive',
            icon: faGoogleDrive,
            filePath:
              'https://drive.google.com/file/d/12cWAfX7NYqm5dSxTtXfwliN7BkqgN4ua/view?usp=sharing',
          },
          {
            id: 'arduino-nano-main-board-pinout',
            title: 'Arduino Nano 主板腳位',
            type: 'Google Drive',
            icon: faGoogleDrive,
            filePath:
              'https://drive.google.com/file/d/1d1pzAu7U5ny5EnC_VM-ETmBtmdfrXV_G/view?usp=sharing',
          },
          {
            id: 'arduino-nano-extension-board-pinout',
            title: 'Arduino Nano 擴展板腳位',
            type: 'Google Drive',
            icon: faGoogleDrive,
            filePath:
              'https://drive.google.com/file/d/1GCzkVwx3AO1Q1PDgjWtqsq92GhJhHZsh/view?usp=sharing',
          },
          {
            id: 'l9110s-motor-driver-board-pinout',
            title: 'L9110S 馬達驅動板腳位',
            type: 'Google Drive',
            icon: faGoogleDrive,
            filePath:
              'https://drive.google.com/file/d/1aGoymV4LQiIO21juWsIJ_zdaiNwoQqZ3/view?usp=sharing',
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
