import { StepButtons } from "@/components/common/StepButtons";
import React from "react";
import { Text, View } from "react-native";

interface Step5Props {
  onNext: () => void;
  onBack: () => void;
}

const Step5: React.FC<Step5Props> = ({ onBack, onNext }) => {
  return (
    <View>
      <Text>Step5</Text>
      <StepButtons onBack={onBack} onNext={onNext} />
    </View>
  );
};

export default Step5;
