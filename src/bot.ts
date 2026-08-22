import express from "express";
import { Telegraf, Markup, session } from "telegraf";
import type { Context } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

interface SessionData {
  step?: string;
  memberStatus?: string;
  informationType?: string;
  // Mourning
  mourningName?: string;
  mourningRelation?: string;
  mourningBurial?: string;
  mourningAddress?: string;
  // Celebration
  celebrationType?: string;
  welidSpouseName?: string;
  welidChildGender?: string;
  welidPhoto?: string;
  graduationName?: string;
  graduationInfo?: string;
  graduationDegree?: string;
  graduationField?: string;
  graduationPhoto?: string;
  wesebaiName?: string;
  wesebaiAddress?: string;
  wesebaiPhone?: string;
  celebrationInformation?: string;
  // Ethics
  ethicsTargetGroup?: string;
  ethicsGapType?: string;
  ethicsMemberName?: string;
  // Others
  currentInformation?: string;
  question?: string;
  situation?: string;
  advicePhone?: string;
}

interface BotContext extends Context {
  session: SessionData;
}

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;

if (!botToken) {
  throw new Error("TELEGRAM_BOT_TOKEN is missing from .env");
}

if (!adminChatId) {
  throw new Error("ADMIN_CHAT_ID is missing from .env");
}

const bot = new Telegraf<BotContext>(botToken);

bot.use(session({ defaultSession: () => ({}) }));

/* ================= STEP 1: START & MEMBER VERIFICATION ================= */
bot.start(async (ctx) => {
  ctx.session = {
    step: "member_status",
  };

  await ctx.reply(
    "🔔 እንኳን ወደ ደብረ ሰላም መድኃኔዓለም ካቴድራል የመሠረተ ሕይወት ሰንበት ትምህርት ቤት መረጃ መስጫ ቦት በደህና መጡ!\n\n" +
      "👤 የሰንበት ትምህርት ቤቱ አባል ነዎት?",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("✅ አዎ ነኝ", "member_yes"),
        Markup.button.callback("❌ አይ አይደለሁም", "member_no"),
      ],
    ])
  );
});

bot.action("member_yes", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.memberStatus = "አዎ ነኝ";
  ctx.session.step = "information_type";
  await showInformationTypes(ctx);
});

bot.action("member_no", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.memberStatus = "አይ አይደለሁም";
  ctx.session.step = "information_type";
  await showInformationTypes(ctx);
});

/* ================= STEP 2: SERVICE SELECTION ================= */
async function showInformationTypes(ctx: BotContext) {
  await ctx.reply(
    "📋 ምን ዓይነት መረጃ መስጠት ይፈልጋሉ?",
    Markup.inlineKeyboard([
      [Markup.button.callback("🖤 የሐዘን / የእዘን", "mourning")],
      [Markup.button.callback("🎉 የደስታ", "celebration")],
      [
        Markup.button.callback(
          "⚠️ የስነ ምግባር ክፍተት ጥቆማ ለመስጠት",
          "ethics"
        ),
      ],
      [Markup.button.callback("📢 ወቅታዊ", "current")],
      [Markup.button.callback("❓ ትምህርታዊ ጥያቄዎችን ለመጠየቅ", "education")],
      [Markup.button.callback("🤝 ምክር ለመቀበል", "advice")],
    ])
  );
}

/* ================= STEP 3: DETAILED QUESTIONS FLOWS ================= */

/* --- 1. የሐዘን / የእዘን FLOW --- */
bot.action("mourning", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.informationType = "የሐዘን / የእዘን";
  ctx.session.step = "mourning_name";
  await ctx.reply("👤 ሀዘን የደረሰበት/የደረሰባት አባል ሙሉ ስም ያስገቡ፦");
});

