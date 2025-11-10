import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useAuthStore } from "@/stores/useAuthStore";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import Artist from "../../../assets/images/artists.png";
import Catalogue from "../../../assets/images/catalogue.png";
import Chat from "../../../assets/images/chat.png";
import Contacts from "../../../assets/images/contacts.png";
import FAQs from "../../../assets/images/faqs.png";
import Royalties from "../../../assets/images/royalties.png";
import { LinearGradient } from "expo-linear-gradient";
import { Controller, useForm } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";

interface FormValues {
  title: string;
  description: string;
  status: string;
  user: number;
  attachment?: number;
}

export default function CustomDrawer(props: any) {
  const { user } = useAuthStore();
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    register,
  } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {
      title: "",
      description: "",
      status: "open",
      user: Number(user?.id),
      attachment: 0,
    },
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    name?: string;
    type?: string;
  } | null>(null);

  const onSubmit = () => {
    if (!subject || !message) {
      Alert.alert("Please fill all fields");
      return;
    }
    Alert.alert("Ticket Submitted", "Our support team will reach out soon.");
    setSubject("");
    setMessage("");
    setIsModalVisible(false);
  };

  // Open the system picker
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access photos is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        name: asset.fileName ?? "selected-image",
        type: asset.type ?? "image",
      });
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => props.navigation.closeDrawer()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.profileContainor}>
          <Image
            source={{
              uri:
                `${process.env.EXPO_PUBLIC_API_URL}${user?.Profile_image?.formats?.thumbnail?.url}` ||
                "",
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name || "Artist"}</Text>
        </View>
      </View>
      {/* Drawer Items */}
      {/* Artists */}
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          props.navigation.navigate("MainTabs", {
            screen: "HomeTab",

            params: { screen: "Artist" },
          })
        }
      >
        <Image
          source={Artist}
          style={{
            width: 20,

            height: 20,
          }}
        />
        <Text style={styles.itemText}>Artists</Text>
      </TouchableOpacity>
      {/* Catalogue */}
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          props.navigation.navigate("MainTabs", {
            screen: "HomeTab",

            params: { screen: "Artist" },
          })
        }
      >
        <Image
          source={Catalogue}
          style={{
            width: 20,

            height: 20,
          }}
        />
        <Text style={styles.itemText}>Catalogue</Text>
      </TouchableOpacity>
      {/* Royalties */}
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          props.navigation.navigate("MainTabs", {
            screen: "HomeTab",

            params: { screen: "Artist" },
          })
        }
      >
        <Image
          source={Royalties}
          style={{
            width: 20,

            height: 20,
          }}
        />
        <Text style={styles.itemText}>Royalties</Text>
      </TouchableOpacity>
      {/* FAQs */}
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          props.navigation.navigate("MainTabs", {
            screen: "HomeTab",

            params: { screen: "Artist" },
          })
        }
      >
        <Image
          source={FAQs}
          style={{
            width: 20,

            height: 20,
          }}
        />
        <Text style={styles.itemText}>FAQs</Text>
      </TouchableOpacity>
      {/* Live Chat */}
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          props.navigation.navigate("MainTabs", {
            screen: "HomeTab",

            params: { screen: "Artist" },
          })
        }
      >
        <Image
          source={Chat}
          style={{
            width: 20,

            height: 20,
          }}
        />
        <Text style={styles.itemText}>Live Chat</Text>
      </TouchableOpacity>
      {/* Open Modal Instead of Screen */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          props.navigation.closeDrawer();

          setIsModalVisible(true);
        }}
      >
        <Image
          source={Contacts}
          style={{
            width: 20,

            height: 20,
          }}
        />
        <Text style={styles.itemText}>Contact Form</Text>
      </TouchableOpacity>
      {/* Support Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View
              style={{
                flexDirection: "row",

                justifyContent: "space-between",

                alignItems: "center",

                marginBottom: 16,
              }}
            >
              <Text style={styles.modalTitle}>Raise a Support Ticket</Text>

              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={Colors.gray} />
              </TouchableOpacity>
            </View>

            <LinearGradient
              colors={[
                "rgba(17,17,17,0)",
                "rgba(17,17,17,1)",
                "rgba(17,17,17,0)",
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                width: "100%",

                height: 1,

                marginBottom: 16,
              }}
            />
            <form>
              <View>
                <Text style={styles.label}>Write a descriptive title</Text>
                <Controller
                  name="title"
                  control={control}
                  rules={{
                    required: "Title is required",
                    minLength: {
                      value: 4,
                      message: "Title must be at least 4 characters",
                    },
                  }}
                  render={({ field }) => (
                    <TextInput
                      placeholder="Subject"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      style={styles.input}
                    />
                  )}
                />
              </View>
              <View>
                <Text style={styles.label}>Upload Attachment</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={pickImage}
                  style={[
                    styles.uploadBox,
                    selectedImage ? styles.activeBorder : styles.inactiveBorder,
                  ]}
                >
                  <View style={styles.inner}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={18}
                      color={Colors.primary}
                    />
                    <Text style={styles.text}>
                      Tap to <Text style={styles.highlight}>Browse</Text> or
                      choose a file
                    </Text>

                    {selectedImage ? (
                      <>
                        <Text style={styles.fileName}>
                          {selectedImage.name}
                        </Text>
                        <Image
                          source={{ uri: selectedImage.uri }}
                          style={styles.preview}
                          resizeMode="cover"
                        />
                      </>
                    ) : (
                      <Text style={styles.subText}>
                        Supported formats: JPEG, PNG, TIFF (Max. 6MB)
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              <View>
                <Text style={styles.label}>Explain the problem</Text>
                <Controller
                  name="description"
                  control={control}
                  rules={{
                    required: "Description is required",
                    minLength: {
                      value: 4,
                      message: "Description must be at least 4 characters",
                    },
                  }}
                  render={({ field }) => (
                    <TextInput
                      placeholder="Describe your issue..."
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      multiline
                      style={[styles.input, styles.textArea]}
                    />
                  )}
                />
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: Colors.primary }]}
                  onPress={handleSubmit(onSubmit)}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </form>
          </View>
        </View>
      </Modal>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "flex-start",
    paddingTop: 4,
    paddingLeft: 12,
    gap: 20,
  },
  backButton: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 8,
  },
  profileContainor: {
    gap: 6,
    justifyContent: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 40,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 8,
  },
  itemText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.lightBlack,
    fontFamily: "Poppins_400Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  label: {
    color: Colors.gray,
    marginBottom: 6,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    marginHorizontal: 5,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  uploadBox: {
    marginBottom: 15,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBorder: {
    borderColor: "#7C3AED",
    backgroundColor: "#F5F3FF",
  },
  inactiveBorder: {
    borderColor: "#B3B3B3",
  },
  inner: {
    alignItems: "center",
  },
  text: {
    color: "#0F0F0F",
    fontSize: 14,
    textAlign: "center",
  },
  highlight: {
    color: "#7C3AED",
    fontWeight: "600",
  },
  subText: {
    marginTop: 4,
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  fileName: {
    marginTop: 6,
    color: "#22C55E",
    fontSize: 12,
  },
  preview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginTop: 8,
  },
});
