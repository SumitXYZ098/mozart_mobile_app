import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Share,
  Modal,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCountryStore } from "@/stores/useCountryStore";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { useTranslation } from "@/utils/translations";
import { useNavigation } from "@react-navigation/native";
import { LazyImage } from "@/components/modules/LazyImage";
import { LinearGradient } from "expo-linear-gradient";
import Creator from "../../../assets/images/creator.png";
import * as ImagePicker from "expo-image-picker";
import { uploadFile } from "@/api/uploadApi";
import { ENDPOINTS } from "@/api/endpoints";
import axios from "axios";
import Svg, { Path, G, Defs, ClipPath, Rect } from "react-native-svg";

const LANGUAGES_BY_COUNTRY = {
  IN: [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা" },
    { code: "mr", name: "Marathi", nativeName: "मराठी" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
    { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  ],
  CA: [
    { code: "en", name: "English", nativeName: "English" },
    { code: "fr", name: "French", nativeName: "Français" },
  ],
  US: [
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español" },
  ],
};



const ReferFriendIcon = () => (
  <Svg width={24} height={22} viewBox="0 0 24 22" fill="none">
    <Path
      d="M3.60469 5.69531C3.60469 3.22969 5.61094 1.22812 8.07187 1.22812C10.5328 1.22812 12.5438 3.23437 12.5438 5.69531C12.5438 7.08281 11.9156 8.36719 10.8188 9.225C10.0266 9.83906 9.075 10.1672 8.07187 10.1672C7.81875 10.1672 7.575 10.1438 7.33125 10.1063C7.15781 10.0781 6.98906 10.0359 6.825 9.98906C6.62813 9.93281 6.44062 9.86719 6.25312 9.78281C5.925 9.6375 5.62031 9.45 5.32969 9.225H5.325C4.23281 8.37187 3.60469 7.08281 3.60469 5.69531ZM14.4844 20.8125C14.4187 20.7281 14.3531 20.6484 14.2922 20.5641C14.2547 20.5125 14.2219 20.4563 14.1844 20.4C14.1328 20.325 14.0813 20.2453 14.0391 20.1656C14.0063 20.1094 13.9734 20.0484 13.9453 19.9875C13.9031 19.9078 13.8609 19.8234 13.8281 19.7438C13.8 19.6828 13.7766 19.6219 13.7484 19.5563C13.7156 19.4719 13.6828 19.3875 13.6547 19.2984C13.6312 19.2375 13.6172 19.1766 13.5938 19.1109C13.5656 19.0172 13.5469 18.9234 13.5234 18.8344C13.5094 18.7781 13.4953 18.7172 13.4859 18.6516C13.4625 18.5484 13.4484 18.4453 13.4344 18.3375C13.4297 18.2859 13.4203 18.2344 13.4109 18.1828C13.3969 18.0281 13.3875 17.8688 13.3875 17.7094C13.3875 17.6063 13.3922 17.5078 13.3969 17.4047C13.3969 17.3719 13.4016 17.3391 13.4062 17.3016C13.4109 17.2359 13.4156 17.1703 13.425 17.1047C13.4297 17.0672 13.4344 17.0297 13.4391 16.9875C13.4484 16.9312 13.4578 16.8703 13.4672 16.8141C13.4766 16.7719 13.4812 16.7297 13.4906 16.6875C13.5047 16.6359 13.5141 16.5797 13.5281 16.5234C13.5375 16.4813 13.5516 16.4391 13.5609 16.3969C13.575 16.3453 13.5891 16.2891 13.6031 16.2422C13.6172 16.2 13.6313 16.1578 13.6453 16.1156C13.6641 16.0641 13.6781 16.0125 13.6969 15.9656C13.7109 15.9234 13.7297 15.8812 13.7484 15.8391C13.7672 15.7922 13.7906 15.7406 13.8094 15.6938C13.8281 15.6563 13.8469 15.6094 13.8656 15.5719L13.9359 15.4313C13.9594 15.3938 13.9734 15.3516 14.0016 15.3141C14.025 15.2672 14.0531 15.225 14.0812 15.1781C14.1047 15.1406 14.1281 15.1031 14.1516 15.0656C14.1797 15.0187 14.2078 14.9766 14.2406 14.9297C14.2687 14.8922 14.2922 14.8594 14.3156 14.8219C14.3484 14.775 14.3859 14.7328 14.4188 14.6906C14.4469 14.6578 14.4703 14.625 14.4938 14.5922C14.5313 14.5453 14.5734 14.4984 14.6109 14.4562C14.6344 14.4281 14.6578 14.4 14.6859 14.3719C14.7375 14.3156 14.7937 14.2594 14.85 14.2031L14.8922 14.1609C14.9625 14.0906 15.0375 14.025 15.1078 13.9641C15.1312 13.9406 15.1547 13.9266 15.1781 13.9078C15.225 13.8703 15.2719 13.8281 15.3187 13.7953C15.2859 13.7297 15.2531 13.6641 15.2156 13.5984C15.1641 13.5047 15.1125 13.4109 15.0609 13.3219C14.9953 13.2094 14.925 13.0969 14.8547 12.9891C14.7984 12.9 14.7375 12.8156 14.6766 12.7266C14.6016 12.6187 14.5219 12.5156 14.4375 12.4172C14.3719 12.3328 14.3109 12.2531 14.2406 12.1734C14.1562 12.0703 14.0672 11.9766 13.9734 11.8828C13.9031 11.8078 13.8328 11.7328 13.7578 11.6625C13.6641 11.5688 13.5609 11.4797 13.4625 11.3953C13.3875 11.3297 13.3125 11.2641 13.2375 11.1984C13.1297 11.1094 13.0125 11.0297 12.9 10.95C12.825 10.8938 12.75 10.8375 12.675 10.7859C12.5437 10.7016 12.4125 10.6219 12.2766 10.5422C12.2062 10.5047 12.1453 10.4578 12.0703 10.4203C11.8641 10.3078 11.6531 10.2047 11.4375 10.1109C11.3344 10.0641 11.2312 10.0219 11.1281 9.98438C11.1 10.0078 11.0625 10.0266 11.0344 10.05C10.9828 10.0875 10.9266 10.1203 10.8703 10.1578C10.8047 10.2 10.7391 10.2422 10.6734 10.275C10.6172 10.3078 10.5609 10.3406 10.5047 10.3688C10.4344 10.4016 10.3688 10.4391 10.2938 10.4719C10.2375 10.5 10.1812 10.5234 10.125 10.5469C10.0547 10.5797 9.97969 10.6031 9.90937 10.6359C9.85312 10.6594 9.79219 10.6781 9.73594 10.6969C9.66094 10.725 9.58594 10.7438 9.50625 10.7672C9.45 10.7813 9.39375 10.8 9.33281 10.8141C9.24844 10.8328 9.16875 10.8469 9.08438 10.8656C9.02812 10.875 8.97656 10.8891 8.92031 10.8984C8.82656 10.9125 8.73281 10.9266 8.63906 10.9313C8.59219 10.9359 8.54531 10.9453 8.50312 10.95C8.35781 10.9594 8.21719 10.9641 8.07656 10.9641C7.93125 10.9641 7.79062 10.9594 7.65 10.95C7.60312 10.9453 7.55625 10.9359 7.50937 10.9313C7.41562 10.9219 7.32188 10.9125 7.23281 10.8984C7.17656 10.8891 7.125 10.875 7.06875 10.8656C6.98438 10.8516 6.90469 10.8328 6.82031 10.8141C6.76406 10.8 6.70781 10.7813 6.65156 10.7672C6.57656 10.7438 6.49687 10.725 6.42188 10.6969C6.36562 10.6781 6.30469 10.6594 6.24844 10.6313C6.17344 10.6031 6.10312 10.5797 6.03281 10.5469C5.97656 10.5234 5.92031 10.4953 5.85938 10.4719C5.78906 10.4391 5.72344 10.4063 5.65312 10.3688C5.59687 10.3406 5.54063 10.3078 5.48438 10.275C5.41875 10.2375 5.35313 10.2 5.2875 10.1578C5.23125 10.125 5.17969 10.0875 5.12344 10.05C5.09063 10.0266 5.05781 10.0125 5.02969 9.98438C2.01094 11.1328 0 14.0297 0 17.2594C0 17.8266 0.065625 18.4031 0.192187 18.975C0.525 20.4563 1.81875 21.4922 3.3375 21.4922H12.8156C13.4484 21.4922 14.0719 21.3 14.5969 20.9531C14.5922 20.9484 14.5875 20.9438 14.5828 20.9391C14.55 20.8969 14.5172 20.8547 14.4844 20.8125ZM15.5062 6.15469C15.7312 6.32812 15.9703 6.46875 16.2188 6.58125C16.4859 6.69844 16.7625 6.7875 17.0531 6.83438C17.2406 6.8625 17.4281 6.88125 17.625 6.88125C18.3984 6.88125 19.1297 6.63281 19.7391 6.15469C20.5828 5.49844 21.0656 4.50469 21.0656 3.44063C21.0656 1.54219 19.5187 0 17.6203 0C15.7219 0 14.175 1.54219 14.175 3.44063C14.1797 4.50469 14.6625 5.49844 15.5062 6.15469ZM22.1531 16.1203C22.3641 16.6266 22.4672 17.1609 22.4672 17.7141C22.4672 19.9969 20.6062 21.8578 18.3234 21.8578C17.25 21.8578 16.2328 21.45 15.4594 20.7094C14.6437 19.9313 14.175 18.8391 14.175 17.7141C14.175 16.3125 14.8734 15.0188 16.0406 14.25C16.7203 13.8047 17.5078 13.5656 18.3234 13.5656C18.6375 13.5656 18.9469 13.5984 19.2469 13.6688C19.3781 13.7016 19.5094 13.7391 19.6406 13.7812C20.4703 14.0578 21.1922 14.5875 21.7078 15.3094C21.7641 15.3938 21.8203 15.4781 21.8766 15.5625C21.9797 15.7406 22.0734 15.9281 22.1531 16.1203ZM20.9156 17.7141C20.9156 17.4234 20.6812 17.1891 20.3906 17.1891H18.8484V15.6469C18.8484 15.3563 18.6141 15.1219 18.3234 15.1219C18.0328 15.1219 17.7984 15.3563 17.7984 15.6469V17.1891H16.2562C15.9703 17.1891 15.7313 17.4234 15.7313 17.7141C15.7313 18 15.9656 18.2391 16.2562 18.2391H17.7984V19.7812C17.7984 20.0719 18.0328 20.3063 18.3234 20.3063C18.6141 20.3063 18.8484 20.0719 18.8484 19.7812V18.2391H20.3906C20.6812 18.2391 20.9156 18.0047 20.9156 17.7141ZM20.0438 6.91406L19.9875 6.95156C19.9453 6.97969 19.9031 7.00313 19.8609 7.02656C19.8047 7.05938 19.7531 7.09688 19.6922 7.12969C19.65 7.15313 19.6078 7.17656 19.5656 7.2C19.5094 7.22813 19.4531 7.25625 19.3922 7.28438C19.35 7.30313 19.3031 7.32188 19.2609 7.34063C19.2 7.36406 19.1437 7.3875 19.0781 7.41094C19.0312 7.425 18.9891 7.44375 18.9469 7.45781C18.8813 7.48125 18.8203 7.49531 18.7547 7.51406C18.7078 7.52813 18.6656 7.54219 18.6234 7.55156C18.5578 7.56563 18.4922 7.57969 18.4219 7.59375C18.3797 7.60313 18.3375 7.60781 18.2953 7.61719C18.2203 7.62656 18.1453 7.63594 18.0703 7.64531C18.0328 7.65 17.9953 7.65469 17.9578 7.65938C17.8453 7.66875 17.7328 7.67344 17.6156 7.67344C17.4984 7.67344 17.3859 7.66875 17.2734 7.65938C17.2359 7.65 17.1984 7.6 17.1609 7.64531C17.0859 7.63594 17.0109 7.63125 16.9359 7.61719C16.8891 7.60781 16.8469 7.60313 16.8047 7.59375C16.7391 7.57969 16.6734 7.56563 16.6078 7.55156C16.5609 7.54219 16.5187 7.52813 16.4719 7.51406C16.4109 7.5 16.3453 7.48125 16.2844 7.45781C16.2375 7.44375 16.1953 7.425 16.1484 7.41094C16.0875 7.3875 16.0312 7.36406 15.9703 7.34063C15.9234 7.32188 15.8812 7.30313 15.8391 7.28438C15.7828 7.25625 15.7219 7.22813 15.6656 7.2C15.6234 7.17656 15.5813 7.15313 15.5391 7.12969C15.4828 7.09688 15.4266 7.06406 15.3703 7.02656C15.3281 7.00313 15.2859 6.975 15.2484 6.95156C15.2297 6.9375 15.2109 6.92344 15.1922 6.91406C13.9078 7.41563 12.8203 8.35781 12.1312 9.55781C12.1406 9.5625 12.1453 9.56719 12.1547 9.57188C12.3375 9.66094 12.5156 9.75938 12.6891 9.8625C12.7125 9.87656 12.7359 9.89063 12.7547 9.9C12.9281 10.0031 13.0969 10.1156 13.2609 10.2281C13.2891 10.2516 13.3219 10.2703 13.35 10.2938C13.5141 10.4109 13.6687 10.5328 13.8234 10.6594C13.8469 10.6781 13.8703 10.6969 13.8937 10.7203C14.0484 10.8516 14.2031 10.9922 14.3484 11.1328C14.3531 11.1375 14.3531 11.1375 14.3531 11.1375C14.5031 11.2828 14.6437 11.4328 14.7797 11.5922C14.8031 11.6156 14.8266 11.6437 14.8453 11.6672C14.9766 11.8172 15.0984 11.9719 15.2156 12.1313C15.2391 12.1641 15.2625 12.1969 15.2859 12.225C15.4031 12.3891 15.5156 12.5531 15.6234 12.7219C15.6375 12.7453 15.6516 12.7688 15.6609 12.7875C15.7641 12.9609 15.8672 13.1344 15.9562 13.3125C15.9609 13.3219 15.9703 13.3359 15.975 13.3453L16.1437 13.2609C16.1719 13.2469 16.2 13.2328 16.2281 13.2141C16.3313 13.1672 16.4344 13.125 16.5328 13.0875C16.5563 13.0781 16.5844 13.0688 16.6078 13.0594C16.6875 13.0312 16.7719 13.0031 16.8516 12.975C16.8891 12.9656 16.9266 12.9516 16.9641 12.9422C17.0344 12.9234 17.1047 12.9047 17.175 12.8859C17.2172 12.8766 17.2594 12.8672 17.3016 12.8578C17.3719 12.8438 17.4375 12.8297 17.5125 12.8203C17.5547 12.8109 17.5969 12.8062 17.6391 12.7969C17.7141 12.7875 17.7891 12.7828 17.8641 12.7734C17.8969 12.7688 17.9344 12.7641 17.9719 12.7641C18.0844 12.7547 18.1969 12.7547 18.3094 12.7547C18.4266 12.7547 18.5531 12.7594 18.6656 12.7687C18.7031 12.7734 18.7453 12.7781 18.7828 12.7781C18.8578 12.7875 18.9375 12.7922 19.0172 12.8063C19.0641 12.8156 19.1063 12.8203 19.1531 12.8297C19.2234 12.8438 19.2891 12.8531 19.3594 12.8672C19.4109 12.8766 19.4531 12.8906 19.5047 12.9C19.5703 12.9188 19.6359 12.9328 19.7016 12.9516C19.7531 12.9656 19.7953 12.9797 19.8469 12.9984C19.9125 13.0219 19.9734 13.0406 20.0344 13.0641C20.0812 13.0781 20.1281 13.1016 20.175 13.1203C20.2359 13.1437 20.2969 13.1719 20.3578 13.1953C20.4047 13.2188 20.4516 13.2375 20.4938 13.2609C20.55 13.2891 20.6109 13.3172 20.6672 13.35C20.7141 13.3781 20.7563 13.4016 20.7984 13.425L20.9672 13.5281C21.0094 13.5563 21.0516 13.5797 21.0938 13.6125C21.15 13.65 21.2016 13.6875 21.2578 13.7297C21.2953 13.7578 21.3375 13.7859 21.375 13.8188C21.4266 13.8609 21.4828 13.9078 21.5297 13.95C21.5672 13.9781 21.6 14.0109 21.6375 14.0438C21.6891 14.0906 21.7406 14.1422 21.7922 14.1938C21.825 14.2219 21.8578 14.25 21.8859 14.2828C21.9422 14.3438 21.9984 14.4094 22.0547 14.475C22.0734 14.4984 22.0969 14.5219 22.1156 14.5453C22.1906 14.6344 22.2609 14.7281 22.3312 14.8219C22.3453 14.8453 22.3594 14.8641 22.3734 14.8875C22.425 14.9625 22.4766 15.0375 22.5234 15.1172C22.5469 15.1547 22.5609 15.1922 22.5844 15.2297C22.6172 15.2859 22.65 15.3422 22.6828 15.3984C22.7484 15.3562 22.8141 15.3094 22.8703 15.2625C23.3062 14.9156 23.6156 14.4234 23.7375 13.8797C24.4172 10.9594 22.8281 7.99687 20.0438 6.91406ZM22.1531 16.1203C22.3641 16.6266 22.4672 17.1609 22.4672 17.7141C22.4672 19.9969 20.6062 21.8578 18.3234 21.8578C17.25 21.8578 16.2328 21.45 15.4594 20.7094C14.6437 19.9313 14.175 18.8391 14.175 17.7141C14.175 16.3125 14.8734 15.0188 16.0406 14.25C16.7203 13.8047 17.5078 13.5656 18.3234 13.5656C18.6375 13.5656 18.9469 13.5984 19.2469 13.6688C19.3781 13.7016 19.5094 13.7391 19.6406 13.7812C20.4703 14.0578 21.1922 14.5875 21.7078 15.3094C21.7641 15.3938 21.8203 15.4781 21.8766 15.5625C21.9797 15.7406 22.0734 15.9281 22.1531 16.1203ZM20.9156 17.7141C20.9156 17.4234 20.6812 17.1891 20.3906 17.1891H18.8484V15.6469C18.8484 15.3563 18.6141 15.1219 18.3234 15.1219C18.0328 15.1219 17.7984 15.3563 17.7984 15.6469V17.1891H16.2562C15.9703 17.1891 15.7313 17.4234 15.7313 17.7141C15.7313 18 15.9656 18.2391 16.2562 18.2391H17.7984V19.7812C17.7984 20.0719 18.0328 20.3063 18.3234 20.3063C18.6141 20.3063 18.8484 20.0719 18.8484 19.7812V18.2391H20.3906C20.6812 18.2391 20.9156 18.0047 20.9156 17.7141ZM20.0438 6.91406L19.9875 6.95156C19.9453 6.97969 19.9031 7.00313 19.8609 7.02656C19.8047 7.05938 19.7531 7.09688 19.6922 7.12969C19.65 7.15313 19.6078 7.17656 19.5656 7.2C19.5094 7.22813 19.4531 7.25625 19.3922 7.28438C19.35 7.30313 19.3031 7.32188 19.2609 7.34063C19.2 7.36406 19.1437 7.3875 19.0781 7.41094C19.0312 7.425 18.9891 7.44375 18.9469 7.45781C18.8813 7.48125 18.8203 7.49531 18.7547 7.51406C18.7078 7.52813 18.6656 7.54219 18.6234 7.55156C18.5578 7.56563 18.4922 7.57969 18.4219 7.59375C18.3797 7.60313 18.3375 7.60781 18.2953 7.61719C18.2203 7.62656 18.1453 7.63594 18.0703 7.64531C18.0328 7.65 17.9953 7.65469 17.9578 7.65938C17.8453 7.66875 17.7328 7.67344 17.6156 7.67344C17.4984 7.67344 17.3859 7.66875 17.2734 7.65938C17.2359 7.65 17.1984 7.6 17.1609 7.64531C17.0859 7.63594 17.0109 7.63125 16.9359 7.61719C16.8891 7.60781 16.8469 7.60313 16.8047 7.59375C16.7391 7.57969 16.6734 7.56563 16.6078 7.55156C16.5609 7.54219 16.5187 7.52813 16.4719 7.51406C16.4109 7.5 16.3453 7.48125 16.2844 7.45781C16.2375 7.44375 16.1953 7.425 16.1484 7.41094C16.0875 7.3875 16.0312 7.36406 15.9703 7.34063C15.9234 7.32188 15.8812 7.30313 15.8391 7.28438C15.7828 7.25625 15.7219 7.22813 15.6656 7.2C15.6234 7.17656 15.5813 7.15313 15.5391 7.12969C15.4828 7.09688 15.4266 7.06406 15.3703 7.02656C15.3281 7.00313 15.2859 6.975 15.2484 6.95156C15.2297 6.9375 15.2109 6.92344 15.1922 6.91406C13.9078 7.41563 12.8203 8.35781 12.1312 9.55781C12.1406 9.5625 12.1453 9.56719 12.1547 9.57188C12.3375 9.66094 12.5156 9.75938 12.6891 9.8625C12.7125 9.87656 12.7359 9.89063 12.7547 9.9C12.9281 10.0031 13.0969 10.1156 13.2609 10.2281C13.2891 10.2516 13.3219 10.2703 13.35 10.2938C13.5141 10.4109 13.6687 10.5328 13.8234 10.6594C13.8469 10.6781 13.8703 10.6969 13.8937 10.7203C14.0484 10.8516 14.2031 10.9922 14.3484 11.1328C14.3531 11.1375 14.3531 11.1375 14.3531 11.1375C14.5031 11.2828 14.6437 11.4328 14.7797 11.5922C14.8031 11.6156 14.8266 11.6437 14.8453 11.6672C14.9766 11.8172 15.0984 11.9719 15.2156 12.1313C15.2391 12.1641 15.2625 12.1969 15.2859 12.225C15.4031 12.3891 15.5156 12.5531 15.6234 12.7219C15.6375 12.7453 15.6516 12.7688 15.6609 12.7875C15.7641 12.9609 15.8672 13.1344 15.9562 13.3125C15.9609 13.3219 15.9703 13.3359 15.975 13.3453L16.1437 13.2609C16.1719 13.2469 16.2 13.2328 16.2281 13.2141C16.3313 13.1672 16.4344 13.125 16.5328 13.0875C16.5563 13.0781 16.5844 13.0688 16.6078 13.0594C16.6875 13.0312 16.7719 13.0031 16.8516 12.975C16.8891 12.9656 16.9266 12.9516 16.9641 12.9422C17.0344 12.9234 17.1047 12.9047 17.175 12.8859C17.2172 12.8766 17.2594 12.8672 17.3016 12.8578C17.3719 12.8438 17.4375 12.8297 17.5125 12.8203C17.5547 12.8109 17.5969 12.8062 17.6391 12.7969C17.7141 12.7875 17.7891 12.7828 17.8641 12.7734C17.8969 12.7688 17.9344 12.7641 17.9719 12.7641C18.0844 12.7547 18.1969 12.7547 18.3094 12.7547C18.4266 12.7547 18.5531 12.7594 18.6656 12.7687C18.7031 12.7734 18.7453 12.7781 18.7828 12.7781C18.8578 12.7875 18.9375 12.7922 19.0172 12.8063C19.0641 12.8156 19.1063 12.8203 19.1531 12.8297C19.2234 12.8438 19.2891 12.8531 19.3594 12.8672C19.4109 12.8766 19.4531 12.8906 19.5047 12.9C19.5703 12.9188 19.6359 12.9328 19.7016 12.9516C19.7531 12.9656 19.7953 12.9797 19.8469 12.9984C19.9125 13.0219 19.9734 13.0406 20.0344 13.0641C20.0812 13.0781 20.1281 13.1016 20.175 13.1203C20.2359 13.1437 20.2969 13.1719 20.3578 13.1953C20.4047 13.2188 20.4516 13.2375 20.4938 13.2609C20.55 13.2891 20.6109 13.3172 20.6672 13.35C20.7141 13.3781 20.7563 13.4016 20.7984 13.425L20.9672 13.5281C21.0094 13.5563 21.0516 13.5797 21.0938 13.6125C21.15 13.65 21.2016 13.6875 21.2578 13.7297C21.2953 13.7578 21.3375 13.7859 21.375 13.8188C21.4266 13.8609 21.4828 13.9078 21.5297 13.95C21.5672 13.9781 21.6 14.0109 21.6375 14.0438C21.6891 14.0906 21.7406 14.1422 21.7922 14.1938C21.825 14.2219 21.8578 14.25 21.8859 14.2828C21.9422 14.3438 21.9984 14.4094 22.0547 14.475C22.0734 14.4984 22.0969 14.5219 22.1156 14.5453C22.1906 14.6344 22.2609 14.7281 22.3312 14.8219C22.3453 14.8453 22.3594 14.8641 22.3734 14.8875C22.425 14.9625 22.4766 15.0375 22.5234 15.1172C22.5469 15.1547 22.5609 15.1922 22.5844 15.2297C22.6172 15.2859 22.65 15.3422 22.6828 15.3984C22.7484 15.3562 22.8141 15.3094 22.8703 15.2625C23.3062 14.9156 23.6156 14.4234 23.7375 13.8797C24.4172 10.9594 22.8281 7.99687 20.0438 6.91406Z"
      fill="#6739B7"
    />
  </Svg>
);

const LanguageIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <G clipPath="url(#clip0_7470_17818)">
      <Path
        d="M6.50197 6.42188H6.20103L5.63867 9.23438H7.06433L6.50197 6.42188Z"
        fill="#6739B7"
      />
      <Path
        d="M17.877 12.0469C18.1806 12.8625 18.5844 13.5226 19.0313 14.0844C19.4782 13.5226 19.9289 12.8624 20.2325 12.0469H17.877Z"
        fill="#6739B7"
      />
      <Path
        d="M21.8908 4.26562H13.1588L14.9795 18.8756C15.0117 19.4731 14.8483 20.0357 14.4583 20.4762L11.375 24H21.8908C23.054 24 24.0002 23.0538 24.0002 21.8906V6.42188C24.0002 5.25872 23.054 4.26562 21.8908 4.26562ZM21.8908 12.0469H21.703C21.3029 13.3305 20.6685 14.3348 20.0091 15.1267C20.5257 15.5989 21.078 15.9862 21.6271 16.4201C21.9299 16.6625 21.9794 17.1047 21.7363 17.4082C21.4943 17.7113 21.0504 17.7604 20.7482 17.5174C20.1515 17.0464 19.5915 16.6522 19.0314 16.1383C18.4714 16.6522 17.9582 17.0464 17.3615 17.5174C17.0593 17.7604 16.6154 17.7113 16.3734 17.4082C16.1303 17.1047 16.1798 16.6625 16.4826 16.4201C17.0317 15.9862 17.5372 15.5989 18.0537 15.1267C17.3944 14.3349 16.8067 13.3305 16.4067 12.0469H16.2189C15.8303 12.0469 15.5158 11.7324 15.5158 11.3438C15.5158 10.9551 15.8303 10.6406 16.2189 10.6406H18.3283V9.9375C18.3283 9.54886 18.6428 9.23438 19.0314 9.23438C19.4201 9.23438 19.7345 9.54886 19.7345 9.9375V10.6406H21.8908C22.2794 10.6406 22.5939 10.9551 22.5939 11.3438C22.5939 11.7324 22.2794 12.0469 21.8908 12.0469Z"
        fill="#6739B7"
      />
      <Path
        d="M11.4452 1.84777C11.314 0.794437 10.4138 0 9.35231 0H2.10938C0.946219 0 0 0.946219 0 2.10938V17.6719C0 18.835 0.946219 19.7812 2.10938 19.7812C6.31266 19.7812 9.33642 19.7812 13.1977 19.7812C13.4028 19.5468 13.5748 19.4 13.582 19.0939C13.5838 19.0172 11.4547 1.92389 11.4452 1.84777ZM8.62238 13.4394C8.24953 13.5161 7.87186 13.2741 7.79498 12.888L7.34559 10.6406H5.35758L4.90819 12.888C4.83267 13.2684 4.46597 13.5183 4.0808 13.4394C3.70041 13.3632 3.45319 12.9931 3.52941 12.612L4.93561 5.58075C5.00152 5.25253 5.28994 5.01562 5.625 5.01562H7.07812C7.41319 5.01562 7.70161 5.25253 7.76752 5.58075L9.17377 12.612C9.24998 12.9931 9.00281 13.3632 8.62238 13.4394Z"
        fill="#6739B7"
      />
      <Path
        d="M8.21484 21.1875L8.3355 22.1522C8.41594 22.7983 8.84522 23.4571 9.55134 23.7861C10.8839 22.3192 10.0777 23.2066 11.9119 21.1875H8.21484Z"
        fill="#6739B7"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_7470_17818">
        <Rect width={24} height={24} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

const ChangePasswordIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.3965 18.8578V12.11C20.3965 10.9472 19.7186 9.94049 18.7383 9.46479V8.55055C18.7383 4.93852 15.8045 2 12.1982 2C8.59198 2 5.65823 4.93852 5.65823 8.55055V9.46479C4.67778 9.94042 4 10.9472 4 12.11V18.8578C4 20.4769 5.31511 21.7942 6.93069 21.7942H17.4658C19.0814 21.7942 20.3965 20.4769 20.3965 18.8578ZM12.1982 4.13607C14.6287 4.13607 16.6056 6.11621 16.6056 8.55055V9.1735H7.79081V8.55055C7.79081 6.11621 9.76775 4.13607 12.1982 4.13607ZM11.1316 16.2226V14.7452C11.1316 14.1556 11.6094 13.6771 12.1982 13.6771C12.7871 13.6771 13.2649 14.1556 13.2649 14.7452V16.2226C13.2649 16.8129 12.7871 17.2906 12.1982 17.2906C11.6094 17.2906 11.1316 16.8129 11.1316 16.2226Z"
      fill="#6739B7"
    />
  </Svg>
);

export default function ProfileScreen() {
  const { logOut, user, refreshUserProfile } = useAuthStore();
  const country = useCountryStore((state) => state.country);
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const countryKey = (country === "IN" || country === "CA" || country === "US") ? country : "US";
  const availableLanguages = LANGUAGES_BY_COUNTRY[countryKey];

  const handlePickProfileImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos to upload a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const selected = result.assets[0];
      let file: any;
      if (Platform.OS === "web" && selected.file) {
        file = selected.file;
      } else {
        const localUri = selected.uri;
        const filename = selected.fileName || localUri.split("/").pop() || "profile.jpg";
        const type = selected.mimeType || "image/jpeg";
        file = { uri: localUri, name: filename, type };
      }

      setUploading(true);

      const uploaded = await uploadFile(file, () => {});
      const imageId = uploaded?.id;

      if (imageId && user?.id) {
        await axios.put(
          ENDPOINTS.USER_DETAIL_BY_ID(user.id.toString()),
          { Profile_image: imageId },
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        await refreshUserProfile();
        Alert.alert("Success", "Profile image updated successfully.");
      }
    } catch (err: any) {
      console.error("❌ Profile upload failed:", err);
      Alert.alert(
        "Upload Error",
        err?.response?.data?.error?.message || err?.message || "Failed to update profile image."
      );
    } finally {
      setUploading(false);
    }
  };

  const menuList = [
    {
      title: t("refer_a_friend"),
      renderIcon: () => <ReferFriendIcon />,
      onPress: async () => {
        try {
          await Share.share({
            message: "Join Mozart App, the ultimate platform for music distribution! Download now.",
          });
        } catch (error) {
          console.log(error);
        }
      },
    },
    {
      title: t("language"),
      renderIcon: () => <LanguageIcon />,
      value: language,
      onPress: () => setLangModalVisible(true),
    },
    {
      title: t("change_password"),
      renderIcon: () => <ChangePasswordIcon />,
      onPress: () => {
        navigation.navigate("ChangePassword");
      },
    },
    {
      title: "Order History",
      renderIcon: () => (
        <Ionicons name="receipt" size={20} color={Colors.primary} />
      ),
      onPress: () => {
        navigation.navigate("OrderHistory");
      },
    },
  ];

  const secondaryMenuList = [
    {
      title: t("tc_privacy"),
      onPress: () => {
        Alert.alert("T&C & Privacy Policy", "Terms & Conditions and Privacy Policy will be open soon.");
      },
    },
    {
      title: t("customer_experience"),
      onPress: () => {
        Alert.alert("Customer Experience", "For support, email us at support@mozart.com.");
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("HomeTab")}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("settings_title")}</Text>
        <View style={styles.placeholder}></View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {user && (
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <LazyImage
                uri={user?.Profile_image?.formats?.thumbnail?.url || user?.Profile_image?.url || ""}
                style={{ width: 110, height: 110, borderRadius: 110 }}
              />
              <TouchableOpacity
                style={styles.cameraBadge}
                onPress={handlePickProfileImage}
                disabled={uploading}
                activeOpacity={0.8}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons name="camera" size={16} color={Colors.white} />
                )}
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.nameText}>{user?.name || "User Name"}</Text>
              <Text style={styles.emailText}>{user?.email}</Text>
            </View>
          </View>
        )}

        <View style={styles.planCardContainer}>
          <ImageBackground
            source={Creator}
            style={styles.planCard}
            imageStyle={{ borderRadius: 20 }}
          >
            <Text style={styles.planTitle}>
              {user?.latest_subscription?.plan?.name || "Creator Pro"}
            </Text>
            <Text style={styles.planDescription}>
              {user?.latest_subscription?.plan?.name === "Artist"
                ? "You're building momentum with 15 track uploads/year, basic royalty tracking, and distribution."
                : user?.latest_subscription?.plan?.name === "Artist Plus"
                  ? "You're getting unlimited uploads, advanced analytics, and collaborator royalty splits."
                  : user?.latest_subscription?.plan?.name === "Pro Label"
                    ? "You're getting priority distribution, custom label branding, and team management."
                    : "You're getting priority distribution, detailed royalty reports, and unlimited uploads."}
            </Text>
          </ImageBackground>
        </View>

        <View style={styles.menuSection}>
          {/* Main List */}
          <View style={styles.menuBlock}>
            {menuList.map((menuItem, index) => (
              <TouchableOpacity
                key={index}
                onPress={menuItem.onPress}
                activeOpacity={0.7}
                style={styles.menuRow}
              >
                <View style={styles.menuRowLeft}>
                  <View style={styles.iconContainer}>
                    {menuItem.renderIcon()}
                  </View>
                  <Text style={styles.menuItemText}>{menuItem.title}</Text>
                </View>
                <View style={styles.menuRowRight}>
                  {menuItem.value && (
                    <Text style={styles.menuItemValue}>{menuItem.value}</Text>
                  )}
                  <Ionicons name="chevron-forward" size={18} color="#AEAEB2" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Secondary List */}
          <View style={styles.secondaryMenuBlock}>
            {secondaryMenuList.map((menuItem, index) => (
              <View key={index}>
                {index > 0 && (
                  <LinearGradient
                    colors={["rgba(17,17,17,0)", "rgba(180,186,197,0.4)", "rgba(17,17,17,0)"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{
                      width: "100%",
                      height: 1,
                     
                    }}
                  />
                )}
                <TouchableOpacity
                  onPress={menuItem.onPress}
                  activeOpacity={0.7}
                  style={styles.secondaryMenuRow}
                >
                  <Text style={styles.secondaryMenuText}>{menuItem.title}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#AEAEB2" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={logOut}
            activeOpacity={0.8}
            style={styles.logoutButton}
          >
            <MaterialIcons name="logout" size={20} color="#8E8E93" />
            <Text style={styles.logoutText}>{t("logout")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 🌐 Language Selection Modal/Bottom Sheet */}
      <Modal visible={langModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bsHeader}>
              <View>
                <Text style={styles.bsTitle}>{t("language")}</Text>
                <Text style={styles.bsSubtitle}>Available languages for your region ({countryKey})</Text>
              </View>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
              {availableLanguages.map((item) => {
                const isSelected = language === item.name;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={styles.langItemRow}
                    onPress={async () => {
                      await setLanguage(item.name);
                      setLangModalVisible(false);
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={styles.langPrefixContainer}>
                        <Text style={styles.langPrefixText}>
                          {item.code.toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.langNameText}>{item.name}</Text>
                        <Text style={styles.langNativeText}>{item.nativeName}</Text>
                      </View>
                    </View>
                    <MaterialIcons
                      name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
                      size={22}
                      color={isSelected ? Colors.primary : "#D1D1D6"}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  backButton: {
    backgroundColor: "#F5F5F7",
    borderRadius: 10,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  placeholder: {
    width: 38,  
  },
  scrollContent: {
    paddingBottom: 40,                                                                                               
  },
  profileSection: {
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: 110,
    backgroundColor: Colors.white,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 18,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  nameText: {
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 18,
    color: "#1A1A1A",
    marginTop: 4,
  },
  emailText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  planCardContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  planCard: {
    padding: 20,
    borderRadius: 20,
    gap: 6,
  },
  planTitle: {
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 20,
    color: Colors.white,
  },
  planDescription: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 18,
  },
  menuSection: {
    paddingHorizontal: 24,
    gap: 24,
  },
  menuBlock: {
    gap: 16,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  menuRowLeft: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.lightPrimary,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#1A1A1A",
  },
  menuRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuItemValue: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#8E8E93",
  },
  secondaryMenuBlock: {
    gap: 6,
    marginTop: 4,
  },
  secondaryMenuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  secondaryMenuText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#1A1A1A",
  },
  logoutButton: {
    backgroundColor: "#F2F2F7",
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8E8E93",
    fontFamily: "Poppins_500Medium",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomSheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: "60%",
  },
  bsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  bsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  bsSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },
  langItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  langPrefixContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.lightPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  langPrefixText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.primary,
  },
  langNameText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
    fontFamily: "Poppins_500Medium",
  },
  langNativeText: {
    fontSize: 11,
    color: "#AEAEB2",
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
  },
});