/* --- 2. የደስታ FLOW --- */
bot.action("celebration", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.informationType = "የደስታ";
  ctx.session.step = "celebration_type";
  await ctx.reply(
    "🎈 እባክዎን የደስታ ዓይነት ይምረጡ፦",
    Markup.inlineKeyboard([
      [Markup.button.callback("💍 ሰርግ ለማሳወቅ", "wedding")],
      [Markup.button.callback("👶 ወሊድ", "welid")],
      [Markup.button.callback("🎓 ምርቃት ለማሳወቅ", "graduation")],
      [Markup.button.callback("🕊️ ወሰባዬ", "wesebai")],
      [
        Markup.button.callback(
          "✨ ሌሎች የደስታ መርሃ-ግብሮችን ለማሳወቅ",
          "other_celebration"
        ),
      ],
    ])
  );
});

// 2.1. ሰርግ
bot.action("wedding", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.celebrationType = "ሰርግ";
  ctx.session.step = "wedding_info";
  await ctx.reply(
    "📝 እባክዎን የሰርግ ያለበትን የሰንበት ትምህርት ቤቱን አባል ሙሉ ስም፣ ስልክ ቁጥር እና የመርሃ-ግብሩን ሰዓት እና ቦታ ይጻፉ።"
  );
});

// 2.2. ወሊድ
bot.action("welid", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.celebrationType = "ወሊድ";
  ctx.session.step = "welid_spouse";
  await ctx.reply("👨‍👩‍👧 እባክዎትን የወለዱትን ባለትዳር የባል(የሚስት) ስም ያስገቡልን?");
});

// 2.3. ምርቃት
bot.action("graduation", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.celebrationType = "ምርቃት";
  ctx.session.step = "grad_name";
  await ctx.reply("👤 እባክዎን የተመረቀውን/ቷን ሙሉ ስም ያስገቡ?");
});

// Graduation Level Handler
bot.action(/^grad_level_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const level = ctx.match[1];
  ctx.session.graduationDegree = level;
  ctx.session.step = "grad_field";

  await ctx.reply(
    "📚 እባክዎን አባሉ የተመረቀበትን የትምህርት ዘርፍ ይምረጡ፦",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("💊 Pharmacy", "grad_field_Pharmacy"),
        Markup.button.callback("🧪 Medical Lab", "grad_field_MedLab"),
      ],
      [
        Markup.button.callback("🩺 Medicine", "grad_field_Medicine"),
        Markup.button.callback("💉 Anesthesia", "grad_field_Anesthesia"),
      ],
      [
        Markup.button.callback("👶 Midwifery", "grad_field_Midwifery"),
        Markup.button.callback("🧑‍⚕️ Nursing", "grad_field_Nursing"),
      ],
      [
        Markup.button.callback("🏗️ Engineering", "grad_field_Engineering"),
        Markup.button.callback("💻 Software Eng", "grad_field_SE"),
      ],
      [
        Markup.button.callback("🖥️ Computer Sci", "grad_field_CS"),
        Markup.button.callback("🌐 IT", "grad_field_IT"),
      ],
      [
        Markup.button.callback("💰 Accounting", "grad_field_Accounting"),
        Markup.button.callback("📊 Management", "grad_field_Management"),
      ],
      [
        Markup.button.callback("📈 Marketing", "grad_field_Marketing"),
        Markup.button.callback("🏛️ Governance", "grad_field_Governance"),
      ],
      [
        Markup.button.callback("⚖️ Law", "grad_field_Law"),
        Markup.button.callback("✍️ ሌላ ካለ በጽሑፍ ይግለጹልን", "grad_field_Other"),
      ],
    ])
  );
});

