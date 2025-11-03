/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { useArtistList, useCreateArtist } from "@/hooks/useArtistList";
import { useUpdateTrack, useTrack } from "@/hooks/useTrack";
import { useDraftFlow } from "@/hooks/useDraft";
import { genresList, rolesList } from ".";
import SelectInputField from "@/components/common/SelectInputField";
import InputField from "@/components/modules/InputField";
import { Colors } from "@/theme/colors";

interface TrackEditModalProps {
  visible: boolean;
  trackIndex: number;
  onClose: (
    trackIndex: number,
    stepCompleted: boolean,
    currentStep: number,
    trackId: number | null,
    formData: any
  ) => void;
}

const requiredRoles = ["Primary Artist", "Composer", "Lyricist", "Vocals"];

const TrackEditModalExpo: React.FC<TrackEditModalProps> = ({
  visible,
  trackIndex,
  onClose,
}) => {
  const { control, watch, setValue, trigger, getValues } = useFormContext();
  const releaseType = watch("ReleaseType");
  // trackIndex is a numeric index into TrackList; read the actual trackId from the form state
  const trackId = watch(`TrackList.${trackIndex}.trackId`);
  console.log(trackId, "Id");
  const { data: trackData } = useTrack(trackId);

  const {
    fields: roleFields,
    append: appendRole,
    remove: removeRole,
  } = useFieldArray({
    control,
    name: `TrackList.${trackIndex}.RoleCredits`,
  });

  const { artists } = useArtistList();
  const { createArtist } = useCreateArtist();
  const { mutate: updateTrack, isPending } = useUpdateTrack();
  const { step3Mutation } = useDraftFlow();

  const [artistQuery, setArtistQuery] = useState<string>("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [localArtists, setLocalArtists] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [artistQueries, setArtistQueries] = useState<Record<number, string>>(
    {}
  );
  const [visibleSuggestions, setVisibleSuggestions] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (artists) setLocalArtists(artists);
  }, [artists]);

  useEffect(() => {
    console.log(trackData, trackId, "Data");
    if (trackId && trackData) {
      setValue(`TrackList.${trackIndex}.TrackName`, trackData.TrackName || "");
      setValue(
        `TrackList.${trackIndex}.PrimaryGenre`,
        trackData.PrimaryGenre || ""
      );
      setValue(
        `TrackList.${trackIndex}.SecondaryGenre`,
        trackData.SecondaryGenre || ""
      );
      setValue(`TrackList.${trackIndex}.ISRC`, trackData.ISRC || "");
      setValue(`TrackList.${trackIndex}.ISWC`, trackData.ISWC || "");
      setValue(
        `TrackList.${trackIndex}.LyricsAvailable`,
        trackData.LyricsAvailable ?? false
      );
      setValue(
        `TrackList.${trackIndex}.AppropriateForAllAudiences`,
        trackData.AppropriateForAllAudiences ?? false
      );
      setValue(
        `TrackList.${trackIndex}.ContainsExplicitContent`,
        trackData.ContainsExplicitContent ?? false
      );
      setValue(
        `TrackList.${trackIndex}.CleanVersionAvailable`,
        trackData.CleanVersionAvailable ?? false
      );
      setValue(
        `TrackList.${trackIndex}.RequestANewISRC`,
        trackData.RequestANewISRC ?? false
      );

      if (trackData.RoleCredits && trackData.RoleCredits.length) {
        setValue(`TrackList.${trackIndex}.RoleCredits`, trackData.RoleCredits);
      } else {
        const current = getValues(`TrackList.${trackIndex}.RoleCredits`);
        if (!current || !current.length) {
          setValue(`TrackList.${trackIndex}.RoleCredits`, [
            { artistName: "", roleName: "Primary Artist" },
            { artistName: "", roleName: "Composer" },
            { artistName: "", roleName: "Lyricist" },
            { artistName: "", roleName: "Vocals" },
          ]);
        }
      }
    }
  }, [trackData, trackId, setValue, trackIndex]);

  const suggestions = useMemo(() => {
    const q = artistQuery.trim().toLowerCase();
    if (!q) return [];
    return localArtists
      .filter((a) => a.name?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [artistQuery, localArtists]);

  const handleCreateArtist = async (name: string) => {
    if (!name?.trim()) return;
    try {
      const created = await createArtist({ artistName: name });
      const newArtist = created?.artistName ?? created;
      setLocalArtists((prev) => [newArtist, ...prev]);
      setArtistQuery("");
      setSuggestionsVisible(false);
      Alert.alert("Success", "Artist created successfully.");
      return newArtist;
    } catch (err: any) {
      console.error("create artist failed", err);
      Alert.alert("Error", err?.message || "Failed to create artist.");
      throw err;
    }
  };

  const validateRoleCredits = (roleCredits: any[]) => {
    // Must have all required roles
    const hasAllRoles = requiredRoles.every((role) =>
      roleCredits?.some(
        (credit: any) =>
          credit.roleName === role && credit.artistName?.trim()?.length > 0
      )
    );

    if (!hasAllRoles) {
      return "Each required role (Primary Artist, Composer, Lyricist, Vocals) must have an artist name.";
    }

    return true;
  };

  const handleNext = async () => {
    const ok = await trigger(`TrackList.${trackIndex}.RoleCredits`);
    if (!ok) return;

    const roleCredits = getValues(`TrackList.${trackIndex}.RoleCredits`) || [];
    const validation = validateRoleCredits(roleCredits);
    if (validation !== true) {
      Alert.alert("Validation Error", validation);
      return;
    }

    if (currentStep < 1) {
      setCurrentStep((s) => s + 1);
      return;
    }

    const formData = getValues(`TrackList.${trackIndex}`);

    try {
      if (trackId) {
        await updateTrack({ trackId, payload: formData }, {
          onSuccess: () => {
            Alert.alert("Success", "Track updated successfully.");
            onClose(
              trackIndex,
              currentStep === 1,
              currentStep,
              trackId,
              formData
            );
          },
          onError: (err: any) => {
            Alert.alert("Error", err?.message || "Failed to update track.");
          },
        } as any);
      } else {
        await step3Mutation.mutateAsync({ ...formData, tracks: [formData] }, {
          onSuccess: (data: any) => {
            Alert.alert("Success", "Track created successfully.");
            const newId = data?.data?.TrackList?.[trackIndex]?.id;
            if (newId) setValue(`TrackList.${trackIndex}.trackId`, newId);
            onClose(
              trackIndex,
              currentStep === 1,
              currentStep,
              data.data.TrackList?.[trackIndex]?.id || 0,
              formData
            );
          },
          onError: (err: any) => {
            Alert.alert("Error", err?.message || "Failed to create track.");
          },
        } as any);
      }
    } catch (err: any) {
      console.error("save track failed:", err);
      Alert.alert("Error", err?.message || "Something went wrong.");
    }
  };
  const handleDialogClose = () => {
    const stepCompleted = currentStep === 1;
    const formData = getValues(`TrackList.${trackIndex}`);
    onClose(trackIndex, stepCompleted, currentStep, formData.trackId, formData);
  };

  const handleBack = () => {
    if (currentStep === 0) handleDialogClose;
    else setCurrentStep((s) => s - 1);
  };

  const updateArtistName = (idx: number, name: string) => {
    setValue(`TrackList.${trackIndex}.RoleCredits.${idx}.artistName`, name, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setArtistQuery("");
    setSuggestionsVisible(false);
  };

  const renderRoleRow = (idx: number) => {
    const roleCredits = getValues(`TrackList.${trackIndex}.RoleCredits`) || [];
    const roleName = watch(
      `TrackList.${trackIndex}.RoleCredits.${idx}.roleName`
    );

    const query = artistQueries[idx] || "";
    const isVisible = visibleSuggestions[idx] || false;

    // Count duplicates of same role
    const countOfRole = (role: string) =>
      roleCredits.filter((rc: any) => rc.roleName === role).length;
    const showRemoveButton = countOfRole(roleName) > 1;

    const handleArtistSelect = (
      name: string,
      onChange: (val: string) => void
    ) => {
      setValue(`TrackList.${trackIndex}.RoleCredits.${idx}.artistName`, name, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setArtistQueries((prev) => ({ ...prev, [idx]: "" }));
      setVisibleSuggestions((prev) => ({ ...prev, [idx]: false }));
      onChange(name);
    };

    return (
      <View key={idx} style={styles.roleRow}>
        <View style={{ flexDirection: "column", gap: 6, flex: 1 }}>
          <Text
            style={[
              styles.smallLabel,
              { marginBottom: 6, color: Colors.gray, fontSize: 14 },
            ]}
          >
            Artist Name
          </Text>

          <Controller
            control={control}
            name={`TrackList.${trackIndex}.RoleCredits.${idx}.artistName`}
            rules={{
              validate: (val) => {
                if (requiredRoles.includes(roleName)) {
                  if (!val || val.trim().length === 0)
                    return `${roleName} must have an artist name`;
                }
                return true;
              },
            }}
            render={({
              field: { value, onChange, onBlur },
              fieldState: { error },
            }) => {
              const currentValue = query || value || "";

              return (
                <View>
                  <TextInput
                    style={[
                      styles.smallInput,
                      error ? { borderColor: "red" } : {},
                    ]}
                    placeholder="Select or type artist"
                    value={currentValue}
                    onChangeText={(text) => {
                      setArtistQueries((prev) => ({ ...prev, [idx]: text }));
                      setVisibleSuggestions((prev) => ({
                        ...prev,
                        [idx]: true,
                      }));
                      onChange(text);
                    }}
                    onBlur={onBlur}
                  />

                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}

                  {isVisible && query.trim().length > 0 && (
                    <View style={styles.suggestionsBox}>
                      <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: 8 }}
                        style={{ maxHeight: 160 }}
                      >
                        {localArtists
                          .filter((a) =>
                            a.name?.toLowerCase().includes(query.toLowerCase())
                          )
                          .slice(0, 6)
                          .map((item) => (
                            <TouchableOpacity
                              key={item.id?.toString() || item.name}
                              style={styles.suggestionItem}
                              onPress={() =>
                                handleArtistSelect(item.name, onChange)
                              }
                            >
                              <Text style={styles.suggestionText}>
                                {item.name}
                              </Text>
                            </TouchableOpacity>
                          ))}

                        {/* Add new artist option */}
                        {query.trim().length > 0 && (
                          <TouchableOpacity
                            style={styles.createArtistRow}
                            onPress={async () => {
                              try {
                                const newArtist = await handleCreateArtist(
                                  query.trim()
                                );
                                handleArtistSelect(
                                  newArtist as string,
                                  onChange
                                );
                              } catch {
                                // handled inside handleCreateArtist
                              }
                            }}
                          >
                            <Ionicons name="add" size={16} color="#6739B7" />
                            <Text style={styles.createArtistText}>
                              Add "{query.trim()}"
                            </Text>
                          </TouchableOpacity>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              );
            }}
          />

          <SelectInputField
            control={control}
            placeholder="Select the Role"
            items={rolesList}
            name={`TrackList.${trackIndex}.RoleCredits.${idx}.roleName`}
            rules={{ required: "Role is required" }}
            label="Search Roles"
            zIndex={2}
          />
        </View>

        {showRemoveButton && (
          <View style={styles.roleActions}>
            <TouchableOpacity
              onPress={() => removeRole(idx)}
              style={styles.removeRoleBtn}
            >
              <Ionicons name="trash-outline" size={18} color="#b91c1c" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOuter}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.headerLeft}>
              <Ionicons name="chevron-back" size={22} color="#111" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Tracks</Text>

            <View style={styles.headerRight}>
              <Text style={styles.stepCounter}>{currentStep + 1}/2</Text>
            </View>
          </View>

          {/* ... rest of form content remains identical ... */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Step 0 */}
            {currentStep === 0 && (
              <View>
                {/* Track name */}
                <Controller
                  control={control}
                  name={`TrackList.${trackIndex}.TrackName`}
                  rules={{
                    required: "Track Name is required",
                    maxLength: {
                      value: 200,
                      message: "Track Name cannot exceed 200 characters",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9\s]{2,200}$/, // allows letters, numbers, spaces
                      message:
                        "Only alphanumeric characters and spaces allowed (2–200 characters)",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <InputField
                      label="Track Name"
                      placeholder="Enter track name"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                {/* Genre selects */}
                {releaseType !== "Single" && (
                  <>
                    <Text
                      style={[
                        { marginVertical: 4, color: Colors.gray, fontSize: 14 },
                      ]}
                    >
                      Genre(Multiple tracks if it's an album or EP etc.)
                    </Text>
                    <View
                      style={{
                        flexDirection: "column",
                        gap: 6,
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <SelectInputField
                        placeholder="Primary Genre"
                        items={genresList}
                        name={`TrackList.${trackIndex}.PrimaryGenre`}
                        control={control}
                        rules={{ required: "Primary Genre is Required" }}
                        zIndex={2}
                        style={{
                          width: "100%",
                        }}
                      />
                      <SelectInputField
                        placeholder="Secondary Genre(optional)"
                        items={genresList}
                        name={`TrackList.${trackIndex}.SecondaryGenre`}
                        control={control}
                        zIndex={2}
                        style={{
                          marginTop: 0,
                          width: "100%",
                        }}
                      />
                    </View>
                  </>
                )}
                {/* Credits header + add role button */}
                <View style={styles.rowBetween}>
                  <Text style={[styles.label, { marginBottom: 6 }]}>
                    Credits
                  </Text>
                  <TouchableOpacity
                    style={styles.addRoleBtn}
                    onPress={() => appendRole({ artistName: "", roleName: "" })}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.addRoleText}>Add Role</Text>
                  </TouchableOpacity>
                </View>

                {/* Render role rows from RHF field array */}
                <View>{roleFields.map((rf, idx) => renderRoleRow(idx))}</View>

                {/* Lyrics toggle */}
                <View style={styles.switchRow}>
                  <Text style={styles.label}>Lyrics Available?</Text>
                  <Controller
                    control={control}
                    name={`TrackList.${trackIndex}.LyricsAvailable`}
                    render={({ field }) => (
                      <Switch
                        value={!!field.value}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                </View>
              </View>
            )}

            {/* Step 1 */}
            {currentStep === 1 && (
              <View>
                <Text style={styles.label}>Explicit / Versions</Text>

                <View style={styles.switchCol}>
                  <View style={styles.switchRow}>
                    <Text style={styles.smallLabel}>
                      Appropriate for all audiences
                    </Text>
                    <Controller
                      control={control}
                      name={`TrackList.${trackIndex}.AppropriateForAllAudiences`}
                      render={({ field }) => (
                        <Switch
                          value={!!field.value}
                          onValueChange={field.onChange}
                        />
                      )}
                    />
                  </View>

                  <View style={styles.switchRow}>
                    <Text style={styles.smallLabel}>
                      Contains explicit content
                    </Text>
                    <Controller
                      control={control}
                      name={`TrackList.${trackIndex}.ContainsExplicitContent`}
                      render={({ field }) => (
                        <Switch
                          value={!!field.value}
                          onValueChange={field.onChange}
                        />
                      )}
                    />
                  </View>

                  <View style={styles.switchRow}>
                    <Text style={styles.smallLabel}>
                      Clean version available
                    </Text>
                    <Controller
                      control={control}
                      name={`TrackList.${trackIndex}.CleanVersionAvailable`}
                      render={({ field }) => (
                        <Switch
                          value={!!field.value}
                          onValueChange={field.onChange}
                        />
                      )}
                    />
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={styles.label}>ISRC</Text>
                  <Controller
                    control={control}
                    name={`TrackList.${trackIndex}.ISRC`}
                    render={({ field }) => (
                      <TextInput
                        style={styles.input}
                        placeholder="Enter ISRC (12 chars) or request a new one"
                        value={field.value}
                        onChangeText={field.onChange}
                        editable={
                          !getValues(`TrackList.${trackIndex}.RequestANewISRC`)
                        }
                      />
                    )}
                  />

                  <View style={styles.rowBetween}>
                    <Text style={styles.smallLabel}>Request a new ISRC</Text>
                    <Controller
                      control={control}
                      name={`TrackList.${trackIndex}.RequestANewISRC`}
                      render={({ field }) => (
                        <Switch
                          value={!!field.value}
                          onValueChange={(v) => {
                            field.onChange(v);
                            if (v) setValue(`TrackList.${trackIndex}.ISRC`, "");
                          }}
                        />
                      )}
                    />
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={styles.label}>ISWC</Text>
                  <Controller
                    control={control}
                    name={`TrackList.${trackIndex}.ISWC`}
                    rules={{
                      required: "ISWC is required",
                      pattern: {
                        value: /^[a-zA-Z0-9]{12}$/,
                        message: "Only 12 digit alphanumeric code",
                      },
                    }}
                    render={({ field }) => (
                      <TextInput
                        style={styles.input}
                        placeholder="Enter ISWC (12 alphanumeric)"
                        value={field.value}
                        onChangeText={field.onChange}
                      />
                    )}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerBtn, styles.backBtn]}
              onPress={handleBack}
            >
              <Text style={styles.backBtnText}>
                {currentStep === 0 ? "Cancel" : "Back"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerBtn, styles.nextBtn]}
              onPress={handleNext}
              disabled={isPending || step3Mutation.isPending}
            >
              <Text style={styles.nextBtnText}>
                {currentStep === 1 ? "Save" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default TrackEditModalExpo;

const styles = StyleSheet.create({
  modalOuter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 14,
    maxHeight: "92%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerLeft: { width: 40 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  headerRight: { width: 40, alignItems: "center" },
  stepCounter: { color: "#666" },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#111" },
  smallLabel: { fontSize: 13, color: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  row: { flexDirection: "row", gap: 8 },
  col: { flex: 1, paddingRight: 6 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addRoleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6739B7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addRoleText: { color: "#fff", marginLeft: 6 },
  roleRow: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  roleActions: { marginLeft: 8 },
  removeRoleBtn: {
    padding: 6,
    backgroundColor: "#FFF3F3",
    borderRadius: 8,
  },
  suggestionsBox: {
    position: "absolute",
    top: 46,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    maxHeight: 160,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  suggestionText: { color: "#111" },
  errorText: { color: Colors.error, fontSize: 12, marginTop: 4 },
  createArtistRow: { flexDirection: "row", alignItems: "center", padding: 10 },
  createArtistText: { marginLeft: 8, color: "#6739B7", fontWeight: "600" },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: "#fafafa",
  },
  rolePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 8,
  },
  rolePillActive: { backgroundColor: "#6739B7", borderColor: "#6739B7" },
  rolePillText: { color: "#444" },
  rolePillTextActive: { color: "#fff" },
  genrePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 8,
  },
  genrePillActive: { backgroundColor: "#6739B7", borderColor: "#6739B7" },
  genrePillText: { color: "#444" },
  genrePillTextActive: { color: "#fff" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  switchCol: { marginTop: 8 },
  footer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  backBtn: { backgroundColor: "#F3F3F3", marginRight: 8 },
  nextBtn: { backgroundColor: "#6739B7" },
  backBtnText: { color: "#111", fontWeight: "700" },
  nextBtnText: { color: "#fff", fontWeight: "700" },
});
