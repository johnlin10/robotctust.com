import { Competition } from '../types/competition'

/**
 * 競賽資料範例
 * 用於開發測試和初始資料
 */
export const competitions: Competition[] = [
  {
    id: 'obstacle-avoidance-2025-11-12',
    title: '機器人避障競賽',
    description:
      '本競賽旨在挑戰機器人的自主避障與導航能力。參賽機器人需在布滿寶特瓶與障礙物的賽場內，從起點區移動至終點區後再折返回到起點。競賽考驗隊伍的程式設計、感測器應用與硬體整合能力，目標是以最短時間完成來回全程。',
    detailMarkdown: `
### 競賽規則

1. 參加隊伍於比賽前由裁判抽出出場順序。
2. 每隊限一名操控手下場操控自走車。機器人無須先碰觸邊界，吹哨後即可開始。
3. 比賽開始前，所有參賽的自走車均須置放於大會指定的區域，輪到下場比賽的隊伍，操控手須在裁判示意下拿取自己的自走車下場比賽。
4. 比賽時每次一個自走車下場比賽，先就位於起跑線，當裁判發出哨聲後，操控手即可啟動自走車向終點線方向行走； 當自走車的車體全部越過終點線後，操控手即自行拿取自走車，置於終點線後方，並使它往起跑線方向行走。
5. 自走車啟動後，除第一次越過終點線時，操控手即不可再碰觸自走車，也不可以任何遙控方式遙控自走車。違反本條規定者，該自走車即須退場，不計成績。
6. 比賽中自走車任一部位撞牆、撞倒任一個寶特瓶或障礙柱體、或任一個輪子壓到邊線者即須退場，以當時的位置計算行走距離。
7. 比賽成績以自走車走完全程(自起跑線起，越過終點線，再反方向回到起跑線後方)的時間為計算標準，時間越短者成績越高。
8. 每隊有3分鐘比賽時間，在比賽時間內，共有至多2次比賽機會，以較高成績進行排名。
9. 無法走完全程者(包含因撞牆、撞倒寶特瓶/障礙柱體或壓到邊線而退場者)，以該自走車的行走的距離為計算標準，距離越遠者成績越高。此一距離的量測以一段為一個單位，未滿一段者不予計算。
10. 排名以走完全程者為優先、多隊完成全程則比較完成時間，時間短者為優。無法走完全程的隊伍，則以行走距離遠(行走段數高)者為優。相同行走距離(段數)者，以終止時間短者為優。
11. 比賽開始後，選手不得再對自走車所有的組件進行調整或置換(含程式、電池及電路板等)，也不得要求暫停。
12. 比賽場所的照明、溫度、濕度… 者等，均為普通的環境程度，參賽隊伍不得要求作任何改變。
13. 本規則未提及事宜，由裁判在現場根據實際情況裁定。

### 機器人的規定

1. 機器人必須為自立型，不得以有線、無線射頻或紅外線遙控。
2. 自走車機構總主機(控制器)數僅限一台。
3. 於競賽全程，機器人之整體長度（L）≤ 30cm、寬度（W）≤ 30cm、高度（H）不限。
4. 機器人限為輪型之運動方式。
5. 機器人重量無任何限制。
6. 本競賽所有挑戰均為全自主運動。

### 比賽場地

1. 比賽場地如圖所示，為一般的學校教室地板 (可能有某種程度的不平坦)，會在地面上放底圖上面有標示段數，尺寸是5.8m乘2.3m，左右邊有黑色跟紅色邊線。
2. 比賽時將於場地內不等距離的放置 15 個以上的寶特瓶及 2 個長寬均10cm、高30cm的紙做的障礙柱體(位置約在1/3、2/3處)，部分寶特瓶距離邊緣約 2 公分，每兩個寶特瓶(或障礙柱體)間的距離大於 50 公分；邊線上每隔約 1 公尺放置 1 個寶特瓶。
3. 寶特瓶的容量約 0.6 公升，圓柱形，不裝瓶蓋，瓶口着地倒立，外表可能有貼產品標籤。寶特瓶的放置數量及位置以比賽現場的為準，每一場均相同。
4. 底圖上將標示距離終點線的段數，每段的距離大約相等，約 100 公分。
5. 本規則對場地所描述或註記的尺寸均為概略值，實際尺寸以比賽現場的配置為準。

![比賽場地](https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/competitions%2Fobstacle-avoidance-2025-11-12%2FSCR-20250916-tjqm.png?alt=media&token=cec28647-6068-4477-b4fa-be5124243473)
    `,
    status: 'upcoming',
    position: 'club',
    timeline: [
      {
        id: 'obstacle-avoidance-2025-11-12-registration',
        step: 'registration',
        stepName: '報名階段',
        startDateTime: {
          date: null,
          time: null,
        },
        endDateTime: {
          date: '2025-11-12',
          time: '14:00',
        },
        description: '報名階段',
        required: true,
        order: 1,
      },
      {
        id: 'obstacle-avoidance-2025-11-12-final',
        step: 'final',
        stepName: '決賽',
        startDateTime: {
          date: '2025-11-12',
          time: '14:00',
        },
        endDateTime: {
          date: '2025-11-12',
          time: '16:00',
        },
        description: '最終挑戰，複雜軌道測試',
        required: true,
        order: 1,
      },
      {
        id: 'obstacle-avoidance-2025-11-12-result-announcement',
        step: 'result',
        stepName: '成績公布',
        startDateTime: {
          date: '2025-11-12',
          time: '16:00',
        },
        endDateTime: {
          date: null,
          time: null,
        },
        description: '公布成績並進行技術分享',
        required: true,
        order: 2,
      },
    ],
    link: '',
    image:
      'https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/competitions%2Fobstacle-avoidance-2025-11-12%2FSCR-20250916-tjqm.png?alt=media&token=cec28647-6068-4477-b4fa-be5124243473',
    tags: ['競賽', '機器人', '避障', '障礙挑戰'],
    priority: 2,
    createdAt: {
      date: '2025-09-16',
      time: '22:30',
    },
    updatedAt: {
      date: '2025-09-16',
      time: '22:30',
    },
    published: true,
    estimatedParticipants: 40,
    registrationFee: 0,
    rewards: ['獲得排列名次及佳作的隊伍依本大賽辦法發給選手獎狀'],
    contact: {
      email: 'robotctust@gmail.com',
      phone: '',
      person: '中臺機器人研究社',
    },
  },
  {
    id: 'line-following-2025-12-31',
    title: '機器人循跡競賽',
    description:
      '這是一場考驗機器人精準循跡能力的經典競賽。參賽機器人必須沿著指定的黑色軌跡線，從起點自主行走到終點。競賽著重於感測器的精準度與控制演算法的效率，目標是在最短時間內穩定且快速地完成賽道。',
    detailMarkdown: `
### 競賽規則

1. 出賽次序：參加隊伍於比賽前由裁判抽出出場順序。
2. 操控手人數：每隊限一名操控手下場操控機器人。
3. 比賽開始前，所有參賽的機器人均須置放於大會指定的區域，輪到下場比賽的隊伍，操控手須在裁判示意下拿取自己的機器人下場比賽。
4. 準備狀態：比賽時每次一個機器人下場比賽，先就位於起點處，機器人本體不得超出黑色長方形，並且不可先啟動馬達。
5. 比賽任務：當裁判發出哨聲後，操控手即可啟動機器人沿著黑色軌跡線向終點方向行走。
6. 比賽時間：每隊有5分鐘的比賽時間。 
7. 比賽次數：每隊在比賽時間內，共有至多3次比賽機會，以較高成績進行排名。
8. 比賽終止：比賽時間結束，比賽終止，以當時的情況計算比賽成績。
9. 失去比賽機會：當發生以下情況，失去一次比賽機會，如比賽機會已用完，則結束比賽。
  9-1. 脫離軌跡線：機器人脫離軌跡線行走，即車體的正投影未全部覆蓋在軌跡線上。
  9-2. 停止不動：機器人停止不動超過10秒。
  9-3. 原地打轉：機器人原地打轉超過10秒。
  9-4. 跌落場地：機器人跌落場地外或是卡在場地邊緣無法繼續行進。
10. 成績計算：比賽以下列兩種方式計算成績：
  10-1. 走完全程：以走完全程的時間為計算標準，時間越短者成績越高。機器人的前緣通過終點線時，必須立即停止，車體的正投影必須覆蓋住終點線的全部或一部分，否則比賽時間加計5秒。
  10-2. 未走完全程：以該機器人已行走的距離為計算標準，距離越遠者成績越高。
11. 機器人的行走距離以標註於軌跡線旁的距離段數計算，未滿一段者不計算。機器人遇到比賽時間結束、脫離軌跡線、重複行走、停止不動、原地打轉，以當時的位置計算比賽成績。
12. 名次排列：
  12-1. 以走完全程者先排列名次，時間越短者排名越前。時間相同的隊伍加場比賽，直到可決定先後名次為止。
  12-2. 未走完全程者，排名於走完全程者之後，以行走距離為排名依據，行走距離越遠者，排名越前。行走距離相同者，以行走時間越短者排名在前。
13. 禁止事項：比賽開始後，操控手不得對機器人所有的組件進行調整或置換(含程式、電池及電路板等)，也不得要求暫停。
14. 適應環境：比賽場所的照明、溫度、濕度…者等，均為普通的環境程度，參賽作品必須能適應現場的環境，參賽隊伍不得要求作任何改變。
15. 本規則未提及事宜，由裁判在現場根據實際情況裁定。


### 機器人的規定

1. 機器人必須為自立型，不得以有線、無線射頻或紅外線遙控。
2. 自走車機構總主機(控制器)數僅限一台。
3. 於競賽全程，機器人之整體長度（L）≤ 30cm、寬度（W）≤ 30cm、高度（H）不限。
4. 機器人限為輪型之運動方式。
5. 機器人重量無任何限制。
6. 本競賽所有挑戰均為全自主運動。


### 比賽場地

1. 比賽底面為海報紙拼接或大圖印刷，並使用黑色膠帶製作線路，寬度為2公分
2. 本規則對場地所描述或註記的尺寸均為概略值，實際尺寸以比賽現場的配置為準。
3. 出發和終點以黑色膠帶貼出長方形。
    `,
    status: 'upcoming',
    position: 'club',
    timeline: [
      {
        id: 'line-following-2025-12-31-registration',
        step: 'registration',
        stepName: '報名階段',
        startDateTime: {
          date: null,
          time: null,
        },
        endDateTime: {
          date: '2025-12-31',
          time: '14:00',
        },
        description: '最終挑戰，複雜軌道測試',
        required: true,
        order: 1,
      },
      {
        id: 'line-following-2025-12-31-final',
        step: 'final',
        stepName: '決賽',
        startDateTime: {
          date: '2025-12-31',
          time: '14:00',
        },
        endDateTime: {
          date: '2025-12-31',
          time: '16:00',
        },
        description: '最終挑戰，複雜軌道測試',
        required: true,
        order: 1,
      },
      {
        id: 'line-following-2025-12-31-result',
        step: 'result',
        stepName: '成績公布',
        startDateTime: {
          date: '2025-12-31',
          time: '16:00',
        },
        endDateTime: {
          date: null,
          time: null,
        },
        description: '公布成績並進行技術分享',
        required: true,
        order: 2,
      },
    ],
    link: '',
    image: '',
    tags: ['競賽', '機器人', '循跡', '感測器'],
    priority: 2,
    createdAt: {
      date: '2025-09-16',
      time: '22:30',
    },
    updatedAt: {
      date: '2025-09-17',
      time: '11:15',
    },
    published: true,
    estimatedParticipants: 40,
    registrationFee: 0,
    rewards: ['獲得排列名次及佳作的隊伍依本大賽辦法發給選手獎狀'],
    contact: {
      email: 'robotctust@gmail.com',
      phone: '',
      person: '中臺機器人研究社',
    },
  },
  {
    id: 'aerc-a01-line-following-2025-11-22',
    title: '2025AERC 亞洲智慧型機器人大賽第 37 屆 - A01 機器人循跡挑戰',
    description:
      'AERC 亞洲智慧型機器人大賽的經典循跡挑戰賽。此競賽不僅考驗感測器應用與控制演算法，更加入了刺激的「魔王」與「天使」挑戰賽制，為比賽增添更多策略性。歡迎各路好手前來挑戰速度極限或時間掌控的雙重考驗。',
    detailMarkdown: `
「A01 機器人循跡挑戰」是一項考驗 **感測器應用與控制演算法** 的競賽，參賽隊伍需設計自主移動的機器人，在限定時間內依照比賽場地的黑色軌跡線行進，並通過不同難度的挑戰。  

### 競賽特色
- **自主移動**：機器人不得使用遙控，必須依靠感測器與程式自行完成循跡。
- **組別多元**：依照零組件來源分為 A（LEGO）、B（益眾科技）、C（Makeblock）、D（不限廠牌）四組，讓不同平台的作品都能公平競賽。
- **場地挑戰**：軌跡線路徑各具特色，還包含避障區（如寶特瓶）與返跑限制。
- **隱藏賽制**：比賽當天可能抽到「魔王挑戰賽」或「天使挑戰賽」：
  - **魔王挑戰賽**：最快完成賽道者可額外獲得獎金。  
  - **天使挑戰賽**：最接近 60 秒完成賽道者可額外獲得獎金。  

### 評分方式
- 依照到達終點的 **時間長短** 或 **特定條件（隱藏賽制）** 排名。  
- 各組別獨立頒發獎項，並額外設有「魔王獎金」、「天使獎金」等特別獎勵。  

### 報名資訊
- **報名費用**：新台幣 1,000 元  
- **參賽對象**：不限背景，對機器人循跡技術有興趣的隊伍皆可參加  
- **注意事項**：比賽當日場地圖將以抽籤決定，實際規格與障礙物配置以現場為準。  

### 延伸閱讀
👉 詳細規則請參考：[官方競賽規則 PDF](https://www.robot-ctust.com/competitions/line-following/rules)  

---

本賽事不僅是速度的比拚，更是 **感測器整合、控制策略與臨場應變** 的全面挑戰，歡迎各路高手前來挑戰！
    `,
    status: 'upcoming',
    position: 'national',
    timeline: [
      {
        id: 'aerc-a01-line-following-2025-11-22-registration',
        step: 'registration',
        stepName: '報名階段',
        startDateTime: {
          date: null,
          time: null,
        },
        endDateTime: {
          date: '2025-10-20',
          time: '12:00',
        },
        description: '開放報名，歡迎所有對循跡技術有興趣的同學',
        required: true,
        order: 1,
      },
      {
        id: 'aerc-a01-line-following-2025-11-22-final',
        step: 'final',
        stepName: '決賽',
        startDateTime: {
          date: '2025-11-22',
          time: '09:00',
        },
        endDateTime: {
          date: '2025-11-22',
          time: '15:00',
        },
        timeline: [
          {
            stepName: '報到時間',
            startTime: '09:00',
            endTime: '11:50',
          },
          {
            stepName: '練習時間',
            startTime: '10:30',
            endTime: '11:50',
          },
          {
            stepName: '檢錄',
            startTime: '12:20',
            endTime: '13:10',
          },
          {
            stepName: '比賽時間',
            startTime: '13:20',
            endTime: null,
          },
        ],
        description: '最終挑戰，複雜軌道測試',
        required: true,
        order: 2,
      },
      {
        id: 'aerc-a01-line-following-2025-11-22-result',
        step: 'result',
        stepName: '成績公布',
        startDateTime: {
          date: '2025-11-22',
          time: null, // 視情況而定
        },
        endDateTime: {
          date: null,
          time: null,
        },
        description: '公布成績並進行技術分享',
        required: true,
        order: 3,
      },
    ],
    link: 'https://www.aerc1988.com.tw/index.html',
    image:
      'https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/competitions%2Faerc-a01-line-following-2025-11-22%2FAERC2025-37.jpg?alt=media&token=85ab7299-a44d-4295-8ad7-88f69081c703',
    tags: ['競賽', '機器人', '循跡', '感測器', 'AERC'],
    priority: 10,
    createdAt: {
      date: '2025-09-17',
      time: '10:30',
    },
    updatedAt: {
      date: '2025-09-17',
      time: '10:30',
    },
    published: true,
    estimatedParticipants: 0,
    registrationFee: 1000,
    rewards: [
      '得排列名次及佳作的隊伍依本大賽辦法發給指導老師及選手獎狀電子檔進行下載，並提供排列名次的獲獎隊伍一座獎盃。',
    ],
    contact: {
      email: '',
      phone: '',
      person: '',
    },
  },
  {
    id: 'aerc-a02-obstacle-avoidance-2025-11-22',
    title: '2025AERC 亞洲智慧型機器人大賽第 37 屆 - A02 機器人程控障礙挑戰',
    description:
      'AERC 亞洲智慧型機器人大賽的程控障礙挑戰賽。參賽機器人需在充滿寶特瓶與未知ㄇ型障礙物的場地中，自主完成前進、折返的任務。賽前將隨機變動部分障礙物位置，極度考驗機器人的環境感知與即時路徑規劃能力。',
    detailMarkdown: `
「A02 機器人程控障礙挑戰」是一項結合 **自主導航、程式控制與障礙規劃** 的競賽。參賽隊伍需設計能在限定場地中前進、迴轉並避開障礙的機器人，在時間限制內完成挑戰。

### 競賽特色
- **自主操作**：機器人必須全程程控運作，禁止任何形式的遙控。  
- **組別劃分**：依照零組件來源分為 A（LEGO）、B（益眾科技）、C（Makeblock）、D（不限廠牌）四組，各組獨立競賽與頒獎。  
- **挑戰場地**：  
  - 賽道長度約 5 公尺，含起點區與中點區。  
  - 場地內放置 **15 個以上寶特瓶**（含裝水的邊界瓶與倒立的場內瓶）。  
  - **ㄇ型障礙物**將於比賽當天公布位置與方向。  
- **變數挑戰**：比賽前會隨機變更 **1/3 寶特瓶位置**，考驗機器人環境適應性。  

### 競賽規則
- **比賽流程**  
  - 機器人自起點區出發，須抵達中點區，再折返至起點區才算完成全程。  
  - 每隊限一名操控手，啟動後不得觸碰機器人。  
- **比賽時間**：每隊 60 秒，可進行最多 2 次挑戰。  
  - 若第 1 次挑戰出界或失敗，可啟用第 2 次機會，計時從第 1 次的秒數繼續累積。  
- **成績計算**  
  1. **完成全程**：依完成時間排名，時間短者勝。  
  2. **未完成全程**：依「行走段數」判定（越多段越優，折返後越接近起點越優）。  
- **比賽終止條件**：撞倒寶特瓶/圍牆/障礙物、出界、超時或觸碰機器人。  

### 延伸閱讀
👉 詳細規則請參考：[官方競賽規則 PDF](https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/competitions%2Faerc-a02-obstacle-avoidance-2025-11-22%2FA02%20%E6%A9%9F%E5%99%A8%E4%BA%BA%E7%A8%8B%E6%8E%A7%E9%9A%9C%E7%A4%99%E6%8C%91%E6%88%B0-%E6%AF%94%E8%B3%BD%E8%A6%8F%E5%89%87(250911).pdf?alt=media&token=46c980c9-405b-48f7-b52c-125cf97729d9)  

---

這項比賽不僅考驗速度，更強調 **程式規劃能力、障礙應對策略與臨場穩定性**，是綜合性極高的挑戰！
    `,
    status: 'upcoming',
    position: 'national',
    timeline: [
      {
        id: 'aerc-a02-obstacle-avoidance-2025-11-22-registration',
        step: 'registration',
        stepName: '報名階段',
        startDateTime: {
          date: null,
          time: null,
        },
        endDateTime: {
          date: '2025-10-20',
          time: '12:00',
        },
        description: '開放報名，歡迎所有對循跡技術有興趣的同學',
        required: true,
        order: 1,
      },
      {
        id: 'aerc-a02-obstacle-avoidance-2025-11-22-final',
        step: 'final',
        stepName: '決賽',
        startDateTime: {
          date: '2025-11-22',
          time: '09:00',
        },
        endDateTime: {
          date: '2025-11-22',
          time: '15:00',
        },
        timeline: [
          {
            stepName: '報到時間',
            startTime: '09:00',
            endTime: '11:50',
          },
          {
            stepName: '練習時間',
            startTime: '10:30',
            endTime: '11:50',
          },
          {
            stepName: '檢錄',
            startTime: '12:20',
            endTime: '13:10',
          },
          {
            stepName: '比賽時間',
            startTime: '13:20',
            endTime: null,
          },
        ],
        description: '最終挑戰，複雜軌道測試',
        required: true,
        order: 2,
      },
      {
        id: 'aerc-a02-obstacle-avoidance-2025-11-22-result',
        step: 'result',
        stepName: '成績公布',
        startDateTime: {
          date: '2025-11-22',
          time: null, // 視情況而定
        },
        endDateTime: {
          date: null,
          time: null,
        },
        description: '公布成績並進行技術分享',
        required: true,
        order: 3,
      },
    ],
    link: 'https://www.aerc1988.com.tw/index.html',
    image:
      'https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/competitions%2Faerc-a01-line-following-2025-11-22%2FAERC2025-37.jpg?alt=media&token=85ab7299-a44d-4295-8ad7-88f69081c703',
    tags: ['競賽', '機器人', '程式控制', '障礙挑戰', 'AERC'],
    priority: 10,
    createdAt: {
      date: '2025-09-17',
      time: '10:30',
    },
    updatedAt: {
      date: '2025-09-17',
      time: '10:30',
    },
    published: true,
    estimatedParticipants: 0,
    registrationFee: 1000,
    rewards: [
      '得排列名次及佳作的隊伍依本大賽辦法發給指導老師及選手獎狀電子檔進行下載，並提供排列名次的獲獎隊伍一座獎盃。',
    ],
    contact: {
      email: '',
      phone: '',
      person: '',
    },
  },
]

