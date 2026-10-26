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
  type TextInputInstance,
  type TextInputSubmitEditingEvent,
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
  const inputRef = useRef<TextInputInstance>(null);

  // 🕐 Debounce handler
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        if (onSearch) onSearch(term);
        else console.log("Searching for:", term);
      }, debounceTime),
    [onSearch, debounceTime]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // 🧠 Expand/collapse animations
  const expandSearch = () => {
    setIsExpanded(true);
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
      inputRef.current?.focus();
    });
  };

  const collapseSearch = () => {
    Keyboard.dismiss();
    debouncedSearch.cancel();
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
      if (onSearch) onSearch("");
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
  const handleSubmit = (e?: TextInputSubmitEditingEvent) => {
    const term = e ? e.nativeEvent.text : searchTerm;
    debouncedSearch.cancel();
    if (onSearch) onSearch(term.trim());
    else console.log("Searching for:", term.trim());
  };

  const handleClear = () => {
    setSearchTerm("");
    debouncedSearch.cancel();
    if (onSearch) onSearch("");
    inputRef.current?.focus();
  };

  return (
    <Animated.View style={[styles.container, { width: widthAnim }, style]}>
      {/* 🔍 Search Icon Button */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => {
          if (!isExpanded) {
            expandSearch();
          } else {
            handleSubmit();
          }
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
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
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