// Graduation Field Handler
bot.action(/^grad_field_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const fieldKey = ctx.match[1];

  const fieldMap: Record<string, string> = {
    Pharmacy: "Pharmacy",
    MedLab: "Medical Laboratory",
    Medicine: "Medicine",
    Anesthesia: "Anesthesia",
    Midwifery: "Midwifery",
    Nursing: "Nursing",
    Engineering: "Engineering Department",
    SE: "Software Engineering",
    CS: "Computer Science",
    IT: "IT",
    Accounting: "Accounting and Finance",
    Management: "Management",
    Marketing: "Marketing Management",
    Governance: "Governance",
    Law: "Law",
  };

  if (fieldKey === "Other") {
    ctx.session.step = "grad_field_custom";
    await ctx.reply("✍️ እባክዎን የተመረቁበትን የትምህርት ዘርፍ በጽሑፍ ይግለጹልን፦");
  } else {
    ctx.session.graduationField = fieldMap[fieldKey] || fieldKey;
    ctx.session.step = "grad_photo";
    await ctx.reply("🖼️ እባክዎን ፎቶ ካለ ይላኩልን (ከሌለ «የለም» ብለው ይጻፉ)፦");
  }
});

// 2.4. ወሰባዬ
bot.action("wesebai", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.celebrationType = "ወሰባዬ";
  ctx.session.step = "wesebai_name";
  await ctx.reply("👤 እባክዎን ወሰባዬ ያለበትን የሰንበት ትምህርት ቤቱን አባል ሙሉ ስም ያስገቡ፦");
});

// 2.5. ሌሎች የደስታ መርሃ-ግብሮች
bot.action("other_celebration", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.celebrationType = "ሌሎች የደስታ መርሃ-ግብር";
  ctx.session.step = "other_celebration_info";
  await ctx.reply(
    "📝 እባክዎን የፕሮግራሙን ዓይነት፣ የሰንበት ትምህርት ቤቱን አባል ሙሉ ስም፣ ስልክ ቁጥር እና የመርሃ-ግብሩን ሰዓት እና ቦታ ይጻፉ።"
  );
});

/* --- 3. የስነ ምግባር ክፍተት ጥቆማ FLOW --- */
bot.action("ethics", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.informationType = "የስነ ምግባር ክፍተት ጥቆማ";
  ctx.session.step = "ethics_group";
  await ctx.reply(
    "👥 ጥቆማ መስጠት የሚፈልጉት በየትኛው ክፍል አባል ላይ ነው?",
    Markup.inlineKeyboard([
      [Markup.button.callback("👶 የአዳጊ እና ወጣቶች አባላት ላይ", "ethics_g_1")],
      [Markup.button.callback("🧑 የወጣቶች አባላት ላይ", "ethics_g_2")],
      [Markup.button.callback("🎶 የመዘምራን አባላት ላይ", "ethics_g_3")],
      [
        Markup.button.callback(
          "💼 የስራ አመራር እና አስፈጻሚ አባላት ላይ",
          "ethics_g_4"
        ),
      ],
      [Markup.button.callback("👴 የነባር አባላት ላይ", "ethics_g_5")],
    ])
  );
});

bot.action(/^ethics_g_\d$/, async (ctx) => {
  await ctx.answerCbQuery();
  const buttonData =
    ctx.callbackQuery && "data" in ctx.callbackQuery
      ? ctx.callbackQuery.data
      : "";
  const groups: Record<string, string> = {
    ethics_g_1: "የአዳጊ እና ወጣቶች አባላት ላይ",
    ethics_g_2: "የወጣቶች አባላት ላይ",
    ethics_g_3: "የመዘምራን አባላት ላይ",
    ethics_g_4: "የስራ አመራር እና አስፈጻሚ አባላት ላይ",
    ethics_g_5: "የነባር አባላት ላይ",
  };
  ctx.session.ethicsTargetGroup = groups[buttonData] || "ያልተጠቀሰ";
  ctx.session.step = "ethics_gap";

  await ctx.reply(
    "🚨 በአባሉ/ሏ ላይ ያዩት ክፍተት ምንድነው?",
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "📱 ማህበራዊ ድኅረ ገጽ ላይ አርአያነት የጎደለውን ምስሎች (ቪድዮዎች) ማጋራት",
          "ethics_p_1"
        ),
      ],
      [Markup.button.callback("💥 ከአባላት ጋር በመጋጨት", "ethics_p_2")],
      [
        Markup.button.callback(
          "🚫 ከቤ/ክን እንዲሁም ከማህበረሰቡ ውጭ የሆኑ ድርጊቶችን በማድረግ",
          "ethics_p_3"
        ),
      ],
      [
        Markup.button.callback(
          "🗣️ ተጨባጭነት የሌለው ወሬ በማውራት (ስም በማጥፋት)",
          "ethics_p_4"
        ),
      ],
      [Markup.button.callback("📝 ሌሎች ካሉ ይጥቀሱ", "ethics_p_5")],
    ])
  );
});

