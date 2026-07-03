import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/theme/colors";

// ─── Predefined Quick Suggestion Chips ───────────────────────────────────────
const SUGGESTION_CHIPS = [
  "When do I get paid?",
  "How long to go live?",
  "Can I upload cover songs?",
  "How to request a takedown?",
];

// ─── Message Interface ────────────────────────────────────────────────────────
interface IMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

// ─── AI Response Matching Logic ──────────────────────────────────────────────
const getAIResponse = (query: string): string => {
  const q = query.toLowerCase();

  if (q.includes("paid") || q.includes("payout") || q.includes("money") || q.includes("royalty") || q.includes("royalties") || q.includes("wallet")) {
    return "Amozart takes 0% commission—you keep 100% of your earnings! Royalties are reported monthly (with a 2-month delay from stores). You can request a payout via PayPal or Bank Transfer from the Wallet tab once your balance reaches the $10 minimum threshold.";
  }

  if (q.includes("how long") || q.includes("go live") || q.includes("release time") || q.includes("spotify") || q.includes("apple music") || q.includes("upload")) {
    return "Releases typically go live on major stores like Spotify and Apple Music within 24 to 72 hours. To guarantee your release is online on a specific date, we recommend uploading your music at least 10–14 days in advance.";
  }

  if (q.includes("cover") || q.includes("samples") || q.includes("copyright") || q.includes("license")) {
    return "You can distribute cover songs, but you must acquire a mechanical license for the original composition. Distributing unauthorized samples, remixes, or copyrighted sound recordings is strictly prohibited and will lead to release rejection.";
  }

  if (q.includes("takedown") || q.includes("delete") || q.includes("remove")) {
    return "To take down a release, go to the Catalogue tab, tap on the specific release, and select 'Request Takedown'. It takes 2 to 5 business days for stores to process and remove the audio.";
  }

  if (q.includes("artist") || q.includes("composer") || q.includes("lyricist") || q.includes("producer")) {
    return "You can manage primary artists and credits under the 'Artists' menu in the side drawer. The number of artists you can create depends entirely on your subscription plan limit.";
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("help")) {
    return "Hello! I am Mozie, your Amozart AI support assistant. You can ask me about payouts, release distribution timelines, cover song copyrights, or takedown requests. Tap any of the quick suggestions above to start!";
  }

  return "I'm here to help you with your Amozart music distribution. If you need account-specific help or want our team to look into your profile, please close this chat and tap 'Contact Support Form' in the side menu to raise an official support ticket.";
};

const fetchGeminiAIResponse = async (query: string): Promise<string> => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is not configured.");

  const systemContext = `You are Mozie, the official, professional AI Support Assistant for Amozart, a premium music distribution platform.
Amozart key details to use:
- Commission: 0% commission. Artists keep 100% of their earnings and royalties.
- Delivery Times: Music is delivered to Spotify, Apple Music, and other major stores within 24 to 72 hours. We recommend uploading 10-14 days prior to target release date.
- Payouts: Handled via PayPal or Bank Transfer from the Wallet tab (minimum balance $10). Earnings report with a 2-month delay.
- Artists & Credits: Managed in the side drawer under 'Artists'. Support for Primary Artist, Composer, Lyricist, and Producer.
- Catalogue: Takedowns take 2-5 business days. Select the release under Catalogue and request takedown.

Answer the user's question concisely, helpfully, and with a friendly tone. Limit responses to 2-3 sentences.
User Question: ${query}`;

  const models = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-2.5-pro",
    "gemini-1.0-pro",
  ];

  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: systemContext }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        console.log(`✅ Gemini AI request succeeded using model: ${model}`);
        return reply.trim();
      } else {
        console.warn(`⚠️ Model ${model} failed response check:`, JSON.stringify(data));
        lastError = data.error?.message || "No content candidate returned.";
      }
    } catch (e: any) {
      console.warn(`⚠️ Model ${model} request crashed:`, e.message);
      lastError = e.message;
    }
  }

  throw new Error(lastError || "All models failed to respond.");
};

export default function LiveChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<IMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hi there! I am Mozie, your Amozart AI Assistant. 🎵 How can I help you with your music distribution today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // ─── Sending Message ────────────────────────────────────────────────────────
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: IMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    let aiResponseText = "";
    try {
      if (process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
        aiResponseText = await fetchGeminiAIResponse(textToSend);
      } else {
        // Fallback to local rule engine if API key is not configured
        aiResponseText = getAIResponse(textToSend);
      }
    } catch (error) {
      console.warn("AI API request failed, using local rule fallback:", error);
      aiResponseText = getAIResponse(textToSend);
    }

    const aiMsg: IMessage = {
      id: Math.random().toString(),
      sender: "ai",
      text: aiResponseText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessageItem = ({ item }: { item: IMessage }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userRow : styles.aiRow,
        ]}
      >
        {!isUser && (
          <View style={styles.avatar}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <View style={styles.onlineIndicatorRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Amozart  is Online</Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Chat List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingRow}>
            <View style={styles.avatar}>
              <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            </View>
            <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          </View>
        )}

        {/* Suggestion Chips */}
        {messages.length < 4 && !isTyping && (
          <View style={styles.chipsContainer}>
            <FlatList
              horizontal
              data={SUGGESTION_CHIPS}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => handleSend(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chipText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Input Section */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type your question..."
            value={inputText}
            onChangeText={setInputText}
            style={styles.textInput}
            placeholderTextColor="#94A3B8"
            autoCorrect={false}
            onSubmitEditing={() => handleSend(inputText)}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? Colors.primary : "#E2E8F0" },
            ]}
            onPress={() => handleSend(inputText)}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={16} color={inputText.trim() ? "#FFFFFF" : "#94A3B8"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
   
 
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  onlineIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 4,
  },
  onlineText: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: "Poppins_400Regular",
  },

  // List content
  listContent: {
    padding: 16,
    gap: 16,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    maxWidth: "80%",
  },
  userRow: {
    alignSelf: "flex-end",
  },
  aiRow: {
    alignSelf: "flex-start",
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
  },
  userText: {
    color: "#FFFFFF",
  },
  aiText: {
    color: "#334155",
  },

  // Typing Row
  typingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignSelf: "flex-start",
    gap: 8,
  },
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // Suggestion Chips
  chipsContainer: {
    backgroundColor: "transparent",
    paddingVertical: 8,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  chipText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },

  // Input Container
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    fontSize: 14,
    color: "#1E293B",
    fontFamily: "Poppins_400Regular",
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
});
