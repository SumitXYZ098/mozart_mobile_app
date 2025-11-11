import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  Animated,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { debounce } from "lodash";
import { Colors } from "@/theme/colors";

interface DynamicSearchBarProps {
  onSearch?: (term: string) => void;
  style?: object;
  placeholder?: string;
  widthExpanded?: number;
  widthCollapsed?: number;
  debounceTime?: number;
}

const DynamicSearchBar: React.FC<DynamicSearchBarProps> = ({
  onSearch,
  style,
  placeholder = "Search",
  widthExpanded = 240,
  widthCollapsed = 40,
  debounceTime = 500,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const widthAnim = useRef(new Animated.Value(widthCollapsed)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // 🕐 Debounce handler
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        if (onSearch) onSearch(term);
        else console.log("Searching for:", term);
      }, debounceTime),
    [onSearch]
  );

  // 🧠 Expand/collapse animations
  const expandSearch = () => {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: widthExpanded,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsExpanded(true);
      inputRef.current?.focus();
    });
  };

  const collapseSearch = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: widthCollapsed,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsExpanded(false);
      setSearchTerm("");
    });
  };

  // 💬 Handle typing
  const handleChange = useCallback(
    (text: string) => {
      setSearchTerm(text);
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  // 🔎 Manual submit (Enter key or icon click)
  const handleSubmit = (
    e?: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => {
    const term = e ? e.nativeEvent.text : searchTerm;
    if (onSearch) onSearch(term.trim());
    else console.log("Searching for:", term.trim());
  };

  return (
    <Animated.View style={[styles.container, { width: widthAnim }, style]}>
      {/* 🔍 Search Icon Button */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => {
          if (isExpanded === false) expandSearch();
          else if (isExpanded === true) collapseSearch();
          else handleSubmit();
        }}
      >
        <MaterialCommunityIcons name="magnify" size={20} color={Colors.gray} />
      </TouchableOpacity>

      {/* 🧾 Input Field */}
      {isExpanded && (
        <Animated.View style={[styles.inputContainer, { opacity: fadeAnim }]}>
          <TextInput
            ref={inputRef}
            placeholder={placeholder}
            placeholderTextColor="#aaa"
            value={searchTerm}
            onChangeText={handleChange}
            onSubmitEditing={handleSubmit}
            style={styles.input}
            returnKeyType="search"
          />
        </Animated.View>
      )}

      {/* ❌ Clear button */}
      {isExpanded && searchTerm.length > 0 && (
        <TouchableOpacity onPress={collapseSearch} style={styles.clearButton}>
          <MaterialCommunityIcons name="close" size={18} color={Colors.gray} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  iconButton: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
  },
  input: {
    fontSize: 16,
    color: Colors.black,
    paddingVertical: 0,
    height: 32,
  },
  clearButton: {
    paddingHorizontal: 6,
  },
});

export default DynamicSearchBar;
