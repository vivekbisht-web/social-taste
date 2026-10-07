import { useRouter } from "expo-router";
import {
  Heart,
  Home,
  MessageCircle,
  Settings,
  UserCheck,
  Users,
} from "lucide-react-native";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");

const tabs = [
  "Home",
  "Matches",
  "Interests",
  "Connections",
  "Chat",
  "Settings",
];

const TABS_COUNT = tabs.length;
const TAB_WIDTH = width / TABS_COUNT;
const TAB_HEIGHT = 70;

const CustomBottomTab = ({ activeTab, onTabPress }: any) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const bottomPadding = Math.max(insets.bottom, 15);
  const totalHeight = TAB_HEIGHT + bottomPadding;

  const translateX = useSharedValue(0);

  useEffect(() => {
    const index = tabs.indexOf(activeTab);

    if (index !== -1) {
      translateX.value = withSpring(index * TAB_WIDTH, {
        damping: 15,
      });
    }
  }, [activeTab]);

  const handlePress = (index: number, tabName: string) => {
    translateX.value = withSpring(index * TAB_WIDTH, {
      damping: 15,
    });

    if (onTabPress) onTabPress(tabName);

    switch (tabName) {
      case "Home":
        router.push("/Screens/Dashboard/Dashboard");
        break;

      case "Matches":
        router.push("/Screens/MatchesScreen/MatchesScreen");
        break;

      case "Interests":
        router.push("/Screens/InterestsScreen/InterestsScreen");
        break;

      case "Connections":
        router.push("/Screens/ConnectionsScreen/ConnectionsScreen");
        break;

      case "Chat":
        router.push("/Screens/ChatScreen/InboxScreen");
        break;

      case "Settings":
        router.push("/Screens/SettingsScreen/SettingsScreen");
        break;
    }
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const renderIcon = (name: string, isActive: boolean) => {
    const color = isActive ? "#000" : "#888";
    const size = 20;

    switch (name) {
      case "Home":
        return (
          <Home size={size} color={color} fill={isActive ? "#000" : "none"} />
        );

      case "Matches":
        return (
          <Heart size={size} color={color} fill={isActive ? "#000" : "none"} />
        );

      case "Interests":
        return (
          <UserCheck
            size={size}
            color={color}
            fill={isActive ? "#000" : "none"}
          />
        );

      case "Connections":
        return (
          <Users size={size} color={color} fill={isActive ? "#000" : "none"} />
        );

      case "Chat":
        return (
          <MessageCircle
            size={size}
            color={color}
            fill={isActive ? "#000" : "none"}
          />
        );

      case "Settings":
        return (
          <Settings
            size={size}
            color={color}
            fill={isActive ? "#000" : "none"}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { height: totalHeight }]}>
      <View style={[StyleSheet.absoluteFillObject, { height: totalHeight }]}>
        <Svg width={width} height={totalHeight}>
          <Path
            fill="#1a1a1a"
            d={`M0,20 L${width},20 L${width},${totalHeight} L0,${totalHeight} Z`}
          />
        </Svg>
      </View>

      <Animated.View
        style={[styles.indicatorContainer, animatedIndicatorStyle]}
      >
        <Svg width={TAB_WIDTH} height={TAB_HEIGHT}>
          <Path
            fill="#1a1a1a"
            d={`M0,20 
            C${TAB_WIDTH * 0.2},20 
            ${TAB_WIDTH * 0.3},0 
            ${TAB_WIDTH * 0.5},0 
            C${TAB_WIDTH * 0.7},0 
            ${TAB_WIDTH * 0.8},20 
            ${TAB_WIDTH},20 
            L${TAB_WIDTH},${TAB_HEIGHT} 
            L0,${TAB_HEIGHT} Z`}
          />
        </Svg>
      </Animated.View>

      <View style={[styles.content, { paddingBottom: bottomPadding }]}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => handlePress(index, tab)}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.iconCircle,
                  isActive && {
                    backgroundColor: "#D4AF37",
                    transform: [{ translateY: -15 }],
                  },
                ]}
              >
                {renderIcon(tab, isActive)}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: width,
    backgroundColor: "transparent",
  },

  indicatorContainer: {
    position: "absolute",
    top: 0,
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
  },

  content: {
    flexDirection: "row",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-around",
  },

  tabItem: {
    width: TAB_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
});

export default CustomBottomTab;
