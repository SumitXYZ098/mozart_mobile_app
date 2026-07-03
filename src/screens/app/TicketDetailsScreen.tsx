import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { useTicketStore } from "@/stores/ticketStore";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  getTicketMessages,
  sendTicketMessage,
  TicketMessage,
} from "@/api/issuesRaised";
import * as ImagePicker from "expo-image-picker";
import {
  uploadFile,
  getUploadFileById,
} from "@/api/uploadApi";

export default function TicketDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { ticketId } = route.params;
  const { user } = useAuthStore();
  
  const { selectedTicket, selectLoading, fetchTicketById } = useTicketStore();
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState("");
  
  // Attachment state for messages
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentProgress, setAttachmentProgress] = useState(0);
  const [msgAttachmentId, setMsgAttachmentId] = useState<number | null>(null);
  const [msgAttachmentUrl, setMsgAttachmentUrl] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadData();
  }, [ticketId]);

  const loadData = async () => {
    fetchTicketById(ticketId);
    loadMessages();
  };

  const loadMessages = async () => {
    setLoadingMessages(true);
    const msgs = await getTicketMessages(ticketId);
    // Sort chronologically
    msgs.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    setMessages(msgs);
    setLoadingMessages(false);
    
    // Scroll to end
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const handlePickAttachment = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission Required", "Please allow access to your photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const selected = result.assets[0];
      let file: any;
      if (Platform.OS === "web" && selected.file) {
        file = selected.file;
      } else {
        const localUri = selected.uri;
        const filename = selected.fileName || localUri.split("/").pop() || "reply-attach.jpg";
        const type = selected.mimeType || "image/jpeg";
        file = { uri: localUri, name: filename, type };
      }

      setUploadingAttachment(true);
      setAttachmentProgress(0);

      // Smooth progress simulation
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        if (progressValue < 90) {
          progressValue += Math.floor(Math.random() * 8) + 4;
          if (progressValue > 90) progressValue = 90;
          setAttachmentProgress(progressValue);
        }
      }, 60);

      try {
        const uploaded = await uploadFile(file, () => {});
        clearInterval(progressInterval);
        
        let remaining = progressValue;
        const finalizeInterval = setInterval(() => {
          if (remaining < 100) {
            remaining += 2;
            if (remaining >= 100) {
              remaining = 100;
              clearInterval(finalizeInterval);
              setTimeout(async () => {
                const imageId = uploaded?.[0]?.id;
                if (imageId) {
                  setMsgAttachmentId(imageId);
                  const fileInfo = await getUploadFileById(imageId);
                  setMsgAttachmentUrl(fileInfo?.formats?.thumbnail?.url || fileInfo?.url);
                }
                setUploadingAttachment(false);
              }, 100);
            }
            setAttachmentProgress(remaining);
          }
        }, 10);
      } catch (err: any) {
        clearInterval(progressInterval);
        setUploadingAttachment(false);
        throw err;
      }
    } catch (err: any) {
      console.error("❌ Reply attachment upload failed:", err);
      Alert.alert("Upload Error", "Failed to upload image.");
    }
  };

  const handleSendMessage = async () => {
    if (!replyText.trim() && !msgAttachmentId) return;

    try {
      await sendTicketMessage(ticketId, replyText, msgAttachmentId);
      setReplyText("");
      setMsgAttachmentId(null);
      setMsgAttachmentUrl(null);
      
      // Reload message list
      await loadMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
      Alert.alert("Error", "Failed to send message.");
    }
  };

  const getStatusStyle = (status: string) => {
    const st = status?.toLowerCase() || "";
    if (st.includes("progress") || st.includes("assign")) {
      return { bg: "#E0F2FE", text: "#0369A1", label: "In Progress" };
    } else if (st.includes("resolve") || st.includes("close")) {
      return { bg: "#DCFCE7", text: "#15803D", label: "Resolved" };
    }
    return { bg: "#F3E8FF", text: "#7E22CE", label: "Open" };
  };

  const formatCategory = (cat: string) => {
    const mapping: Record<string, string> = {
      technical_issue: "Technical Issue",
      content_management: "Content Management",
      arrange_meeting_call: "Arrange Meeting Call",
      quality_control_process: "Quality Control Process",
      copyright_claims: "Copyright Claims",
      invoices_payments: "Invoices & Payments",
      terminate_my_contract: "Terminate My Contract",
      general_question: "General Question",
      other: "Other",
    };
    return mapping[cat] || cat || "General Issue";
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const date = d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${date} ${hours}:${minutes} ${ampm}`;
  };

  const renderHeaderComponent = () => {
    if (!selectedTicket) return null;
    const statusInfo = getStatusStyle(selectedTicket.status);
    const ticketNo = selectedTicket.ticketNumber || (selectedTicket.id ? `TKT-${selectedTicket.id.slice(0, 6).toUpperCase()}` : "");

    return (
      <View style={styles.detailContainer}>
        {/* Ticket Header parameters */}
        <View style={styles.detailCard}>
          <View style={styles.row}>
            <Text style={styles.detailTitle}>{selectedTicket.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.statusText, { color: statusInfo.text }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
          <Text style={styles.detailId}>Ticket ID : {ticketNo}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaVal}>{formatCategory(selectedTicket.category || "")}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Assigned To</Text>
              <Text style={styles.metaVal}>{selectedTicket.user?.name || "Not Assigned"}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Created</Text>
              <Text style={styles.metaVal}>{formatDateTime(selectedTicket.createdAt)}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Updated</Text>
              <Text style={styles.metaVal}>{formatDateTime(selectedTicket.updatedAt)}</Text>
            </View>
          </View>

          <LinearGradientLine />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{selectedTicket.description}</Text>

          {selectedTicket.attachment && (
            <View style={styles.attachmentContainer}>
              <Text style={styles.sectionTitle}>Attachments</Text>
              <TouchableOpacity
                onPress={() => Alert.alert("Attachment", "Opening file...")}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: selectedTicket.attachment }}
                  style={styles.attachmentImg}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.threadTitle}>Replies & Conversation</Text>
      </View>
    );
  };

  const renderMessageItem = ({ item }: { item: TicketMessage }) => {
    // Check if the sender matches user or support
    const isMe = item.sender?.id === user?.id;

    return (
      <View style={[styles.msgRow, isMe ? styles.msgMeRow : styles.msgSupportRow]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleSupport]}>
          {!isMe && (
            <Text style={styles.senderName}>{item.sender?.name || "Support"}</Text>
          )}
          
          {item.attachment && (
            <Image
              source={{ uri: item.attachment }}
              style={styles.msgAttachment}
              resizeMode="cover"
            />
          )}

          {item.message ? (
            <Text style={[styles.msgText, isMe ? styles.msgMeText : styles.msgSupportText]}>
              {item.message}
            </Text>
          ) : null}
          
          <Text style={[styles.msgTime, isMe ? styles.msgMeTime : styles.msgSupportTime]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Details</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Message Area */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {selectLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessageItem}
            ListHeaderComponent={renderHeaderComponent}
            contentContainerStyle={styles.listContainer}
            refreshing={loadingMessages}
            onRefresh={loadMessages}
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          {/* Attachment Preview (if any) */}
          {msgAttachmentUrl && (
            <View style={styles.inputAttachPreview}>
              <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${msgAttachmentUrl}` }} style={styles.attachThumb} />
              <TouchableOpacity
                style={styles.attachCloseBtn}
                onPress={() => {
                  setMsgAttachmentId(null);
                  setMsgAttachmentUrl(null);
                }}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}

          {uploadingAttachment && (
            <View style={styles.uploadingBar}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.uploadingText}>Uploading attachment... {attachmentProgress}%</Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.clipBtn}
              onPress={handlePickAttachment}
              disabled={uploadingAttachment}
            >
              <Ionicons name="attach" size={24} color={Colors.primary} />
            </TouchableOpacity>

            <TextInput
              placeholder="Type your reply..."
              value={replyText}
              onChangeText={setReplyText}
              placeholderTextColor={Colors.gray}
              style={styles.chatInput}
              multiline
            />

            <TouchableOpacity
              style={[styles.sendBtn, (!replyText.trim() && !msgAttachmentId) ? styles.sendBtnDisabled : {}]}
              onPress={handleSendMessage}
              disabled={!replyText.trim() && !msgAttachmentId}
            >
              <Ionicons name="send" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Subcomponent to render a thin line separator
