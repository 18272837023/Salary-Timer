import type { WishItem } from "./types";

/**
 * Keyword → emoji table for wishlist items.
 *
 * The emoji is derived from the item name, never randomised: a random pick is
 * how "camera" ended up wearing a laptop 💻. First match wins, so the more
 * specific rules must sit above the generic ones (洗衣机 → 🧺, not 🧥).
 */
type Rule = { keys: string[]; emoji: string };

const RULES: Rule[] = [
  // ---------- laundry / cleaning ----------
  { keys: ["洗衣机", "洗衣機", "washing machine", "washer", "laundry", "干衣机", "烘干机", "烘乾機", "dryer"], emoji: "🧺" },
  { keys: ["吸尘器", "吸塵器", "vacuum", "hoover", "扫地机器人", "掃地機器人", "robot vacuum"], emoji: "🧹" },
  { keys: ["洗碗机", "洗碗機", "dishwasher"], emoji: "🍽️" },
  { keys: ["熨斗", "ironing", "steam iron"], emoji: "👔" },

  // ---------- kitchen appliances ----------
  { keys: ["冰箱", "fridge", "refrigerator", "freezer"], emoji: "🧊" },
  { keys: ["微波炉", "微波爐", "microwave"], emoji: "🍲" },
  { keys: ["烤箱", "oven", "toaster", "烤面包机", "空气炸锅", "氣炸鍋", "air fryer"], emoji: "🍞" },
  { keys: ["电饭锅", "電飯鍋", "rice cooker", "电饭煲"], emoji: "🍚" },
  { keys: ["电水壶", "電水壺", "kettle", "水壶", "保溫杯", "thermos"], emoji: "🫖" },
  { keys: ["咖啡机", "咖啡機", "coffee machine", "espresso machine", "grinder"], emoji: "☕" },
  { keys: ["炉灶", "爐灶", "stove", "cooktop", "hob", "燃气灶"], emoji: "🔥" },
  { keys: ["锅", "鍋", "pan", "pot", "cookware", "wok", "刀具", "knife", "cutlery", "餐具", "tableware"], emoji: "🍳" },
  { keys: ["kitchen", "厨房", "廚房", "appliance", "家电", "家電"], emoji: "🍳" },

  // ---------- home climate / utilities ----------
  { keys: ["空调", "空調", "air conditioner", "aircon", "heater", "暖气", "暖氣", "取暖器"], emoji: "❄️" },
  { keys: ["风扇", "風扇", "fan", "加湿器", "humidifier", "purifier", "净化器", "淨化器", "dehumidifier"], emoji: "🌀" },
  { keys: ["热水器", "熱水器", "water heater", "boiler", "淋浴", "shower"], emoji: "🚿" },
  { keys: ["马桶", "馬桶", "toilet", "浴缸", "bathtub", "洗手台", "sink", "浴室", "bathroom"], emoji: "🛁" },
  { keys: ["电费", "電費", "水费", "水費", "utility", "utilities", "bills", "bill", "水电", "水電"], emoji: "🧾" },

  // ---------- audio ----------
  { keys: ["headphone", "headset", "earbud", "earphone", "airpod", "耳机", "耳機"], emoji: "🎧" },
  { keys: ["speaker", "soundbar", "音箱", "音响", "音響", "homepod"], emoji: "🔊" },
  { keys: ["microphone", "mic", "podcast", "麦克风", "麥克風"], emoji: "🎤" },
  { keys: ["vinyl", "record player", "turntable", "黑胶", "黑膠"], emoji: "🎵" },

  // ---------- photo / video ----------
  { keys: ["camera", "lens", "gopro", "mirrorless", "dslr", "相机", "相機", "镜头", "鏡頭"], emoji: "📷" },
  { keys: ["drone", "无人机", "無人機"], emoji: "🚁" },
  { keys: ["projector", "投影仪", "投影機", "投影"], emoji: "📽️" },

  // ---------- computing ----------
  { keys: ["laptop", "macbook", "notebook", "thinkpad", "电脑", "電腦", "筆電", "笔记本", "筆記本"], emoji: "💻" },
  { keys: ["monitor", "display", "显示器", "顯示器", "screen", "屏幕"], emoji: "🖥️" },
  { keys: ["keyboard", "mouse", "键盘", "鍵盤", "鼠标", "滑鼠"], emoji: "⌨️" },
  { keys: ["tablet", "ipad", "平板", "电纸书", "電子書"], emoji: "📱" },
  { keys: ["phone", "iphone", "pixel", "smartphone", "手机", "手機"], emoji: "📱" },
  { keys: ["printer", "打印机", "印表機", "scanner", "扫描仪"], emoji: "🖨️" },
  { keys: ["router", "wifi", "路由器", "modem", "网卡"], emoji: "📶" },
  { keys: ["charger", "power bank", "充电器", "充電器", "充电宝", "充电桩", "cable", "数据线"], emoji: "🔌" },
  { keys: ["hard drive", "ssd", "硬盘", "硬碟", "nas", "memory card", "存储卡"], emoji: "💾" },
  { keys: ["tv", "television", "电视", "電視", "oled", "投影电视"], emoji: "📺" },

  // ---------- tickets / events ----------
  { keys: ["concert", "ticket", "festival", "gig", "演唱会", "演唱會", "门票", "門票"], emoji: "🎫" },
  { keys: ["cinema", "movie", "电影", "電影"], emoji: "🎬" },
  { keys: ["museum", "gallery", "博物馆", "博物館", "展览", "展覽"], emoji: "🏛️" },
  { keys: ["theme park", "amusement", "游乐园", "遊樂園", "迪士尼", "disney"], emoji: "🎢" },

  // ---------- travel ----------
  { keys: ["flight", "airfare", "airline", "机票", "機票", "航班"], emoji: "✈️" },
  { keys: ["visa", "passport", "签证", "簽證", "护照", "護照"], emoji: "🛂" },
  { keys: ["luggage", "suitcase", "行李", "行李箱", "背包"], emoji: "🧳" },
  { keys: ["hotel", "airbnb", "stay", "酒店", "民宿", "住宿"], emoji: "🏨" },
  { keys: ["train", "rail", "高铁", "高鐵", "火車", "火车", "地铁", "地鐵", "subway", "metro"], emoji: "🚄" },
  { keys: ["taxi", "uber", "cab", "打车", "打車", "滴滴"], emoji: "🚕" },
  { keys: ["weekend", "trip", "travel", "vacation", "holiday", "getaway", "away", "旅行", "度假", "旅游", "旅遊"], emoji: "🏝️" },
  { keys: ["camping", "tent", "露营", "露營"], emoji: "⛺" },

  // ---------- wearables / fashion ----------
  { keys: ["watch", "smartwatch", "手表", "手錶"], emoji: "⌚" },
  { keys: ["shoe", "sneaker", "boot", "trainers", "鞋"], emoji: "👟" },
  { keys: ["bag", "backpack", "handbag", "purse", "包"], emoji: "👜" },
  { keys: ["jacket", "coat", "down", "羽绒", "羽絨", "外套", "大衣"], emoji: "🧥" },
  { keys: ["dress", "skirt", "裙"], emoji: "👗" },
  { keys: ["shirt", "tee", "hoodie", "sweater", "clothes", "衣服", "T恤", "毛衣"], emoji: "👕" },
  { keys: ["pants", "jeans", "trousers", "裤", "褲"], emoji: "👖" },
  { keys: ["hat", "cap", "帽"], emoji: "🧢" },
  { keys: ["scarf", "围巾", "圍巾"], emoji: "🧣" },
  { keys: ["gloves", "手套"], emoji: "🧤" },
  { keys: ["glasses", "sunglasses", "眼镜", "眼鏡", "墨镜", "墨鏡"], emoji: "🕶️" },
  { keys: ["ring", "necklace", "jewel", "bracelet", "戒指", "项链", "項鍊", "手链"], emoji: "💍" },
  { keys: ["perfume", "skincare", "makeup", "cosmetic", "香水", "护肤", "護膚", "化妆"], emoji: "💄" },
  { keys: ["lipstick", "口红", "口紅"], emoji: "💋" },
  { keys: ["haircut", "barber", "理发", "理髮", "剪发"], emoji: "💇" },
  { keys: ["nails", "manicure", "美甲"], emoji: "💅" },

  // ---------- home / furniture ----------
  { keys: ["couch", "sofa", "armchair", "沙发", "沙發"], emoji: "🛋️" },
  { keys: ["desk", "table", "chair", "furniture", "家具", "桌子", "椅"], emoji: "🪑" },
  { keys: ["bed", "mattress", "床", "床垫", "床墊"], emoji: "🛏️" },
  { keys: ["wardrobe", "closet", "衣柜", "衣櫃", "橱柜", "櫥櫃", "cabinet"], emoji: "🗄️" },
  { keys: ["bookshelf", "shelf", "书架", "書架"], emoji: "📚" },
  { keys: ["rug", "carpet", "地毯", "地垫"], emoji: "🧶" },
  { keys: ["curtain", "blind", "窗帘", "窗簾"], emoji: "🪟" },
  { keys: ["mirror", "镜子", "鏡子"], emoji: "🪞" },
  { keys: ["lamp", "light", "bulb", "灯", "燈", "照明"], emoji: "💡" },
  { keys: ["plant", "植物", "绿植", "綠植", "花", "flower", "bouquet"], emoji: "🪴" },
  { keys: ["candle", "蜡烛", "蠟燭", "香薰", "diffuser"], emoji: "🕯️" },
  { keys: ["house", "home", "apartment", "rent", "deposit", "mortgage", "房", "房租", "首付", "房贷", "房貸"], emoji: "🏠" },
  { keys: ["renovation", "remodel", "装修", "裝修", "paint", "刷墙"], emoji: "🔨" },

  // ---------- vehicles ----------
  { keys: ["bike", "bicycle", "cycle", "自行车", "自行車", "單車", "单车"], emoji: "🚲" },
  { keys: ["scooter", "motorbike", "motorcycle", "摩托", "电动车", "電動車"], emoji: "🛵" },
  { keys: ["car", "vehicle", "tesla", "车", "車", "汽车", "汽車"], emoji: "🚗" },
  { keys: ["fuel", "gas", "petrol", "油费", "油費", "加油"], emoji: "⛽" },

  // ---------- food ----------
  { keys: ["coffee", "espresso", "latte", "咖啡"], emoji: "☕" },
  { keys: ["bubble tea", "boba", "奶茶"], emoji: "🧋" },
  { keys: ["dinner", "lunch", "meal", "restaurant", "food", "brunch", "breakfast", "餐", "吃", "外卖", "外賣", "takeout"], emoji: "🍽️" },
  { keys: ["wine", "whisky", "whiskey", "beer", "cocktail", "酒"], emoji: "🍷" },
  { keys: ["cake", "dessert", "蛋糕", "甜点", "甜品"], emoji: "🍰" },
  { keys: ["chocolate", "巧克力", "糖果", "candy"], emoji: "🍫" },
  { keys: ["fruit", "水果", "grocery", "groceries", "买菜", "買菜", "超市"], emoji: "🍎" },

  // ---------- fun / learning / health ----------
  { keys: ["game", "console", "playstation", "xbox", "switch", "steam", "游戏", "遊戲"], emoji: "🎮" },
  { keys: ["book", "novel", "course", "class", "书", "書", "课程", "課程", "教材"], emoji: "📚" },
  { keys: ["tuition", "school", "学费", "學費", "学位", "留學", "留学"], emoji: "🎓" },
  { keys: ["exam", "test", "certification", "考试", "考試", "报名费"], emoji: "📝" },
  { keys: ["stationery", "pen", "notebook paper", "文具", "笔记本子"], emoji: "✏️" },
  { keys: ["guitar", "piano", "instrument", "吉他", "钢琴", "鋼琴", "樂器", "乐器"], emoji: "🎸" },
  { keys: ["paint", "art", "drawing", "canvas", "绘画", "繪畫", "画材", "美術"], emoji: "🎨" },
  { keys: ["gym", "fitness", "workout", "健身", "健身房", "私教"], emoji: "🏋️" },
  { keys: ["yoga", "pilates", "瑜伽", "普拉提", "跑步机", "跑步機", "treadmill"], emoji: "🧘" },
  { keys: ["swim", "swimming", "游泳"], emoji: "🏊" },
  { keys: ["ski", "snowboard", "滑雪"], emoji: "🎿" },
  { keys: ["golf", "高尔夫", "高爾夫"], emoji: "⛳" },
  { keys: ["fishing", "钓鱼", "釣魚"], emoji: "🎣" },
  { keys: ["spa", "massage", "按摩", "水疗", "水療"], emoji: "💆" },
  { keys: ["doctor", "dentist", "therapy", "medical", "医院", "醫院", "牙医", "看病", "体检", "體檢"], emoji: "🩺" },
  { keys: ["insurance", "保险", "保險"], emoji: "🛡️" },

  // ---------- pets / kids ----------
  { keys: ["dog", "puppy", "cat", "kitten", "pet", "狗", "猫", "貓", "宠物", "寵物"], emoji: "🐶" },
  { keys: ["baby", "kid", "toy", "lego", "玩具", "宝宝", "寶寶", "婴儿"], emoji: "🧸" },
  { keys: ["puzzle", "lego set", "拼图", "拼圖", "积木", "積木"], emoji: "🧩" },

  // ---------- catch-alls ----------
  { keys: ["gift", "present", "礼物", "禮物", "送礼"], emoji: "🎁" },
];

