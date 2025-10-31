import { StepButtons } from "@/components/common/StepButtons";
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

const Step2: React.FC<Step2Props> = ({ onNext, onBack }) => {
  const [primaryGenre, setPrimaryGenre] = useState("");
  const [secondaryGenre, setSecondaryGenre] = useState("");
  const [label, setLabel] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Genre & Label</Text>
      <Text style={styles.subtitle}>Choose the genres and add your label info.</Text>

      <Text style={styles.label}>Primary Genre</Text>
      <TextInput
        placeholder="e.g. Pop"
        value={primaryGenre}
        onChangeText={setPrimaryGenre}
        style={styles.input}
      />

      <Text style={styles.label}>Secondary Genre</Text>
      <TextInput
        placeholder="e.g. Dance, Rock, Hip-hop"
        value={secondaryGenre}
        onChangeText={setSecondaryGenre}
        style={styles.input}
      />

      <Text style={styles.label}>Label</Text>
      <TextInput
        placeholder="Your label name (optional)"
        value={label}
        onChangeText={setLabel}
        style={styles.input}
      />

      <StepButtons onNext={onNext} onBack={onBack} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  label: { fontWeight: "600", fontSize: 14, marginBottom: 6 },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 14,
  },
});

export default Step2;
