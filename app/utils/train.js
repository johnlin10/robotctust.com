var data = [
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
// 判斷新的訂位是否會與已有的訂位衝突，如果衝突則回傳 false，否則回傳 true
function isBookingAvailable(newBooking) {
  var isAvailable = data.some(function (train) {
    return train.seats.some(function (seat) {
      return seat.bookingStations.some(function (station) {
        return newBooking.bookingStation.includes(station)
      })
    })
  })
  return isAvailable ? console.log('可訂位') : console.log('不可訂位')
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
