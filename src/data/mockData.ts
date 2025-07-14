import { Post, User } from '../types';

const users: User[] = [
  {
    id: '1',
    username: 'sakura_style',
    displayName: '桜スタイル',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isVerified: true
  },
  {
    id: '2',
    username: 'tokyo_foodie',
    displayName: '東京フーディー',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    username: 'nature_lover_jp',
    displayName: '自然愛好家',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    username: 'travel_japan',
    displayName: '日本旅行記',
    avatar: 'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isVerified: true
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    user: users[0],
    imageUrl: '/images/img1.png',
    caption: '中村咲太先生の遠隔ヒーリングワークショップに参加しました✨ エネルギーの流れを感じながら、心の奥深くにある愛と光に触れることができました。宇宙との繋がりを実感し、魂が浄化されていく感覚が忘れられません 🌟 #中村咲太WSヒーリングシェア',
    likes: 1247,
    comments: [
      {
        id: '1',
        user: users[1],
        text: '私も参加したかったです！素晴らしい体験ですね💕',
        timestamp: '2h',
        likes: 12
      },
      {
        id: '2',
        user: users[2],
        text: 'エネルギーの変化を感じられましたか？',
        timestamp: '1h',
        likes: 8
      }
    ],
    timestamp: '3h',
    tags: ['ヒーリング', 'スピリチュアル', '愛と光'],
    location: 'オンライン',
    isLiked: false,
    isSaved: false,
    source: 'mock' as const
  },
  {
    id: '2',
    user: users[1],
    imageUrl: '/images/img2.png',
    caption: '中村咲太先生のワークショップで体験した遠隔ヒーリング🌈 距離を超えて伝わってくる温かなエネルギーに包まれ、涙が自然と溢れました。過去の傷が癒され、新しい自分に生まれ変わったような感覚です。感謝の気持ちでいっぱい 🙏 #中村咲太WSヒーリングシェア',
    likes: 892,
    comments: [
      {
        id: '3',
        user: users[3],
        text: '本当に素晴らしい体験でしたね！',
        timestamp: '4h',
        likes: 5
      }
    ],
    timestamp: '5h',
    tags: ['遠隔ヒーリング', '癒し', '感謝'],
    location: 'オンライン',
    isLiked: true,
    isSaved: true,
    source: 'mock' as const
  },
  {
    id: '3',
    user: users[2],
    imageUrl: '/images/img3.png',
    caption: '中村咲太先生のヒーリングワークショップで感じた深い平安 🕊️ 瞑想の中で見えた光の世界は、まさに天国のようでした。チャクラが開かれ、生命エネルギーが全身を駆け巡る感覚。この体験を通して、本当の自分と出会えた気がします ✨ #中村咲太WSヒーリングシェア',
    likes: 2156,
    comments: [
      {
        id: '4',
        user: users[0],
        text: '光の世界、私も体験してみたいです！',
        timestamp: '6h',
        likes: 15
      },
      {
        id: '5',
        user: users[1],
        text: 'チャクラの開放、素晴らしい体験ですね🌟',
        timestamp: '5h',
        likes: 9
      }
    ],
    timestamp: '8h',
    tags: ['瞑想', 'チャクラ', '覚醒'],
    location: 'オンライン',
    isLiked: false,
    isSaved: false,
    source: 'mock' as const
  },
  {
    id: '4',
    user: users[3],
    imageUrl: '/images/img4.png',
    caption: '長年抱えていた心の重荷が、まるで波に洗い流されるように消えていきました。先生の愛に満ちたエネルギーが、私の魂の奥底まで届いたのを感じます。人生が変わる瞬間でした 💎 #中村咲太WSヒーリングシェア',
    likes: 1834,
    comments: [
      {
        id: '6',
        user: users[2],
        text: '本当に人生が変わりますよね✨',
        timestamp: '2h',
        likes: 7
      }
    ],
    timestamp: '12h',
    tags: ['奇跡', '変容', '魂の癒し'],
    location: 'オンライン',
    isLiked: true,
    isSaved: false,
    source: 'mock' as const
  },
  {
    id: '5',
    user: users[0],
    imageUrl: '/images/img5.png',
    caption: '愛の本質 💖 ヒーリングを受けながら、宇宙の無条件の愛を体感しました。すべての存在が繋がっていることを深く理解し、自分自身を愛することの大切さを実感。この愛を日常に持ち帰り、周りの人々にも分かち合いたいです 🌸 #中村咲太WSヒーリングシェア',
    likes: 756,
    comments: [],
    timestamp: '1d',
    tags: ['無条件の愛', '宇宙意識', '愛の分かち合い'],
    location: 'オンライン',
    isLiked: false,
    isSaved: true,
    source: 'mock' as const
  },
  {
    id: '6',
    user: users[1],
    imageUrl: '/images/img6.png',
    caption: '中村咲太先生の遠隔ヒーリングで起こった内なる革命 🌟 古い思考パターンや制限的な信念が溶け去り、本来の輝きを取り戻しました。ハートチャクラが大きく開かれ、愛と喜びが泉のように湧き上がってきます。新しい人生の扉が開かれた瞬間です 🚪✨ #中村咲太WSヒーリングシェア',
    likes: 634,
    comments: [
      {
        id: '7',
        user: users[3],
        text: 'ハートチャクラの開放、素晴らしいですね！',
        timestamp: '1d',
        likes: 4
      }
    ],
    timestamp: '1d',
    tags: ['内なる革命', 'ハートチャクラ', '新しい人生'],
    location: 'オンライン',
    isLiked: false,
    isSaved: false,
    source: 'mock' as const
  },
  {
    id: 'instagram-test',
    user: {
      id: 'instagram',
      username: 'instagram',
      displayName: 'Instagram',
      avatar: 'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      isVerified: true
    },
    imageUrl: 'https://via.placeholder.com/400x400.png?text=Instagram+Embed',
    caption: 'This is a test Instagram embed post',
    likes: 1000,
    comments: [],
    timestamp: '1h',
    tags: ['test', 'instagram', 'embed'],
    location: 'Test Location',
    isLiked: false,
    isSaved: false,
    source: 'instagram' as const,
    instagramUrl: 'https://www.instagram.com/p/C-example/'
  }
];