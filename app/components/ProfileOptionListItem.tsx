/*
프로필 화면에서 아이콘 + 텍스트로 구성된 선택형 버튼 목록 항목
→ 눌렀을 때 onPress 실행, 선택되면 오른쪽에 표시(dot) 뜸, 색상도 바뀜
*/

import {
  View,
  StyleSheet,
  Pressable,
  Text,
  ViewStyle,
  StyleProp,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import colors from "@utils/colors";

interface Props {
  antIconName: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
  onPress?(): void;
}
export default function ProfileOptionListItem({
    style,
    antIconName,
    title,
    active,
    onPress,
}: Props) {
    return (
        <Pressable onPress={onPress} style={[styles.container, style]}>
            <View style={styles.buttonContainer}>
                <AntDesign
                    name={antIconName as any}
                    size={24}
                    color={active ? colors.active : colors.primary}
                />
                <Text
                    style={[
                        styles.title,
                        { color: active ? colors.active : colors.primary },
                    ]}
                >
                    {title}
                </Text>
            </View>

            {active && <View style={styles.indicator} />}
        </Pressable>
    )
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    paddingLeft: 10,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.active,
  },
});