//   {
//     id: 'obstacle-avoidance-2025-11',
//     title: '機器人避障比賽',
//     description: '測試機器人自主避障能力的競賽，考驗程式設計與硬體整合技術',
//     detailMarkdown: `
// # 機器人避障比賽

// ## 比賽規則

// ## 機器人的規定

// ## 比賽場地

// ## 評分標準
// 1. 完成時間 (50%)
// 2. 路線流暢度 (30%)
// 3. 技術創新性 (20%)
//     `,
//     status: 'upcoming',
//     position: 'club',
//     timeline: [
//       {
//         id: 'registration-phase',
//         step: 'registration',
//         stepName: '報名階段',
//         startDateTime: {
//           date: '2025-10-01',
//           time: '09:00',
//         },
//         endDateTime: {
//           date: '2025-11-01',
//           time: '12:00',
//         },
//         description: '開放報名，請準備團隊資料',
//         required: true,
//         order: 1,
//       },
//       {
//         id: 'preliminary-round',
//         step: 'pre',
//         stepName: '初賽',
//         startDateTime: {
//           date: '2025-11-10',
//           time: '14:00',
//         },
//         endDateTime: {
//           date: '2025-11-10',
//           time: '16:00',
//         },
//         description: '篩選出前8名隊伍進入決賽',
//         required: true,
//         order: 2,
//       },
//       {
//         id: 'final-round',
//         step: 'final',
//         stepName: '決賽',
//         startDateTime: {
//           date: '2025-11-12',
//           time: '14:00',
//         },
//         endDateTime: {
//           date: '2025-11-12',
//           time: '16:00',
//         },
//         description: '最終決賽，決定冠亞季軍',
//         required: true,
//         order: 3,
//       },
//       {
//         id: 'result-announcement',
//         step: 'result',
//         stepName: '成績公布',
//         startDateTime: {
//           date: '2025-11-12',
//           time: '17:00',
//         },
//         endDateTime: {
//           date: null,
//           time: null,
//         },
//         description: '公布最終成績與頒獎',
//         required: true,
//         order: 4,
//       },
//     ],
//     link: 'https://www.robot-ctust.com/competitions/obstacle-avoidance',
//     image: 'https://www.robot-ctust.com/images/obstacle-avoidance.png',
//     tags: ['競賽', '機器人', '避障', '自主導航'],
//     priority: 1,
//     createdAt: {
//       date: '2025-09-16',
//       time: '10:00',
//     },
//     updatedAt: {
//       date: '2025-09-16',
//       time: '10:00',
//     },
//     published: true,
//     estimatedParticipants: 20,
//     registrationFee: 200,
//     rewards: [
//       '冠軍獎金 5000元',
//       '亞軍獎金 3000元',
//       '季軍獎金 1000元',
//       '參賽證書',
//     ],
//     contact: {
//       email: 'competitions@robot-ctust.com',
//       phone: '04-1234-5678',
//       person: '王小明',
//     },
//   },
