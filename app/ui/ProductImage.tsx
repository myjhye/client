import size from "@utils/size";
import { View, StyleSheet, Image, Dimensions } from "react-native";

interface Props {
  uri?: string;
}

const { width } = Dimensions.get("screen");
const imageWidth = width - size.padding * 2;
const aspect = 16 / 9;

export default function ProductImage({ uri }: Props) {
    return (
        <Image 
            source={{ uri }}
            style={styles.image}
            resizeMethod="resize"
            resizeMode="cover"
        />
    )
}

const styles = StyleSheet.create({
  image: {
    width: imageWidth,
    height: imageWidth / aspect,
    borderRadius: 7,
  },
});