bot.action(/^ethics_p_\d$/, async (ctx) => {
  await ctx.answerCbQuery();
  const buttonData =
    ctx.callbackQuery && "data" in ctx.callbackQuery
      ? ctx.callbackQuery.data
      : "";
  const gaps: Record<string, string> = {
    ethics_p_1:
      "ማህበራዊ ድኅረ ገጽ ላይ አርአያነት የጎደለውን ምስሎች (ቪድዮዎች) ማጋራት",
    ethics_p_2: "ከአባላት ጋር በመጋጨት",
    ethics_p_3: "ከቤ/ክን እንዲሁም ከማህበረሰቡ ውጭ የሆኑ ድርጊቶችን በማድረግ",
    ethics_p_4: "ተጨባጭነት የሌለው ወሬ በማውራት (ስም በማጥፋት)",
    ethics_p_5: "ሌሎች",
  };
  ctx.session.ethicsGapType = gaps[buttonData] || "ያልተጠቀሰ";
  ctx.session.step = "ethics_member_name";
  await ctx.reply("👤 እባክዎን የአባሉ (ክፍተት ያዩበትን) ሙሉ ስም ያስገቡልን?");
});

/* --- 4. OTHER FLOWS --- */
bot.action("current", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.informationType = "ወቅታዊ";
  ctx.session.step = "current_information";
  await ctx.reply("📝 እባክዎን ማሳወቅ የሚፈልጉትን ወቅታዊ መረጃ ያስገቡ።");
});

bot.action("education", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.informationType = "ትምህርታዊ ጥያቄ";
  ctx.session.step = "education_question";
  await ctx.reply("❓ እባክዎን ጥያቄዎን ያስገቡ።");
});

bot.action("advice", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.informationType = "ምክር ለመቀበል";
  ctx.session.step = "advice_situation";
  await ctx.reply("📝 እባክዎን ያጋጠመዎትን ሁኔታ ያሳውቁ።");
});

/* ================= PHOTO HANDLING ================= */
bot.on("photo", async (ctx) => {
  const step = ctx.session.step;
  const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;

  if (step === "welid_photo") {
    ctx.session.welidPhoto = photoId;
    await sendToAdmin(
      ctx,
      "የደስታ መረጃ - ወሊድ",
      `የባል/የሚስት ስም፦ ${ctx.session.welidSpouseName}\n` +
        `የልጅ ጾታ/መረጃ፦ ${ctx.session.welidChildGender}\n` +
        `ፎቶ፦ [ፎቶ ተያይዟል]`
    );
    await ctx.telegram.sendPhoto(adminChatId as string, photoId);
    await finish(ctx);
    return;
  }

  if (step === "grad_photo") {
    ctx.session.graduationPhoto = photoId;
    await sendToAdmin(
      ctx,
      "የደስታ መረጃ - ምርቃት",
      `የተመረቀው አባል፦ ${ctx.session.graduationName}\n` +
        `የተመረቀበት ጊዜ እና ዩኒቨርሲቲ፦ ${ctx.session.graduationInfo}\n` +
        `የትምህርት ደረጃ፦ ${ctx.session.graduationDegree}\n` +
        `የትምህርት ዘርፍ፦ ${ctx.session.graduationField}\n` +
        `ፎቶ፦ [ፎቶ ተያይዟል]`
    );
    await ctx.telegram.sendPhoto(adminChatId as string, photoId);
    await finish(ctx);
    return;
  }
});