function LinearGradientLine() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 14,
        width: "100%",
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
   
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingBottom: 24,
  },
  detailContainer: {
    padding: 20,
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  detailId: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 14,
  },
  metaCard: {
    width: "48.5%",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    minHeight: 58,
    justifyContent: "center",
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 16,
  },
  attachmentContainer: {
    marginTop: 10,
  },
  attachmentImg: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  threadTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginTop: 24,
    marginBottom: 4,
  },
  // Msg Bubbles
  msgRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  msgMeRow: {
    justifyContent: "flex-end",
  },
  msgSupportRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 2,
  },
  bubbleSupport: {
    backgroundColor: "#E5E7EB",
    borderBottomLeftRadius: 2,
  },
  senderName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
  },
  msgText: {
    fontSize: 14.5,
    lineHeight: 20,
  },
  msgMeText: {
    color: Colors.white,
  },
  msgSupportText: {
    color: "#1F2937",
  },
  msgTime: {
    fontSize: 9.5,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  msgMeTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  msgSupportTime: {
    color: "#6B7280",
  },
  msgAttachment: {
    width: 180,
    height: 120,
    borderRadius: 8,
    marginBottom: 6,
  },
  // Chat input
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clipBtn: {
    padding: 8,
    marginRight: 6,
  },
  chatInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#111827",
    paddingTop: 10,
    paddingBottom: 10,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  // Attachment preview inside input
  inputAttachPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 6,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  attachThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 6,
  },
  attachCloseBtn: {
    padding: 2,
  },
  uploadingBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  uploadingText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 6,
    fontWeight: "500",
  },
});
