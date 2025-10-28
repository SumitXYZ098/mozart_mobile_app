import React, { useState, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { Colors } from "@/theme/colors";
import { useNavigation } from "@react-navigation/native";
import { today } from "@/utils/utils";
import { events } from "@/mock/mockData";
import dayjs from "dayjs";

const CalendarEventScreen = () => {
  const currentDate = dayjs(today).format("YYYY-MM-DD");

  const navigation = useNavigation<any>();
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs(currentDate).format("YYYY-MM-DD")
  );
  console.log("Date", selectedDate);

  // Filter events for selected date
  const eventsForDate = useMemo(() => {
    return events.filter(
      (event) =>
        new Date(event.start).toDateString() ===
        new Date(selectedDate).toDateString()
    );
  }, [selectedDate]);

  // Mark dates that have events
  const markedDates = useMemo(() => {
    const marks: any = {};
    events.forEach((e) => {
      const dateKey = e.start.toISOString().split("T")[0];
      marks[dateKey] = {
        marked: true,
        dotColor: Colors.primary,
        ...(dateKey === selectedDate
          ? { selected: true, selectedColor: Colors.primary }
          : {}),
      };
    });
    if (!marks[selectedDate]) {
      marks[selectedDate] = { selected: true, selectedColor: Colors.primary };
    }
    return marks;
  }, [events, selectedDate]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Calender</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Notification")}
          style={styles.topButton}
        >
          <Image
            source={require("../../../assets/images/notification.png")}
            resizeMode="contain"
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <Calendar
        style={styles.calendar}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          todayTextColor: Colors.primary,
          todayBackgroundColor: Colors.lightPrimary,
          arrowColor: Colors.primary,
          monthTextColor: Colors.black,
          textMonthFontWeight: "bold",
          textDayFontFamily: "PlusJakartaSans_600SemiBold",
          textMonthFontFamily: "PlusJakartaSans_700Bold",
          textDayHeaderFontFamily: "PlusJakartaSans_600SemiBold",
          calendarBackground: "#FAFAFA",
          dotStyle: {
            marginTop: -2,
          },
        }}
      />

      {/* Event List */}
      <View style={styles.eventListContainer}>
        {eventsForDate.length > 0 ? (
          <>
            <Text style={styles.dateHeader}>
              {new Date(selectedDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>

            <FlatList
              data={eventsForDate}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.eventCard}>
                  <View style={styles.eventLeft}>
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeText}>
                        {new Date(item.start).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      {/* k */}
                    </View>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
              )}
            />
          </>
        ) : (
          <Text style={styles.noEventsText}>Select a date to view events</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CalendarEventScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 8,
  },
  title: { fontSize: 20, fontWeight: "700", color: Colors.gray },
  topButton: { backgroundColor: Colors.secondary, borderRadius: 6, padding: 6 },
  menuIcon: { width: 24, height: 24 },
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 24,
    backgroundColor: "#F9F8FF",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  filterButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  filterText: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  calendar: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    elevation: 1,
  },
  eventListContainer: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 6,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray,
    marginVertical: 12,
    fontFamily: "Poppins_400Regular",
  },
  eventCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5EDFF",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  eventLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  timeBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: { color: Colors.white, fontSize: 12, fontWeight: "400" },
  eventTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.black,
    fontFamily: "Poppins_400Regular",
  },
  statusBadge: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  noEventsText: {
    textAlign: "center",
    color: Colors.gray,
    marginTop: 40,
    fontSize: 14,
  },
});