/* ================= TEXT INPUT HANDLING ================= */
bot.on("text", async (ctx) => {
  const text = ctx.message.text.trim();
  const step = ctx.session.step;

  // Mourning Steps
  if (step === "mourning_name") {
    ctx.session.mourningName = text;
    ctx.session.step = "mourning_relation";
    await ctx.reply("🔗 በሟች እና በአባሉ/ሏ በኩል ያለው ዝምድና እባክዎ ይጥቀሱልን?");
    return;
  }

  if (step === "mourning_relation") {
    ctx.session.mourningRelation = text;
    ctx.session.step = "mourning_burial";
    await ctx.reply("⚰️ ቀበር ተፈጽሟል? ካልተፈጸመ የት? እና ሰዓቱ?");
    return;
  }

  if (step === "mourning_burial") {
    ctx.session.mourningBurial = text;
    ctx.session.step = "mourning_address";
    await ctx.reply("🏠 አባሉ/ሏ ሀዘን የተቀመጠበት አድራሻ ይጥቀሱልን?");
    return;
  }

  if (step === "mourning_address") {
    ctx.session.mourningAddress = text;
    await sendToAdmin(
      ctx,
      "የሐዘን / የእዘን መረጃ",
      `ሀዘን የደረሰበት አባል፦ ${ctx.session.mourningName}\n` +
        `ዝምድና፦ ${ctx.session.mourningRelation}\n` +
        `የቀብር ሁኔታ/ቦታ/ሰዓት፦ ${ctx.session.mourningBurial}\n` +
        `ሀዘን የተቀመጠበት አድራሻ፦ ${text}`
    );
    await finish(ctx);
    return;
  }

  // Celebration Steps - Wedding
  if (step === "wedding_info") {
    ctx.session.celebrationInformation = text;
    ctx.session.step = "wedding_additional";
    await ctx.reply(
      "➕ ማሳወቅ የሚፈልጉትን ተጨማሪ መረጃ ያስገቡ (ከሌለ «የለም» ይበሉ)፦"
    );
    return;
  }

  if (step === "wedding_additional") {
    await sendToAdmin(
      ctx,
      "የደስታ መረጃ - ሰርግ",
      `የአባሉ መረጃ፣ ስልክ፣ ቦታ እና ሰዓት፦ ${ctx.session.celebrationInformation}\n` +
        `ተጨማሪ መረጃ፦ ${text}`
    );
    await finish(ctx);
    return;
  }

  // Celebration Steps - Welid
  if (step === "welid_spouse") {
    ctx.session.welidSpouseName = text;
    ctx.session.step = "welid_child_info";
    await ctx.reply("📸 የወለዱት ልጅ ጾታ ከተቻለ ፎቶውን ቢያይዙልን (ፎቶ ከሌለ «የለም» ብለው ይጻፉ)፦");
    return;
  }

  if (step === "welid_child_info") {
    ctx.session.welidChildGender = text;
    ctx.session.step = "welid_photo";
    await ctx.reply("🖼️ እባክዎን ፎቶ ካለ ይላኩልን (ከሌለ «የለም» ብለው ይጻፉ)፦");
    return;
  }

  if (step === "welid_photo") {
    await sendToAdmin(
      ctx,
      "የደስታ መረጃ - ወሊድ",
      `የባል/የሚስት ስም፦ ${ctx.session.welidSpouseName}\n` +
        `የልጅ ጾታ/መረጃ፦ ${ctx.session.welidChildGender}\n` +
        `ፎቶ፦ ${text}`
    );
    await finish(ctx);
    return;
  }

  // Celebration Steps - Graduation
  if (step === "grad_name") {
    ctx.session.graduationName = text;
    ctx.session.step = "grad_info";
    await ctx.reply("🏛️ መቼ ተመረቀ? የት ዩኒቨርሲቲ?");
    return;
  }

  if (step === "grad_info") {
    ctx.session.graduationInfo = text;
    ctx.session.step = "grad_degree";
    await ctx.reply(
      "📜 በምን ተመረቀ/ች?",
      Markup.inlineKeyboard([
        [
          Markup.button.callback("🎓 ዲፕሎማ (Diploma)", "grad_level_ዲፕሎማ"),
          Markup.button.callback("🎓 ዲግሪ (Degree)", "grad_level_ዲግሪ"),
        ],
        [
          Markup.button.callback("🎓 ማስተርስ (Masters)", "grad_level_ማስተርስ"),
          Markup.button.callback("🎓 ፒኤችዲ (PhD)", "grad_level_ፒኤችዲ"),
        ],
      ])
    );
    return;
  }

  if (step === "grad_field_custom") {
    ctx.session.graduationField = text;
    ctx.session.step = "grad_photo";
    await ctx.reply("🖼️ እባክዎን ፎቶ ካለ ይላኩልን (ከሌለ «የለም» ብለው ይጻፉ)፦");
    return;
  }

  if (step === "grad_photo") {
    await sendToAdmin(
      ctx,
      "የደስታ መረጃ - ምርቃት",
      `የተመረቀው አባል፦ ${ctx.session.graduationName}\n` +
        `የተመረቀበት ጊዜ እና ዩኒቨርሲቲ፦ ${ctx.session.graduationInfo}\n` +
        `የትምህርት ደረጃ፦ ${ctx.session.graduationDegree}\n` +
        `የትምህርት ዘርፍ፦ ${ctx.session.graduationField}\n` +
        `ፎቶ፦ ${text}`
    );
    await finish(ctx);
    return;
  }

  // Celebration Steps - Wesebai
  if (step === "wesebai_name") {
    ctx.session.wesebaiName = text;
    ctx.session.step = "wesebai_address";
    await ctx.reply("📍 ወሰባዬ የሚካሄድበትን አድራሻ ያስቀምጡ፦");
    return;
  }

  if (step === "wesebai_address") {
    ctx.session.wesebaiAddress = text;
    ctx.session.step = "wesebai_phone";
    await ctx.reply(
      "📞 እባክዎን ወሰባዬ ያለበትን የሰንበት ትምህርት ቤቱን አባል ስልክ ቁጥር ያስገቡ፦"
    );
    return;
  }

  if (step === "wesebai_phone") {
    ctx.session.wesebaiPhone = text;
    await sendToAdmin(
      ctx,
      "የደስታ መረጃ - ወሰባዬ",
      `የአባሉ ስም፦ ${ctx.session.wesebaiName}\n` +
        `አድራሻ፦ ${ctx.session.wesebaiAddress}\n` +
        `ስልክ ቁጥር፦ ${text}`
    );
    await finish(ctx);
    return;
  }

  // Celebration Steps - Other
  if (step === "other_celebration_info") {
    await sendToAdmin(
      ctx,
      "የደስታ መረጃ - ሌሎች",
      `የፕሮግራሙ መረጃ፦ ${text}`
    );
    await finish(ctx);
    return;
  }

  // Ethics Steps
  if (step === "ethics_member_name") {
    ctx.session.ethicsMemberName = text;
    await sendToAdmin(
      ctx,
      "የስነ ምግባር ክፍተት ጥቆማ",
      `ጥቆማ የተሰጠበት ክፍል፦ ${ctx.session.ethicsTargetGroup}\n` +
        `የታየው ክፍተት፦ ${ctx.session.ethicsGapType}\n` +
        `የአባሉ ሙሉ ስም፦ ${text}`
    );
    await finish(ctx);
    return;
  }

  // Current Info Steps
  if (step === "current_information") {
    ctx.session.currentInformation = text;
    await sendToAdmin(ctx, "ወቅታዊ መረጃ", text);
    await finish(ctx);
    return;
  }

  // Education Steps
  if (step === "education_question") {
    ctx.session.question = text;
    await sendToAdmin(ctx, "ትምህርታዊ ጥያቄ", text);
    await ctx.reply("⏳ ምላሹን በጥቂት ቀናት ውስጥ እናሳውቆታለን።");
    ctx.session = {};
    return;
  }

  // Advice Steps
  if (step === "advice_situation") {
    ctx.session.situation = text;
    ctx.session.step = "advice_phone";
    await ctx.reply("📞 እባክዎን ስልክ ቁጥርዎን ያስገቡ፦");
    return;
  }

  if (step === "advice_phone") {
    ctx.session.advicePhone = text;
    await sendToAdmin(
      ctx,
      "ምክር ለመቀበል",
      `ያጋጠመው ሁኔታ፦ ${ctx.session.situation}\n` + `ስልክ ቁጥር፦ ${text}`
    );
    await ctx.reply(
      "🕊️ በጥቂት ቀናት ውስጥ ለምክር አባው ወይም ከሰንበት ትምህርት ቤቱ የሰው ሀብት ክፍል ሥነ-ምግባር ዘርፍ ጋር እናገናኝዎታለን።"
    );
    ctx.session = {};
    return;
  }

  if (!step) {
    await ctx.reply("እባክዎን /start በመጫን ውይይቱን ይጀምሩ።");
  }
});

