import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import SelectInputField from "@/components/common/SelectInputField";
import { rolesList } from ".";
import { Colors } from "@/theme/colors";
import { useArtistList, useCreateArtist } from "@/hooks/useArtistList";
import { toast } from "@/stores/useToastStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { getArtistsLimit } from "@/utils/utils";
import { ArtistLimitModal } from "@/components/common/ArtistLimitModal";


export default function ReleaseCreditsSection() {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ReleaseCredits",
  });
  
  const [limitModalVisible, setLimitModalVisible] = useState(false);

  
  useEffect(() => {
    const credits = watch("ReleaseCredits");
    console.log("Current Credits:");

    if (!credits || credits.length === 0) {
      setValue("ReleaseCredits", [
        {
          artistName: "",
          roleName: "Primary Artist",
        },
        {
          artistName: "",
          roleName: "Composer",
        },
        {
          artistName: "",
          roleName: "Lyricist",
        },
        {
          artistName: "",
          roleName: "Producer",
        },
      ]);
    }
  }, []);



  const { user } = useAuthStore();
  const { artists, loading } = useArtistList();
  const { createArtist } = useCreateArtist();

  const [artistQueries, setArtistQueries] = useState<Record<number, string>>({});
  const [visibleSuggestions, setVisibleSuggestions] = useState<Record<number, boolean>>({});
  const [localArtists, setLocalArtists] = useState<any[]>([]);

  useEffect(() => {
    if (artists) {
      setLocalArtists(artists);
    }
  }, [artists]);

  const handleCreateArtist = async (name: string, roleName?: string) => {
    if (!name?.trim()) return;
    // Only enforce artist limit for Primary Artist role
    if (!roleName || roleName === "Primary Artist") {
      const limit = getArtistsLimit(user);
      const primaryArtistsCount = artists.filter(
        (a) => {
          const r = a.role;
          return !r || r === "Primary Artist";
        }
      ).length;

      if (primaryArtistsCount >= limit) {
        setLimitModalVisible(true);
        throw new Error("Limit reached");
      }
    }

    try {
      const created = (await createArtist({ artistName: name, roleName })) as any;
      let artistName = name;
      if (created) {
        if (created.artistName) {
          artistName = created.artistName;
        } else if (created.data?.attributes?.artistName) {
          artistName = created.data.attributes.artistName;
        }
      }
      const artistObj = { name: artistName, role: roleName };
      
      setLocalArtists((prev) => [artistObj, ...prev]);
    
      toast.success("Artist created successfully.");
      return artistObj.name;
    } catch (err: any) {
      console.error("create artist failed", err);
      toast.error(err?.message || "Failed to create artist.");
      throw err;
    }
  };
  return (
    <View style={{ marginTop: 25 }}>
      <ArtistLimitModal
        visible={limitModalVisible}
        onClose={() => setLimitModalVisible(false)}
        planName={user?.latest_subscription?.plan?.name || "Artist Plus"}
        limit={getArtistsLimit(user)}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={styles.sectionTitle}>Credits</Text>

        <TouchableOpacity
          onPress={() =>
            append({
              artistName: "",
              roleName: "",
            })
          }
          style={styles.addRoleBtn}
        >
          <Plus size={16} color="#fff" />
          <Text style={styles.addRoleText}>Add Role</Text>
        </TouchableOpacity>
      </View>

      {fields.map((item, index) => (
        <View
          key={item.id}
          style={[styles.creditCard, { zIndex: 100 - index }]}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.cardHeaderTitle}>
                {watch(`ReleaseCredits.${index}.roleName`) || "New Credit"}
              </Text>
            </View>
            {index >= 4 && (
              <TouchableOpacity
                onPress={() => remove(index)}
                style={styles.cardRemoveBtn}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>

          {/* Role */}
          <Controller
            control={control}
            name={`ReleaseCredits.${index}.roleName`}
            rules={{
              required: "Role required",
            }}
            render={({ field }) => (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.inputLabel}>Role</Text>
                <SelectInputField
                  placeholder="Select Role"
                  items={rolesList}
                  value={field.value}
                  onChange={field.onChange}
                  style={{
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: "#F8FAFC",
                  }}
                />
              </View>
            )}
          />

          {/* Artist */}
          <Controller
            control={control}
            name={`ReleaseCredits.${index}.artistName`}
            rules={{
              required: "Artist required",
            }}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
              const query = artistQueries[index] || "";
              const isVisible = visibleSuggestions[index] || false;
              const currentValue = query || value || "";

              const handleArtistSelect = (name: string) => {
                setValue(`ReleaseCredits.${index}.artistName`, name, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setArtistQueries((prev) => ({ ...prev, [index]: "" }));
                setVisibleSuggestions((prev) => ({ ...prev, [index]: false }));
                onChange(name);
              };

              return (
                <View style={{ position: "relative" }}>
                  <Text style={styles.inputLabel}>Artist Name</Text>
                  <View style={[
                    styles.inputContainer,
                    error && styles.inputError,
                    isVisible && styles.inputFocused
                  ]}>
                    <Ionicons 
                      name="person-outline" 
                      size={18} 
                      color={isVisible ? (Colors.primary || "#6739B7") : "#94A3B8"} 
                      style={{ marginRight: 10 }} 
                    />
                    <TextInput
                      placeholder="Type or select artist"
                      value={currentValue}
                      onChangeText={(text) => {
                        setArtistQueries((prev) => ({ ...prev, [index]: text }));
                        setVisibleSuggestions({
                          [index]: true,
                        });
                        onChange(text);
                      }}
                      onFocus={() => {
                        setVisibleSuggestions({
                          [index]: true,
                        });
                      }}
                      onBlur={onBlur}
                      style={styles.textInput}
                      placeholderTextColor="#94A3B8"
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setVisibleSuggestions((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }));
                      }}
                      style={{ padding: 4 }}
                    >
                      <Ionicons
                        name={isVisible ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>

                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}

                  {isVisible && (localArtists.length > 0 || query.trim().length > 0 || loading) && (
                    <View style={styles.suggestionsBox}>
                      {loading ? (
                        <View style={{ padding: 16, alignItems: "center" }}>
                          <ActivityIndicator size="small" color={Colors.primary || "#6739B7"} />
                        </View>
                      ) : (
                        <ScrollView
                          keyboardShouldPersistTaps="handled"
                          contentContainerStyle={{ paddingVertical: 4 }}
                          style={{ maxHeight: 180 }}
                          showsVerticalScrollIndicator={false}
                        >
                          {localArtists
                            .filter((a) => {
                              const artistRole = a.role || a.roleName || "";
                              const currentRole = watch(`ReleaseCredits.${index}.roleName`);
                              if (artistRole !== currentRole) {
                                return false;
                              }
                              return (a.name || a.artistName || "")
                                .toLowerCase()
                                .includes(query.toLowerCase());
                            })
                            .slice(0, 6)
                            .map((item) => {
                              const name = item.name || item.artistName || "";
                              const isSelected = name === value;
                              return (
                                <TouchableOpacity
                                  key={item.id?.toString() || name}
                                  style={[
                                    styles.suggestionItem,
                                    isSelected && styles.suggestionItemSelected
                                  ]}
                                  onPress={() => handleArtistSelect(name)}
                                >
                                  <View style={styles.suggestionLeft}>
                                    <View style={[
                                      styles.avatarPlaceholder,
                                      isSelected && { backgroundColor: "#DDD6FE" }
                                    ]}>
                                      <Text style={[
                                        styles.avatarText,
                                        isSelected && { color: Colors.primary || "#6739B7" }
                                      ]}>
                                        {name.charAt(0).toUpperCase()}
                                      </Text>
                                    </View>
                                    <Text style={[
                                      styles.suggestionText,
                                      isSelected && styles.suggestionTextSelected
                                    ]}>
                                      {name}
                                    </Text>
                                  </View>
                                  {isSelected && (
                                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary || "#6739B7"} />
                                  )}
                                </TouchableOpacity>
                              );
                            })}

                        {/* Add new artist option */}
                        {query.trim().length > 0 && (
                          <TouchableOpacity
                            style={styles.createArtistRow}
                            onPress={async () => {
                              const currentRole = watch(`ReleaseCredits.${index}.roleName`);
                              try {
                                const newArtistName = await handleCreateArtist(
                                  query.trim(),
                                  currentRole
                                );
                                if (newArtistName) {
                                  handleArtistSelect(newArtistName);
                                }
                              } catch {
                                // handled inside handleCreateArtist
                              }
                            }}
                          >
                            <View style={styles.createArtistIconContainer}>
                              <Ionicons name="person-add" size={16} color={Colors.primary || "#6739B7"} />
                            </View>
                            <Text style={styles.createArtistText}>
                              Create Artist "{query.trim()}"
                            </Text>
                          </TouchableOpacity>
                        )}
                      </ScrollView>
                    )}
                    </View>
                  )}
                </View>
              );
            }}
          />
        </View>
      ))}

      {!!errors?.ReleaseCredits && (
        <Text
          style={{
            color: Colors.red || "red",
            marginTop: 10,
            fontSize: 13,
            fontFamily: "Poppins_400Regular",
          }}
        >
          Credits must include Primary Artist, Composer, Lyricist and Producer.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  creditCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  numberBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    fontFamily: "Poppins_600SemiBold",
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "Poppins_600SemiBold",
  },
  cardRemoveBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    fontFamily: "Poppins_600SemiBold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: "#F8FAFC",
  },
  inputFocused: {
    borderColor: "#DDD6FE",
    backgroundColor: "#FFFFFF",
    shadowColor: "#6739B7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  inputError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF5F5",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    fontFamily: "Poppins_400Regular",
    padding: 0,
  },
  errorText: {
    color: Colors.red || "#E53935",
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },
  suggestionsBox: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 180,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  suggestionItemSelected: {
    backgroundColor: "#F5F3FF",
  },
  suggestionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    fontFamily: "Poppins_600SemiBold",
  },
  suggestionText: {
    fontSize: 14,
    color: "#334155",
    fontFamily: "Poppins_400Regular",
  },
  suggestionTextSelected: {
    color: "#6739B7",
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  createArtistRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F5F3FF",
    gap: 10,
  },
  createArtistIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
  },
  createArtistText: {
    color: "#6739B7",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  addRoleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6739B7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#6739B7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addRoleText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
