import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import EmptyProfile from "../../../../assets/images/emptyProfile.png";
import { LazyImage } from "@/components/modules/LazyImage";
import { updateArtistById } from "@/api/artistApi";
import { useArtistListById } from "@/hooks/useArtistList";

interface ArtistDetailsDialogProps {
  visible: boolean;
  onClose: () => void;
  artistId: string;
  onRefresh: () => void;
}

const ArtistDetailsDialog: React.FC<ArtistDetailsDialogProps> = ({
  visible,
  onClose,
  artistId,
  onRefresh,
}) => {
  const [verifying, setVerifying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { artist, loading, refetch } = useArtistListById(artistId);

  const profileImage =
    artist?.Profile_image?.formats?.thumbnail?.url ||
    artist?.Profile_image?.formats?.small?.url ||
    null;

  useEffect(() => {
    if (visible) {
      refetch?.(); // ✅ fetch again when dialog opens
    }
  }, [visible]);

  const sendVerification = async () => {
    try {
      setVerifying(true);
      setUploadProgress(0);
      await updateArtistById(
        Number(artistId),
        { requiredVerification: true },
        (progress) => setUploadProgress(progress)
      );
      Alert.alert("✅ Success", "Verification request sent successfully!");
      onRefresh?.(); // ✅ Refresh artist list in parent
      onClose?.();
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert("❌ Error", "Failed to send verification request.");
    } finally {
      setVerifying(false);
      setUploadProgress(0);
    }
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Artist Profile</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={28} color="#b3b3b3" />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ color: Colors.gray, marginTop: 8 }}>
                Loading artist details...
              </Text>
            </View>
          ) : artist ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Artist Info */}
              <View style={styles.artistRow}>
                {profileImage ? (
                  <LazyImage uri={profileImage} style={styles.profileImage} />
                ) : (
                  <Image source={EmptyProfile} style={styles.profileImage} />
                )}
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.artistName}>{artist.artistName}</Text>
                    {artist.itsVerified && (
                      <MaterialCommunityIcons
                        name="check-decagram"
                        size={22}
                        color={Colors.primary}
                      />
                    )}
                  </View>
                  <Text style={styles.bio} numberOfLines={3}>
                    {artist.biography || "No biography provided"}
                  </Text>
                </View>
              </View>

              {/* Verification Button */}
              {!artist.itsVerified && (
                <Pressable
                  style={[
                    styles.verifyButton,
                    {
                      backgroundColor: artist.requiredVerification
                        ? Colors.gray
                        : Colors.primary,
                    },
                    verifying && { opacity: 0.6, flexDirection: "row" },
                  ]}
                  disabled={verifying || artist.requiredVerification}
                  onPress={sendVerification}
                >
                  {verifying ? (
                    <>
                      <ActivityIndicator color={Colors.white} size="small" />
                      <Text style={[styles.verifyText, { marginLeft: 8 }]}>
                        Sending... {Math.round(uploadProgress)}%
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.verifyText}>
                      {artist.requiredVerification
                        ? "Verification In Progress"
                        : "Send for Verification"}
                    </Text>
                  )}
                </Pressable>
              )}

              <View style={styles.divider} />

              {/* Channels */}
              <Text style={styles.sectionTitle}>Channels</Text>
              <InfoRow label="Apple Music ID" value={artist.appleMusicId} />
              <InfoRow label="Spotify ID" value={artist.spotifyId} />
              <InfoRow
                label="YouTube Username"
                value={artist.youtubeUsername}
              />
              <InfoRow label="SoundCloud Page" value={artist.soundcloudPage} />

              <View style={styles.divider} />

              {/* Social Media */}
              <Text style={styles.sectionTitle}>Social Media</Text>
              <InfoRow label="Facebook Page" value={artist.facebookPage} />
              <InfoRow label="X (Twitter)" value={artist.twitterUsername} />
              <InfoRow label="Website" value={artist.websiteUrl} />
            </ScrollView>
          ) : (
            <Text style={{ textAlign: "center", color: Colors.gray }}>
              No artist data found.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "—"}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  dialog: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  artistRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  artistName: {
    fontSize: 18,
    fontWeight: "600",
  },
  bio: {
    color: "#555",
    marginTop: 4,
    fontSize: 14,
  },
  verifyButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: "#999",
    fontSize: 14,
  },
  value: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
});

export default ArtistDetailsDialog;