/* ================= HELPER FUNCTIONS ================= */
async function sendToAdmin(ctx: BotContext, title: string, details: string) {
  const username = ctx.from?.username ? `@${ctx.from.username}` : "የለም";
  const firstName = ctx.from?.first_name || "የለም";
  const lastName = ctx.from?.last_name || "";

  const adminMessage =
    `🔔 አዲስ መረጃ\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `📌 የመረጃ ዓይነት፦ ${title}\n\n` +
    `${details}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 የላኪው ስም፦ ${firstName} ${lastName}\n` +
    `📱 Telegram Username፦ ${username}\n` +
    `🆔 Telegram ID፦ ${ctx.from?.id}\n` +
    `👥 የአባልነት ሁኔታ፦ ${ctx.session.memberStatus}`;

  try {
    await ctx.telegram.sendMessage(adminChatId as string, adminMessage);
    console.log("✅ Sent to admin group successfully.");
  } catch (err) {
    console.error("❌ FAILED to send to admin group:", err);
  }
}

async function finish(ctx: BotContext) {
  const contactText = "\nለበለጠ መረጃ በ 0991294313 ይደውሉ።";

  if (ctx.session.memberStatus === "አዎ ነኝ") {
    await ctx.reply(`🙏 መረጃውን ስላሳወቁን እናመሰግናለን!${contactText}`);
  } else {
    await ctx.reply(
      `🙏 እንደ ሰንበት ትምህርት ቤቱ አባል ባይሆኑም መረጃውን ስላሰጡን እናመሰግናለን!${contactText}`
    );
  }
  ctx.session = {};
}

bot.catch((error) => {
  console.error("Bot error:", error);
});

/* ================= EXPRESS WEBHOOK SERVER ================= */
const app = express();
const port = Number(process.env.PORT) || 3000;
const domain = process.env.RENDER_EXTERNAL_URL;

if (!domain) {
  throw new Error(
    "RENDER_EXTERNAL_URL is missing — this only gets set automatically when running on Render."
  );
}

app.use(await bot.createWebhook({ domain }));

app.get("/", (_req, res) => {
  res.send("Bot is running.");
});

app.listen(port, () => {
  console.log(
    `🤖 የመሠረተ ሕይወት መረጃ መስጫ ቦት እየሰራ ነው... (webhook mode, port ${port})`
  );
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));