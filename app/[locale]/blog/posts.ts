export const testPosts = [
  {
    id: '20250527-robot-ctust-created',
    title: '機器人研究社成立',
    publishedAt: '2025-05-27',
    content:
      '在 5/23 提交社團成立申請後，5/27 創立社團成功，開始籌備社團所需資源，以在下學期開始運作。',
  },
  {
    id: '20250323-robot-ctust-preparing',
    title: '準備創立機器人研究社',
    publishedAt: '2025-03-23',
    content:
      '社團幹部組織中，並招募初始社員以達到社團成立所需人數，並且開始規劃社團的發展方向及成立社團所需文件。',
  },
]

export const getPostById = (id: string) => {
  return testPosts.find((post) => post.id === id)
}
