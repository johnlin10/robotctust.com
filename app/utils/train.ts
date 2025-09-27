/**
 * 車站資訊介面
 */
interface Station {
  stationId:
    | 'taipei'
    | 'newTaipei'
    | 'taoyuan'
    | 'miaoli'
    | 'taichung'
    | 'tainan'
    | 'kaohsiung'
    | 'pingtung'
  stationName:
    | '台北'
    | '新北'
    | '桃園'
    | '苗栗'
    | '台中'
    | '台南'
    | '高雄'
    | '屏東'
}

/**
 * 座位資訊介面
 */
interface Seat {
  seatId: number
  isBooked: boolean
  bookingStations: Station[]
}

/**
 * 車廂資訊介面
 */
interface Train {
  trainId: number // 車廂編號
  seats: Seat[]
}

/**
 * 訂票系統主要資料型別
 */
type TrainData = Train[]

/**
 * 訂位資料
 */
interface Booking {
  trainId: number
  seatId: number
  bookingStation: Station[]
}

const data: TrainData = [
  {
    trainId: 1, //車廂編號
    seats: [
      {
        seatId: 1, //座位編號
        isBooked: false,
        // 訂位站點
        bookingStations: [
          {
            stationId: 'taipei',
            stationName: '台北',
          },
          {
            stationId: 'newTaipei',
            stationName: '新北',
          },
          {
            stationId: 'taoyuan',
            stationName: '桃園',
          },
          {
            stationId: 'miaoli',
            stationName: '苗栗',
          },
          {
            stationId: 'taichung',
            stationName: '台中',
          },
        ],
      },
      {
        seatId: 2,
        isBooked: false,
        bookingStations: [
          {
            stationId: 'taoyuan',
            stationName: '桃園',
          },
          {
            stationId: 'miaoli',
            stationName: '苗栗',
          },
          {
            stationId: 'taichung',
            stationName: '台中',
          },
          {
            stationId: 'tainan',
            stationName: '台南',
          },
        ],
      },
      {
        seatId: 3,
        isBooked: false,
        bookingStations: [
          {
            stationId: 'taichung',
            stationName: '台中',
          },
          {
            stationId: 'tainan',
            stationName: '台南',
          },
          {
            stationId: 'kaohsiung',
            stationName: '高雄',
          },
        ],
      },
    ],
  },
  {
    trainId: 1, //車廂編號
    seats: [
      {
        seatId: 1, //座位編號
        isBooked: false,
        // 訂位站點
        bookingStations: [
          {
            stationId: 'taipei',
            stationName: '台北',
          },
          {
            stationId: 'newTaipei',
            stationName: '新北',
          },
          {
            stationId: 'taoyuan',
            stationName: '桃園',
          },
          {
            stationId: 'miaoli',
            stationName: '苗栗',
          },
          {
            stationId: 'taichung',
            stationName: '台中',
          },
        ],
      },
      {
        seatId: 2,
        isBooked: false,
        bookingStations: [
          {
            stationId: 'taoyuan',
            stationName: '桃園',
          },
          {
            stationId: 'miaoli',
            stationName: '苗栗',
          },
          {
            stationId: 'taichung',
            stationName: '台中',
          },
          {
            stationId: 'tainan',
            stationName: '台南',
          },
        ],
      },
      {
        seatId: 3,
        isBooked: false,
        bookingStations: [
          {
            stationId: 'taichung',
            stationName: '台中',
          },
          {
            stationId: 'tainan',
            stationName: '台南',
          },
          {
            stationId: 'kaohsiung',
            stationName: '高雄',
          },
        ],
      },
    ],
  },
]

/**
 * 檢查新的訂位是否可用 - 訂票系統核心邏輯
 * @param newBooking 新的訂位請求
 * @returns 返回字串 '可訂位' (無衝突) 或 '不可訂位' (有衝突)
 */
function isBookingAvailable(newBooking: Booking) {
  //* 核心檢查邏輯：三層巢狀遍歷
  const isAvailable = data.some(
    (
      train // 遍歷所有車廂
    ) =>
      train.seats.some(
        (
          seat // 遍歷車廂內的所有座位
        ) =>
          seat.bookingStations.some(
            (
              station // 檢查座位的預訂站點
            ) => newBooking.bookingStation.includes(station) // 判斷新訂位站點是否與現有預訂重疊
          )
      )
  )

  return isAvailable ? '可訂位' : '不可訂位'
}

isBookingAvailable({
  trainId: 1,
  seatId: 1,
  bookingStation: [
    {
      stationId: 'taipei',
      stationName: '台北',
    },
    {
      stationId: 'newTaipei',
      stationName: '新北',
    },
  ],
})
