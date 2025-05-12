import colors from "@utils/colors";
import { View, StyleSheet, Text } from "react-native";
import ProductGridView from "./ProductGridView";

export type LatestProduct = {
  id: string;
  name: string;
  thumbnail?: string;
  category: string;
  price: number;
};

interface Props {
  data: LatestProduct[];
  onPress(product: LatestProduct): void;
}

export default function LatestProductList({ data, onPress }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recently Listed Offers</Text>
            <ProductGridView data={data} onPress={onPress} />
        </View>
    )
}

const styles = StyleSheet.create({
  container: {},
  title: {
    fontWeight: "600",
    color: colors.primary,
    fontSize: 20,
    marginBottom: 15,
    letterSpacing: 0.5,
  },
});