/** Fallback when nothing matches — neutral, never misleading. */
export const WISH_FALLBACK_EMOJI = "🎁";

/**
 * Manual override palette. Keyword matching can never cover every product
 * name, so tapping an item's emoji opens this short list.
 */
export const EMOJI_PALETTE = [
  "🎁", "🛍️", "🛒", "💳", "🧾", "💰",
  "🧺", "🍳", "🧊", "🧹", "🛁", "🪑",
  "🛋️", "🛏️", "💡", "🪴", "🕯️", "🪞",
  "💻", "📱", "🖥️", "⌨️", "🎧", "📷",
  "📺", "🎮", "📚", "✏️", "🎨", "🎸",
  "👕", "👟", "👜", "⌚", "🕶️", "💍",
  "💄", "🧴", "🚲", "🚗", "✈️", "🧳",
  "🏨", "🎫", "🎬", "🍽️", "☕", "🍰",
  "🏋️", "🧘", "🩺", "🐶", "🧸", "🏠",
];

const WORD_CHAR = /[a-z0-9]/;

/**
 * Substring match for normal keys; short keys ("car", "bed", "bag") need a word
 * boundary so "carpet" or "cartoon" don't become 🚗.
 */
function matches(haystack: string, key: string): boolean {
  if (!key) return false;
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(key, from);
    if (at === -1) return false;
    const before = at === 0 ? "" : haystack[at - 1];
    const after = haystack[at + key.length] ?? "";
    const needsBoundary = key.length <= 4 && WORD_CHAR.test(key[0]);
    const okBefore = !needsBoundary || !WORD_CHAR.test(before);
    const okAfter = !needsBoundary || !WORD_CHAR.test(after);
    if (okBefore && okAfter) return true;
    from = at + 1;
  }
}

/** Pick an emoji that actually describes the item name. */
export function pickWishEmoji(name: string): string {
  const haystack = name.toLowerCase().replace(/[-_/()]+/g, " ");
  for (const rule of RULES) {
    for (const key of rule.keys) {
      if (matches(haystack, key.toLowerCase())) return rule.emoji;
    }
  }
  return WISH_FALLBACK_EMOJI;
}

/**
 * Emoji is derived from the name unless the visitor picked one by hand
 * (`emojiPicked`). Items saved before the picker existed carry a stale random
 * emoji and no flag, so they get repaired on load.
 */
export function resolveWishEmoji(item: Pick<WishItem, "name" | "emoji" | "emojiPicked">): string {
  if (item.emojiPicked && item.emoji) return item.emoji;
  return pickWishEmoji(item.name);
}

export function normalizeWishEmoji(items: WishItem[]): WishItem[] {
  return items.map((item) => {
    const emoji = resolveWishEmoji(item);
    return emoji === item.emoji ? item : { ...item, emoji };
  });
}
