import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { StepButtons } from "@/components/common/StepButtons";

interface Step4Props {
  onNext: () => void;
  onBack: () => void;
}

interface TrackItem {
  id: string;
  name: string;
  size: number;
}

const Step4: React.FC<Step4Props> = ({ onNext, onBack }) => {
  const [tracks, setTracks] = useState<TrackItem[]>([]);

  const handlePickTrack = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setTracks((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: file.name,
          size: file.size || 0,
        },
      ]);
    } catch (error) {
      console.log("File pick error:", error);
    }
  };

  const renderItem = ({ item }: { item: TrackItem }) => (
    <View style={styles.trackCard}>
      <Text style={styles.trackName}>{item.name}</Text>
      <Text style={styles.trackSize}>
        {(item.size / (1024 * 1024)).toFixed(2)} MB
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Track List</Text>
      <Text style={styles.subtitle}>
        Upload your audio files (MP3, WAV, FLAC, etc.)
      </Text>

      <TouchableOpacity style={styles.uploadBox} onPress={handlePickTrack}>
        <Text style={styles.uploadText}>Tap to upload or browse audio</Text>
      </TouchableOpacity>

      {tracks.length > 0 ? (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>No tracks uploaded yet</Text>
      )}

      <TouchableOpacity onPress={handlePickTrack} style={styles.addButton}>
        <Text style={styles.addText}>+ Add Track</Text>
      </TouchableOpacity>

      <StepButtons onNext={onNext} onBack={onBack} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  uploadBox: {
    height: 150,
    borderWidth: 2,
    borderColor: "#DDD",
    borderStyle: "dashed",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  uploadText: { color: "#8C52FF", fontWeight: "600" },
  list: { maxHeight: 200, marginBottom: 20 },
  trackCard: {
    backgroundColor: "#F8F8F8",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trackName: { fontWeight: "600", fontSize: 14 },
  trackSize: { color: "#666", fontSize: 12 },
  addButton: {
    borderWidth: 1,
    borderColor: "#8C52FF",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  addText: { color: "#8C52FF", fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#AAA", marginBottom: 16 },
});

export default Step4;
